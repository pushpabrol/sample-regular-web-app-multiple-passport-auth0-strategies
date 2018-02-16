const express = require('express');
const ensureLoggedIn = require('connect-ensure-login').ensureLoggedIn;
const router = express.Router();

/* GET user profile. */
router.get('/', ensureLoggedIn('/auth'), function (req, res, next) {
  
  let env = {}
  if(req.session.profile && req.session.profile._json["https://natgeo.com/claims/auth0_tenant"] === "EU")
  env = {
    AUTH0_CLIENT_ID: process.env.AUTH0_CLIENT_ID,
    AUTH0_DOMAIN: process.env.AUTH0_DOMAIN,
    AUTH0_CALLBACK_URL: process.env.APP_BASE_URL + process.env.AUTH0_CALLBACK_URL,
    LOGOUT_URL : process.env.APP_BASE_URL + process.env.LOGOUT_URL
  };

  else 
  env = {
    AUTH0_DOMAIN: process.env.AUTH0_US_DOMAIN,
    AUTH0_CLIENT_ID: process.env.AUTH0_US_CLIENT_ID,
    AUTH0_CALLBACK_URL: process.env.APP_BASE_URL + process.env.AUTH0_US_CALLBACK_URL,
    LOGOUT_URL : process.env.APP_BASE_URL + process.env.LOGOUT_URL
  }
  console.log(env);
  
  res.render('user', { env: env, user: req.user });
});

module.exports = router;
