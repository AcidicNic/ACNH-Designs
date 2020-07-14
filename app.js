if (process.env.NODE_ENV !== 'production') {  require('dotenv').config(); }
const express = require('express');
const app = express();
const port = process.env.PORT || 666;

// Importing packages
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
// const expressValidator = require('express-validator');
const expressSession = require('express-session')({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false
});
const cookieParser = require('cookie-parser');
const jwt = require('jsonwebtoken');

// routes
const router = require('./routes/router');

// Handlebars setup
app.engine('hbs', exphbs({
    defaultLayout: 'base',
    extname: '.hbs',
    layoutsDir: __dirname + '/views',
    partialsDir: __dirname + '/views/partials'
}));
app.set('view engine', 'hbs');

// BodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// Validator setup
// app.use(expressValidator());

// ExpressSession setup
app.use(expressSession);

// CookieParser setup
app.use(cookieParser());

// Static files in views/assets
app.use(express.static('public'));

// css and JS shortcuts!
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/fas', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));

// Check Auth and get user object!
const auth = require('./controllers/auth');
app.use(auth.checkAuth);

// Mongoose Setup
require('./data/design-db');

// Routes
app.use('/', router);

app.listen(port, () => {
    console.log(`Live at http://localhost:${port}`);
});
