var express = require('express');
var expressValidator = require('express-validator');
var bodyParser = require('body-parser');
var router = express.Router();

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

    req.checkBody('email', 'Email is required.').notEmpty();
    req.checkBody('email', 'Email is not valid').isEmail(); 

    //todo: check if email already exist
    //then save it in db

    req.getValidationResult().then(function (result) {
        try {
            result.throw();
            res.send('See you there!');
        } catch (e) {
            console.log(e.array());
            res.status(400).send('oops, we couldn\'t register you!');
        }
    });
});

module.exports = router;