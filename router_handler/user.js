/**
 * 在这里定义和用户相关的路由处理函数，供 /router/user.js 模块进行调用
 */

// 导入数据库操作模块
const db = require('../db/index')
// 导入密码处理包
const bcrypt = require('bcryptjs')
// 导入生成token字符串的包
const jwt = require('jsonwebtoken')
// 导入配置文件
const config=require('../config')


// 注册用户的处理函数
exports.regUser = (req, res) => {
  // 接收表单数据
  const userinfo = req.body
  // 判断数据是否合法
  if (!userinfo.username || !userinfo.password) { 
    return res.send({status:1,message:'用户名和密码不能为空'})
  }   

  // 执行sql语句并根据结果判断用户名是否被占用
  const sqlStr = 'select * from ev_users where username=?'
  db.query(sqlStr, [userinfo.username], function (err, results) { 
    // 执行sql语句失败
    if (err) { 
      // return res.send({status:1,message:err.message})
      return res.cc(err)
    }
    // 用户名被占用
    if (results.length > 0) { 
      // return res.send({status:1,message:'用户名被占用，请更换用户名'})
      return res.cc('用户名被占用，请更换用户名')
    }
    // 对用户密码进行加密处理,返回值是加密之后的密码字符串
    userinfo.password = bcrypt.hashSync(userinfo.password, 10)
    // 定义插入用户的sql语句
    const sql='insert into ev_users set ?'
    // 插入新用户
    db.query(sql, {username:userinfo.username,password:userinfo.password}, function (err, results) { 
      // 执行sql语句失败
      if (err) { 
        // return res.send({status:1,message:err.message})
        return res.cc(err)
      }
      // sql语句执行成功，但影响函数不为1
      if (results.affectedRows !== 1) { 
        // return res.send({status:1,message:'注册用户失败，请稍后再试'})
        return res.cc('注册用户失败，请稍后再试')
      }
      // 注册成功
      // res.send({ status: 0, message: '注册成功' })
      res.cc('注册成功',0)
    })
  })
}
// 登录的处理函数
exports.login = (req, res) => {
  const userinfo = req.body
  const sql = 'select * from ev_users where username=?'
  // （1）先验证用户名是否存在
  db.query(sql, userinfo.username, function (err, results) { 
    // 执行sql语句失败
    if(err) return res.cc(err)
    // 执行sql语句成功，但是查询到数据条数不等于1
    if (results.length !== 1) return res.cc('查询条数不唯一，登陆失败')
    // （2）再判断用户密码是否一致
    const compareResult = bcrypt.compareSync(userinfo.password, results[0].password)
    // 如果对比结果等于false，则证明用户输入的密码错误
    if (!compareResult) { 
      return res.cc('密码有误，登陆失败')
    }
    // 登陆成功，生成Token字符串
    // 在生成token字符串的时候，一定要剔除密码和头像的值
    const user = { ...results[0], password: '', user_pic: '' }
    // 生成token字符串
    const tokenStr = jwt.sign(user, config.jwtSecretKey, {
      expiresIn:'10h', //token有效期为10个小时
    })
    // 将生成的token字符串发送给客户端
    res.send({
      status: 0,
      message: '登陆成功',
      // 为了方便客户端使用token，在服务器端直接拼接上Bearer的前缀
      token:'Bearer '+tokenStr,
    })
  })
}
