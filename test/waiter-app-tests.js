'use strict';
let assert = require('assert');
let waitersFunctions = require('../waiters-functions');
const pg = require('pg');
const Pool = pg.Pool;

// we are using a special test database for the tests
const connectionString = process.env.DATABASE_URL || 'postgresql://coder:pg123@localhost:5432/weekly_schedule';

const pool = new Pool({
    connectionString
});

describe('It should store names of the waiters', function () {
    beforeEach(async function () {
        await pool.query('DELETE FROM waiters');
        await pool.query('DELETE FROM days_booked');
    });
    it('Add names to the database', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.waitersNames('Andrew');
        let allNames = await pool.query('SELECT * FROM waiters');
        assert.equal(allNames.rows[0].names, 'Andrew');
    });
    it('Return days that has been booked by the waiter', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.getWeekDays();
        await waitersData.waitersNames('Andrew');
        await waitersData.bookingOfDays('Andrew', ['Monday', 'Tuesday']);
        let booked = await waitersData.waitersNames('Andrew');
        assert.deepEqual(booked, [ { id: 1, weekday: 'Monday', checked: 'checked' },
            { id: 2, weekday: 'Tuesday', checked: 'checked' },
            { id: 3, weekday: 'Wednesday' },
            { id: 4, weekday: 'Thursday' },
            { id: 5, weekday: 'Friday' },
            { id: 6, weekday: 'Saturday' },
            { id: 7, weekday: 'Sunday' }]);
    });
    it('Show all the days booked by the waiters ', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.getWeekDays();
        await waitersData.waitersNames('Andrew');
        await waitersData.waitersNames('Yegan');
        await waitersData.bookingOfDays('Andrew', ['Monday', 'Tuesday']);
        await waitersData.bookingOfDays('Yegan', ['Wednesday', 'Friday']);
        await waitersData.waitersNames('Andrew');
        await waitersData.waitersNames('Yegan');
        let admin = await waitersData.admin();
        assert.deepEqual(admin, [
            { id: 1, weekday: 'Monday', waiter: [ { 'names': 'Andrew' } ], color: 'orange' },
            { id: 2, weekday: 'Tuesday', waiter: [ { 'names': 'Andrew' } ], color: 'orange' },
            { id: 3, weekday: 'Wednesday', waiter: [ { 'names': 'Yegan' } ], color: 'orange' },
            { id: 4, weekday: 'Thursday', waiter: [], color: 'crimson' },
            { id: 5, weekday: 'Friday', waiter: [ { 'names': 'Yegan' } ], color: 'orange' },
            { id: 6, weekday: 'Saturday', waiter: [], color: 'crimson' },
            { id: 7, weekday: 'Sunday', waiter: [], color: 'crimson' }]);
    });
    it('Add colour crimson for the overbooking or no booking, orange below 3 booked waiters and green for 3 booked waiters', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.getWeekDays();
        await waitersData.waitersNames('Andrew');
        await waitersData.waitersNames('Yegan');
        await waitersData.waitersNames('Busisele');
        await waitersData.waitersNames('Sbu');
        await waitersData.bookingOfDays('Andrew', ['Monday', 'Tuesday', 'Friday']);
        await waitersData.bookingOfDays('Yegan', ['Monday', 'Friday']);
        await waitersData.bookingOfDays('Busisele', ['Monday', 'Friday']);
        await waitersData.bookingOfDays('Sbu', ['Friday']);
        await waitersData.waitersNames('Andrew');
        await waitersData.waitersNames('Yegan');
        await waitersData.waitersNames('Busisele');
        await waitersData.waitersNames('Sbu');
        let admin = await waitersData.admin();
        assert.deepEqual(admin, [
            { id: 1, weekday: 'Monday', waiter: [ { 'names': 'Andrew' }, { 'names': 'Busisele' }, { 'names': 'Yegan' } ], color: 'green' },
            { id: 2, weekday: 'Tuesday', waiter: [ { 'names': 'Andrew' } ], color: 'orange' },
            { id: 3, weekday: 'Wednesday', waiter: [], color: 'crimson' },
            { id: 4, weekday: 'Thursday', waiter: [], color: 'crimson' },
            { id: 5, weekday: 'Friday', waiter: [ { 'names': 'Andrew' }, { 'names': 'Busisele' }, { 'names': 'Sbu' }, { 'names': 'Yegan' } ], color: 'crimson' },
            { id: 6, weekday: 'Saturday', waiter: [], color: 'crimson' },
            { id: 7, weekday: 'Sunday', waiter: [], color: 'crimson' }]);
    });

    after(function () {
        pool.end();
    });
});
