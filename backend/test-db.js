const mysql = require('mysql2/promise');
require('dotenv').config();

async function testConnection() {
    try {
        const connection = await mysql.createConnection(process.env.DATABASE_URL);
        console.log('Successfully connected to the database!');
        await connection.end();
    } catch (error) {
        console.error('Failed to connect to the database:', error);
    }
}

testConnection();
