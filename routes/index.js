const verifyToken = require('./verify-token.js')
var express = require('express');
var router = express.Router();

var api = require('./api.js')

/* GET home page. */
router.get('/', function(req, res, next) {
  res.render('index', { title: 'Express' });
});

// 拦截器
// router.get(['/admin', '/admin/*', '/publish', '/publish/*'], ...这样设置后要进入这些页面必须cookies中有token的（即登录状态下）
router.get(['/users'], function(req, res, next) {
  // console.log('----tokendddd:', req.cookies.token)
  if (req.cookies.token) {
    next()
  } else {
    res.redirect('/')
  }
})

// 新增接口
router.get('/api/test', api.test)

// 修改addtest接口为在登录下才能提交
// router.post('/api/addtest', api.addtest)
router.route('/api/addtest').all(verifyToken).post(api.addtest)

// 登录模块
router.post('/api/login', api.login)

module.exports = router;
