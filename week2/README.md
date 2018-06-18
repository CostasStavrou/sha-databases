# [SocialHackersAcademy](https://www.socialhackersacademy.org/) - Database module - week 2 homework

[Instructions from SHA](https://github.com/SocialHackersCodeSchool/databases/blob/master/Week2/MAKEME.md)

## Writing a model to communicate with the TODO database

A database is provided in [todo_app/db.sql](https://github.com/SocialHackersCodeSchool/databases/blob/master/Week2/todo_app/db.sql) and an incomplete program in [todo_app/program.js](https://github.com/SocialHackersCodeSchool/databases/blob/master/Week2/todo_app/program.js).

The `load` function already extracts all TODOs from the database. Implement the
rest of the function on the Model (`create`, `update`, `delete`, `tagTodoItem`,
`untagTodoItem`, and `markCompleted`)

**Answer**

The code is in file [step1.js](step1.js)

Of course, being a Node.js application first we initialize it
with `npm init` and install the necessary module with `npm install mysql`.

It is a really simple implementation. It uses the [Node.js mysql module](https://www.npmjs.com/package/mysql) with simple queries since
the database contains just a few entries.

It can be used (of course) with the [Node.js mysql2 module](https://www.npmjs.com/package/mysql2) just by changing the module
name in line 5 of the step1.js file.

*Note: Don't use the included package.json with this. It is for step3.js*

## Adding a new database user

Until now we've always connected to the database as root. We don't want to allow
our TODO app access to other databases than the TODO app itself:

- Figure out how to create a new user in MySQL.
- Restrict the access for that user to only the todo_app database.
- Use the newly created user credentials (username, password) in the connector
of the program.js file.

**Answer**

We want to create a nodetodoapp user to access the todo_app database.
The new user is able to retrieve, insert, update and delete on the
database. So we need the following 3 SQL statements.

```sql
CREATE USER 'nodetodoapp'@'localhost' IDENTIFIED BY 'mypassword';

GRANT SELECT, INSERT, UPDATE, DELETE, EXECUTE on todo_app.* TO 'nodetodoapp'@'localhost';

FLUSH PRIVILEGES;
```

## Bonus assignment (not part of the SocialHackersAcademy assignment)

Combine this Model with the final project from the Node.js module. More
information on the [third week's homework](https://github.com/SocialHackersCodeSchool/Node.js/tree/master/week3)
of the Node.js SocialHackersAcademy module.

**Answer**

The code is in file [step3.js](step3.js)

Implementation details / differences with the above mentioned exercise:
- In the code [mysql2](https://www.npmjs.com/package/mysql2) Node.js module
is used. It is API compatible for what this exercise needs/uses with the
[mysql](https://www.npmjs.com/package/mysql) module.
- I follow the CRUD model of the database exercise and not the REST API of
the Node.js project from the SocialHackersAcademy assignment. I changed
the REST API accordingly.
- Promises used to put things in order as needed.
- The front-end part is non-existant. Testing was done by using [Postman](https://www.getpostman.com/).
- Everything is kept very simple. This is not to make the most performant
or optimized implementation. It is built for educational purposes, as the
next step in a node + sql class.

To run this:
- npm install
- node step3.js

# License and Copyright

Unless explicitly specified all this is copyrighted by Costas Stavrou, the
author of these Github pages and GPL-3 licensed.
