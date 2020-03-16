"use strict"
/*
    Modules
 */

const Sqlite = require('better-sqlite3');



/*
    Creation de la db
 */

let db = new Sqlite('db.sqlite');
var create_db =function () {
    db.prepare('DROP TABLE IF EXISTS user').run();
    db.prepare('DROP TABLE IF EXISTS object').run();
    db.prepare('DROP TABLE IF EXISTS exchange').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, surname TEXT, city TEXT, mail TEXT, phone TEXT)').run();
    db.prepare('CREATE TABLE object (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT)').run();
    db.prepare('CREATE TABLE exchange (idUser INTEGER REFERENCES user(id), idObject INTEGER REFERENCES object(id), type TEXT)').run();
};

create_db();