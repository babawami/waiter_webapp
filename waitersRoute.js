'use strict';

module.exports = (waiterServices) => {
    const bookingOfDays = async (req, res, next) => {
        try {
            let username = req.params.username;
            let days = Array.isArray(req.body.day) ? req.body.day : [req.body.day];
            await waiterServices.bookingOfDays(username, days);
            res.redirect('/waiters/' + username);
        } catch (err) {
            next(err.stack);
        }
    };

    const getBookingOfDays = async (req, res, next) => {
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
    };

    const goToHome = async (req, res, next) => {
        try {
            res.render('home');
        } catch (err) {
            next(err.stack);
        }
    };
    const showAllShifts = async (req, res, next) => {
        try {
            let allShifts = await waiterServices.admin();
            res.render('days', { allShifts });
        } catch (err) {
            next(err.stack);
        }
    };

    const clear = async (req, res, next) => {
        try {
            await waiterServices.reset();
            res.redirect('/days');
        } catch (err) {
            next(err.stack);
        }
    };

    return {
        bookingOfDays,
        getBookingOfDays,
        goToHome,
        showAllShifts,
        clear
    };
};
