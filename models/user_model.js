var mongoose = require('mongoose');

// mongoose.connect('mongodb://mee2thereservice:rva2015@ds041831.mongolab.com:41831/mee2theredb', function (error) {
//     if (error) {
//         console.log(error);
//     }
// });

//Mongoose Schema definition
var Schema = mongoose.Schema;

var LocationSchema = new Schema({
	address1: String,
	address2: String,
	city: String,
	state: String,
	postal: String,
	country: String,
	latitude: Number,
	longitude: Number
});

var PreferenceSchema = new Schema({
	type: String,
	subtype: String
});

var UserSchema = new Schema({
	fullname: String,
	email: String,
	fbid: String,
	location: [LocationSchema],
	preferences: [PreferenceSchema]
});

// Mongoose Model definition
var Users = mongoose.model('users', UserSchema);

module.exports = Users;
