const express = require('express');
const bodyParser = require('body-parser');
const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const app = express();
const PORT = process.env.PORT || 3000;

// Set EJS as templating engine
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));

// Parse URL-encoded bodies
app.use(bodyParser.urlencoded({ extended: false }));
// Serve static files from the public folder
app.use(express.static('public'));

// Setup SQLite database
const db = new sqlite3.Database('./todo.db', (err) => {
    if (err) {
        console.error("Error opening database:", err.message);
    } else {
        console.log('Connected to the todo database.');
    }
});

// Create the todos table if it doesn't exist
db.serialize(() => {
    db.run(`CREATE TABLE IF NOT EXISTS todos (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        task TEXT NOT NULL,
        done INTEGER DEFAULT 0
    )`);
});

// Route to display todos
app.get('/', (req, res) => {
    db.all("SELECT * FROM todos", [], (err, rows) => {
        if (err) {
            console.error(err.message);
        }
        res.render('index', { todos: rows });
    });
});

// Route to add a new todo
app.post('/add', (req, res) => {
    const task = req.body.task;
    db.run("INSERT INTO todos (task) VALUES (?)", [task], function(err) {
        if (err) {
            console.error(err.message);
        }
        res.redirect('/');
    });
});

// Route to delete a todo
app.post('/delete/:id', (req, res) => {
    const id = req.params.id;
    db.run("DELETE FROM todos WHERE id = ?", id, function(err) {
        if (err) {
            console.error(err.message);
        }
        res.redirect('/');
    });
});

app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});
