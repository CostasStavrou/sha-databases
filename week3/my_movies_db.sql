CREATE TABLE country (
  code VARCHAR(3) NOT NULL,
  name VARCHAR(60) NOT NULL,
  PRIMARY KEY (code));

CREATE TABLE reviewer (
  id INT UNSIGNED AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  username VARCHAR(50) NOT NULL,
  PRIMARY KEY (id));

CREATE TABLE person (
  id INT UNSIGNED AUTO_INCREMENT,
  name VARCHAR(100) NOT NULL,
  birthdate DATE,
  deathdate DATE,
  PRIMARY KEY (id));

CREATE TABLE movie (
  id INT UNSIGNED AUTO_INCREMENT,
  imdb_url VARCHAR(255),
  metacritic_url VARCHAR(255),
  tmdb_url VARCHAR(255),
  PRIMARY KEY (id));

CREATE TABLE title (
  id INT UNSIGNED AUTO_INCREMENT,
  movie INT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  code VARCHAR(3) NOT NULL,
  released DATE,
  duration TIME,
  PRIMARY KEY (id),
  CONSTRAINT fk_title_country
    FOREIGN KEY (code) REFERENCES country (code)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_title_movie
    FOREIGN KEY (movie) REFERENCES movie (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE review (
  id INT UNSIGNED AUTO_INCREMENT,
  movie INT UNSIGNED NOT NULL,
  reviewer INT UNSIGNED NOT NULL,
  text TEXT NOT NULL,
  PRIMARY KEY (id),
  CONSTRAINT fk_review_movie
    FOREIGN KEY (movie) REFERENCES movie (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_review_reviewer
    FOREIGN KEY (reviewer) REFERENCES reviewer (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);

CREATE TABLE movie_person (
  movie INT UNSIGNED,
  person INT UNSIGNED,
  role VARCHAR(50) NOT NULL,
  PRIMARY KEY (movie, person),
  CONSTRAINT fk_movie_person_movie
    FOREIGN KEY (movie) REFERENCES movie (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE,
  CONSTRAINT fk_movie_person_person
    FOREIGN KEY (person)
    REFERENCES person (id)
    ON DELETE CASCADE
    ON UPDATE CASCADE);
