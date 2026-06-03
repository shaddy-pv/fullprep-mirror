/**
 * Health Check Routes
 * For Docker health checks and monitoring
 */

import express from 'express';

const router = express.Router();

/**
 * @route   GET /api/health
 * @desc    Health check endpoint
 * @access  Public
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
router.get('/ready', (req, res) => {
  // Check if database is connected
  const mongoose = require('mongoose');
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
