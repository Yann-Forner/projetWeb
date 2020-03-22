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
    db.prepare('DROP TABLE IF EXISTS exchange').run();
    db.prepare('DROP TABLE IF EXISTS object').run();
    db.prepare('DROP TABLE IF EXISTS user').run();

    db.prepare('CREATE TABLE user (id INTEGER PRIMARY KEY AUTOINCREMENT, password TEXT, name TEXT, surname TEXT, city TEXT, mail TEXT, phone TEXT, role TEXT)').run();
    db.prepare('CREATE TABLE object (id INTEGER PRIMARY KEY AUTOINCREMENT, name TEXT, category TEXT)').run();
    db.prepare('CREATE TABLE exchange (idUser INTEGER REFERENCES user(id), idObject INTEGER REFERENCES object(id), type TEXT, PRIMARY KEY (idUser, idObject))').run();

    db.prepare('INSERT INTO user VALUES (@id, @password, @name, @surname, @city, @mail, @phone, @role)')
        .run({id: null, password: 'root', name: 'admin', surname: 'admin', city: 'Marseille', mail: 'admin@admin.fr', phone: '0000000000', role: 'admin'})
};

create_db();