const mysql = require("mysql2")
require("dotenv").config()

const connection = mysql.createConnection(process.env.DB_URL)

connection.connect((err) => {
    if (err) {
        console.log("Error occured while connecting db.")
        process.exit(1)
    }
    else {
        console.log("Connected to MySql")
        createFlashcardsTable()
    }
})
function createFlashcardsTable() {
    const createTableQuery = `
      CREATE TABLE IF NOT EXISTS flashcards (
        id INT AUTO_INCREMENT PRIMARY KEY,
        question TEXT NOT NULL,
        answer TEXT NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );`;

    connection.query(createTableQuery, (err, results) => {
        if (err) throw err;
        console.log('Table created or already exists.');
    });
}

module.exports = connection