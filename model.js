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

exports.login = (user_login, password) => {
    let query = db.prepare('SELECT * FROM user WHERE name = @user_login AND password = @password');
    let result = query.get({user_login: user_login, password: password});
    if (result) {
        return result.id;
    }
    return -1;
};

exports.new_user = (user_login, password, name, surname, city, mail, phone) => {
    let query = db.prepare('INSERT INTO user VALUES (@id, @user_login, @password, @name, @surname, @city, @mail, @phone)')
        .run({id: null, user_login: user_login, password: password, name: name, surname: surname, city: city, mail: mail, phone: phone});
    return query.lastInsertRowid;
};