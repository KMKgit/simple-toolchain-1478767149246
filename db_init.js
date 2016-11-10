var MongoClient = require('mongodb').MongoClient,
  test = require('assert');
MongoClient.connect('mongodb://localhost:27017/', function(err, db) {
  test.equal(null, err);

  // Create a capped collection with a maximum of 1000 documents
  db.createCollection("user", function(err, collection) {
    test.equal(null, err);
    // Insert a document in the capped collection
    console.log("happy");
    db.close();
  });
});