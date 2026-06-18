import { spawn } from 'child_process';
import fs from 'fs/promises';
import path from 'path';
import crypto from 'crypto';
import os from 'os';

/**
 * Maps our internal language IDs to Docker images and execution commands
 */
const LANGUAGE_CONFIG = {
  PYTHON: {
    image: 'python:3.10-alpine',
    filename: 'solution.py',
    getCommand: (file) => ['python3', file]
  },
  CPP: {
    image: 'gcc:11',
    filename: 'solution.cpp',
    getCompileCommand: (file, out) => ['g++', '-O2', file, '-o', out],
    getRunCommand: (out) => [`./${out}`]
  },
  JAVA: {
    image: 'openjdk:17-alpine',
    filename: 'Main.java',
    getCompileCommand: (file) => ['javac', file],
    getRunCommand: () => ['java', 'Main']
  },
  JAVASCRIPT: {
    image: 'node:18-alpine',
    filename: 'solution.js',
    getCommand: (file) => ['node', file]
  }
};

/**
 * Runs a command in a child process with a timeout
 */
const runProcess = (command, args, options, timeoutMs, stdin = '') => {
  return new Promise((resolve, reject) => {
    const child = spawn(command, args, options);
    let stdout = '';
    let stderr = '';
    
    // Write stdin
    if (stdin) {
      child.stdin.write(stdin);
      child.stdin.end();
    }

    child.stdout.on('data', (data) => {
      stdout += data.toString();
    });

    child.stderr.on('data', (data) => {
      stderr += data.toString();
    });

    // Timeout
    const timer = setTimeout(() => {
      child.kill('SIGKILL');
      resolve({ stdout, stderr: 'Execution timed out', exitCode: 124, timeout: true });
    }, timeoutMs);

    child.on('close', (code) => {
      clearTimeout(timer);
      resolve({ stdout, stderr, exitCode: code, timeout: false });
    });

    child.on('error', (err) => {
      clearTimeout(timer);
      reject(err);
    });
  });
};

/**
 * Executes a single test case in a Docker sandbox
 * @returns {Promise<{stdout: string, stderr: string, exitCode: number, executionTime: number, isCompileError: boolean}>}
 */
export async function executeCodeInSandbox(language, code, stdin, timeoutMs = 5000) {
  const langKey = language.toUpperCase() === 'PYTHON3' ? 'PYTHON' : language.toUpperCase().replace('CPP17', 'CPP');
  const config = LANGUAGE_CONFIG[langKey];
  if (!config) throw new Error(`Unsupported language: ${language}`);

  const runId = crypto.randomUUID();
  const tmpDir = path.join(os.tmpdir(), `fullprep-sandbox-${runId}`);
  
  try {
    await fs.mkdir(tmpDir, { recursive: true });
    const codePath = path.join(tmpDir, config.filename);
    await fs.writeFile(codePath, code);

    // Some environments (Windows to WSL) require path conversion, but keeping it simple for now
    const volumeMount = `${tmpDir}:/app`;

    const startTime = Date.now();
    let isCompileError = false;

    // 1. Compile if needed
    if (config.getCompileCommand) {
      const compileCmd = config.getCompileCommand(config.filename, 'solution');
      const compileArgs = [
        'run', '--rm', '-v', volumeMount, '-w', '/app', config.image, ...compileCmd
      ];
      
      const compileResult = await runProcess('docker', compileArgs, {}, 10000);
      if (compileResult.exitCode !== 0) {
        return {
          stdout: '',
          stderr: compileResult.stderr || 'Compilation Failed',
          exitCode: compileResult.exitCode,
          executionTime: Date.now() - startTime,
          isCompileError: true
        };
      }
    }

    // 2. Execute
    const runCmd = config.getRunCommand ? config.getRunCommand('solution') : config.getCommand(config.filename);
    
    const dockerArgs = [
      'run', '-i', '--rm',
      '--network', 'none', // Disable networking
      '--cpus', '1.0',     // Limit CPU
      '--memory', '256m',  // Limit RAM
      '-v', volumeMount,
      '-w', '/app',
      config.image,
      ...runCmd
    ];

    const runResult = await runProcess('docker', dockerArgs, {}, timeoutMs, stdin);

    return {
      stdout: runResult.stdout.trim(),
      stderr: runResult.stderr.trim(),
      exitCode: runResult.exitCode,
      executionTime: Date.now() - startTime,
      isCompileError: false
    };

  } finally {
    // Cleanup temp directory
    try {
      await fs.rm(tmpDir, { recursive: true, force: true });
    } catch (e) {
      console.error(`Failed to cleanup temp dir ${tmpDir}`, e);
    }
  }
}

/**
 * Judges a single test case
 */
export async function judgeTestCaseSandbox(language, code, input, expectedOutput) {
  const result = await executeCodeInSandbox(language, code, input);

  const normalize = (str) => str.trim().split('\n').map(l => l.trimEnd()).join('\n');
  const actual = normalize(result.stdout);
  const expected = normalize(expectedOutput || '');

  const passed = !result.isCompileError && result.exitCode === 0 && actual === expected;

  return {
    passed,
    stdout: result.stdout,
    stderr: result.stderr,
    expected: expectedOutput || '',
    executionTime: result.executionTime,
    isCompileError: result.isCompileError
  };
}
