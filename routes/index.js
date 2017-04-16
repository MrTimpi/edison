var _ = require('lodash');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('util');
var router = express.Router();
var fs = require('fs');

// init db
var db = require('../database/init');


//=========================================================
//  ROUTES
//---------------------------------------------------------
router.use(bodyParser.json());
router.use(expressValidator());

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

router.get('/api/attendee/count', function (req, res) {
    logRequest("/api/attendee/count")

    var visitors = db.get('attendee').value()
    return res.status(200).send({ "count": visitors.length });
})

router.get('/visitors.html', function (req, res) {
  'use strict';

  logRequest('/visitors.html');

  let orgaHTML = '', trHTML = '';

  let visitors = db.get('attendee').value().map((v) => {
    return {
    	id: v.id,
	handle: v.handle,
	group: v.group,
	country: v.country,
	isOrga: v.isOrga
    };
  }).forEach((item) => {
    if (item.isOrga) {
        orgaHTML += '<tr><td>' + item.id + '</td><td>' + item.handle + '</td><td>' + item.group + '</td><td>' + item.country + '</td></tr>';
    } else {
        trHTML += '<tr><td>' + item.id + '</td><td>' + item.handle + '</td><td>' + item.group + '</td><td>' + item.country + '</td></tr>';
    }
  });

  fs.readFile('public/visitors-template.html', (err, html) => {
    return res.status(200).send(html.toString().replace('<!--visitorhtml-->', trHTML).replace('<!--orgahtml-->', orgaHTML));
  });
});

router.post('/api/attendee', function (req, res) {
    logRequest("/api/attendee","POST")

    //remove 2 following lines when registration is open.
    //    res.status(401).send('<pre>Registration is currently closed \n Registration will open 2017-04-15 15:00 CET</pre>');
    //    return;

    //registration limit
    var attendees = db.get('attendee').value();
    if (_.size(attendees) >= 179) {
        res.status(401).send('Maximum number of attendees registered.');
        return;
    }

    //validations
    req.checkBody('handle', 'Handle is required.').notEmpty();
    req.checkBody('country', 'Country is required.').notEmpty();
    req.checkBody('email', 'Email is required.').notEmpty();

    req.getValidationResult().then(function (result) {
        if (!result.isEmpty()) {
            var errors = result.array();
            res.status(400).send(errors[0].msg);
            return;
        }
        try {

            data = req.body;
            // check if handle exist
            if (handleExists(data.handle)) {
                res.status(400).send('Handle is already registered!');
            }
            else if (existEmail(data.email)) {
                res.status(400).send('Email is already registered!');
            }
            else {
                data.id = getNextId()
                db.get('attendee').push(data).write();
                res.send(`See you there ${data.handle}!`);
            }

        } catch (e) {
            console.log(e);
            res.status(400).send('oops, we couldn\'t register you!');
        }
    });
});

//=========================================================
//  UTILS
//---------------------------------------------------------

function getNextId() {
    var attendees = db.get('attendee').value();
    if (_.size(attendees) > 0) {
        return _.last(attendees).id + 1;
    }
    return data.id = 1
}

function handleExists(handle) {
    var attendees = db.get('attendee').value();
    if (_.size(attendees) < 1) return false;

    const attendee = db.get('attendee')
        .find({ handle: handle })
        .value();
    return !_.isEmpty(attendee);
}
var existEmail = function exist(email) {
    const attendee = db.get('attendee')
        .find({ email: email })
        .value();
    return !_.isEmpty(attendee);
}

function logRequest(url, method) {
    if(!method)
        method = "GET"
    console.log(getDateString() + " - " + method + " " + url);
}

function getDateString() {
    var now = new Date()

    var day = leftpadDate(now.getDay())
    var month = leftpadDate(now.getMonth())
    var hour = leftpadDate(now.getHours());
    var minute = leftpadDate(now.getMinutes());
    var second = leftpadDate(now.getSeconds());

    var datestring = "" + now.getFullYear() + month + day + " - " + hour + ":" + minute + ":" + second;
    return datestring;
}
function leftpadDate(number) {
    if (number < 10)
        return "0" + number;

    return number
}
module.exports = router;
