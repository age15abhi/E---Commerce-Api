const CustomAPIError = require('../errors')
const {isTokenValid} = require('../utils')

const authenticateUser = (req, res , next) => {

const token = req.signedCookies.token

if(!token){
throw new CustomAPIError.BadRequestError('Authentication Invalid')
}

try {
    const {name , userId , role} = isTokenValid({token});
    req.user = {name , userId , role};
    next();
} catch (error) {
    throw new CustomAPIError.BadRequestError('Authentication Invalid')
}

}

//  Authentication permission setup
const authorizePermissions = (...roles) => {
   return (req , res , next) => {
    if(!roles.includes(req.user.role)){
throw new CustomAPIError.UnauthorizeError('Unauthorize access to this route')
    }
    next();
   }
} 

module.exports = {
    authenticateUser,
    authorizePermissions,
}
