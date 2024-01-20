class Encrypter {
  constructor(encryptionKey) {
    this.algorithm = "aes-192-cbc";
    this.key = crypto.scryptSync(encryptionKey, "salt", 24);
  }

  encrypt(clearText) {
    const iv = crypto.randomBytes(16);
    const cipher = crypto.createCipheriv(this.algorithm, this.key, iv);
    const encrypted = cipher.update(clearText, "utf8", "hex");
    return [
      encrypted + cipher.final("hex"),
      Buffer.from(iv).toString("hex"),
    ].join("|");
  }

  dencrypt(encryptedText) {
    const [encrypted, iv] = encryptedText.split("|");
    if (!iv) throw new Error("IV not found");
    const decipher = crypto.createDecipheriv(
      this.algorithm,
      this.key,
      Buffer.from(iv, "hex")
    );
    return decipher.update(encrypted, "hex", "utf8") + decipher.final("utf8");
  }
}



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
var crypto = require('crypto');

let encodeUrl = bodyParser.urlencoded({ extended: false });
 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});

//session middleware
app.use(sessions({
  secret: "t122323",
  saveUninitialized:true,
  cookie: { maxAge: 1000 * 60 * 60 * 24 }, // 24 hours
  resave: true
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


//hash password
const encrypter = new Encrypter("secret");

//utils
const util = new Utils();

//views
app.get('/', (req, res) => {
  let log = false;
  if(req.session.user){
    log = true;
  }
  res.render('templates/index', {'log': log});
});

app.get('/route', (req, res) => {
  let log = false;
  if(req.session.user){
    log = true;
  }
  var query = "SELECT DISTINCT region FROM culturalObjects WHERE map IS NOT NULL ORDER BY region";
  mySQL.makeQuery(query, function(result){
    res.render('templates/route', {'regions': JSON.parse(result), 'log':log});
  });
})

app.get('/register', (req, res) => {
  res.render('templates/reg');
});
app.get('/login', (req, res) => {
  res.render('templates/login');
});
app.get('/logout', (req, res) => {
  req.session.user = null;
  res.redirect('/');
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
app.post('/register-data', encodeUrl, (req, res) => {
  var firstName = req.body["firstname"];
  var lastName = req.body["lastname"];
  var userName = req.body["username"];
  var password = req.body["password"];
  var errors = [];
  if(firstName == ""){
    errors.push({"firstName":"Имя пустое"});
  }
  if(lastName == ""){
    errors.push({"lastName":"Фамилия пустая"});
  }
  if(userName == ""){
    errors.push({"userName":"Имя пользователя пустое"});
  }
  if(password == ""){
    errors.push({"password":"Пароль пустой"})
  }
  if(password.length < 8 ){
    errors.push({"passwordShort":"Пароль слишком короткий"});
  }
  password = encrypter.encrypt(password);
  var query = "SELECT * FROM users WHERE username = ?";
  query = mySQL.prepareQuery(query, userName);
  mySQL.makeQuery(query, function(result){
    if(Object.keys(JSON.parse(result)).length > 0){
      errors.push({"usernameIncorrect":"Пользователь с таким именем уже существует"})
    }else{
      query = "INSERT INTO users(firstname, lastname, username, password) VALUE(?, ?, ?, ?)";
      query = mySQL.prepareQuery(query, [firstName, lastName, userName, password]);
      mySQL.makeQuery(query, function(result){});
    }
  })
  if(errors.length == 0){
    req.session.user = {
      username: userName,
      password: password 
    };
  }
  res.send(errors);
  res.end();
});

app.post('/login-data', encodeUrl, (req, res) => {
    var userName = req.body["username"];
    var password = req.body["password"];
    var errors = [];
    if(userName == ""){
      errors.push({"userName":"Имя пользователя пустое"});
    }
    else if(password == ""){
      errors.push({"password":"Пароль пустой"});
    }
    else{
      var query = "SELECT username, password FROM users WHERE username = ?";
      query = mySQL.prepareQuery(query, userName);
      mySQL.makeQuery(query, function(result){
        if(Object.keys(JSON.parse(result)).length > 0){
          var des = encrypter.dencrypt(JSON.parse(result)[0]["password"]);
          if(des != password){
            res.end();
            errors.push({"passwordIncorrect":"Пароль неверный"});
          }
        }else{
          res.end();
          errors.push({"usernameIncorrect":"Такого пользователя не существует"});
        }
      });
    }
    if(errors.length == 0){
      req.session.user = {
        username: userName,
        password: password 
      };
    }
    res.end();
});


