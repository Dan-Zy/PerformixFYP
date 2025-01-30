import dotenv from "dotenv";
import mysql from "mysql";

dotenv.config();

const DB_HOST = process.env.DB_HOST;
const DB_USER = process.env.DB_USER;
const DB_PASS = process.env.DB_PASS;
const DB_NAME = process.env.DB_NAME;

const connection = mysql.createConnection({
    host: DB_HOST,
    user: DB_USER,
    password: DB_PASS,
});

// Connect to MySQL (without selecting a database initially)
connection.connect((err) => {
    if (err) {
        console.error("Error connecting to MySQL:", err.stack);
        return;
    }
    console.log("Connected to MySQL server.");

    // Create database if it doesn't exist
    connection.query(`CREATE DATABASE IF NOT EXISTS ${DB_NAME}`, (err, result) => {
        if (err) {
            console.error("Error creating database:", err);
            return;
        }
        console.log(`Database '${DB_NAME}' is ready.`);

        // Now connect to the created database
        const dbConnection = mysql.createConnection({
            host: DB_HOST,
            user: DB_USER,
            password: DB_PASS,
            database: DB_NAME
        });

        dbConnection.connect((err) => {
            if (err) {
                console.error("Error connecting to the database:", err);
                return;
            }
            console.log("Connected to the database.");

            // Create 'roles' table if not exists
            const createRolesTable = `
                CREATE TABLE IF NOT EXISTS roles (
                    role_id INT PRIMARY KEY AUTO_INCREMENT,
                    role_name VARCHAR(50) UNIQUE
                );
            `;

            dbConnection.query(createRolesTable, (err, result) => {
                if (err) {
                    console.error("Error creating 'roles' table:", err);
                    return;
                }
                console.log("'roles' table is ready.");

                // Insert default roles if they don't exist
                const insertRoles = `
                    INSERT IGNORE INTO roles (role_name) VALUES
                    ('Admin'),
                    ('Line Manager'),
                    ('Staff');
                `;

                dbConnection.query(insertRoles, (err, result) => {
                    if (err) {
                        console.error("Error inserting default roles:", err);
                        return;
                    }
                    console.log("Default roles inserted.");
                });

                dbConnection.end(); // Close the connection after setup
            });
        });
    });
});

export default connection;
