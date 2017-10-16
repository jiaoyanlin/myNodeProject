## 初始化项目

1. 安装Express

    `npm install -g express`
    
2. 安装Express命令行工具

    `npm install -g express-generator`
    
3. 使用express初始化项目：这里使用ejs模板，默认为jade模板

    `express -e myproject`

    提示：此时将在当前目录下创建myproject子目录，并自动搭建其他相关目录及文件。
    
    `cd myproject` 进入项目目录
    
    `npm install` 安装相关依赖
    
4. 运行项目
    
    `SET DEBUG=myproject:* & npm start`

    此时在浏览器上输入http:localhost:3000将能看到相关页面
    
5. 若不想每次修改代码后都要重启服务器，可以安装并使用supervisor工具实现代码修改和自启动

    `npm install -g supervisor`
    
    `supervisor bin/www` 
    
    提示：express 4.x把原来用于项目启动代码也被移到./bin/www的文件，所以直接运行 supervisor bin/www就可以了（更早版本使用 `supervisor  app.js`）

## 实战热身（实现基础的get和post的ajax请求）

1. 安装mongodb模块（须先在电脑上安装过mongodb并且启动服务）

    `npm install mongodb --save`
    
    ps: "crypto": "^1.0.1",未确定是否需要安装？？？？？
    
2. 修改/routes/index.js，新增两个接口

    ```javascript
    var express = require('express');
    var router = express.Router();
    
    // 我新增的api，用于连接到数据库
    var api = require('./api.js')
    
    /* GET home page. */
    router.get('/', function(req, res, next) {
      res.render('index', { title: 'Express' });
    });
    
    // 我新增的测试接口
    router.get('/api/test', api.test)
    
    router.post('/api/addtest', api.addtest)
    
    module.exports = router;
    
    ```
    
3. 新增文件1 /routes/api.js

    ```javascript
    const db = require('./db.js')
    
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
    ```
    新增文件2 /routes/db.js（封装了对数据库的增删查改的函数）
    ```javascript
    const MongoClient = require('mongodb').MongoClient
    const settings = require('./settings')
    // 链接数据库 如果没有自动创建
    function _connectDB(callback) {
      let url = settings.dbUrl
      MongoClient.connect(url, function(err, db) {
        if (err) {
          callback(err, null)
          return
        }
        // 数据库链接成功执行回掉
        callback(err, db)
      })
    }
    
    // 插入数据
    exports.insertOne = function(collectionName, json, callback) {
      _connectDB(function(err, db) {
        db.collection(collectionName).insertOne(json, function(err, result) {
          if (err) {
            callback(err, null)
            db.close()
            return
          }
          callback(err, result)
          db.close()
        })
      })
    }
    
    // 查找数据
    exports.find = function(collectionName, queryJson, callback) {
      _connectDB(function(err, db) {
        let json = queryJson.query || {},
          limit = Number(queryJson.limit) || 0,
          count = Number(queryJson.page) - 1,
          sort = queryJson.sort || {}
        // 页数为0或者1都显示前limit条数据
        if (count <= 0) {
          count = 0
        } else {
          count = count * limit
        }
    
        let cursor = db.collection(collectionName).find(json).limit(limit).skip(count).sort(sort)
        cursor.toArray(function(err, results) {
          if (err) {
            callback(err, null)
            db.close()
            return
          }
          callback(err, results)
          db.close()
        })
      })
    }
    
    // 删除数据
    exports.deleteMany = function(collectionName, json, callback) {
      _connectDB(function(err, db) {
        db.collection(collectionName).deleteMany(json, function(err, results) {
          if (err) {
            callback(err, null)
            db.close()
            return
          }
          callback(err, results)
          db.close()
        })
      })
    }
    
    // 修改数据
    exports.updateMany = function(collectionName, jsonOld, jsonNew, callback) {
      _connectDB(function(err, db) {
        db.collection(collectionName).updateMany(
          jsonOld, {
            $set: jsonNew,
            $currentDate: { "lastModified": false }
          },
          function(err, results) {
            if (err) {
              callback(err, null)
              db.close()
              return
            }
            callback(err, results)
            db.close()
          })
      })
    }
    ```
    新增文件3 /routes/settings.js（mongodb数据库相关设置）
    ```javascript
    let nickname = 'myproject1'
    module.exports = {
        dbUrl:'mongodb://localhost:27017/myproject1',
        nickname:nickname
    }
    ```
    到此，接口创建完毕
    
4. 前端使用ajax来获取数据

    /views/index.ejs
    ```html
    <!DOCTYPE html>
    <html>
      <head>
        <title><%= title %></title>
        <link rel='stylesheet' href='/stylesheets/style.css' />
        <script src='/js/jquery.min.js'></script>
      </head>
      <body>
        <h1><%= title %></h1>
        <p>Welcome to <%= title %></p>
        <div class="post">
          <input type="text" class="title" placeholder="请输入标题">
          <input type="text" class="content" placeholder="请输入标题">
          <button class="ok">提交</button>
        </div>
        <div class="test"></div>
      </body>
      <script>
        function getList() {
          $.get('/api/test', {}, function (data) {
            console.log('----data', data)
            if (data.code == 200) {
              var html = '', list = data.result;
              for (var i = 0; i < list.length; i++) {
                html += '<div>这是第' + i + '条数据：标题为' + list[i].title + '，内容为' + list[i].content + '</div>'
              }
              $('.test').empty().append(html);
            }
          })
        }
        getList();
        $('.ok').click(function() {
          if (!$('.title').val()) {
            alert('请填写标题');
            return false;
          }
          if (!$('.content').val()) {
            alert('请填写内容');
            return false;
          }
          $.post('/api/addtest', {
            title: $('.title').val(),
            content: $('.content').val()
          }, function (data) {
            console.log('----addtest', data)
            if (data.code == 200) {
              alert('提交成功');
              getList();
            } else {
              alert('提交失败');
            }
          })
        })
      </script>
    </html>
    ```
    打开浏览器控制台，可以看到打印出查到的数据。
    
    
    
    
### 参考文档
1、http://y.dobit.top/Detail/150.html

2、https://github.com/wmui/vueblog
