const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');


exports.readAll = function () {
    return db.prepare('SELECT * FROM probleme').all();

};