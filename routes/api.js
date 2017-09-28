// const md5 = require('./md5.js')
const db = require('./db.js')
// const formidable = require('formidable')
// const fs = require('fs')
// const path = require('path')
// const jwt = require('jsonwebtoken')

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
