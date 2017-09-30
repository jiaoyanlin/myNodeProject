const md5 = require('./md5.js')
const db = require('./db.js')
// const formidable = require('formidable')
// const fs = require('fs')
// const path = require('path')
const jwt = require('jsonwebtoken')

exports.test = function(req, res, next) {
  db.find('mytest', { "query": {} }, function(err, result) {
    if (err) {
      return res.json({
        "code": 404,
        "message": "数据查询失败",
        "result": []
      })
    }
    return res.json({
        "code": 200,
        "message": "数据获取成功",
        "result": result,
        "total": result.length
    })
  })
}

exports.addtest = function(req, res, next) {
  // console.log('-----addtest cookie', req.cookies.token)
  let newData = {
    "title": req.body.title,
    "content": req.body.content
  };
  // 插入到数据库
  db.insertOne('mytest', newData, function(err, result) {
    if (err) {
      return res.json({
        "code": 401,
        "message": "test新增失败"
      })
    }
    return res.json({
      "code": 200,
      "message": "test新增成功"
    })
  })
}

// 登录
exports.login = function(req, res, next) {
  let user = req.body.user, pwd = md5(req.body.pwd);
  // 根据用户名查询数据库中是否含有该用户
  db.findOne('users', { "user": user }, function(err, result) {
    if (err) {
      return res.json({
        "code": 500,
        "message": "内部服务器错误"
      })
    }

    if (!result || result.length === 0) {
      return res.json({
        "code": 401,
        "message": "找不到用户名"
      })
    }

    let dbPassword = result.pwd
    let id = result._id
    let expires = 60 * 60 * 24 * 30
    if (dbPassword === pwd) {
      let token = jwt.sign({ id, user }, 'secret', { expiresIn: expires })
      res.cookie('token', token, { maxAge: expires })
      res.cookie('id', id, { maxAge: expires })
      res.cookie('user', user, { maxAge: expires })
      return res.json({
        "code": 200,
        "message": "登录成功"
      })
    } else {
      return res.json({
        "code": 401,
        "message": "密码错误"
      })
    }
  })
}
