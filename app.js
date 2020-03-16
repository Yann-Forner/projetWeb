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

app.get('/', (req, res) => {
    console.log(model.readAll());
    res.render('index');
});

app.get('/login', (req, res) => {
   res.render('login');
});

app.post('/login', (req, res) => {
    let userId = model.login(req.body.name, req.body.password);
    if (userId !== -1) {
        req.session.user = userId;
        res.redirect('/');
        return;
    }
    res.redirect('/login');
});

app.get('/logout', (req, res) => {
    req.session = null;
    res.locals.authentificated = false;
    res.redirect('/');
});

app.get('/new_user', (req, res) => {
    res.render('new_user');
});

app.post('/new_user', (req, res) => {
    req.session.user = model.new_user(req.body.name, req.body.password);
    res.redirect('/');
});


app.listen(3000, () => console.log('listening on http://localhost:3000'));

