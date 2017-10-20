const jwt = require('jsonwebtoken')
module.exports = (req, res, next) => {
  let token = req.query.token || req.body.token;
  let user = req.query.user || req.body.user;
  let id = req.query.id || req.body.id;
  // let user = req.cookies.user;
  // let id = req.cookies.id;
  if (token) {
    jwt.verify(token, 'secret', function(err, decoded) {
      if (!err && decoded.user === user && decoded.id === id) {
        req.decoded = decoded
        next()
      } else {
        // res.cookie('token', '', { maxAge: 0 })
        // res.cookie('username', '', { maxAge: 0 })
        // res.cookie('id', '', { maxAge: 0 })
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