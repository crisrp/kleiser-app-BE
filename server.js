var cors = require('cors');
var bp = require('body-parser');
var express = require('express');
var mongodb = require('mongodb');
var request = require('request');
var path = require('path');

var app = express(); //**?

var PORT = process.env.PORT || 3000;
// var PORT = process.env.PORT || 80;

app.use(cors());
app.use(bp.text({extended:true}));
// app.use(bp.urlencoded({extended: true}));

var MongoClient = mongodb.MongoClient;

var mongoUrl = 'mongodb://localhost:27017/kleiser';
// var mongoUrl = 'mongodb://heroku_r2b0d4gm:vni40asof632mi7jgs4pn1sg34@ds029715.mlab.com:29715/heroku_r2b0d4gm/';

var CAMBRIDGE_API_KEY = process.env;

/* default */
app.get('/', function (req, res) {
  res.send('kleiser app. Hello!');
});

/*get random phrase*/
app.get('/usefulphrases', function(request, response) {
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
        var phrasesCollection = db.collection('usefulphrases');
        var recId = Math.floor(Math.random() * 100) + 1;
        phrasesCollection.find({id: recId}).toArray(function(err, result){
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

    } // end else
  }); // end mongoconnect
}); //end get

/*show all saved phrases*/
app.get('/usefulphrases/saved', function(req, res){
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
      var savedPhrases = db.collection('saved');
      savedPhrases.find();
    }
  });
});

/*TO API - get the word's entry Id*/
app.post('/usefulphrases/wordgetid', function(req, res) {
  /*query Cambridge dictionary*/
  var baseUrl = 'https://dictionary.cambridge.org/api/v1/';
  var searchWord = req.body;
  console.log("******SEARCH WORDS ARE*********");
  console.log(searchWord);
  var endpoint = 'dictionaries/british/search/?q='+searchWord+'&pagesize=10&pageindex=1';
  console.log('QUERY TO API: '+ baseUrl+endpoint);

  request({
    url: baseUrl+endpoint,
    headers: {'accesskey': 'mcq9cxUgNQdTw9O6dE7WjIjeB87UCOjd2TRtHW9PTfzCgPgqrvZe8J7uqsQx6Nv8'},
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  });
});

/*TO API  - get the word's definition*/
app.post('/usefulphrases/wordgetdef', function(req, res) {
  var baseUrl = 'https://dictionary.cambridge.org/api/v1/';
  var searchEntry = req.body;
  var endpoint = 'dictionaries/british/entries/'+searchEntry+'/?format=html';
  console.log('QUERY TO API FOR ENTRIES: '+ baseUrl+endpoint);

  request ({
    url: baseUrl+endpoint,
    headers: {'accesskey': 'mcq9cxUgNQdTw9O6dE7WjIjeB87UCOjd2TRtHW9PTfzCgPgqrvZe8J7uqsQx6Nv8'},
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  });
});

/* save phrase */
app.post('/usefulphrases/new', function(req,res) {
  console.log("request.body: " + req.body)
  var savedPhrase = req.body;

  MongoClient.connect(mongoUrl, function(err, db){
    var savedCollection = db.collection('saved');
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
        console.log("connected to server. saving....")
        console.log(req.body);

        /* insert */
        savedCollection.insert([savedPhrase], function(err, result){
          if (err){
            console.log(err);
            response.json("error");
          } else {
            console.log("inserted.");
            console.log('Result: ', result);
            console.log("end result");
            response.json(result);
          }
        });
    }
  });
});

/***port listening***/
app.listen(PORT, function() {
  console.log('App is listening on port'+ PORT);
});
