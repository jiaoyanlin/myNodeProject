## 登录模块

1、 准备工作：

> 安装token相关工具，用于登录验证：`npm install jsonwebtoken --save`

> 在/routes/db.js中添加查找方法（只查询一个）：

```javascript
// 查找单个数据
exports.findOne = function(collectionName, queryJson, callback) {
	_connectDB(function(err, db) {
		db.collection(collectionName).findOne(queryJson, function(err, results) {
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

> 修改/routes/setting.js

```javascript
let md5 = require('./md5.js')
let user = 'test'
let pwd = md5('test') // 密码加密处理，防止被窃取真实密码
module.exports = {
    dbUrl: 'mongodb://localhost:27017/myproject1',
    user: user,
    pwd: pwd
}
```

> 新增/routes/md5.js

```javascript
let crypto = require('crypto')
module.exports = function (content) {
    let md5 = crypto.createHash('md5')
    let newContent = md5.update(content).digest('base64')
    return newContent
}
```

2、 在/routes/index.js中添加接口

```javascript
// 登录模块
router.post('/api/login', api.login)
```
3、 在/routes/api.js中添加

```javascript
const jwt = require('jsonwebtoken')
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
        // 根据查询到的id、user按照一定的加密方式生成token，并且缓存在cookie中，后期当用户使用别的接口的时候我们可以直接通过req.cookies.token获取到token，此时根据该用户的id和user利用同样的方法解密得到对应的user和id，将新旧数据对比即可知道该token是否为正确登录的token
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
```

> 关于jsonwebtoken的原理及使用可以参考：http://www.jianshu.com/p/a7882080c541

4、 举例看下token验证方法：

> 新增 /routes/verify-token.js

```javascript
const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
	let token = req.cookies.token; // 获取cookies中的token
	let user = req.cookies.user;
	let id = req.cookies.id;
	if (token) {
		jwt.verify(token, 'secret', function(err, decoded) { // 与加密时使用同样的方法对token进行解密
			if (!err && decoded.user === user && decoded.id === id) { // token正确就进入下一个方法继续执行，否则就清空cookie
				req.decoded = decoded
				next()
			} else {
				res.cookie('token', '', { maxAge: 0 })
				res.cookie('user', '', { maxAge: 0 })
				res.cookie('id', '', { maxAge: 0 })
				return res.json({
					"code": 401,
					"message": "登录失败"
				})
			}
		})
	} else {
		return res.json({
			"code": 401,
			"message": "请登录后操作"
		})
	}
}
```

> 在/routes/index.js中使用：将addtest方法修改为登录后才可以使用

```javascript
const verifyToken = require('./verify-token.js')
router.route('/api/addtest').all(verifyToken).post(api.addtest) // 先验证是否有正确的token，正确才能进行下一步提交
```
此时，因为没有进行登录，所以提交test会失败，只需要在/views/index.ejs中加入以下代码：
```javascript
$.post('/api/login', {
	user: 'test',
	pwd: 'test'
}, function (data) {
	console.log('----login', data)
})
```
刷新浏览器已经登录成功，此时再进行提交test就会成功了。

5、 此部分代码请看这个commit：https://github.com/jiaoyanlin/myNodeProject/tree/20e9faa837ac69580aa450962efd4af02d891a8b
