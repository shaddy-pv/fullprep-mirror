import { Queue, Worker } from 'bullmq';
import IORedis from 'ioredis';

// Redis Connection
const connection = new IORedis(process.env.REDIS_URL || 'redis://127.0.0.1:6379', {
  maxRetriesPerRequest: null,
});

// Create Queue
export const submissionQueue = new Queue('CodeSubmissions', { connection });

// Optional: Basic Worker (can be separated into a different worker process)
export const submissionWorker = new Worker(
  'CodeSubmissions',
  async (job) => {
    console.log(`[Worker] Processing submission job ${job.id}`);
    const { submissionId, code, language, problemId } = job.data;
    
    // Here we would typically call Judge0 or evaluate the code
    console.log(`[Worker] Executing code for ${language}...`);
    
    // Simulate execution time
    await new Promise((resolve) => setTimeout(resolve, 1000));
    
    console.log(`[Worker] Finished processing submission ${job.id}`);
    
    return { status: 'success', memory: '12MB', time: '0.1s' };
  },
  { connection }
);

submissionWorker.on('completed', (job, returnvalue) => {
  console.log(`[Worker] Job ${job.id} completed! Result:`, returnvalue);
});

submissionWorker.on('failed', (job, err) => {
  console.log(`[Worker] Job ${job.id} failed with error:`, err);
});
