
// 导入路径处理的path核心模块
const path = require('path')
// 导入db数据库操作模块
const db=require('../db/index')

// 发布新文章
exports.addArticle = (req, res) => { 
    // 手动判断是否上传了文章封面
    if (!req.file || req.file.filename !== 'cover_img') return res.cc('文章封面是必选参数')
    // 处理文章的信息对象
    const articleInfo = {
        // 标题、内容、状态、所属的分类id
        ...req.body,
        // 文章封面在服务器端的存放路径
        ccover_img: path.join('/uploads', req.file.filename),
        // 文章发布时间
        pub_date: new Date(),
        // 文章作者的Id
        author_id:req.user.id,
    }
    const sql = 'insert into ev_articles set ?'
    db.query(sql, articleInfo, (err, results) => { 
        // 执行sql语句失败
        if (err) return res.cc(err)
        // 执行sql语句成功，但影响行数不为1
        if (results.length !== 1) return res.cc(err)
        // 发布文章成功
        res.cc('发布文章成功',0)
    })
    
    
}