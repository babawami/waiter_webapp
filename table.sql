
DROP TABLE IF EXISTS waiters, weekdays, days_booked;

CREATE TABLE waiters
(
    id serial not null PRIMARY KEY,
    names text not null 
);

CREATE TABLE weekdays
(
    id serial not null PRIMARY KEY,
    weekday text UNIQUE
);

INSERT INTO weekdays(weekday) VALUES('Monday');
INSERT INTO weekdays(weekday) VALUES('Tuesday');
INSERT INTO weekdays(weekday) VALUES('Wednesday');
INSERT INTO weekdays(weekday) VALUES('Thursday');
INSERT INTO weekdays(weekday) VALUES('Friday');
INSERT INTO weekdays(weekday) VALUES('Saturday');
INSERT INTO weekdays(weekday) VALUES('Sunday');


CREATE TABLE days_booked
(
    id serial not null PRIMARY KEY,
    name_id int,
    daybooked_id int,
    foreign key(name_id) references waiters(id) ON DELETE CASCADE,
    foreign key(daybooked_id)references weekdays(id) ON DELETE CASCADE
);