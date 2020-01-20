const MongoClient = require('mongodb').MongoClient
const urlDB = 'mongodb://localhost:27017/tto'
var quizs;

class Database {
  init() {
    console.log('Initializing database...')
    const quizz = require('../../document/quizz')
    MongoClient.connect(urlDB, { useNewUrlParser: true }, function (err, db) {
      if (err) throw err
      console.log('database created')
      const database = db.db('tto')
      database.collection('quizz').insertMany(quizz, function (err, res) {
          if (err) throw err
          console.log(`inserted quiz:${res.insertedCount}`)
          db.close()
        })
    })
  }

  sendAllQuizz(socket){
    MongoClient.connect(urlDB, {useNewUrlParser: true}, function (err, db) {
      if (err) throw  err
      const dbo = db.db('tto')
      dbo.collection('quizz').find({}).toArray(function (err, result) {
        if (err) throw  err
        socket.emit('all quizz', result)
        db.close()
      })
    })
  }

  closeDatabase(){
    MongoClient.connect(urlDB, {useNewUrlParser: true}, function (err, db) {
      if(err) throw  err;
      const dbo = db.db('tto');
      dbo.dropDatabase();
      dbo.close()
      console.log('dfsdf')
      process.exit(0)
    })
  }
}

module.exports = new Database()
