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

exports.login = (name, password) => {
    let query = db.prepare('SELECT * FROM user WHERE name = @name AND password = @password');
    let result = query.get({name: name, password: password});
    if (result) {
        return result.id;
    }
    return -1;
};

exports.new_user = (name, password) => {
    let query = db.prepare('INSERT INTO user VALUES (@id, @name, @password)').run({id: null, name:name, password: password});
    return query.lastInsertRowid;
};