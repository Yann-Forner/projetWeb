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

app.get('/home', is_authenticated, is_admin,(req,res)=>{
   res.render("home");
});

app.get('/login', (req, res) => {
   res.render('login');
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

app.get('/new_user', (req, res) => {
    res.render('new_user');
});

app.post('/new_user', (req, res) => {
    req.session.user = model.new_user(req.body.password, req.body.name, req.body.surname,
                                        req.body.city, req.body.mail, req.body.phone, 'user');
    res.redirect('/');
});

app.get('/profile', is_authenticated, is_admin, (req,res)=>{
    let myUser  = model.get_user(req.session.user);
    console.log(myUser);
    res.render('profile',myUser);
});

app.get('/admin',is_authenticated,is_admin,(req,res)=>{
    let users  = model.get_users();
    res.render('admin',{users: users});
});

app.post('/add_user', (req, res) => {
    let isDone = model.new_user(req.body.password, req.body.name, req.body.surname,
        req.body.city, req.body.mail, req.body.phone, req.body.role);
    let users  = model.get_users();
    res.render('admin',{users: users, isAdd: isDone !== -1});
});

app.get('/delete/:id', (req, res) => {
    let isDone = model.delete_user(req.params.id);
    let users  = model.get_users();
    res.render('admin',{users: users, isDelete: isDone});
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));

