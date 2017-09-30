/**
 * Created by dell on 2017/5/14.
 */
let md5 = require('./md5.js')
let user = 'test'
let pwd = md5('test')
module.exports = {
    dbUrl:'mongodb://localhost:27017/myproject1',
    user:user,
    pwd:pwd
}