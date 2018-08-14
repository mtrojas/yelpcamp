var Campground = require('../models/campground');
var middleware = require('../middleware');
var express    = require('express');
var router     = express.Router();



//INDEX - show all campgrounds
router.get('/', function(req, res) {
  //console.log(req.user);
  //get all campgrounds, from DB and then render the file
  Campground.find({}, function(err, allCampgrounds) {
    if(err) {
      console.log(err); 
    } else {
      res.render('campgrounds/index', {campgrounds: allCampgrounds});
    }
  });
});

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn ,function(req, res) {
  //get data from forms and add to campgrounds array (push)
  var name = req.body.name;
  var price = req.body.price;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var newCampground = {name: name, price: price, image: image, description: desc, author: author};
  //create a new campground and save to database
  Campground.create(newCampground, function(err, newlyCreated) {
    if(err) {
      console.log(err);
    } else {
      //redirect back to campgrounds page, back to the get route
      res.redirect('/campgrounds');
    }
  });
});

//NEW - show the form to add a new campgroud
router.get('/new', middleware.isLoggedIn, function(req, res) {
  res.render('campgrounds/new');  
});

//SHOW - shows more information about one specific campground
router.get('/:id', function(req, res) {
  //find the campground with the corresponding id
  Campground.findById(req.params.id).populate('comments').exec(function(err, foundCampground) {
    if(err || !foundCampground) {
      req.flash('error', 'Campground not found');
      return res.redirect('back');
    } else {  //render show template with that campground
      res.render('campgrounds/show', {campground: foundCampground});
    }
  });
});

//EDIT CAMPGROUND ROUTE
router.get('/:id/edit', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground){
    res.render('campgrounds/edit', {campground: foundCampground});
  });
});

//UPDATE CAMPGROUND ROUTE
router.put('/:id', middleware.checkCampgroundOwnership, function(req, res) {
   //find and update the correct campground
  Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
    if (err) {
      res.redirect('/campgrounds');
    } else {   //redirect to show page 
       res.redirect('/campgrounds/' + updatedCampground._id);
    }
  });
});

//DESTROY CAMPGROUND ROUTE
router.delete('/:id', middleware.checkCampgroundOwnership, function(req, res) {
  Campground.findByIdAndRemove(req.params.id, function(err) {
    if(err) {
      res.redirect('/campgrounds');
    } else {
      res.redirect('/campgrounds');
    }
  });
});


module.exports = router;