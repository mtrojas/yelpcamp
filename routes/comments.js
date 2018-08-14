var Campground = require('../models/campground');
var middleware = require('../middleware');
var Comment = require('../models/comment');
var express    = require('express');
var router     = express.Router({mergeParams: true});

//NEW COMMENT ROUTE
router.get('/new', middleware.isLoggedIn, function (req, res) {
  Campground.findById(req.params.id, function(err, campground) {
    if(err) {
      console.log(err);
    } else {
      res.render('comments/new', {campground: campground});     
    }
  });
});

//CREATE COMMENT ROUTE
router.post('/', middleware.isLoggedIn, function(req, res){
  //lookup campground using ID again
  Campground.findById(req.params.id, function(err, campground) {
    if(err) {
      console.log(err);
      res.redirect('/campgrounds');
    } else { //create new comment
    //console.log(req.body.comment);
      Comment.create(req.body.comment, function(err, comment) {
        if(err) {
           req.flash('error', 'Something went wrong');
          console.log(err);
      } else {
        //first add username and id to the comment
        comment.author.id = req.user._id;
        comment.author.username = req.user.username;
        //save the comment
        comment.save();
        //connect comment to campground
        campground.comments.push(comment);
        campground.save();
        //redirect to campground
        req.flash('success', 'Comment created successfully');
        res.redirect('/campgrounds/' + campground._id);
      }
     });
    }
  });
});

//COMMENTS EDIT ROUTE
router.get('/:comment_id/edit', middleware.checkCommentOwnership, function(req, res) {
  Campground.findById(req.params.id, function(err, foundCampground) {
    if(err || !foundCampground) {
      req.flash('error', 'Cannot find that campground');
      return res.redirect('back');
    }
    Comment.findById(req.params.comment_id, function(err, foundComment) {
      if(err) {
        res.redirect('back');
      } else {
        res.render('comments/edit', {campground_id: req.params.id, comment: foundComment});
      }
    });
  });
});

//COMMENTS UPDATE ROUTE
router.put('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndUpdate(req.params.comment_id, req.body.comment, function(err, updatedComment) {
    if(err) {
      res.redirect('back');
    } else {
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
}); 

//COMMENTS DESTROY ROUTE
router.delete('/:comment_id', middleware.checkCommentOwnership, function(req, res) {
  Comment.findByIdAndRemove(req.params.comment_id, function(err) {
    if(err) {
      res.redirect('back');
    } else {
      req.flash('success', 'Comment deleted');
      res.redirect('/campgrounds/' + req.params.id);
    }
  });
});


module.exports = router;