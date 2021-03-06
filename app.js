require('dotenv').config();

var LocalStrategy  = require('passport-local'),
    methodOverride = require('method-override'),
    bodyParser     = require('body-parser'),
    Campground     = require('./models/campground'),
    Comment        = require('./models/comment'),
    User           = require('./models/user'),
    passport       = require('passport'),
    mongoose       = require('mongoose'),
    session        = require('express-session'),
    express        = require('express'),
    flash          = require('connect-flash'),
    seedDB         = require('./seeds'),
    app            = express();

//requiring routes
var campgroundRoutes = require('./routes/campgrounds'),
    commentRoutes    = require('./routes/comments'),
    indexRoutes      = require('./routes/index');

var url = process.env.DB || 'mongodb://localhost:27017/yelpcamp';

mongoose.connect(url, { useNewUrlParser: true });   

app.use(bodyParser.urlencoded({extended: true}));
app.set('view engine', 'ejs');
app.use(express.static(__dirname + '/public'));
app.use(methodOverride('_method'));
app.use(flash());
//seedDB();

app.locals.moment = require('moment');

//PASSPORT CONFIGURATION
app.use(session({
  secret: 'yelp_camp',
  resave: false,
  saveUninitialized: false
}));
app.use(passport.initialize());
app.use(passport.session());
passport.use(new LocalStrategy(User.authenticate()));
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());


//IMPORTANT MIDDLEWARE THAT MAKES THE USER AVAILABLE EVERYWHERE!!!!! AND THAT WILL RUN FOR EVERY SINGLE ROUTE
app.use(function(req, res, next) {
  res.locals.currentUser = req.user;
  res.locals.error = req.flash('error');
  res.locals.success = req.flash('success');
  next();
});

app.use('/', indexRoutes);
app.use('/campgrounds', campgroundRoutes);
app.use('/campgrounds/:id/comments', commentRoutes);



app.listen(process.env.PORT, process.env.IP, function() {
  console.log('Yelp Camp server has started');
});