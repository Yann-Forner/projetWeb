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
const fetch = require('node-fetch');

const { check, validationResult } = require('express-validator');

var app = express();


/*
    Middleware
 */

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
        res.status(401).render('error-page', {error: 'Authentication required'});
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
        res.status(401).render('error-page', {error: 'You are not an administrator'});
    }
}

const check_inscription = [
    // mail must be an email and must not exists in database
    check('mail').custom(value => {
        if (!value.match(/[\w\-.]+@[\w\-]{2,}\.[a-zA-Z]{2,}/)) {
            return Promise.reject("Email isn't at good format");
        }
        if (model.is_mail_exists(value) !== undefined) {
            return Promise.reject('E-mail already used');
        }
        else return Promise.resolve;
    }),
    // password must be at least 5 chars long
    check('password', "Password isn't enough long").isLength({ min: 5 }),
    // name and surname must be alphabetic and between 2 and 20 characters
    check('name', 'Name is not at good format').matches(/[\wáàâãéèêíïóôõöúçñ -]*/).isLength({min: 2, max: 20}),
    check('surname', 'Surname is not at good format').matches(/[\wáàâãéèêíïóôõöúçñ -]*/).isLength({min: 2, max: 20}),
    // city must be alphabetic and between 1 and 100 characters
    check('city').matches(/[\wáàâãéèêíïóôõöúçñ -]*/).isLength({min: 1, max: 100}),
    // phone must be at phone format
    check('phone').custom(value => {
        if (!value.match(/(\+\d+(\s|-))?0\d(\s|-)?(\d{2}(\s|-)?){4}/)) {
            return Promise.reject("Phone isn't at good format");
        }
        else return Promise.resolve;
    })
];

const check_new_password = [
    check('new_password1').isLength({min: 5}).custom((value, {req}) => {
        if (value !== req.body.new_password2) {
            return Promise.reject("Password aren't the same");
        }
        return Promise.resolve;
    })
];

//a appeler pour appliquer la validation
const validator = (req, res, next) => {
    const errors = validationResult(req);
    console.log(errors);
    if (!errors.isEmpty()) {
        res.locals.validationFailed = true;
        res.locals.errors = errors.array();
    }
    next();
};

app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieSession({secret: 'mot-de-passe-du-cookie',}));
app.use('/img', express.static(__dirname + '/img'));
app.use('/js',express.static(__dirname + '/js'));
app.use('/css',express.static(__dirname + '/css'));

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
    else res.render('index',{myUrl : "https://source.unsplash.com/1800x1080/?nature"});
});

app.get('/home', is_authenticated, isLogAdmin, (req,res) => {
    let isPeople = false;
    let needs = model.get_user_needs(req.session.user);
    let peoples = [];

    let myTown = model.get_my_town(req.session.user);

    let iterNumber = 0;
    for (let need of needs){
        let users = model.get_correspondance(need.category, need.name);
        for (let user of users){
            ++iterNumber;
        }
    }
    let categories = model.get_categories();
    if(iterNumber === 0){
        res.render("home", {peoples: peoples, categories: categories , isPeople : isPeople});
    }
    for (let need of needs) {
        let users = model.get_correspondance(need.category, need.name);
        if (users.length !== 0) {
            for(let user of users){

                let url = "https://fr.distance24.org/route.json?stops="+myTown.city+"|"+user.city;

                let settings = { method: "Get" };
                fetch(url, settings)
                    .then(res => res.json())
                    .then((json) => {
                        let people = {user: user, object: need.name ,distance: json.distance};
                        peoples.push(people);
                        if( iterNumber === peoples.length){
                            if(peoples.length !== 0) isPeople = true;
                            peoples.sort(function (a,b) {
                                return a.distance - b.distance;
                            });
                            res.render("home", {peoples: peoples, categories: categories , isPeople : isPeople});
                        }
                    });

            }

        }
    }

});

