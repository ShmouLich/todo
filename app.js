const express = require('express');
const bodyParser = require('body-parser');
const mysql = require('mysql'); // Use MySQL module
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

// Setup MySQL database connection
const db = mysql.createConnection({
  host: process.env.DB_HOST,
  user: process.env.DB_USER,
  password: process.env.DB_PASSWORD,
  database: process.env.DB_NAME
});

db.connect((err) => {
  if (err) {
    console.error('Error connecting to MySQL:', err);
    return;
  }
  console.log('Connected to MySQL as id ' + db.threadId);
});

// Create the todos table if it doesn't exist
const createTableQuery = `
  CREATE TABLE IF NOT EXISTS todos (
    id INT AUTO_INCREMENT PRIMARY KEY,
    task TEXT NOT NULL,
    done TINYINT DEFAULT 0
  )
`;
db.query(createTableQuery, (err, result) => {
  if (err) {
    console.error('Error creating todos table:', err);
  } else {
    console.log('Todos table is ready.');
  }
});

// Route to display todos
app.get('/', (req, res) => {
  db.query("SELECT * FROM todos", (err, results) => {
    if (err) {
      console.error('Error fetching todos:', err);
      res.sendStatus(500);
      return;
    }
    res.render('index', { todos: results });
  });
});

// Route to add a new todo
app.post('/add', (req, res) => {
  const task = req.body.task;
  db.query("INSERT INTO todos (task) VALUES (?)", [task], (err, result) => {
    if (err) {
      console.error('Error inserting todo:', err);
      res.sendStatus(500);
      return;
    }
    res.redirect('/');
  });
});

// Route to delete a todo
app.post('/delete/:id', (req, res) => {
  const id = req.params.id;
  db.query("DELETE FROM todos WHERE id = ?", [id], (err, result) => {
    if (err) {
      console.error('Error deleting todo:', err);
      res.sendStatus(500);
      return;
    }
    res.redirect('/');
  });
});

app.get('/health', (req, res) => {
  res.sendStatus(200);
});

app.listen(PORT, '0.0.0.0', () => {
  console.log(`Server is running on port ${PORT}`);
});
