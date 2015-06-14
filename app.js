var express = require('express');
var http = require('http');
var async = require('async');


var path = require('path');
var favicon = require('serve-favicon');
var logger = require('morgan');

var cookieParser = require('cookie-parser');
var bodyParser = require('body-parser');
var mongoose = require('mongoose');
mongoose.connect('mongodb://mee2thereservice:rva2015@ds041831.mongolab.com:41831/mee2theredb', function (error) {
    if (error) {
        console.log(error);
    }
});

var routes = require('./routes/index');


var users = require('./routes/users');

var  eventModel = require("./models/event_model");
var  userModel = require("./models/user_model");

var  chatModel = require("./models/chat_model");

eventModel.find({}, function(err, events) {
  if (err) throw err;

  // object of all the users
  //console.log(events);
});


var app = express();
var debug = require('debug')('mee2thereserver:server');

app.set('port', process.env.PORT || 3000);

var server = app.listen(app.get('port'), function() {
    debug('Express server listening on port ' + server.address().port);
});

var io = require('socket.io').listen(server);


// var app = express();
// var http = require('http');
// var server = http.createServer(app)
// var io = require('socket.io').listen(server);

// var http = require('http').Server(app);
// var io = require('socket.io')(http);

// console.log(io);
//var server = require('http').createServer(app);  
// app.listen(app.get('port'), function(){
//    console.log("Express server listening on port " + app.get('port'));
// });
// var io = require('socket.io').listen(server);

// view engine setup
app.set('views', path.join(__dirname, 'views'));
app.set('view engine', 'hjs');

// uncomment after placing your favicon in /public
//app.use(favicon(__dirname + '/public/favicon.ico'));
app.use(logger('dev'));
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));
app.use(cookieParser());
app.use(express.static(path.join(__dirname, 'public')));

app.use('/', routes);
app.use('/users', users);

// catch 404 and forward to error handler
app.use(function(req, res, next) {
  var err = new Error('Not Found');
  err.status = 404;
  next(err);
});

// error handlers

// development error handler
// will print stacktrace
if (app.get('env') === 'development') {
  app.use(function(err, req, res, next) {
    res.status(err.status || 500);
    res.render('error', {
      message: err.message,
      error: err
    });
  });
}

// production error handler
// no stacktraces leaked to user
app.use(function(err, req, res, next) {
  res.status(err.status || 500);
  res.render('error', {
    message: err.message,
    error: {}
  });
});




// Chatroom

// usernames which are currently connected to the chat
var usernames = {};
var numUsers = 0;
var broadcastChats=[];
var userFullNames= [];


io.on('connection', function (socket) {

  var addedUser = false;
  // when the client emits 'new message', this listens and executes
  socket.on('new message', function (data) {
    var newChat = new chatModel({
        eventId: socket.eventid,
        userId: socket.userid,
        message: data

    });
    newChat.save(function(err, chats) {
      if (err) throw err;

      // object of all the users
      // console.log(chats);
      // broadcastChats = chats;
    });

    // we tell the client to execute 'new message'
    socket.broadcast.emit('new message', {
      username: socket.username,
      message: data
    });
  });

var waiting = 0;

  // when the client emits 'add user', this listens and executes
  socket.on('add user', function (username,userid,eventid) {
    // console.log(username);
    // console.log(userid);
    // console.log(eventid);

    // we store the username in the socket session for this client
    socket.username = username;
    socket.userid = userid;
    socket.eventid = eventid;

  /*  async.waterfall([
      function(callback){
        chatModel.find({eventId:eventid})
        .sort({date: 'desc'})
        .limit(10)
        .exec(function(err, chats) {
          if (err) throw err;
          broadcastChats = chats;

          callback(null,chats);

        });

      },
      function(arg1,callback1){
        var chats = arg1;
        // for (var i = 0; i < chats.length; i++) {
        async.each(chats, function(chat, callback){
          userModel.findOne({_id:chat.userId},{'fullname':1},function(err, username) {
             if (err) throw err;
              userFullNames.push(username);
              console.log("username" + username);
          });
          callback1();

        }, function(err){
          console.log("userFullNames" + userFullNames);
          callback(null,'done');

        });



      }
    ], function(err){
      //socket emit
      console.log("socket emit");
            socket.emit('login', {
        numUsers: numUsers,
        chats:broadcastChats
      });

    });*/

    chatModel.find({eventId:eventid})
    .sort({date: 'desc'})
    .limit(10)
    //.populate('userId')
    .exec(function(err, chats) {
      if (err) throw err;
      waiting = chats.length;
      broadcastChats = chats;

      for (var i = 0; i < chats.length; i++) {
          // console.log(chats[i].userId);
          userModel.findOne({_id:chats[i].userId},{'fullname':1},function(err, username) {
             if (err) throw err;
             waiting--;
            userFullNames.push(username);
            console.log(username)
            complete(socket,broadcastChats,userFullNames);
            });

      }


      // socket.emit('login', {
      //   numUsers: numUsers,
      //   chats:broadcastChats

      // });
      console.log("over");
    });


    // add the client's username to the global list
    usernames[username] = username;
    ++numUsers;
    addedUser = true;
    //console.log(broadcastChats);

    // echo globally (all clients) that a person has connected
    socket.broadcast.emit('user joined', {
      username: socket.username,
      numUsers: numUsers,
    });
  });


function complete(socket,broadcast,usernames) {

    if (!waiting) {
         //console.log('waiting'+broadcast);
      for (var i = 0; i < broadcast.length; i++) {
        
        for(var j in usernames) {
          //console.log('1'+usernames[j]._id);
          //console.log('2'+broadcast[i].userid);

          if(usernames[j]._id == broadcast[i].userId){
            //console.log('match'+usernames[j].fullname);
            broadcast[i] = {
              'eventId': broadcast[i].eventId,
              'userId': broadcast[i].userId,
              'message': broadcast[i].message,
              'time': broadcast[i].time,
              'username': usernames[j].fullname
            };
            // broadcast[i].username = usernames[j].fullname;
            // console.log('match'+broadcast[i].username);

          }
        }

      }
         console.log('waiting'+broadcast);

        console.log('done');
        socket.emit('login', {
          numUsers: numUsers,
          chats:broadcast
        });
    
    }
}


  // when the client emits 'typing', we broadcast it to others
  socket.on('typing', function () {
    socket.broadcast.emit('typing', {
      username: socket.username
    });
  });

  // when the client emits 'stop typing', we broadcast it to others
  socket.on('stop typing', function () {
    socket.broadcast.emit('stop typing', {
      username: socket.username
    });
  });

  // when the user disconnects.. perform this
  socket.on('disconnect', function () {
    // remove the username from global usernames list
    if (addedUser) {
      delete usernames[socket.username];
      --numUsers;

      // echo globally that this client has left
      socket.broadcast.emit('user left', {
        username: socket.username,
        numUsers: numUsers
      });
    }
  });
});



module.exports = app;
