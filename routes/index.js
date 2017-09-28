var express = require('express');
var router = express.Router();

var api = require('./api.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 新增接口--lin
router.get('/api/test', api.test)

router.post('/api/addtest', api.addtest)

module.exports = router;
