var cors = require('cors');
var express = require('express');
var mongodb = require('mongodb');
var request = require('request');
var bodyParser = require('body-parser')
var ObjectId = require('mongodb').ObjectID;

var app = express();

// var PORT = process.env.PORT || 3000;
// heroku
var PORT = process.env.PORT || 80;

app.use(cors());
app.use(bodyParser.urlencoded({extended: true}));


var MongoClient = mongodb.MongoClient;
// var mongoUrl = 'mongodb://localhost:27017/kleiser';
// heroku mongodb
var mongoUrl = 'mongodb://heroku_r2b0d4gm:vni40asof632mi7jgs4pn1sg34@ds029715.mlab.com:29715/heroku_r2b0d4gm/';

var CAMBRIDGE_API_KEY = process.env.CAMBRIDGE_API_KEY;


/* default */
app.get('/', function (request, response) {
  response.send('kleiser app. Hello!');
});

/*get random phrase*/
app.get('/usefulphrases', function(request, response) {
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
        var phrasesCollection = db.collection('usefulphrases');
        var phraseId = Math.floor(Math.random() * 100) + 1;
        phrasesCollection.find({id: phraseId}).toArray(function(err, result){
          if (err) {
            console.log("ERROR!", err);
          } else if (result.length) {
            console.log("Found:", result);
          } else {
            console.log("No documents found with defined criteria.");
          }
          response.json(result);
        }); // end find

    } // end else
  }); // end mongoconnect
}); //end get

/*show all saved phrases*/
app.get('/usefulphrases/saved', function(request, response){
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
      var savedPhrases = db.collection('saved');
      savedPhrases.find().toArray(function (err, result) {
        if (err) {
          console.log("ERROR!", err);
          response.json("error");
        } else if (result.length) {
          console.log('Found:', result);
          response.json(result);
        } else { //
          console.log('No document(s) found with defined "find" criteria');
          response.json("no phrases found");
        }
      })
    }
  })
});

app.delete('/usefulphrases/removeSaved', function(request, response){
  MongoClient.connect(mongoUrl, function(err, db){
    if (err) {
      console.log("Unable to connect to the mongodb server. Error: ", err);
    } else {
        console.log(request.body._id);
        var savedPhrases = db.collection('saved');
        // var result = savedPhrases.remove({ _id: { $eq: request.body._id }});
        var result = savedPhrases.remove({_id: ObjectId(request.body._id) });
        console.log(result);

        response.json("deleted phrase");

      }
  });
});
/*TO API - get the word's entry Id*/
app.post('/usefulphrases/wordgetid', function(req, res) {
  /*query Cambridge dictionary*/
  var apiBaseUrl = 'https://dictionary.cambridge.org/api/v1/';
  var searchWord = req.body.word;
  console.log("***SEARCH WORD: ",searchWord);
  var endpoint = 'dictionaries/british/search/?q='+searchWord+'&pagesize=10&pageindex=1';
  console.log("******TO API SEARCH WORDS ARE*********");
  console.log(searchWord);
  console.log('QUERY TO API: '+ apiBaseUrl+endpoint);

  request({
    url: apiBaseUrl+endpoint,
    headers: {'accesskey': CAMBRIDGE_API_KEY},
    method: 'GET',
    callback: function(error, response, body) {
      res.send(body);
    }
  })
});

/*TO API  - get the word's definition*/
app.post('/usefulphrases/wordgetdef', function(req, res) {
  var apiBaseUrl = 'https://dictionary.cambridge.org/api/v1/';
  var searchEntryId = req.body.entryId;
  console.log("****SearchENTRYID ",searchEntryId);
  var endpoint = 'dictionaries/british/entries/'+searchEntryId+'/?format=html';
  console.log('QUERY TO API FOR ENTRIES: '+ apiBaseUrl+endpoint);

  request ({
    url: apiBaseUrl+endpoint,
    headers: {'accesskey': 'mcq9cxUgNQdTw9O6dE7WjIjeB87UCOjd2TRtHW9PTfzCgPgqrvZe8J7uqsQx6Nv8'},
    method: 'GET',
    callback: function(error, response, body) {
      console.log(response);
      console.log(body);
      res.send(body);
    }
  })
});

/* save phrase */
app.post('/usefulphrases/save', function(request,response) {
  console.log(request.body.phrase);
  MongoClient.connect(mongoUrl, function(error, db){
    var savedPhrasesCollection = db.collection('saved');
    if (error) {
      console.log("Unable to connect to mongodb server: ", error);
    } else {
      console.log("Connection established to: ", mongoUrl);
      console.log("saving new phrase...");
      var newSavedPhrase = request.body;
      savedPhrasesCollection.insert(request.body, function(error, result){
        if (error){
          response.json('error');
        } else {
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
