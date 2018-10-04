var passportLocalMongoose = require('passport-local-mongoose'),
    mongoose              = require('mongoose');

var userSchema = new mongoose.Schema({
  name: String,
  password: String,
  isAdmin: {
    type: Boolean,
    default: false
  }
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);