require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');;

const sauceRoutes = require('./routes/sauces');
const userRoutes = require('./routes/user');

const app = express();

//Demande du package helmet pour sécuriser Express

const helmet = require('helmet');
app.use(helmet())

app.use(express.json());

mongoose.connect(`mongodb+srv://${process.env.mongoadmin}:${process.env.mongopassword}@cluster0.9ggbm.mongodb.net/${process.env.mongoDB}?retryWrites=true&w=majority`,
    {
        useNewUrlParser: true,
        useUnifiedTopology: true
    })
    .then(() => console.log('Connexion à MongoDB réussie !'))
    .catch(() => console.log('Connexion à MongoDB échouée !'));

app.use((req, res, next) => {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content, Accept, Content-Type, Authorization');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, PUT, DELETE, PATCH, OPTIONS');
    next();
});

app.use('/images', express.static(path.join(__dirname, 'images')));

app.use('/api/sauces', sauceRoutes);
app.use('/api/auth', userRoutes);

module.exports = app;