// PART 1 require statements

// PART 2 USE statements (cors, bodyparser)

// PART 3 Urls

// PART 4 backend routes

// PART 5 listen on port 3000

var cors = require('cors');
var bp = require('body-parser');
var express = require('express');
var mongodb = require('mongodb');
var request = require('request');
var path = require('path');

var app = express(); //**?

app.use(cors());
app.use(bp.urlencoded({extended:true}));

var MongoClient = mongodb.MongoClient;

var mongoUrl = 'mongodb://localhost:27017/kleiser';


// var PORT = process.env.PORT || 80;
// for heroku ^

app.get('/', function (req, res) {
  res.send('kleiser app. Hello!');
});


app.get('/usefulphrases', function(request, response) {
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
        var phrasesCollection = db.collection('usefulphrases');
        phrasesCollection.find().toArray(function(err, result){
          if (err) {
            console.log("ERROR!", err);
            response.json(result);
          } else if (result.length) {
            console.log("Found:", result);
            response.json(result);
          } else {
            console.log("No documents found with defined criteria.");
            response.json(result);
          }
        }); // end find
    }; // end else
  }); // end mongoconnect
}); //end get

app.listen(3000, function() {
  console.log('App is listening on port 3000!');
});
