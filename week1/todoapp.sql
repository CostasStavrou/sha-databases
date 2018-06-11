CREATE DATABASE todoapp;

USE todoapp;

CREATE TABLE todo_item (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  description VARCHAR(512) NOT NULL,
  completed TINYINT DEFAULT 0
);

CREATE TABLE tags (
  id INTEGER AUTO_INCREMENT PRIMARY KEY,
  tagname VARCHAR(45)
);

CREATE TABLE todo_item_tag (
  todo_item_id INTEGER,
  tags_id INTEGER,
  PRIMARY KEY(todo_item_id, tags_id)
);
