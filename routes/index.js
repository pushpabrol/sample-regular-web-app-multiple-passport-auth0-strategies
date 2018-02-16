const express = require('express');
const passport = require('passport');
const uuidv4 = require('uuid/v4');
const router = express.Router();

const env = {
  AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
  AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
  AUTH0_CALLBACK_URL: process.env.APP_BASE_URL + process.env.AUTH0_CALLBACK_URL,
  AUTH0_US_DOMAIN: process.env.AUTH0_US_DOMAIN,
  AUTH0_US_CLIENT_ID: process.env.AUTH0_US_CLIENT_ID,
  AUTH0_US_CALLBACK_URL: process.env.APP_BASE_URL + process.env.AUTH0_US_CALLBACK_URL,
  AUDIENCE: process.env.AUDIENCE,
  SCOPE: process.env.SCOPE,
  LOGOUT_URL : process.env.APP_BASE_URL + process.env.LOGOUT_URL,
  APP_BASE_URL: process.env.APP_BASE_URL
};

/* GET home page. */
router.get('/', function (req, res, next) {
  res.render('index', { env: env });
});

router.get('/elogin', function (req, res) {
  res.render('login', { env: env });
});

router.get('/clogin', function (req, res) {
  console.log(req.session);
  req.session.state = uuidv4();
  let url = `https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}`;

        if(req.query.login_hint) url  += "&login_hint=" +  req.query.login_hint
  res.redirect(url);
});

router.get('/usclogin', function (req, res) {
  console.log(req.session); 
  req.session.state = uuidv4();
  
  let url = `https://${env.AUTH0_US_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_US_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_US_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}`;
        if(req.query.login_hint) url  += "&login_hint=" +  req.query.login_hint
  res.redirect(url);
});
router.get('/auth', function (req, res) {
  if (req.user) {
    res.redirect('/user');
  } else {
    // check if SSO session exists..
    req.session.state = uuidv4();

    if(req.session.profile && req.session.profile._json["https://natgeo.com/claims/auth0_tenant"] === "US")
    res.redirect(`https://${env.AUTH0_US_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_US_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_US_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}&prompt=none`);

    else res.redirect(`https://${env.AUTH0_DOMAIN}/authorize?response_type=code&client_id=${env.AUTH0_CLIENT_ID}` +
        `&redirect_uri=${env.AUTH0_CALLBACK_URL}&audience=${env.AUDIENCE}&state=${req.session.state}&scope=${env.SCOPE}&prompt=none`);
    
  }
});

router.get('/logout', function (req, res) {
  req.logout();
  var region = req.cookies['region'];
  if(region === 'EU')
  {
  const callbackUrl = env.AUTH0_CALLBACK_URL;
  const returnToUrl = callbackUrl.substr(0, callbackUrl.lastIndexOf('/'));
  res.redirect(`https://${env.AUTH0_DOMAIN}/v2/logout?client_id=${env.AUTH0_CLIENT_ID}&returnTo=${returnToUrl}`);
  }
  else 
  {
    res.redirect(`https://${env.AUTH0_US_DOMAIN}/v2/logout?client_id=${env.AUTH0_US_CLIENT_ID}&returnTo=${env.APP_BASE_URL}`);
  }
});

router.get('/callback',
  passport.authenticate('eu', { failureRedirect: '/failure'}),
  function (req, res) {
    res.cookie('region' ,'EU');
    res.redirect('/user');
  });

 router.get('/us/callback',
  passport.authenticate('us', { failureRedirect: '/failure'
 }),
  function (req, res) {
    res.cookie('region' ,'US');
    res.redirect('/user');
  });


router.get('/failure', function (req, res) {
  var error = req.flash('error');
  var errorDescription = req.flash('error_description');
  req.logout();
  res.render('failure', {
    error: error[0],
    error_description: errorDescription[0]
  });
});

module.exports = router;
