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
    });
    it('Add names to the database', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.waitersNames('Andrew');
        let allNames = await pool.query('SELECT * FROM waiters');
        assert.equal(allNames.rows[0].names, 'Andrew');
    });
    it("Return error message 'name exists' if name already in database", async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.waitersNames('Andrew');
        let nameExits = await waitersData.waitersNames('Andrew');
        await pool.query('SELECT * FROM waiters');
        assert.equal(nameExits, 'name exists');
    });
    it('Join table according to the name and days selected to work', async () => {
        let waitersData = waitersFunctions(pool);
        await waitersData.waitersNames('Andrew');
        await waitersData.waitersNames('Anele');
        await waitersData.bookingOfDays('Andrew', 'Monday');
        await waitersData.bookingOfDays('Andrew', 'Tuesday');
        await waitersData.bookingOfDays('Anele', 'Tuesday');
        await waitersData.bookingOfDays('Anele', 'Wednesday');
        await waitersData.bookedDays();
        let weekSchedule = await waitersData.allShifts();
        console.log(weekSchedule);
        assert.deepEqual(weekSchedule, [ { names: 'Andrew', weekday: 'Monday' },
        { names: 'Andrew', weekday: 'Tuesday' },
        { names: 'Anele', weekday: 'Tuesday' },
        { names: 'Anele', weekday: 'Wednesday' } ]);
    });

    after(function () {
        pool.end();
    });
});
