"use strict";
/*
    Modules
 */

const Sqlite = require('better-sqlite3');
var passwordHash = require('password-hash');
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
    let query = db.prepare('SELECT * FROM user WHERE mail = @mail');
    let result = query.get({mail: mail});
    if (result !== undefined && passwordHash.verify(password,result.password )) {
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
    name = name.trim().toLowerCase();
    let query = db.prepare('INSERT INTO object VALUES(@id , @name ,@category)').run({id : null, name : name, category:category});
    return query.lastInsertRowid;
};

exports.add_object_to_user = (idUser, idObject , type) =>{
    try {
        db.prepare('INSERT INTO exchange VALUES (@idUser, @idObject, @type)').run({idUser : idUser , idObject : idObject , type : type});
    }
    catch (e) {
        return e;
    }
};

exports.get_user_object = (id) =>{
    return db.prepare('SELECT * FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser').all({idUser : id});
};
exports.get_user_needs = (id) =>{
    return db.prepare('SELECT object.* FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser AND exchange.type = @type').all({idUser : id , type : 'besoin'});
};
exports.get_user_surplus = (id) =>{
    return db.prepare('SELECT object.* FROM object LEFT JOIN exchange ON exchange.idObject = object.id WHERE exchange.idUser = @idUser AND exchange.type = @type').all({idUser : id , type : 'surplus'});
};
exports.delete_exchange_needs = (idUser, idObject) =>{
    db.prepare('DELETE FROM exchange WHERE idUser = @idUser AND idObject = @idObject AND type = @type').run({idUser : idUser , idObject : idObject , type : 'besoin'});
};
exports.delete_exchange_surplus = (idUser, idObject) =>{
    db.prepare('DELETE FROM exchange WHERE idUser = @idUser AND idObject = @idObject AND type = @type').run({idUser : idUser , idObject : idObject , type : 'surplus'});
};

exports.delete_user = (id) => {
    let query = db.prepare('DELETE FROM user WHERE id = @id').run({id: id});
    return query.changes === 1;

};

exports.get_id_object = (name,category) => {
  let query = db.prepare('SELECT id FROM object WHERE name = @name AND category = @category').get({name : name , category : category});
  if(query === undefined)return -1;
  return query.id;
};

exports.edit_profile = (userID, name, surname, city, mail, phone) => {
    let query = db.prepare('UPDATE user SET name = @name, surname = @surname, city = @city, phone = @phone, mail = @mail WHERE id = @id')
        .run({id: userID, name: name, surname: surname, city: city, mail: mail, phone: phone});
    return query.changes;
};

exports.edit_password = (userId, new_password) => {
    let query = db.prepare('UPDATE user set password = @new_password WHERE id = @id')
        .run({id: userId, new_password: passwordHash.generate(new_password)});
    return query.changes;
};

exports.get_categories = () => {
    let query = db.prepare('SELECT category FROM object GROUP BY category').all();
    return query;
};

exports.get_correspondance = (category, name) => {
    let query = db.prepare('SELECT object.name AS objectName,user.id, user.city, user.name, user.surname FROM object LEFT JOIN exchange ON exchange.idObject = object.id LEFT JOIN user ON exchange.idUser = user.id WHERE object.category = @category AND object.name = @name AND exchange.type = @type')
        .all({category: category, name: name, type: "surplus"});
    return query;
};

exports.get_correspondance_only_name = (name) => {
    let query = db.prepare('SELECT object.name AS objectName,user.id, user.name, user.surname FROM object LEFT JOIN exchange ON exchange.idObject = object.id LEFT JOIN user ON exchange.idUser = user.id WHERE   object.name = @name AND exchange.type = @type')
        .all({ name: name, type: "surplus"});
    return query;
};

exports.get_correspondance_only_cat = (category) => {
    let query = db.prepare('SELECT object.name AS objectName,user.id, user.name, user.surname FROM object LEFT JOIN exchange ON exchange.idObject = object.id LEFT JOIN user ON exchange.idUser = user.id WHERE object.category = @category  AND exchange.type = @type')
        .all({category: category, type: "surplus"});
    return query;
};

exports.get_names = () => {
    let query = db.prepare('SELECT name FROM object').all();
    return query;
};

exports.is_mail_exists = (mail) => {
    let query = db.prepare('SELECT mail FROM user WHERE mail = @mail').get({mail: mail});
    return query;
};

exports.get_my_town = (id) =>{

    let query = db.prepare('SELECT city FROM user WHERE id = @id').get({id: id});
    return query;
}

exports.replaceSpecialChars = (string) => {
    const tab1 = "ÀÁÂÃÄÅàáâãäåÒÓÔÕÖØòóôõöøÈÉÊËèéêëÇçÌÍÎÏìíîïÙÚÛÜùúûüÿÑñ";
    const tab2 = "aaaaaaaaaaaaooooooooooooeeeeeeeecciiiiiiiiuuuuuuuuynn";
    let rep2 = tab1.split('');
    let rep = tab2.split('');
    let myarray = [];
    let i = -1;
    while(rep2[++i]){
        myarray[rep2[i]]=rep[i]
    }
    myarray['Œ']='OE'
    myarray['œ']='oe'
    return string.replace(/./g, function($0){return (myarray[$0])?myarray[$0]:$0 })
}