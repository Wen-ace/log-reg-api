const express = require('express');
const mysql = require('mysql');
const path = require('path');
const bodyParser = require('body-parser');
const url = require('url');
const queryString = require('querystring');

let app = express();

/**
 * 数据库创建过程。 
 * 1.创建wenrj数据库
 * create database wenrj; 
 * 2.进入wenrj 数据库
 * use wenrj;   
 * 3.创建user_info数据表，包含用户名和密码两个字段，用户名唯一。
 * create table user_info(user_name varchar(8), user_password(16), contraine unique(user_name));
 * 4.创建foul_data数据表，包含id int not null,tag varchar(20),name_zh varchar(20),name_en varchar(40),url varchar(100)
 * create table foul_data(
 *     uid int not null atuo_increment,
 *     tag varchar(20),
 *     name_zh varchar(20),
 *     name_en varchar(40),
 *     url varchar(100),   //保存域名之后的path
 *     primary key(uid),
 *     unique key(tag, name_zh),
 *     unique key(tag, name_en)
 * )
 * 
 */
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '123456',
    database: 'wenrj'
});
connection.connect();
connection.query('create table if not exists `user_info`(user_name varchar(8), user_password varchar(16), unique key(user_name))');
connection.query('create table if not exists `foul_data`(' +
    'uid int not null auto_increment, tag varchar(20), name_zh varchar(20), name_en varchar(40), url varchar(100),' +
    'primary key(uid), unique key(tag, name_zh), unique key(tag, name_en)' +
    ')');
app.get('/', (req, res) => {
    let obj = {
        code: 1,
        msg: 'wenrongjiao'
    };
    res.json(obj);
});
// 
app.get('/test', (req, res) => {
    let url_parse = url.parse(req.url).query;
    let query_params = queryString.parse(url_parse);
    res.json(query_params);
});
// 登录 { user_name: '', user_password: '' }
app.post('/login', (req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.body = JSON.parse(data);
        let rd = {};
        if (!req.body.user_name) {
            rd = {
                code: 0,
                msg: "user_name can't empty!"
            };
            res.json(rd);
            next();
        } else if (!req.body.user_password) {
            rd = {
                code: 0,
                msg: "user_password can't empty!"
            };
            res.json(rd);
            next();
        } else {
            connection.query('select * from user_info where user_name=?', req.body.user_name, (err, result) => {
                if (err) {
                    rd = {
                        code: 0,
                        ...err
                    };
                } else {
                    if (!result || !result[0]) {
                        rd = {
                            code: 1,
                            msg: 'the user_name desn\'t exist!'
                        }
                        res.json(rd);
                        next();
                        return false;
                    }
                    let result_json = result[0];
                    console.log(result_json);
                    if (req.body.user_password != result_json.user_password) {
                        rd = {
                            code: 0,
                            msg: 'the password is wrong!'
                        };
                    } else {
                        rd = {
                            code: 1,
                            msg: "success"
                        };
                    }

                    console.log("su");
                }
                res.json(rd);
                next();
            });
        }
    })
});
// 注册 { user_name: '', user_password: '' }
app.post('/reg', (req, res, next) => {
    let data = '';
    req.on('data', chunk => {
        data += chunk;
    });
    req.on('end', () => {
        req.body = JSON.parse(data);
        let rd = {};
        if (!req.body.user_name) {
            rd = {
                code: 0,
                msg: "user_name can't empty!"
            };
            res.json(rd);
            next();
        } else if (!req.body.user_password) {
            rd = {
                code: 0,
                msg: "user_password can't empty!"
            };
            res.json(rd);
            next();
        } else if (req.body.user_name.length >= 8) {
            rd = {
                code: 0,
                msg: "user_name is too long,can't exceeds 8 byte!"
            };
            res.json(rd);
            next();
        } else if (req.body.user_password.length >= 16) {
            rd = {
                code: 0,
                msg: "user_password is too long,can't exceeds 16 byte!"
            };
            res.json(rd);
            next();
        } else {
            connection.query('insert into user_info (user_name, user_password) values (?, ?)', [req.body.user_name, req.body.user_password], (err, result) => {
                if (err) {
                    console.log('err --> ', err);
                    if (err.code.toUpperCase() == 'ER_DUP_ENTRY') {
                        rd = {
                            code: 0,
                            msg: 'the user_name already exists!'
                        };
                    } else {
                        rd = err;
                    }

                } else {
                    console.log('result --> ', result);
                    rd = {
                        code: 1,
                        msg: 'success'
                    };
                }
                res.json(rd);
                next();
            });
        }
    })
});
let server = app.listen(80, (err) => {
    if (err) {
        console.log(err);
    }
    console.log("run...");
});