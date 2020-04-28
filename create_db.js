"use strict"
/*
    Modules
 */

const Sqlite = require('better-sqlite3');
var passwordHash = require('password-hash');


/*
    Creation de la db
 */

let db = new Sqlite('db.sqlite');
var create_db =function () {
    db.prepare('DROP TABLE IF EXISTS exchange').run();
    db.prepare('DROP TABLE IF EXISTS object').run();
    db.prepare('DROP TABLE IF EXISTS user').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, password TEXT NOT NULL, name TEXT NOT NULL, surname TEXT NOT NULL, city TEXT NOT NULL, mail TEXT NOT NULL, phone TEXT, role TEXT NOT NULL)').run();
    db.prepare('CREATE TABLE object (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT NOT NULL, category TEXT NOT NULL)').run();
    db.prepare('CREATE TABLE exchange (idUser INTEGER REFERENCES user(id) ON DELETE CASCADE, idObject INTEGER REFERENCES object(id) ON DELETE CASCADE, type TEXT NOT NULL, PRIMARY KEY (idUser, idObject))').run();

    db.prepare('INSERT INTO user VALUES (@id, @password, @name, @surname, @city, @mail, @phone, @role)')
        .run({id: null, password: passwordHash.generate('rooot'), name: 'admin', surname: 'admin', city: 'Marseille', mail: 'admin@admin.fr', phone: '0000000000', role: 'admin'})
};

create_db();