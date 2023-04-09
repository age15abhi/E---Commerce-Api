const User = require('../models/user')
const { StatusCodes } = require('http-status-codes')
const CustomAPIError = require('../errors')
const { createTokenUser, attachCookiesToResponse , checkPermissions } = require('../utils')


const getAllUser = async (req, res) => {
    console.log(req.user)
    const users = await User.find({ role: 'user' }).select('-password')
    res.status(StatusCodes.OK).json({ users })
}

const getSingleUser = async (req, res) => {
    const user = await User.findOne({ _id: req.params.id }).select('-password');
    if (!user) {
      throw new CustomError.NotFoundError(`No user with id : ${req.params.id}`);
    }
  
    checkPermissions(req.user, user._id);
    res.status(StatusCodes.OK).json({ user });
}

// show the current user 
const showCurrentUser = async (req, res) => {
    res.status(StatusCodes.OK).json({ user: req.user })
}


// update user with user.save
const updateUser = async (req, res) => {
    const { email, name } = req.body
    if (!email || !name) {
        throw new CustomAPIError.BadRequestError('Please provide all values')
    }

    const user = await User.findOne({ _id: req.user.userId })

    user.email = email;
    user.name = name;

    await user.save()

    const tokenUserPayload = createTokenUser(user)
    attachCookiesToResponse({ res, user: tokenUserPayload })
    res.status(StatusCodes.OK).json({ user: tokenUserPayload });

}

// this is for updating the password 
const updateUserPassword = async (req, res) => {
    const { oldPassword, newPassword } = req.body
    if (!oldPassword || !newPassword) {
        throw new CustomAPIError.BadRequestError('Please provide both values')
    }

    const user = await User.findOne({ _id: req.user.userId })


    const isPasswordCorrect = await user.comparePassword(oldPassword);
    if (!isPasswordCorrect) {
        throw new CustomAPIError.UnauthenticatedError('Invalid credientials')
    }
    user.password = newPassword

    // this save method help us to save the new password 
    // into the hashing password 
    await user.save();

    res.status(StatusCodes.OK).json({ msg: 'Success! Password Updated' })
}

module.exports = {
    getAllUser,
    getSingleUser,
    showCurrentUser,
    updateUser,
    updateUserPassword,
}



// update the user iwith find and update
// const updateUser = async (req, res) => {
//     const { email, name } = req.body
//     if (!email || !name) {
//         throw new CustomAPIError.BadRequestError('Please provide all values')
//     }

//     const user = await User.findOneAndUpdate(
//         { _id: req.user.userId },
//         { email, name },
//         { new: true, runValidators: true }
//     );

//     const tokenUserPayload = createTokenUser(user)
// attachCookiesToResponse({res, user:tokenUserPayload})
// res.status(StatusCodes.OK).json({user:tokenUserPayload});

// }