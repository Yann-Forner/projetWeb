"use strict";
/*
    Modules
 */

const Sqlite = require('better-sqlite3');

let db = new Sqlite('db.sqlite');

/*
    Fonctions
 */

exports.get_users = () => {
    return db.prepare('SELECT * FROM user').all();
};
exports.get_user = (id) =>{
  return db.prepare('SELECT * FROM user WHERE id = @id').get({id : id});
};

exports.login = (mail, password) => {
    let query = db.prepare('SELECT * FROM user WHERE mail = @mail AND password = @password');
    let result = query.get({mail: mail, password: password});
    if (result) {
        return result;
    }
    return -1;
};

exports.new_user = (password, name, surname, city, mail, phone, role) => {
    let query = db.prepare('INSERT INTO user VALUES (@id, @password, @name, @surname, @city, @mail, @phone, @role)')
        .run({id: null, password: password, name: name, surname: surname, city: city, mail: mail, phone: phone, role: role});
    return query.lastInsertRowid;
};

exports.new_object = (name,category) => {
  let query = db.prepare('INSERT INTO object VALUES(@id , @name ,@category)').run({id : null, name : name, category:category});
  return query.lastInsertRowid;
};

exports.add_object_to_user = (idUser, idObject , type) =>{
    db.prepare('INSERT INTO exchange VALUES (@idUser, @idObject, @type)').run({idUser : idUser , idObject : idObject , type : type});
};


exports.get_user_object = (id) =>{
    return db.prepare('SELECT * FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser').all({idUser : id});
};
exports.get_user_needs = (id) =>{
    return db.prepare('SELECT object.* FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser AND exchange.type = @type').all({idUser : id , type : 'besoin'});
};
exports.get_user_surplus = (id) =>{
    return db.prepare('SELECT object.* FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser AND exchange.type = @type').all({idUser : id , type : 'surplus'});
}
exports.delete_exchange_needs = (idUser, idObject) =>{
    db.prepare('DELETE FROM exchange WHERE idUser = @idUser AND idObject = @idObject AND type = @type').run({idUser : idUser , idObject : idObject , type : 'besoin'});
};
exports.delete_exchange_surplus = (idUser, idObject) =>{
    db.prepare('DELETE FROM exchange WHERE idUser = @idUser AND idObject = @idObject AND type = @type').run({idUser : idUser , idObject : idObject , type : 'surplus'});
};

exports.delete_user = (id) => {
    let query = db.prepare('DELETE FROM user WHERE id = @id').run({id: id});
    if (query.changes === 1) {
        return true;
    }
    return false;
};

exports.edit_profile = (userID, password, name, surname, city, mail, phone) => {
    let query = db.prepare('UPDATE user SET name = @name, surname = @surname, city = @city, phone = @phone, mail = @mail WHERE id = @id AND password = @password')
        .run({id: userID, password: password, name: name, surname: surname, city: city, mail: mail, phone: phone});
    return query.changes;
};

exports.getCategories = () => {
    let query = db.prepare('SELECT category FROM object GROUP BY category').all();
    return query;
};
exports.get_names = () => {
    let query = db.prepare('SELECT name FROM object').all();
    return query;
};