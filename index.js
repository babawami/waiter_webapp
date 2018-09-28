'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const WaiterServices = require('./waiters-functions');
const pg = require('pg');
const Pool = pg.Pool;
const app = express();

let useSSL = false;
let local = process.env.LOCAL || false;

if (process.env.DATABASE_URL && !local) {
    useSSL = true;
}

const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/weekly_schedule';

const pool = new Pool({
    connectionString,
    ssl: useSSL
});

const waiterServices = WaiterServices(pool);

// setup template handlebars as the template engine
app.engine('handlebars', exphbs({
    defaultLayout: 'main'
}));

app.set('view engine', 'handlebars');

app.use(express.static('public'));

// setup middleware
// parse application/x-www-form-urlencoded
app.use(bodyParser.urlencoded({ extended: false }));
// parse application/json
app.use(bodyParser.json());

app.use(session({
    secret: 'waiter booked',
    resave: false,
    saveUninitialized: true
}));

app.use(flash());

app.post('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let days = Array.isArray(req.body.day) ? req.body.day : [req.body.day];
        await waiterServices.bookingOfDays(username, days);
        res.redirect('/waiters/' + username);
    } catch (err) {
        next(err.stack);
    }
});

app.get('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let checkwaiter = await waiterServices.checkWaiter(username);
        if (checkwaiter === 'welcome') {
            req.flash('greet', `Welcome ${username} please select the days you want to book`);
        } else if (checkwaiter === 'exist') {
            req.flash('greet', `${username} here are your days you have booked`);
        }
        let displayDays = await waiterServices.waitersNames(username);
        res.render('waiters', { username, displayDays });
    } catch (err) {
        next(err.stack);
    }
});

app.get('/', async (req, res, next) => {
    try {
        res.render('home');
    } catch (err) {
        next(err.stack);
    }
});

app.get('/days', async (req, res, next) => {
    try {
        let allShifts = await waiterServices.admin();
        res.render('days', { allShifts });
    } catch (err) {
        next(err.stack);
    }
});

app.get('/clear', async (req, res, next) => {
    try {
        await waiterServices.reset();
        res.redirect('/days');
    } catch (err) {
        next(err.stack);
    }
});

// configure the port number using and environment number
var portNumber = process.env.PORT || 3010;

// start everything up
app.listen(portNumber, function () {
    console.log('App starting on port', portNumber);
});
