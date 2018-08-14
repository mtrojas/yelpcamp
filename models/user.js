var passportLocalMongoose = require('passport-local-mongoose'),
    mongoose              = require('mongoose');

var userSchema = new mongoose.Schema({
  name: String,
  password: String
});

userSchema.plugin(passportLocalMongoose);

module.exports = mongoose.model('User', userSchema);