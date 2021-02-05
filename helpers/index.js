const {
    createJWTToken,
    checkToken
} = require('./jwt');
const { 
    checkRegister, 
    checkLogin,
    checkAdmin 
} = require('./middlewares');

module.exports = {
    createJWTToken,
    checkToken,
    checkRegister,
    checkLogin,
    checkAdmin
}