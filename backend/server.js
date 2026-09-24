/**
 * SchoolERP — Server Entry Point
 *
 * Responsibilities:
 *   1. Load environment variables
 *   2. Connect to MongoDB
 *   3. Start the Express server
 *
 * Keep this file thin — all Express configuration
 * lives in src/app.js so the app can be imported
 * independently for testing.
 */

require('dotenv').config();

const app = require('./src/app');
const { connectDB } = require('./src/config/db');

const PORT = process.env.PORT || 5000;

// --- Bootstrap -----------------------------------------------------------
async function startServer() {
  try {
    await connectDB();

    app.listen(PORT, () => {
      console.log(`\n  SchoolERP API running on http://localhost:${PORT}`);
      console.log(`  Environment : ${process.env.NODE_ENV || 'development'}`);
      console.log(`  Started at  : ${new Date().toLocaleString()}\n`);
    });
  } catch (error) {
    console.error('Failed to start server:', error.message);
    process.exit(1);
  }
}

startServer();
