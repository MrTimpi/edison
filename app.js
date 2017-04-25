var express = require('express');
var bodyParser = require('body-parser');
var path = require('path');

var app = express();

// config
app.use(bodyParser.json());
app.use(express.static(path.join(__dirname, 'public')));
// routes
app.use('/', require('./routes/index'));

// returns an instance of node-greenlock with additional helper methods
var lex = require('greenlock-express').create({
    // set to https://acme-v01.api.letsencrypt.org/directory in production
    // set to staging in test
    server: 'https://acme-v01.api.letsencrypt.org/directory'

    , challenges: { 'http-01': require('le-challenge-fs').create({ webrootPath: '/tmp/acme-challenges' }) }
    , store: require('le-store-certbot').create({ webrootPath: '/tmp/acme-challenges' })
    , approveDomains: approveDomains
});

// handles acme-challenge and redirects to https
require('http').createServer(lex.middleware(require('redirect-https')())).listen(80, function () {
    console.log("Listening for ACME http-01 challenges on", this.address());
});

// handles your app
require('https').createServer(lex.httpsOptions, lex.middleware(app)).listen(443, function () {
    console.log("Listening for ACME tls-sni-01 challenges and serve app on", this.address());
});

function approveDomains(opts, certs, cb) {
    // The domains being approved for the first time are listed in opts.domains
    // Certs being renewed are listed in certs.altnames
    if (certs) {
        opts.domains = certs.altnames;
    }
    else {
        opts.email = 'tim.schonberger@gmail.com';
        opts.agreeTos = true;
    }

    cb(null, { options: opts, certs: certs });
}