"use strict";
/*
    Modules
 */

const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

/*
    Fonctions
 */

exports.getUsers = function () {
    return db.prepare('SELECT * FROM user').all();
};

exports.login = (mail, password) => {
    let query = db.prepare('SELECT * FROM user WHERE mail = @mail AND password = @password');
    let result = query.get({mail: mail, password: password});
    if (result) {
        return result.id;
    }
    return -1;
};

exports.new_user = (user_login, password, name, surname, city, mail, phone) => {
    let query = db.prepare('INSERT INTO user VALUES (@id, @password, @name, @surname, @city, @mail, @phone)')
        .run({id: null, password: password, name: name, surname: surname, city: city, mail: mail, phone: phone});
    return query.lastInsertRowid;
};