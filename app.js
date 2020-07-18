if (process.env.NODE_ENV !== 'production') {  require('dotenv').config(); }
const express = require('express');
const app = express();
const port = process.env.PORT || 666;

// Importing packages
const Handlebars = require('handlebars');
const exphbs = require('express-handlebars');
const bodyParser = require('body-parser');
const session = require("express-session");
const mongooseConnection = require('./data/design-db');
const MongoStore = require("connect-mongo")(session);
const passport = require("./passport/setup");
const cookieParser = require('cookie-parser');
const {allowInsecurePrototypeAccess} = require('@handlebars/allow-prototype-access');


// routes
const router = require('./routes/router');

// Handlebars setup
app.engine('hbs', exphbs({
    handlebars: allowInsecurePrototypeAccess(Handlebars),
    defaultLayout: 'base',
    extname: '.hbs',
    layoutsDir: __dirname + '/views',
    partialsDir: __dirname + '/views/partials',
    helpers: {}

}));
app.set('view engine', 'hbs');

// BodyParser setup
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

// ExpressSession setup
app.use(session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: true,
    store: new MongoStore({ mongooseConnection: mongooseConnection })
}));

// Passport Setup
app.use(passport.initialize());
app.use(passport.session());

// CookieParser setup
app.use(cookieParser());



// Static files in views/assets
app.use(express.static('public'));

// css and JS shortcuts!
app.use('/bs', express.static(__dirname + '/node_modules/bootstrap/dist'));
app.use('/jquery', express.static(__dirname + '/node_modules/jquery'));
app.use('/popper', express.static(__dirname + '/node_modules/popper.js/dist'));
app.use('/fas', express.static(__dirname + '/node_modules/@fortawesome/fontawesome-free'));


app.use(function(req, res, next) {
    res.locals.cUser = req.user;
    next();
});


// Routes
app.use('/', router);

app.listen(port, () => {
    console.log(`Live at http://localhost:${port}`);
});
