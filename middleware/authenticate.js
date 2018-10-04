var User = require('../config/hoteltokenCon');

var authenticate = (req, res, next) => {
  sess=req.session;
  res.locals.session = req.session;
    if (!sess.email ){
      res.redirect('/');
    }
    else {
    next();
  }};

module.exports = {authenticate};
