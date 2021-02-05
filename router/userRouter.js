const express = require('express');
const router = express.Router();
const { 
    checkToken,
    createJWTToken,
    checkRegister,
    checkLogin
} = require('../helpers'); 
const { query } = require('../database');

//register
router.post('/register', checkRegister, async (req,res) => {
    try{
        const uid = Date.now();
        const { email, username, password } = req.body;
        let role = 2;
        let status = 1;

        const response = await query(`INSERT INTO users (uid, username, email, password, role, status)
        VALUES ('${uid}','${username}','${email}','${password}',${role}, ${status})`);

        const token = createJWTToken({ uid, role });
        
        return res.status(200).send({
            id: response.insertId,
            uid: uid,
            username: `${username}`,
            email: `${email}`,
            token: `${token}`
        });
    }catch(err){
        return res.status(500).send(err);
    };
});

//login
router.post('/login', checkLogin, async (req,res) => {
    try{
        const { user, password } = req.body;
        const response = await query(`SELECT * FROM users WHERE password = '${password}' AND username = '${user}' OR email = '${user}'`);

        if(response.length === 0){
            return res.send({
                message: "Please check your username/email/password",
                status: "Not Found"
            });
        };
        const { id, uid, username, email, status, role } = response[0];

        const token = createJWTToken({ uid, role });
        
        return res.status(200).send({
            id: id,
            uid: uid,
            username: `${username}`,
            email: `${email}`,
            status: status,
            role: role,
            token: `${token}`
        });
    }catch(err){
        return res.status(500).send(err);
    }
});

//token admin
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNjEyNTEwNDI5OTc2Iiwicm9sZSI6MSwiaWF0IjoxNjEyNTE5MTcxfQ.i6ecaanO4POENeVGqB2UYFjeIgzUtwfbcdmnHZrAVBk

//token users
// eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJ1aWQiOiIxNjEyNTE0ODI3NTA0Iiwicm9sZSI6MiwiaWF0IjoxNjEyNTE5MDU4fQ.4eJ9AHRyDn_maw5wiBnglmfErCGeaCvMu5-JMubrdCg

//Please use authorization for token checking (don't use body to check the token)
//Deactivate Account
router.patch("/deactive", checkToken, async(req,res) => {
    try{
        const { uid } = req.user;
        const response = await query(`SELECT * FROM users WHERE uid = '${uid}'`);
        
        const uID = response[0].uid;
        const { status } = response[0];
        if(status === 1){
            await query (`UPDATE users SET status = 2 WHERE uid = ${uID}`);

            return res.status(200).send({
                uid: uID,
                status: 'deactive'
            });
        }else if(status === 3){
            return res.status(500).send({
                message: "Your account has been closed"
            });
        }else{
            return res.status(500).send({
                message: "Your account has already deativated"
            });
        };

    }catch(err){
        return res.status(500).send(err);
    }
});

//Activate Account
router.patch("/activate", checkToken, async(req,res) => {
    try{
        const { uid } = req.user;
        const response = await query(`SELECT * FROM users WHERE uid = '${uid}'`);
        const uID = response[0].uid;
        const { status } = response[0];

        if(status === 1){
            return res.status(500).send({
                message: "Your account is still active"
            });
        }else if(status === 2) {
            await query (`UPDATE users SET status = 1 WHERE uid = ${uID}`);
            return res.status(200).send({
                uid: uID,
                status: 'active'
            });
        }else{
            return res.status(500).send({
                message: "Your account has been closed, please register again"
            });
        };
    }catch(err){
        return res.status(500).send(err);
    }
});

//Close Account
router.patch("/close", checkToken, async (req,res) => {
    try{
        const { uid } = req.user;

        await query(`UPDATE users SET status = 3 WHERE uid = ${uid}`);
        return res.status(200).send({
            uid: uid,
            status: 'closed'
        });
    }catch(err){
        return res.status(500).send(err);
    }
});

module.exports = router;