import mysql from 'mysql2/promise';

// Create a connection pool
const pool = mysql.createPool({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME,
  waitForConnections: true,
  connectionLimit: 10, // Adjust as needed
  queueLimit: 0, // No limit on queued connections
  // Enable keep-alive to prevent connection drops for idle connections
  // connectTimeout: 10000, // 10 seconds, default is 10000
  // dateStrings: true, // Return date/timestamp columns as strings instead of Date objects
});

// Test the connection (optional, but good for immediate feedback)
// (async () => {
//   try {
//     const connection = await pool.getConnection();
//     console.log('Successfully connected to the MySQL database.');
//     connection.release();
//   } catch (error) {
//     console.error('Error connecting to the MySQL database:', error);
//     // Optionally, exit the process if DB connection is critical for startup
//     // process.exit(1);
//   }
// })();

export { pool };