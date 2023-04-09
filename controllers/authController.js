const User = require('../models/user')
const { StatusCodes, SWITCHING_PROTOCOLS } = require('http-status-codes')
const customError = require('../errors')
const jwt = require('jsonwebtoken')
const { attachCookiesToResponse , createTokenUser } = require('../utils')



const register = async (req, res) => {

    const { email, name, password } = req.body
    // 1 st method id to set unique: true ...
    // 2nd method for - if the email you provided is already exist
    const emailAlreadyExist = await User.findOne({ email })
    if (emailAlreadyExist) {
        throw new customError.BadRequestError('Email alrady exist')
    }

    // set first register user is an admin
    const isFirstAccount = (await User.countDocuments({})) === 0;
    const role = isFirstAccount ? 'admin' : 'user';

    const user = await User.create({ name, email, password, role })
    // creating the token
    // jwt.sign(payload , secret , options)

    const tokenUserPayload = createTokenUser(user)

    // Create token and setup cookies
    attachCookiesToResponse({res , user: tokenUserPayload})
    res.status(StatusCodes.CREATED).json({ user: tokenUserPayload })
}


const login = async (req, res) => {
   const {email , password} = req.body

   if(!email || !password){
    throw new customError.BadRequestError('Please provide email and password')
   }

   const user = await User.findOne({email})
   if(!user){
    throw new customError.UnauthenticatedError('Invalid Credientials')
   }

   const isPasswordCorrect = await user.comparePassword(password)

   if(!isPasswordCorrect){
    throw new customError.UnauthenticatedError('Invalid Credientals')
   }

   const tokenUserPayload = createTokenUser(user)

   // Create token and setup cookies
   attachCookiesToResponse({res , user: tokenUserPayload})
   res.status(StatusCodes.OK).json({ user: tokenUserPayload })
}


const logout = async (req, res) => {
 res.cookie('token' , 'logout' , {
    httpOnly: true,
    expires: new Date(Date.now()),
 });

 res.status(StatusCodes.OK).json('msg: User Logged Out')
};

module.exports = {
    register,
    login,
    logout,
}
