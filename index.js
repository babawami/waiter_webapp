'use strict';

const express = require('express');
const exphbs = require('express-handlebars');
const session = require('express-session');
const flash = require('express-flash');
const bodyParser = require('body-parser');
const WaiterServices = require('./waiters-functions');
const WaitersRoute = require('./waitersRoute');
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
const waitersRoutes = WaitersRoute(waiterServices);

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

app.post('/waiters/:username', waitersRoutes.bookingOfDays);

app.get('/waiters/:username', waitersRoutes.getBookingOfDays);

app.get('/', waitersRoutes.goToHome);

app.get('/days', waitersRoutes.showAllShifts);

app.get('/clear', waitersRoutes.clear);

// configure the port number using and environment number
var portNumber = process.env.PORT || 3010;

// start everything up
app.listen(portNumber, function () {
    console.log('App starting on port', portNumber);
});
