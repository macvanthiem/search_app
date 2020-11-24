const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const { mongoDbUrl, PORT } = require('./config/config');

const app = express();

// Connect MongoDB
mongoose.connect(mongoDbUrl, { useNewUrlParser: true, useUnifiedTopology: true, useCreateIndex: true })
.then(response => {
    console.log('Connect mongoDB success.');
})
.catch(error => {
    console.log('Connect mongoDB fail.');
});

// Configure Express
app.use(express.json());
app.use(express.urlencoded({extended: true}));
app.use(express.static(path.join(__dirname, 'public')));

// Set View Engine to EJS
app.set('view engine', 'ejs');

// Router
app.get('/', (req, res) => {
    res.render('pages/index');
});


app.listen(PORT, () => {
    console.log('The port is 3001');
});