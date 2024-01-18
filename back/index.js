//config
const express = require('express');
const path = require('path');
const PORT = process.env.PORT || 3010;
const app = express();
 
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  next();
});
 
app.listen(PORT, () => {
  console.log(`Server listening on ${PORT}`);
});

process.on('SIGTERM', () => {
    server.close(() => {
        console.log('Process terminated');
    });
});

app.set('views', path.join(__dirname, '../front'));
app.set('view engine','ejs');

//views
app.get('/', (req, res) => {
    res.render('templates/index');
});