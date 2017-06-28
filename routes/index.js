var _ = require('lodash');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var util = require('util');
var router = express.Router();
var fs = require('fs');

var request = require('request');
var config = require('../slack-invite-config');

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
    var orgaCounter = 0;
    var visitorCounter =0;

    let visitors = db.get('attendee').value().map((v) => {
        return {
            id: v.id,
            handle: v.handle,
            group: v.group,
            country: v.country,
            isOrga: v.isOrga,
            hasEmail: !!v.email
        };
    }).forEach((item) => {
        if (item.isOrga) {
            orgaCounter++;
            orgaHTML += '<tr><td>' + orgaCounter + '</td><td>' + item.handle + '</td><td>' + item.group + '</td><td>' + item.country + '</td></tr>';
        } else {
            visitorCounter++;
            trHTML += '<tr><td>' + visitorCounter + '</td><td>' + item.handle + '</td><td>' + item.group + '</td><td>' + item.country;
            if (!item.hasEmail) {
                trHTML += '</td><td><a class="zmdi zmdi-info" title="Due to data corruption, please resupply email address to orgas" href="mailto:tim.schonberger@gmail.com?Subject=Edison email ammendment: ' + item.handle + '"> missing email</a>';
            }
            trHTML += '</td></tr>';
        }
    });

    fs.readFile('public/visitors-template.html', (err, html) => {
        return res.status(200).send(html.toString().replace('<!--visitorhtml-->', trHTML).replace('<!--orgahtml-->', orgaHTML));
    });
});

router.post('/api/attendee', function (req, res) {
    logRequest("/api/attendee", "POST")

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
                console.log("Registered visitor: ", data)

                res.send(`See you there ${data.handle}!`);
            }

        } catch (e) {
            console.log(e);
            res.status(400).send('oops, we couldn\'t register you!');
        }
    });
});

console.log("SLACK - slacktoken: \"" + config.slacktoken + "\"")
console.log("SLACK - slackUrl: \"" + config.slackUrl + "\"")
console.log("SLACK - inviteToken: \"" + config.inviteToken + "\"")
// slack invite
router.post('/api/slack/invite', function (req, res) {
    logRequest("/api/slack/invite", "POST")
    if (req.body.email && (!config.inviteToken || (!!config.inviteToken && req.body.token === config.inviteToken))) {
        request.post({
            url: 'https://' + config.slackUrl + '/api/users.admin.invite',
            form: {
                email: req.body.email,
                token: config.slacktoken,
                set_active: true
            }
        }, function (err, httpResponse, body) {
            // body looks like:
            //   {"ok":true}
            //       or
            //   {"ok":false,"error":"already_invited"}
            if (err) { return res.send('Error:' + err); }
            body = JSON.parse(body);
            if (body.ok) {
                res.status(200).send('Success! Check &ldquo;' + req.body.email + '&rdquo; for an invite from Slack.');
            } else {
                var error = body.error;
                if (error === 'already_invited' || error === 'already_in_team') {
                    res.status(200).send('Success! You were already invited.<br>' +
                        'Visit <a href="https://' + config.slackUrl + '">' + config.community + '</a>');
                    return;
                } else if (error === 'invalid_email') {
                    error = 'The email you entered is an invalid email.';
                } else if (error === 'invalid_auth') {
                    error = 'Something has gone wrong. Please contact a system administrator.';
                }
                res.status(400).send('Failed! ' + error );
                return;
            }
        });
    } else {
        var errMsg = [];
        if (!req.body.email) {
            errMsg.push('your email is required');
        }

        if (!!config.inviteToken) {
            if (!req.body.token) {
                errMsg.push('valid token is required');
            }

            if (req.body.token && req.body.token !== config.inviteToken) {
                errMsg.push('the token you entered is wrong');
            }
        }
        res.status(400).send(+ errMsg.join(' and ') + '.');
    }
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
    if (!method)
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
