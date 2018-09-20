'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
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


app.post('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
        let days = req.body.day;
        console.log(days);
        let displayDays = await waiterServices.getWeekDays();
         
        await waiterServices.bookingOfDays(username, days);
        res.render('waiters', { displayDays });
    } catch (err) {
        next(err.stack);
    }
});

app.get('/waiters/:username', async (req, res, next) => {
    try {
        let username = req.params.username;
       let checkwaiter = await waiterServices.waitersNames(username);
       //console.log(checkwaiter);

        let displayDays = await waiterServices.getWeekDays();
        let selectdays = await waiterServices.bookedDays();
        console.log(selectdays.daybooked_id);

        res.render('waiters', { username, displayDays });
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
