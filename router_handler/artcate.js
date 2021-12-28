// 导入数据库操作模块
const db=require('../db/index')

// 获取文章分类列表数据的处理函数
exports.getArticleCates = (req, res) => { 
    // 根据分类的状态，获取所有未被删除的分类列表数据
    // is_delete为0标识没有被标记为删除的数据
    const sql = 'select * from ev_article_cate where is_delete=0 order by id asc'
    db.query(sql, (err, results) => { 
        // 1.执行sql语句失败
        if (err) return res.cc(err)
        // 2.执行sql语句成功
        res.send({
            status: 0,
            message: '获取文章分类列表成功',
            data:results,
        })
    })
    res.send('ok')
}
// 新增文章分类的处理函数
exports.addArticleCates = (req, res) => { 
    // 查询 分类名称 与 分类别名 是否被占用的sql语句
    const sql = 'select * from ev_article_cate where name=? or alias=?'
    db.query(sql, [req.body.name, req.body.alias], (err, results) => { 
        // 执行sql语句失败
        if (err) return res.cc(err)
        // 分类名称 和 分类别名 都被占用
        if (results.length == 2) return res.cc('分类名称与分类别名被占用，请更换后重试')
        if (results.length == 1 && results[0].name == req.body.name && results[0].alias == req.body.alias) return res.cc('分类名称与别名被占用，请更换后重试')
        // 分类名称 或 分类别名 都被占用
        if (results.length == 1 && results[0].name == req.body.name) return res.cc('分类名称被占用，请更换后重试')
        if (results.length == 1 && results[0].alias == req.body.alias) return res.cc('分类别名被占用，请更换后重试')
        // 新增文章分类
        const sql = 'insert into ev_article_cate set ?'
        db.query(sql, (err, results) => { 
            // sql语句执行失败
            if (err) return res.cc(err)
            // sql语句执行成功，但是影响行数不等于1
            if (results.affectedRows !== 1) return res.cc('新增文章分类失败')
            // 新增文章分类成功
            res.cc('新增文章分类成功',0)
        })
    })
}
// 删除文章分类
exports.deleteCateById = (req, res) => { 
    const sql = 'update ev_article_cate set is_delete=1 where id=?'
    db.query(sql, req.params.id, (err, results) => { 
        // 执行sql语句失败
        if(err) return res.cc(err)
        // 执行sql语句成功，但影响行数不为1
        if(results.affectedRows!==1) res.cc(err)
        // 删除文章分类成功
        res.cc('删除文章分类成功',0)
    })
}
// 根据id获取文章分类
exports.getArtCateById = (req, res) => { 
    const sql = 'select * from ev_article_cate where id=?'
    db.query(sql, req.params.id, (err, results) => { 
        if (err) return res.cc(err)
        if (results.affectedRows !== 1) res.cc(err)
        // 把数据响应给客户端
        res.send({
            status: 0,
            message: '获取文章分类成功',
            data:results[0],
        })
    })
}
// 根据id更新文章分类
exports.updateCateById = (req, res) => { 
    // 查询分类名称 与 分类别名 是否被占用
    const sql = 'select * from ev_article_cate where id<>? and (name=? or alias=?)'
    db.query(sql, [req.body.Id, req.body.name, req.body.alias], (err, results) => { 
        if (err) return res.cc(err)
        // 名称和别名都被占用
        // 分类名称和分类别名分别被两条数据占用
        if (results.length === 2) return res.cc('分类名称与分类别名被占用，请更换后重试')
        // 分类名称和分类别名同时被一条数据占用
        if(results.length===1 && results[0].name===req.body.name && results[0].alias===req.body.alias) return res.cc('分类名称和别名被占用，请更换后重试')
        // 分类名称 和 分类别名 被占用
        if (results.length === 1 && results[0].name === req.body.name) return res.cc('分类名称被占用，请更换后重试')
        if (results.length === 1 && results[0].alias === req.body.alias) return res.cc('分类别名被占用，请更换后重试')
        
        const sql = 'update ev_article_cate set ? where Id=?'
        db.query(sql, (err, results) => { 
            if (err) return res.cc(err)
            if (results.affectedRows !== 1) res.cc(err)
            res.cc('更新成功',0)
        })
    })
}
