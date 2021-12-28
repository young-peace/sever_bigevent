// 项目入口文件
// 导入 express 模块
const express = require('express')
// 创建 express 的服务器实例
const app = express()

// write your code here...
// 导入 cors 中间件
const cors = require('cors')
// 将 cors 注册为全局中间件
app.use(cors())

const joi = require('joi')

//配置解析 application/x-www-form-urlencoded 格式的表单数据的中间件
app.use(express.urlencoded({ extended: false }))

// 在所有路由之前，声明响应数据中间件
app.use(function (req, res, next) { 
  // status=0为成功，status=1为失败，默认将status的值设置为1，方便处理失败的情况
  res.cc = function (err, status = 1) { 
    res.send({
      // 状态
      status,
      // 状态描述，判断err是错误对象还是字符串
      message:err instanceof Error ? err.message : err
    })
  }
  next()
})

// 解析token中间件
// 导入配置文件
const config=require('./config')
// 解析token的中间件
const expressJWT=require('express-jwt')
// 使用.unless()指定哪些接口不需要进行Token的身份认证
app.use(expressJWT({ secret: config.jwtSecretKey,algorithms:['HS256'] }).unless({path:[/^\/api\//]}))


// 错误中间件
app.use(function (err, req, res, next) { 
  // 数据验证失败
  if (err instanceof joi.ValidationError) 
    return res.cc('err')
  
  // 捕获身份认证的错误
  if (err.name === 'UnauthorizedError')
    return res.cc('身份认证失败le')  
  // 未知错误
  res.cc(err)
})

// 导入并注册用户路由模块
const userRouter = require('./router/user')
app.use('/api', userRouter)

// 导入并使用用户信息路由模块
const userinfoRouter = require('./router/userinfo')
app.use('/my',userinfoRouter)

// 导入并使用文章分类路由模块
const artCateRouter = require('./router/artcate')
// 为文章分类的路由挂载统一的访问前缀/my/article
app.use('/my/article',artCateRouter)

//导入并使用文章路由模块
const articleRouter=require('./router/article')
// 为文章的路由挂载统一的访问前缀 /my/article
app.use('/my/article',articleRouter)
// 托管静态资源文件
app.use('/uploads',express.static('./uploads'))

// 调用 app.listen 方法，指定端口号并启动web服务器
app.listen(3007, function () {
  console.log('api server running at http://127.0.0.1:3007')
})