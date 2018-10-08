var Campground   = require('../models/campground');
var middleware   = require('../middleware');
var express      = require('express');
var router       = express.Router();
var NodeGeocoder = require('node-geocoder');

var options = {
  provider: 'google',
  httpAdapter: 'https',
  apiKey: process.env.GEOCODER_API_KEY,
  formatter: null
};

var geocoder = NodeGeocoder(options);

//INDEX - show all campgrounds
router.get('/', function(req, res) {
  var noMatch = '';
  //eval(require('locus'));
  if(req.query.search) {
    const regex = new RegExp(escapeRegex(req.query.search), 'gi');
    //get all campgrounds, from DB and then render the file
    Campground.find({name: regex}, function(err, allCampgrounds) {
      if(err) {
        console.log(err); 
      } else {
        if(allCampgrounds.length < 1) {
          noMatch = 'No campground match that query, please try again.';
        }
        res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
      }
    });
  } else {
      //console.log(req.user);
      //get all campgrounds, from DB and then render the file
      Campground.find({}, function(err, allCampgrounds) {
        if(err) {
          console.log(err); 
        } else {
          res.render('campgrounds/index', {campgrounds: allCampgrounds, page: 'campgrounds', noMatch: noMatch});
        }
      });
  }
});

//CREATE - add new campground to DB
router.post('/', middleware.isLoggedIn ,function(req, res) {
  //get data from forms and add to campgrounds array (push)
  var name = req.body.name;
  var image = req.body.image;
  var desc = req.body.description;
  var author = {
    id: req.user._id,
    username: req.user.username
  };
  var cost = req.body.cost;
  geocoder.geocode(req.body.location, function(err, data) {
    if(err || !data.length) {
      console.log(err);
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    var lat = data[0].latitude;
    var lng = data[0].longitude;
    var location = data[0].formattedAddress;
    var newCampground = {
      name: name, 
      cost: cost, 
      image: image, 
      description: desc, 
      author: author, 
      lat: lat, 
      lng: lng, 
      location:location
      
    };
    //create a new campground and save to database
    Campground.create(newCampground, function(err, newlyCreated) {
      if(err) {
        console.log(err);
      } else {
        //redirect back to campgrounds page, back to the get route
        console.log(newlyCreated);
        res.redirect('/campgrounds');
      }
      
    });
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
  geocoder.geocode(req.body.location, function(err,data) {
    if(err || !data.length) {
      req.flash('error', 'Invalid address');
      return res.redirect('back');
    }
    req.body.campground.lat = data[0].latitude;
    req.body.campground.lng = data[0].longitude;
    req.body.campground.location = data[0].formattedAddress;
    
       //find and update the correct campground
    Campground.findByIdAndUpdate(req.params.id, req.body.campground, function(err, updatedCampground){
      if (err) {
        req.flash('error', err.message)
        res.redirect('back');
      } else {   //redirect to Updated campground page
        req.flash('success', 'Successfully Updated!');
        res.redirect('/campgrounds/' + updatedCampground._id);
      }
    });
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

function escapeRegex(text) {
  return text.replace(/[-[\]{}()*+?.,\\^$|#\s]/g, "\\$&");
}


module.exports = router;
