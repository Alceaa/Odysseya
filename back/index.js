const MySQL = require('./db.js');
const Utils = require('./utils.js');

//config
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3010;
const app = express();
const bodyParser = require('body-parser');
const cookieParser = require("cookie-parser");
const sessions = require('express-session');
const { encode } = require('punycode');

let encodeUrl = parseUrl.urlencoded({ extended: false });
 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

//session middleware
app.use(sessions({
  secret: "thisismysecrctekey",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: false
}));

app.use(cookieParser());

app.use(bodyParser.json()); 
app.use(bodyParser.urlencoded({
  extended: true
}));
 
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});

app.set('views', path.join(__dirname, '../front'));
app.use(express.static(path.join(__dirname, '../front')));
app.set('view engine','ejs');

//db
const mySQL = new MySQL();
mySQL.openConnection();

//utils
const util = new Utils();

//views
app.get('/', (req, res) => {
  res.render('templates/index');
});

app.get('/route', (req, res) => {
  var query = "SELECT DISTINCT region FROM culturalObjects WHERE map IS NOT NULL ORDER BY region";
  mySQL.makeQuery(query, function(result){
    res.render('templates/route', {'regions': JSON.parse(result)});
  });
})

app.get('/register', (req, res) => {
  res.render('templates/reg');
});


//requests 
app.post('/region_count', function (req, res) {
  var query = "SELECT COUNT(*) as count FROM culturalObjects WHERE region LIKE ? AND map IS NOT NULL";
  query = mySQL.prepareQuery(query, req.body["region"]);
  mySQL.makeQuery(query, function(result){
    res.send(JSON.parse(result));
  })
})

app.post('/calc', function (req, res) {
  var query = "CALL kmeans(?, ?)";
  query = mySQL.prepareQuery(query, [req.body["region"], req.body["count"]]);
  mySQL.makeQuery(query, function(result){
      var path = util.getPath(JSON.parse(result));
      console.log(path);
      res.send(JSON.stringify(path));
  })
})
app.post('/register--data', encodeUrl, (req, res) => {
  var firstName = req.body.firstName;
  var lastName = req.body.lastName;
  var userName = req.body.userName;
  var password = req.body.password;
});