/**
 * @file starterCode.ts
 * @description Default starter code templates for each supported language.
 *              Shown in the Monaco editor when a user first opens a problem
 *              or clicks "Reset Code".
 */

export type SupportedLanguage = "cpp" | "python" | "java" | "javascript" | "c";

/** Maps frontend language key → backend API language name */
export const LANGUAGE_TO_API: Record<SupportedLanguage, string> = {
  cpp:        "CPP17",
  python:     "PYTHON3",
  java:       "JAVA",
  javascript: "JAVASCRIPT",
  c:          "C",
};

/** Starter code templates per language */
export const STARTER_CODE: Record<SupportedLanguage, string> = {
  cpp: `#include <bits/stdc++.h>
using namespace std;

int main() {
    ios_base::sync_with_stdio(false);
    cin.tie(NULL);
    
    // Read input and write your solution here
    
    return 0;
}`,

  python: `import sys
input = sys.stdin.readline

def solve():
    # Read input and write your solution here
    pass

# Uncomment below if multiple test cases:
# t = int(input())
# for _ in range(t):
#     solve()

solve()`,

  java: `import java.util.*;
import java.io.*;

public class Main {
    public static void main(String[] args) throws IOException {
        BufferedReader br = new BufferedReader(new InputStreamReader(System.in));
        // StringTokenizer st = new StringTokenizer(br.readLine());
        
        // Read input and write your solution here
        
    }
}`,

  javascript: `const lines = require('fs').readFileSync('/dev/stdin', 'utf8').split('\\n');
let idx = 0;

function nextLine() { return lines[idx++]?.trim() ?? ''; }
function nextInt()  { return parseInt(nextLine()); }
function nextInts() { return nextLine().split(' ').map(Number); }

// Write your solution here
`,

  c: `#include <stdio.h>
#include <stdlib.h>
#include <string.h>

int main() {
    // Read input and write your solution here
    
    return 0;
}`,
};

/**
 * Returns the starter template for the given language.
 * Falls back to C++ if the language is unknown.
 */
export function getStarterCode(language: string): string {
  const lang = language.toLowerCase() as SupportedLanguage;
  return STARTER_CODE[lang] ?? STARTER_CODE.cpp;
}

/**
 * Returns the API language name for the given frontend language key.
 */
export function getApiLanguage(language: string): string {
  const lang = language.toLowerCase() as SupportedLanguage;
  return LANGUAGE_TO_API[lang] ?? "CPP17";
}
