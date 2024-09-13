const http = require('../folderS,F,E/S,F,E.JS')
const {First,Second,Third} = require('../utils/httperespons')

const isAuthorized = (...roles)=>{
    return (req , res , next)=>{
        if (!roles.includes(req.user.role))
        return First(res,"not authorized user",403,http.FAIL)
        
        return next()
    }
}

module.exports = isAuthorized