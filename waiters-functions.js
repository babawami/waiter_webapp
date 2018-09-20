'use strict';
module.exports = (pool) => {
    const getWeekDays = async () => {
        let days = await pool.query('SELECT * FROM weekdays');
        return days.rows;
    };

    const waitersNames = async (name) => {
        name = name.charAt(0).toUpperCase() + name.slice(1);
        let nameExists = await pool.query('Select * from waiters WHERE names = $1', [name]);
         let waiterDays = await pool.query('SELECT id  FROM days_booked ');
        if (nameExists.rowCount.length === 0) {
            await pool.query('INSERT INTO waiters(names) VALUES($1)', [name]);
            return 'name added';
        } else if (nameExists.rowCount.length > 0) {
            // let days = getWeekDays();
            // let waiterDays = bookedDays();
            
            // for (let weekdays of days.id) {
            //     for (const shiftDays of waiterDays) {
                    
            //     }
            // }
            return 'name exists';
        }
    };

    const bookingOfDays = async (enteredName, scheduleday) => {
        enteredName = enteredName.charAt(0).toUpperCase() + enteredName.slice(1);
        let waiter = await pool.query('SELECT * FROM waiters where names = $1', [enteredName]);
        let userID = waiter.rows[0].id;
        for (let dayId of scheduleday) {
            await pool.query('INSERT INTO days_booked(name_id, daybooked_id) VALUES($1,$2)', [userID, dayId]);
        }
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
        allShifts,
        getWeekDays
    };
};
