## 其他模块

由于上两篇文章中已经将如何往数据库中插入、修改数据等做了演示，因此这篇文章就不再重复了，主要记录一些开发时遇到的问题及解决方案（具体实现方法看源码）。

1、 这边推荐使用postman进行接口测试，postman网上有很多教程可以看，主要提一下，在使用postman提交post请求时，注意body中选择x-www-form-urlencoded模式来发送，否则后台这边无法通过req.body.xxx来获取参数。

2、 使用mongodb查询数据库时我们有时会使用_id作为参数进行查询，但是直接将它作为条件时查询不到的，应该按照下方这样来查询：

    ```
    var ObjectId = require('mongodb').ObjectId;
    ...
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
        // 注意这里用ObjectId(req.cookies.id)
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
    ```
