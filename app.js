/*
    Modules ---------

 */

var express = require('express');
var mustache = require('mustache-express');
var model = require('./model');


var app = express();


/*
    Middleware ---------

 */

app.use(express.urlencoded());

/*
    Template ---------

 */

app.engine('html', mustache());
app.set('view engine', 'html');
app.set('views', './views');

/*
    Routes ---------

 */
app.get('/', (req, res) => {
    console.log(model.readAll());
    res.render('index');
});


app.listen(3000, () => console.log('listening on http://localhost:3000'));

