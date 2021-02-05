const { query } = require('../database');
const jwt = require('jsonwebtoken');

const checkRegister =  async (req,res,next) => {
    const passwordCheck = /^(?=.*[A-Za-z])(?=.*\d)(?=.*[@$!%*#?&])[A-Za-z\d@$!%*#?&]{6,}$/;
    const emailCheck = /^(([^<>()[\]\\.,;:\s@"]+(\.[^<>()[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
    const { email, password, username } = req.body;

    const resp = await query(`SELECT * FROM users WHERE username = '${username}' OR email = '${email}'`);
    if(resp.length !== 0){
        return res.status(500).send({
            message: "Username / Email already taken!"
        });
    };
    if(username.length < 6){
        return res.status(500).send({
            message: "Username needs to be at least 6 character long"
        });
    };
    if(!email.match(emailCheck)){
        return res.status(500).send({
            message: "Please enter the email address correctly!"
        });
    };
    if(!password.match(passwordCheck)){
        return res.status(500).send({
            message: "Password needs to be at least 6 character long, containing at least 1 number and 1 special character"
        });
    };

    next();
};

const checkLogin = async(req,res,next) => {
    try{
        const { user, password } = req.body;
        resp = await query(`SELECT * FROM users WHERE password = '${password}' AND username = '${user}' OR email = '${user}'`);
        const { status } = resp[0];

        if(status === 1) {
            next();
        }else if(status === 2){
            return res.status(500).send({
                message: "Your account has been deactivate"
            });
        }else{
            return res.status(500).send({
                message: "Your account has been closed, please make a new account"
            });
        }
    }catch(err){
        return res.status(500).send(err);
    };

};

const checkAdmin = (req,res,next) => {
    try{
        const cek = jwt.verify(req.body.token, 'kuncirahasia', (err,decoded) =>{
            if (err) {
                return res.status(401).send({
                  message: err.message,
                  status: "Unauthorized",
                });
            }else{
                req.user = decoded;
                const { role } = req.user;
                if(role === 1){
                    return next();
                }else{
                    return res.status(500).send({
                        message: "Only Admin can Add / Change Movie Data"
                    });
                };
            };
        })
    }catch(err){
        return res.status(500).send(err);
    }
};
module.exports = { 
    checkRegister,
    checkLogin,
    checkAdmin
};