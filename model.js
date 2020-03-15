"use strict"
/*
    Modules
 */

const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

/*
    Fonctions
 */

exports.readAll = function () {
    return db.prepare('SELECT * FROM probleme').all();

};