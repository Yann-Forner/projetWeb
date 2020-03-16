"use strict";
/*
    Modules
 */

var express = require('express');
var mustache = require('mustache-express');
var model = require('./model');
// parse form arguments in POST requests
const bodyParser = require('body-parser');


var app = express();


/*
    Middleware
 */

app.use(bodyParser.urlencoded({ extended: false }));
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


app.listen(3000, () => console.log('listening on http://localhost:3000'));

