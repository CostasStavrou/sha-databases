'use strict';
// This is the connector (also known as driver)
// that we can use to connect to a MySQL process
// and access its databases.
const mysql = require('mysql2');

const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const PORT = 3000;


class TodoModel {
    constructor(dbConnection) {
        this.dbConnection = dbConnection;
    }

    // Loads all the TODOs in the database
    load(callback) {
        const selectTodoItems = "SELECT * FROM todo_items";
        this.dbConnection.query(selectTodoItems, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
        });
    }

    create(description, completed, user, callback) {
        // Write code and query to create a new TODO item
				const insertTodoItem = "INSERT INTO todo_items (text, is_completed, user_id) VALUES (?, ?, ?)";
				const insertValues = [description, completed, user];
				this.dbConnection.query(insertTodoItem, insertValues, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
				});
    }

    update(id, description, callback) {
        // Write code and query to update and existing TODO item
				const updateTodoItem = "UPDATE todo_items SET text=? WHERE id=?";
				const updateValues = [description, id];
				this.dbConnection.query(updateTodoItem, updateValues, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }
            callback(null, results);
				});
    }

    delete(id, callback) {
        // Write code and query to delete an existing TODO item
				const deleteTodoItem = "DELETE FROM todo_items WHERE id=?";
				const deleteValues = [id];
				this.dbConnection.query(deleteTodoItem, deleteValues, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
				});
    }

    tagTodoItem(todoItemId, tagId, callback) {
        // Write code and query add a tag to a TODO item
				const tagTodoItem = "INSERT INTO todo_item_tag (todo_item_id, tag_id) VALUES (?, ?)";
				const tagValues = [todoItemId, tagId];
				this.dbConnection.query(tagTodoItem, tagValues, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
				});
    }

    untagTodoItem(todoItemId, tagId, callback) {
        // Write code and query remove a tag from a TODO item
				const untagTodoItem = "DELETE FROM todo_item_tag WHERE todo_item_id=? AND tag_id=?";
				const untagValues = [todoItemId, tagId];
				this.dbConnection.query(untagTodoItem, untagValues, function(err, results, fields) {
            if(err) {
                callback(err);
                return;
            }

            callback(null, results);
				});
    }

    markCompleted(todoItemId, callback) {
      // Write code to mark a TODO item as completed
			const updateTodoItem = "UPDATE todo_items SET is_completed=1 WHERE id=?";
			const updateValues = [todoItemId];
			this.dbConnection.query(updateTodoItem, updateValues, function(err, results, fields) {
          if(err) {
              callback(err);
              return;
          }
            callback(null, results);
			});
    }
}

const dbConnection = mysql.createConnection({
    host     : 'localhost',
    user     : 'root',
    password : 'admin',
    database : 'todo_app'
});

dbConnection.connect(function(err) {
    if (err != null) {
        console.error('error connecting on the DBMS: ' + err.stack);
        return;
    }
    console.log('We have a connection on the DBMS with id ' + dbConnection.threadId);
});

const todoModel = new TodoModel(dbConnection);

// Now that we have our Model specified, we start with the Node.js part

// This has no path specified so the callback function is called for every
// request on the application (eg. /, /put, /whatever).
// The callback function being the bodyparser middleware populates a
// new body object containing the parsed JSON data on the request object.
app.use(bodyParser.json());

// List all to-do items -> Database Model load method
app.get("/todos", function(request, response) {
  console.log("Query the DBMS and SELECT the todo items... ");
  const loadPromise = new Promise(function(resolve, reject) {
    todoModel.load(function(err, todoItems){
      if (err) {
        reject(err);
      } else {
        resolve(todoItems);
      }
    });
  }).then(function(data) {
    console.log("Send back the todo items.");
    response.writeHead(200, "OK");
    response.write(JSON.stringify(data));
    response.end();
  }).catch(function(error) {
    console.log(error.code);
    response.status(500).send("Internal Server Error");
  });
});

