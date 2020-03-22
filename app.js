"use strict";
/*
    Modules
 */

var express = require('express');
var mustache = require('mustache-express');
var model = require('./model');
// parse form arguments in POST requests
const bodyParser = require('body-parser');
const cookieSession = require('cookie-session');

var app = express();


/*
    Middleware
 */

app.use(bodyParser.urlencoded({ extended: false }));

app.use(cookieSession({secret: 'mot-de-passe-du-cookie',}));

function isLogin(req, res, next) {
    if(req.session.user !== undefined){
        res.locals.authentificated = true;
    }
    next();
}

function isLogAdmin(req, res, next) {
    if (req.session.role === 'admin') {
        res.locals.administrator = true;
    }
    next()
}

function is_authenticated (req, res, next) {
    if (req.session.user === undefined){
        res.locals.authentificated = false;
        res.status(401).send('Authentication required');
    }
    else {
        res.locals.authentificated = true;
        next();
    }
}

function is_admin (req, res, next) {
    if (req.session.role === 'admin') {
        res.locals.administrator = true;
        next();
    }
    else {
        res.locals.administrator = false;
        res.status(401).send('You are not an administrator');
    }
}


app.use('/img', express.static(__dirname + '/img'));
app.use('/js',express.static(__dirname + '/js'));

/*
    Template
 */

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

/*
    Routes
 */

app.get('/', isLogin, (req, res) => {
    if(res.locals.authentificated)res.redirect("/home");
    else res.render('index');
});

app.get('/home', is_authenticated, isLogAdmin, (req,res)=>{
    let peoples = [];
    let users = model.get_users();
    for (let user of users) {
        let people = {user: user, object: "carotte"};
        peoples.push(people);
    }
    let categories = model.getCategories();
   res.render("home", {peoples: peoples, categories: categories});
});

app.get('/login', isLogin, (req, res) => {
    if(res.locals.authentificated)res.redirect("/home");
    else res.render('login');
});

app.post('/login', (req, res) => {
    let user = model.login(req.body.mail, req.body.password);
    let userId = user.id;
    let userRole = user.role;
    if (userId !== -1) {
        req.session.user = userId;
        req.session.role = userRole;
        res.redirect('/');
        return;
    }
    res.render('login',{isFail : true});
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.locals.authentificated = false;
    res.locals.administrator = false;
    res.redirect('/');
});

app.get('/new_user', isLogAdmin, (req, res) => {
    res.render('new_user');
});

app.post('/new_user', (req, res) => {
    req.session.user = model.new_user(req.body.password, req.body.name, req.body.surname,
                                        req.body.city, req.body.mail, req.body.phone, 'user');
    res.redirect('/');
});

app.get('/profile', is_authenticated, isLogAdmin, (req,res)=>{
    let myUser = model.get_user(req.session.user);
     // model.add_object_to_user(req.session.user,model.new_object('chou','alimentaire'),'surplus');
    let surplus =model.get_user_surplus(req.session.user);
    let needs =model.get_user_needs(req.session.user);
    let names = model.get_names();
    let categories = model.getCategories();
    res.render('profile',{myUser : myUser , surplus : surplus , needs : needs, names : names , categories : categories } );
});

app.get('/edit-profile', is_authenticated, isLogAdmin, (req, res) => {
    let myUser = model.get_user(req.session.user);
    res.render('edit-profile', {myUser: myUser});
});

app.post('/edit-profile', (req, res) => {
    let userChanges = {name: req.body.name, surname: req.body.surname, city: req.body.city, mail: req.body.mail, phone: req.body.phone};
    if (model.edit_profile(req.session.user, req.body.password, req.body.name, req.body.surname, req.body.city, req.body.mail, req.body.phone) > 0) {
        res.redirect('/profile');
    }
    else {
        res.render('edit-profile', {myUser: userChanges, isNotDone: true});
    }
});
app.get('/delete-exchange-needs/:id', is_authenticated , (req,res)=>{
    model.delete_exchange_needs(req.session.user,req.params.id);
   res.redirect('/profile');
});
app.get('/delete-exchange-surplus/:id', is_authenticated , (req,res)=>{
    model.delete_exchange_surplus(req.session.user,req.params.id);
    res.redirect('/profile');
});
app.get('/admin', is_authenticated, is_admin,(req,res)=>{
    let users  = model.get_users();
    res.render('admin',{users: users});
});

app.post('/add_user', is_authenticated, is_admin, (req, res) => {
    let isDone = model.new_user(req.body.password, req.body.name, req.body.surname,
        req.body.city, req.body.mail, req.body.phone, req.body.role);
    let users  = model.get_users();
    res.render('admin',{users: users, isAdd: isDone !== -1});
});

app.get('/delete/:id', is_authenticated, is_admin, (req, res) => {
    let isDone = model.delete_user(req.params.id);
    let users  = model.get_users();
    res.render('admin',{users: users, isDelete: isDone});
});

app.get('/user/:id', isLogin, isLogAdmin, (req, res) => {
    let user = model.get_user(req.params.id);
    res.render('user', {user: user});
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));