app.get('/login', isLogin, (req, res) => {
    if(res.locals.authentificated)res.redirect("/home");
    else res.render('login');
});

app.post('/login', (req, res) => {
    let user = model.login(req.body.mail, req.body.password);
    if (user !== -1) {
        let userId = user.id;
        let userRole = user.role;
        req.session.user = userId;
        req.session.role = userRole;
        res.redirect('/');
    }
    else {
        res.render('login', {isFail: true});
    }
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

app.post('/new_user', check_inscription, validator, (req, res) => {
    if (res.locals.validationFailed === true) {
        res.status(422).render('new_user', {errors: res.locals.errors})
    }
    else {
        req.session.user = model.new_user(req.body.password, req.body.name, req.body.surname,
            req.body.city, req.body.mail, req.body.phone, 'user');
        res.redirect('/');
    }
});

app.get('/profile', is_authenticated, isLogAdmin, (req,res)=>{
    let myUser = model.get_user(req.session.user);
    let surplus = model.get_user_surplus(req.session.user);
    let needs = model.get_user_needs(req.session.user);
    let names = model.get_names();
    let categories = model.get_categories();
    res.render('profile',{myUser : myUser , surplus : surplus , needs : needs, names : names , categories : categories } );
});

app.post('/add-new-exchange' , (req,res) => {
    let id  = model.get_id_object(req.body.name,req.body.category);
    if(id === -1) id = model.new_object(req.body.name,req.body.category,) ;
    model.add_object_to_user(req.session.user,id,req.body.type);
    res.redirect('/profile');
 });

app.get('/edit-profile', is_authenticated, isLogAdmin, (req, res) => {
    let myUser = model.get_user(req.session.user);
    res.render('edit-profile', {myUser: myUser});
});

app.post('/edit-profile', is_authenticated, isLogAdmin, (req, res) => {
    let userChanges = {name: req.body.name, surname: req.body.surname, city: req.body.city, mail: req.body.mail, phone: req.body.phone};
    if (model.edit_profile(req.session.user, req.body.password, req.body.name, req.body.surname, req.body.city, req.body.mail, req.body.phone) > 0) {
        res.redirect('/profile');
    }
    else {
        res.render('edit-profile', {myUser: userChanges, isNotDone: true});
    }
});

app.post('/edit-password', is_authenticated, isLogAdmin, check_new_password, validator, (req, res) => {
    let userChanges = {name: req.body.name, surname: req.body.surname, city: req.body.city, mail: req.body.mail, phone: req.body.phone};
    if (res.locals.validationFailed === true) {
        res.status(422).render('edit-profile', {myUser: userChanges, isNotDone: true, errors: res.locals.errors})
    }
    if (model.edit_password(req.session.user, req.body.current_password, req.body.new_password1) > 0) {
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

app.post('/add_user', is_authenticated, is_admin, check_inscription, validator, (req, res) => {
    if (res.locals.validationFailed === true) {
        res.status(422).render('admin', {errors: res.locals.errors})
    }
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
    let surplus = model.get_user_surplus(req.params.id);
    let besoins = model.get_user_needs(req.params.id);
    res.render('user', {user: user, surplus: surplus , needs : besoins});
});

app.post('/search', isLogin, isLogAdmin, (req, res) => {
    let peoples = [];
    let users;
    if(req.body.category === "" && req.body.object === "" ) res.redirect("/home");
    else{
        if(req.body.category === "" )users = model.get_correspondance_only_name(req.body.object);
        else if( req.body.object === "" ) users = model.get_correspondance_only_cat(req.body.category);
        else {
            users = model.get_correspondance(req.body.category, req.body.object);
        }
        for (let user of users) {
            let people = {object: user.objectName , user: user};
            peoples.push(people);
        }
        console.log(peoples);
        res.render("find", {peoples : peoples});
    }
});


app.get('*', function(req, res){
    res.status(404).render('error-page', {error: '404 NOT FOUND'});
});

app.listen(3000, () => console.log('listening on http://localhost:3000'));

