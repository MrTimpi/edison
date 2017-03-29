//=========================================================
//  DATABASE INIT
//---------------------------------------------------------
var lowdb = require('lowdb');
var path = require('path');

const db = lowdb(path.join(__dirname, 'db.json'));
// Set some defaults if the JSON file is empty
db.defaults({ attendee: [] })
    .write()


module.exports = db;