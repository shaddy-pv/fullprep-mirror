/**
 * Health Check Routes
 * For Docker health checks and monitoring
 */

import express from 'express';
import mongoose from 'mongoose';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
 */
/**
 * @openapi
 * /api/health:
 *   get:
 *     summary: Health check
 *     description: Returns the health status of the API.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is healthy
 */
router.get('/health', (req, res) => {
  const healthcheck = {
    uptime: process.uptime(),
    status: 'OK',
    timestamp: Date.now(),
    service: 'FullPrep Backend',
    environment: process.env.NODE_ENV || 'development'
  };
  
  try {
    res.status(200).json(healthcheck);
  } catch (error) {
    healthcheck.status = 'ERROR';
    healthcheck.error = error.message;
    res.status(503).json(healthcheck);
  }
});

/**
 * @route   GET /api/ready
 * @desc    Readiness check endpoint
 * @access  Public
 */
/**
 * @openapi
 * /api/ready:
 *   get:
 *     summary: Readiness check
 *     description: Checks if the API and database are fully ready to accept requests.
 *     tags: [Health]
 *     responses:
 *       200:
 *         description: API is ready
 */
router.get('/ready', (req, res) => {
  // Check if database is connected
  const isDBConnected = mongoose.connection.readyState === 1;
  
  if (isDBConnected) {
    res.status(200).json({
      status: 'READY',
      database: 'connected',
      timestamp: Date.now()
    });
  } else {
    res.status(503).json({
      status: 'NOT_READY',
      database: 'disconnected',
      timestamp: Date.now()
    });
  }
});

export default router;
