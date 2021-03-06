const express = require('express');
const path = require('path');
const favicon = require('serve-favicon');
const logger = require('morgan');
const cookieParser = require('cookie-parser');
const bodyParser = require('body-parser');
const session = require('express-session');
const dotenv = require('dotenv');
const passport = require('passport');
const Auth0Strategy = require('passport-auth0');
const flash = require('connect-flash');

dotenv.load();

const routes = require('./routes/index');
const user = require('./routes/user');
const apis = require('./routes/apis');

passport.use('us',new Auth0Strategy({
  domain: process.env.AUTH0_US_DOMAIN,
  clientID: process.env.AUTH0_US_CLIENT_ID,
  clientSecret: process.env.AUTH0_US_CLIENT_SECRET,
  callbackURL: process.env.APP_BASE_URL + process.env.AUTH0_US_CALLBACK_URL,
  passReqToCallback: true
}, function (req, access_token, refresh_token, extraParams, profile, done) {
  // This callback is invoked event after authorize call originating
  // server-side
  // accessToken is the token to call Auth0 API
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user

  req.session.access_token = access_token;
  req.session.refresh_token = refresh_token;
  req.session.expires_in = extraParams.expires_in;
  req.session.id_token = extraParams.id_token;
  req.session.profile = profile;
  return done(null, profile);
}
 ) );

 passport.use('eu',new Auth0Strategy({
  domain: process.env.AUTH0_DOMAIN,
  clientID: process.env.AUTH0_CLIENT_ID,
  clientSecret: process.env.AUTH0_CLIENT_SECRET,
  callbackURL: process.env.APP_BASE_URL + process.env.AUTH0_CALLBACK_URL,
  passReqToCallback: true
}, function (req, access_token, refresh_token, extraParams, profile, done) {
  // This callback is invoked event after authorize call originating
  // server-side
  // accessToken is the token to call Auth0 API
  // extraParams.id_token has the JSON Web Token
  // profile has all the information from the user

  req.session.access_token = access_token;
  req.session.refresh_token = refresh_token;
  req.session.expires_in = extraParams.expires_in;
  req.session.id_token = extraParams.id_token;
  req.session.profile = profile;
  return done(null, profile);
}
 ) );



// you can use this section to keep a smaller payload
passport.serializeUser(function (user, done) {
  done(null, user);
});

passport.deserializeUser(function (user, done) {
  done(null, user);
});

const app = express();

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'pug');

app.use(favicon(path.join(__dirname, 'public', 'favicon.ico')));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({
  extended: false
}));
app.use(cookieParser());
app.use(session({
  secret: 'shhhhhhhhh',
  resave: true,
  saveUninitialized: true
}));
app.use(passport.initialize());
app.use(passport.session());
app.use(express.static(path.join(__dirname, 'public')));

app.use(flash());

// Handle auth failure error messages
app.use(function (req, res, next) {
  if (req && req.query && req.query.error) {
    req.flash('error', req.query.error);
  }
  if (req && req.query && req.query.error_description) {
    req.flash('error_description', req.query.error_description);
  }
  next();
});

// Check logged in
app.use(function (req, res, next) {
  res.locals.loggedIn = false;
  if (req.session.passport && typeof req.session.passport.user !== 'undefined') {
    res.locals.loggedIn = true;
  }
  next();
});

app.use('/', routes);
app.use('/user', user);
app.use('/api', apis);

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function (err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function (err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});

module.exports = app;
