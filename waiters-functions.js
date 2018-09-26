'use strict';
module.exports = (pool) => {
    const getWeekDays = async () => {
        let days = await pool.query('SELECT * FROM weekdays');
        return days.rows;
    };

    const waitersNames = async (name) => {
        let days = await getWeekDays();
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let nameExists = await pool.query('Select 1 from waiters WHERE names = $1', [name]);

        if (nameExists.rows.length === 0) {
            await pool.query('INSERT INTO waiters(names) VALUES($1)', [name]);
            return days;
        } else if (nameExists.rows.length === 1) {
            let waiterDays = await pool.query('SELECT waiters.names, weekdays.weekday FROM days_booked INNER JOIN waiters ON days_booked.name_id = waiters.id INNER JOIN weekdays ON days_booked.daybooked_id = weekdays.id where names=$1', [name]);
            let waitershift = waiterDays.rows;

            for (let weekday of days) {
                for (let shiftDays of waitershift) {
                    if (weekday.weekday === shiftDays.weekday) {
                        weekday.checked = 'checked';
                    }
                }
            }

            return days;
        }
    };

    const bookingOfDays = async (enteredName, scheduleday) => {
        enteredName = enteredName.charAt(0).toUpperCase() + enteredName.slice(1);
        let waiter = await pool.query('SELECT * FROM waiters where names = $1', [enteredName]);
        let userID = waiter.rows[0].id;
        if (userID) {
            await pool.query('DELETE FROM days_booked WHERE name_id=$1', [userID]);
        }
        for (let dayId of scheduleday) {
            let foundId = await pool.query('SELECT id From weekdays WHERE weekday=$1', [dayId]);
            await pool.query('INSERT INTO days_booked(name_id, daybooked_id) VALUES($1,$2)', [userID, foundId.rows[0].id]);
        }
    };

    const bookedDays = async () => {
        let shifts = await pool.query('SELECT *  FROM days_booked ');
        return shifts.rows;
    };

    const allShifts = async () => {
        let weekSchedule = await pool.query();
        return weekSchedule.rows;
    };

    const admin = async () => {
        let days = await getWeekDays();
        for (let dayofweek of days) {
            let getAllShifts = await pool.query('SELECT waiters.names as names FROM days_booked INNER JOIN waiters ON days_booked.name_id = waiters.id INNER JOIN weekdays ON days_booked.daybooked_id = weekdays.id where weekdays.id = $1 ORDER BY names', [dayofweek.id]);
            dayofweek.waiter = getAllShifts.rows;
            if (dayofweek.waiter.length === 3) {
                dayofweek.color = 'green';
            } else if (dayofweek.waiter.length > 3 || dayofweek.waiter.length === 0) {
                dayofweek.color = 'crimson';
            } else if (dayofweek.waiter.length < 3 && dayofweek.waiter.length > 0 ) {
                dayofweek.color = 'orange';
            }
        }
        console.log(days);
        return days;
    };

    return {
        waitersNames,
        bookingOfDays,
        bookedDays,
        allShifts,
        getWeekDays,
        admin
    };
};
