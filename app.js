var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var port = process.env.PORT || 8081;
var app = express();

// config
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// routes
app.use('/', require('./routes/index'));

app.listen(port, function(){
    console.log('server listening at: ' + port);
})