const express = require('express');
const { Sequelize, DataTypes } = require('sequelize');

// Create Express app
const app = express();

// Initialize Sequelize with your database configuration
const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database.sqlite',
});

// Define a model for your database table
const User = sequelize.define('User', {
  username: {
    type: DataTypes.STRING,
    allowNull: false,
    unique: true,
  },
});

// Express middleware to handle uncaught exceptions
process.on('uncaughtException', async (error) => {
  console.error('Uncaught Exception:', error);
  await sequelize.close(); // Close database connection gracefully
  process.exit(1); // Exit the process with failure status
});

// Express middleware to handle unhandled promise rejections
process.on('unhandledRejection', async (error) => {
  console.error('Unhandled Promise Rejection:', error);
  await sequelize.close(); // Close database connection gracefully
  process.exit(1); // Exit the process with failure status
});

// Route to simulate an operation with database transactions
app.get('/simulate-operation', async (req, res) => {
  let transaction;
  try {
    // Start a database transaction
    transaction = await sequelize.transaction();
    const user = await User.create({ username: 'example' }, { transaction });

    // Uncomment the following line to simulate a database query failure
    // throw new Error('Simulated database query failure');

    // Commit the transaction if everything is successful
    await transaction.commit();

    res.send('Operation completed successfully');
  } catch (error) {
    // Rollback the transaction if an error occurs
    if (transaction) await transaction.rollback();

    // Forward the error to the error handling middleware
    throw error;
  }
});

// Start the Express server
const server = app.listen(3000, () => {
  console.log('Server is running on port 3000');
});

// Gracefully handle shutdown
const gracefulShutdown = async () => {
  console.log('Shutting down gracefully...');
  await server.close(); // Close Express server
  await sequelize.close(); // Close database connection gracefully
  process.exit(0); // Exit the process with success status
};

// Handle SIGINT (Ctrl+C) and SIGTERM signals for graceful shutdown
process.on('SIGINT', gracefulShutdown);
process.on('SIGTERM', gracefulShutdown);