// Create a new to-do -> Database Model create method
app.post("/todos", function(request, response) {
  const record = request.body;
  if ((record === undefined) || (record.text === undefined) ||
    (record.user_id === undefined)) {
    console.log("You should provide all the required fields...");
    response.status(400).send("Bad Request");
  } else {
    // Even if has a specified default value on the DBMS we
    // set the default here if necessary just to make simpler
    // the INSERT statement
    record.is_completed = record.is_completed || false;
    console.log("We try to INSERT: " + JSON.stringify(record));
    const createPromise = new Promise(function(resolve, reject) {
      todoModel.create(record.text, record.is_completed, record.user_id, function(err, results){
        if (err) {
          reject(err);
        } else {
          resolve(results);
        }
      });
    }).then(function(data) {
      console.log("Succeded.");
      response.writeHead(200, "OK");
      // We can use data to print data.affectedRows for example, or data.insertId
      response.write(JSON.stringify(data));
      response.end();
    }).catch(function(error) {
      console.log(error.code);
      response.status(500).send("Internal Server Error");
    });
  }
});

// Update the to-do item given id and description -> Database Model update method
app.put("/todos/:id", function(request, response) {
  const record = request.body;
  // We take the id from the parameters of the PUT request, not from the body of the request
  record.id=request.params.id;
  if ((record === undefined) || (record.id === undefined) ||
    (record.text === undefined)) {
    console.log("You should provide all the required fields...");
    response.status(400).send("Bad Request");
  } else {
    console.log("We try to UPDATE todo item with id: " + record.id);
    console.log(JSON.stringify(record));
    const updatePromise = new Promise(function(resolve, reject) {
      todoModel.update(record.id, record.text, function(err, results){
        if (err) {
          reject(err);
        } else if (results.changedRows === 0) {
          // The query executed normally but no rows were changed since there
          // is no todo item with that id.
          const err = new Error("No rows affected. There is no such todo item.");
          err.code = "No rows affected. There is no such todo item.";
          reject(err);
        } else {
          resolve(results);
        }
      });
    }).then(function(data) {
      console.log("Succeded.");
      response.writeHead(200, "OK");
      // We can use data to print data.affectedRows for example, or data.insertId
      response.write(JSON.stringify(data));
      response.end();
    }).catch(function(error) {
      if (error.code === "No rows affected. There is no such todo item.") {
        console.log(error.code);
        response.status(404).send("Not Found");
      } else {
        console.log(error.code);
        response.status(500).send("Internal Server Error");
      }
    });
  }
});

// Delete the to-do item with id equal to uuid -> Database Model delete method
app.delete("/todos/:id", function(request, response) {
  // We take the id from the parameters of the PUT request, not from the body of the request
  const id=request.params.id;
  console.log("Let's try to DELETE todo item with id: " + id);
  const deletePromise = new Promise(function(resolve, reject) {
    todoModel.delete(id, function(err, results){
      if (err) {
        reject(err);
      } else if (results.affectedRows === 0) {
        // The query executed normally but no rows were changed since there
        // is no todo item with that id.
        const err = new Error("No rows affected. There is no such todo item.");
        err.code = "No rows affected. There is no such todo item.";
        reject(err);
      } else {
        resolve(results);
      }
    });
  }).then(function(data) {
    console.log("Succeded.");
    response.writeHead(200, "OK");
    // We can use data to print data.affectedRows for example, or data.insertId
    response.write(JSON.stringify(data));
    response.end();
    // Or if we just responde with a status code with no body, we use the following
    // response.status(204).send("No Content");
  }).catch(function(error) {
      if (error.code === "No rows affected. There is no such todo item.") {
        console.log(error.code);
        response.status(404).send("Not Found");
      } else {
        console.log(error.code);
        response.status(500).send("Internal Server Error");
      }
  });
});

