var _ = require('lodash');
var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var uuid = require('node-uuid');
var router = express.Router();

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

router.get('/api/attendee', function (req, res) {
    // todo return list of attendee
    return res.json("get ok");
});

router.post('/api/attendee', function (req, res) {

    //validate email
    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail();

    req.getValidationResult().then(function (result) {
        try {
            result.throw();
            data = req.body;
            // check if email exist
            if (existEmail(data.email)) {
                res.status(400).send('Email already registered');
            }
            else {
                data.id = uuid.v4();
                db.get('attendee').push(data).write();
                res.send(`See you there ${data.nickname}!`);
            }
            
        } catch (e) {
            console.log(e.array());
            res.status(400).send('oops, we couldn\'t register you!');
        }
    });
});

//=========================================================
//  UTILS
//---------------------------------------------------------
var existEmail = function exist(email) {
    const attendee = db.get('attendee')
        .find({ email: email })
        .value();
    return !_.isEmpty(attendee);
}

module.exports = router;