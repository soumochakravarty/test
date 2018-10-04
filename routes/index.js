const express = require('express');
const router = express.Router();
var {authenticate} = require('../middleware/authenticate');
//const {ensureAuthenticated, ensureGuest} = require('../helpers/auth');

router.get('/', (req, res) => {
  res.render('index/login');
});

router.get('/about', (req, res) => {
  res.render('index/about');
});

router.get('/dashboard', authenticate, (req, res) => {
  res.render('index/dashboard');
});
module.exports = router;