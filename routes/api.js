const md5 = require('./md5.js')
const db = require('./db.js')
// const formidable = require('formidable')
// const fs = require('fs')
// const path = require('path')
const jwt = require('jsonwebtoken')
var ObjectId = require('mongodb').ObjectId;

function testTel (tel) {
  return /^1[3|4|5|7|8][0-9]{9}$/.test(tel);
}

// 数据页码设置
var pageLimit = 3;

// 表：users用于存放用户信息，mytest用于测试,myArticles用于存放文章

exports.test = function (req, res, next) {
  db.find('mytest', { "query": {} }, function (err, result) {
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

exports.addtest = function (req, res, next) {
  // console.log('-----addtest cookie', req.cookies.token)
  let newData = {
    "title": req.body.title,
    "content": req.body.content
  };
  // 插入到数据库
  db.insertOne('mytest', newData, function (err, result) {
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
exports.login = function (req, res, next) {
  let user = req.body.user, pwd = md5(req.body.pwd)
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

// 获取个人信息
exports.getUserinfo = function (req, res, next) {
  let user = req.cookies.user
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
    // 密码和id不返回给前端
    delete result.pwd
    delete result._id
    return res.json({
      "code": 200,
      "message": "数据获取成功",
      "result": result
    })
  })
}

// 更新个人信息
exports.updateUserinfo = function (req, res, next) {
  let newData = {
    "name": req.body.name,
    "phone": req.body.phone,
    "motto": req.body.motto
  };
  if (!testTel(req.body.phone)) {
    return res.json({
      "code": 401,
      "message": "手机号码格式不正确"
    })
  }

  db.updateMany('users', { "_id": ObjectId(req.cookies.id) }, newData, function (err, result) {
    if (err) {
      return res.json({
        "code": 401,
        "message": "更新失败"
      })
    }

    return res.json({
      "code": 200,
      "message": "更新成功"
    })
  })
}

// 文章的增删改查
// 增
exports.addArticle = function (req, res, next) {
  var now = new Date();
  var time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  let newData = {
    'user': req.cookies.user,
    "title": req.body.title,
    "content": req.body.content,
    'updateTime': time
  };
  // 插入到数据库
  db.insertOne('myArticles', newData, function (err, result) {
    if (err) {
      return res.json({
        "code": 401,
        "message": "新增文章失败"
      })
    }
    return res.json({
      "code": 200,
      "message": "新增文章成功"
    })
  })
}
// 删(参数：文章id（id）)
exports.deleteArticle = function (req, res, next) {
  let id = ObjectId(req.body.id)
  db.deleteMany('myArticles', { "_id": id }, function(err, result) {
    if (err) {
      return res.json({
        "code": 401,
        "message": "文章删除失败"
      })
    }

    return res.json({
      "code": 200,
      "message": "文章删除成功"
    })
  })
}
// 改
exports.updateArticle = function (req, res, next) {
  var now = new Date();
  var time = now.getFullYear()+"-"+(now.getMonth()+1)+"-"+now.getDate()+" "+now.getHours()+":"+now.getMinutes()+":"+now.getSeconds();
  let newData = {
    "title": req.body.title,
    "content": req.body.content,
    'updateTime': time
  };
  if (!req.body.title) {
    return res.json({
      "code": 401,
      "message": "标题不能为空"
    })
  }
  if (!req.body.content) {
    return res.json({
      "code": 401,
      "message": "内容不能为空"
    })
  }

  db.updateMany('myArticles', { "_id": ObjectId(req.body.id) }, newData, function (err, result) {
    if (err) {
      return res.json({
        "code": 401,
        "message": "更改失败"
      })
    }
    console.log('----result:', result)
    return res.json({
      "code": 200,
      "message": "更改成功"
    })
  })
}
// 查（参数：search、page（当前页码：从0开始）、sort（排序方式））
exports.searchArticle = function (req, res, next) {
  let q = req.query.search ? req.query.search : '';
  let limit = pageLimit;
  let page = Number(req.query.page)
  let sortInfo = Number(req.query.sort) || -1;
  let sort = { "updateTime": sortInfo };
  db.find('myArticles', { "query": {"title": { $regex: ".*" + q + ".*" }}, "limit": limit, "page": page, "sort": sort }, function(err, result) {
    if (err) {
      return res.json({
        "code": 404,
        "message": "文章查询失败",
        "result": []
      })
    }

    db.find('myArticles', { "query": {"title": { $regex: ".*" + q + ".*" }} }, function(err, result2) {
      if (err) {
        return res.json({
          "code": 404,
          "message": "文章查询失败",
          "result": []
        })
      }
      if (!result.length) {
        return res.json({
          "code": 200,
          "message": "没有更多数据了",
          "result": result,
          "total": result2.length
        })
      }
      return res.json({
        "code": 200,
        "message": "文章查询成功",
        "result": result,
        "total": result2.length
      })
    })
  })
}
