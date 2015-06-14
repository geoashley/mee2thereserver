var mongoose = require('mongoose');
//mongoose.connect('mongodb://mee2thereservice:rva2015@ds041831.mongolab.com:41831/mee2theredb');
//console.log(mongoose);
// Mongoose connection to MongoDB (ted/ted is readonly)


//Mongoose Schema definition
var Schema = mongoose.Schema;

var ChatSchema = new Schema({
	eventId: String,
	userId: String, 
	time: {type:Date,default:Date.now},
	message: String
});


// Mongoose Model definition
var Chat = mongoose.model('chats', ChatSchema);
// make this available to our users in our Node applications
module.exports = Chat;
