var User       = require('../models/user');
var passport   = require('passport');
var express    = require('express');
var router     = express.Router();

//root route
router.get('/', function(req, res) {
  res.render('landing');
});

//show register form
router.get('/register', function(req, res) {
  res.render('register', {page: 'register'});
});


//handle signup logic
router.post('/register', function(req, res) {
  var newUser = new User({username: req.body.username});
  //locus is a npm package that allows us to stop the code whenever 
  //it hits this point in the route and then we can take a look at whats going on, we can see the variables available to us
  //eval(require('locus')); 
  if (req.body.adminCode === 'secretcode123') {
    newUser.isAdmin = true;
  }
  User.register(newUser, req.body.password, function(err, user) {
    if(err) {
      console.log(err);
      return res.render("register", {error: err.message});
    } 
    passport.authenticate('local')(req, res, function() {
      req.flash('success', 'Welcome to YelpCamp ' + user.username);
      res.redirect('/campgrounds');
    });
  });
});

//show login form
router.get('/login', function(req, res) {
  res.render('login', {page: 'login'});
});

//handle login logic
router.post('/login', passport.authenticate('local', {
  successRedirect: '/campgrounds',
  failureRedirect: '/login',
  failureFlash: true,
  successFlash: 'Welcome to YelpCamp!'
  }), function(req, res) {
});

//logout route
router.get('/logout', function(req, res) {
  req.logout();
  req.flash('success', 'Logged you out!');
  res.redirect('/campgrounds');
});


module.exports = router;