// Mark completed the todo item -> Database Model update method
app.put("/todos/:id/done", function(request, response) {
  // We take the id from the parameters of the PUT request, not from the body of the request
  const id = request.params.id;
  console.log("We try to UPDATE todo item with id: " + id);
  const markCompletedPromise = new Promise(function(resolve, reject) {
    todoModel.markCompleted(id, function(err, results){
      if (err) {
        reject(err);
      } else if (results.changedRows === 0) {
        // The query executed normally but no rows were changed since there
        // is no todo item with that id.
        const err = new Error("No rows affected. There is no such todo item.");
        err.code = "No rows affected. There is no such todo item.";
        reject(err);
      } else {
        resolve(results);
      }
    });
  }).then(function(data) {
    console.log("Succeded.");
    response.writeHead(200, "OK");
    // We can use data to print data.affectedRows for example, or data.insertId
    response.write(JSON.stringify(data));
    response.end();
  }).catch(function(error) {
    if (error.code === "No rows affected. There is no such todo item.") {
      console.log(error.code);
      response.status(404).send("Not Found");
    } else {
      console.log(error.code);
      response.status(500).send("Internal Server Error");
    }
  });
});

// Create a new record on table todo_item_tag -> Database Model tagTodoItem method
app.post("/todos/:todoId/:tagId", function(request, response) {
  const todoId = request.params.todoId;
  const tagId = request.params.tagId;
  console.log("We try to pair todo " + todoId + " with tag " + tagId);
  const tagTodoItemPromise = new Promise(function(resolve, reject) {
    todoModel.tagTodoItem(todoId, tagId, function(err, results){
      if (err) {
        reject(err);
      } else {
        resolve(results);
      }
    });
  }).then(function(data) {
    console.log("Succeded.");
    response.writeHead(200, "OK");
    // We can use data to print data.affectedRows for example, or data.insertId
    response.write(JSON.stringify(data));
    response.end();
  }).catch(function(error) {
    if (error.code === 'ER_DUP_ENTRY') {
      console.log("This tag is already assigned to this todo item.");
      response.status(409).send("Conflict");
    } else {
      console.log(error.code);
      response.status(500).send("Internal Server Error");
    }
  });
});

// Delete the to-do item with id equal to uuid -> Database Model delete method
// Delete a record from table todo_item_tag -> Database Model untagTodoItem method
app.delete("/todos/:todoId/:tagId", function(request, response) {
  const todoId = request.params.todoId;
  const tagId = request.params.tagId;
  console.log("We try to unpair todo " + todoId + " with tag " + tagId);
  const untagTodoItemPromise = new Promise(function(resolve, reject) {
    todoModel.untagTodoItem(todoId, tagId, function(err, results){
      if (err) {
        reject(err);
      } else if (results.affectedRows === 0) {
        // The query executed normally but no rows were changed since there
        // is no todo item with that id.
        const err = new Error("No rows affected. There is no such todo item.");
        err.code = "No rows affected. There is no such todo item.";
        reject(err);
      } else {
        resolve(results);
      }
    });
  }).then(function(data) {
    console.log("Succeded.");
    response.writeHead(200, "OK");
    // We can use data to print data.affectedRows for example, or data.insertId
    response.write(JSON.stringify(data));
    response.end();
    // Or if we just responde with a status code with no body, we use the following
    // response.status(204).send("No Content");
  }).catch(function(error) {
      if (error.code === "No rows affected. There is no such todo item.") {
        console.log(error.code);
        response.status(404).send("Not Found");
      } else {
        console.log(error.code);
        response.status(500).send("Internal Server Error");
      }
  });
});


app.get("/end", function(request, response) {
  console.log("Close the DBMS connection.");
  dbConnection.end();
  console.log("Connection to the DBMS closed.")
  response.status(200).send("Ok");
  http.close();
});

var http = app.listen(PORT, function() {
	console.log("Server listening on port " + PORT);
});
