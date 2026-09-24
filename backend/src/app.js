/**
 * SchoolERP — Express Application
 *
 * This file configures the Express application instance,
 * registers middleware, mounts route modules, and sets up
 * centralized error handling.
 *
 * It does NOT listen on a port — that responsibility belongs
 * to server.js so the app can be imported independently for
 * integration tests.
 */

const express = require('express');
const cors = require('cors');
const helmet = require('helmet');
const morgan = require('morgan');

// --- Route Imports -------------------------------------------------------
// const authRoutes   = require('./routes/auth.routes');
// const studentRoutes = require('./routes/student.routes');
// ... add additional routes here as they are created

// --- Middleware Imports ---------------------------------------------------
const { notFoundHandler, globalErrorHandler } = require('./middleware/error.middleware');

// --- App Initialization ---------------------------------------------------
const app = express();

// --- Global Middleware ----------------------------------------------------
app.use(helmet());                                       // Security headers
app.use(cors({ origin: process.env.CLIENT_URL || '*' })); // CORS policy
app.use(morgan(process.env.NODE_ENV === 'production' ? 'combined' : 'dev')); // Logging
app.use(express.json({ limit: '10mb' }));                // JSON body parser
app.use(express.urlencoded({ extended: true }));         // URL-encoded body parser

// --- Health Check ---------------------------------------------------------
app.get('/api/health', (_req, res) => {
  res.status(200).json({
    status: 'ok',
    timestamp: new Date().toISOString(),
    uptime: process.uptime(),
  });
});

// --- API Routes -----------------------------------------------------------
// app.use('/api/auth',     authRoutes);
// app.use('/api/students', studentRoutes);
// ... mount additional routes here

// --- Error Handling -------------------------------------------------------
app.use(notFoundHandler);
app.use(globalErrorHandler);

module.exports = app;
