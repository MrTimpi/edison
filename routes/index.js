var express = require('express');
var router = express.Router();

router.get('/', function (req, res) {
    res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

router.get('/api/attendee', function (req, res) {
    var user = {
        name: req.body.name,
        email: req.body.email
    };
    console.log(req);
    return res.json("get ok");
});

router.post('/api/attendee', function (req, res) {
    var user = {
        name: req.body.name,
        email: req.body.email
    };
    console.log(req);
    return res.json("post ok");
});

module.exports = router;