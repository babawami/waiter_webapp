'use strict';
module.exports = (pool) => {
    const waitersNames = async (name) => {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let nameExists = await pool.query('Select 1 from waiters WHERE names = $1', [name]);
        if (nameExists.rows.length === 0) {
            await pool.query('INSERT INTO waiters(names) VALUES($1)', [name]);
            return 'name added';
        } else if (nameExists.rows.length === 1) {
            return 'name exists';
        }
    };

    const bookingOfDays = async (enteredName, scheduleday) => {
        // scheduleday loop

        let userName = await pool.query('SELECT * FROM waiters where names = $1', [enteredName]);
        let daybooked = await pool.query('SELECT *  FROM weekdays WHERE weekday = $1', [scheduleday]);

        let userID = userName.rows[0].id;
        let daysID = daybooked.rows[0].id;
        await pool.query('INSERT INTO days_booked(name_id, daybooked_id) VALUES($1,$2)', [userID, daysID]);
    };

    const bookedDays = async () => {
        let shifts = await pool.query('SELECT *  FROM days_booked ');
        return shifts.rows;
    };

    const allShifts = async () => {
        let weekSchedule = await pool.query('SELECT waiters.names, weekdays.weekday FROM days_booked INNER JOIN waiters ON days_booked.name_id = waiters.id INNER JOIN weekdays ON days_booked.daybooked_id = weekdays.id');
        return weekSchedule.rows;
    };

    return {
        waitersNames,
        bookingOfDays,
        bookedDays,
        allShifts
    };
};
