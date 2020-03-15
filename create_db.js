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
    db.prepare('DROP TABLE IF EXISTS probleme').run();

    db.prepare('CREATE TABLE probleme (id INTEGER PRIMARY KEY AUTOINCREMENT, nom TEXT)').run();

    db.prepare('INSERT INTO probleme VALUES (null,@nom)').run({nom : 'Test'});
};

create_db();