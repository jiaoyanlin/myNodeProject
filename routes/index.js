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
router.get('/api/test', api.test);

// 修改addtest接口为在登录下才能提交
// router.post('/api/addtest', api.addtest)
router.route('/api/addtest').all(verifyToken).post(api.addtest);

// 登录模块
router.post('/api/login', api.login);

// 获取个人信息
router.route('/api/getUserinfo').all(verifyToken).get(api.getUserinfo);
// 更新个人信息
router.route('/api/updateUserinfo').all(verifyToken).post(api.updateUserinfo);

// 文章的增删改查（管理员的）
// 增
router.route('/api/addArticle').all(verifyToken).post(api.addArticle);
// 删
router.route('/api/deleteArticle').all(verifyToken).post(api.deleteArticle);
// 改
router.route('/api/updateArticle').all(verifyToken).post(api.updateArticle);
// 查
router.route('/api/searchArticle').all(verifyToken).get(api.searchArticle);

module.exports = router;
