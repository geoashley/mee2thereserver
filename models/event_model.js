var mongoose = require('mongoose');
//mongoose.connect('mongodb://mee2thereservice:rva2015@ds041831.mongolab.com:41831/mee2theredb');
//console.log(mongoose);
// Mongoose connection to MongoDB (ted/ted is readonly)


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

var EventSchema = new Schema({
    name: String,
    description: String,
    date: Date,
    location: [LocationSchema]
});

// Mongoose Model definition
var Events = mongoose.model('events', EventSchema);
// make this available to our users in our Node applications
module.exports = Events;
