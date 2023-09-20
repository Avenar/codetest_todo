const express = require('express');
const path = require('path');
const app = express();
const PORT = 3000;


var bodyParser = require('body-parser');
var jsonParser = bodyParser.json();


const { Client } = require('pg');
const client = new Client({
  user: 'codetest_todo',
  host: 'localhost',
  database: 'codetest_todo',
  password: 'codetest_pass',
  port: 5432,
});

client.connect((err) => {
	console.log("db connect output", err);
});


app.get("/", function (req, res) {
  res.sendFile(path.join(__dirname, '/index.html'));
});

// Get all tasks
app.get("/tasks", function (req, res) {
  client.query('SELECT * FROM tasks ORDER BY status, id', (err, result) => {
	if (err){
		res.status(500).send(err.stack);
	} else {
		res.send(result.rows);
	}
  });
});

// Get specific task
app.get("/task/:id", function (req, res) {
  client.query('SELECT * FROM tasks WHERE ID = $1', [req.params.id], (err, result) => {
	if (err){
		res.status(500).send(err.stack);
	} else {
		res.send(result.rows[0]);
	}
  });
});

// Update task
app.post("/task/:id", jsonParser, function (req, res) {
  if (req.body.name == "") {
	res.status(400).send("Error: Task names cannot be empty");
	return false;
  }
  client.query("UPDATE tasks SET name=$1, status=$2 WHERE id=$3", [req.body.name, (req.body.status ? "TRUE": "FALSE"), req.params.id], (err, result) => {
	if (err){
		res.status(500).send(err.stack);
	} else {
		res.status(200).send();
	}
  });
});

// Create task
app.put("/task", jsonParser, function (req, res) {
  if (req.body.name == "") {
	res.status(400).send("Error: Task names cannot be empty");
	return false;
  }
  client.query("INSERT INTO tasks(name) VALUES($1)", [req.body.name], (err, result) => {
	if (err){
		res.status(500).send(err.stack);
	} else {
		res.status(200).send();
	}
  });
});

// Delete task
app.delete("/task/:id", function (req, res) {
  client.query("DELETE FROM tasks WHERE id=$1", [req.params.id], (err, result) => {
	if (err){
		res.status(500).send(err.stack);
	} else {
		res.status(200).send();
	}
  });
});
 
app.listen(PORT, function(err){
    if (err) console.log("Error in server setup")
    console.log("Server listening on Port", PORT);
})

process.on('exit', function() {
  client.end();
  console.log('About to exit.');
});