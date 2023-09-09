import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import generateAuthToken from "../utiles/generateToken.js";
import ResetToken from "../models/token.js";
import crypto from "crypto";
import bcrypt from "bcrypt";
import BcryptSalt from "bcrypt-salt";
import { clientURL } from "../constants/envConstants.js";
import { Messages } from "../constants/Messages.js";

// register user
const authUser = asyncHandler(async (req, res) => {
  const { email, password } = req.body;

  const user = await User.findOne({ email });
  if (user && (await user.matchPassword(password))) {
    res.send({
      _id: user._id,
      firstName: user.first_name,
      lastName: user.last_name,
      profilePicture: user.profile_picture,
      email: user.email,
      role: user.role,
      token: generateAuthToken(user._id),
    });
  } else {
    res.status(401).send({ message: Messages.InvalidPasswordMsg });
  }
});

//Get userProfile
const getUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    res.send({
      _id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      email: user.email,
      role: user.role,
    });
  } else {
    res.status(404);
    throw new Error(Messages.NoDataFoundMsg);
  }
});

//Update User Profile

const updateUserProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id);
  if (user) {
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.profile_picture = req.body.profile_picture || user.profile_picture;
    user.email = req.body.email || user.email;

    if (req.body.password) {
      user.password = req.body.password;
    }

    const updatedUser = await user.save();

    res.send({
      _id: updatedUser.id,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    throw new Error(Messages.InvalidUserDataMsg);
  }
});

//Register User

const registerUser = asyncHandler(async (req, res) => {
  const { first_name, last_name, profile_picture, email, password } = req.body;

  const userExits = await User.findOne({ email });

  if (userExits) {
    res.status(400);

    throw new Error(Messages.UserAlreadyExistsMsg);
  }

  const user = await User.create({
    first_name,
    last_name,
    profile_picture,
    email,
    password,
  });

  if (user) {
    res.status(201).json({
      _id: user.id,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      email: user.email,
      role: user.role,
      token: generateAuthToken(user._id),
    });
  } else {
    res.status(400);
    throw new Error(Messages.NoDataFoundMsg);
  }
});

//get All User For ADmin

const getAllUsers = asyncHandler(async (req, res) => {
  const users = await User.find({});

  res.send(users);
});

const deleteUser = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    await user.remove();
    res.send({ message: Messages.UserRemoveMsg });
  } else {
    res.status(404);
    res.json({ message: Messages.NoDataFoundMsg });
  }
});

//get User By Id

const getUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id).select("-password");

  if (user) {
    res.send(user);
  } else {
    res.status(404);
    res.json({ message: Messages.NoDataFoundMsg });
  }
});

//Update user By id

const updateUserById = asyncHandler(async (req, res) => {
  const user = await User.findById(req.params.id);

  if (user) {
    user.first_name = req.body.first_name || user.first_name;
    user.last_name = req.body.last_name || user.last_name;
    user.profile_picture = req.body.profile_picture || user.profile_picture;
    user.email = req.body.email || user.email;

    const updatedUser = await user.save();

    res.send({
      id: updatedUser._id,
      first_name: user.first_name,
      last_name: user.last_name,
      profile_picture: user.profile_picture,
      email: updatedUser.email,
      role: updatedUser.role,
    });
  } else {
    res.status(404);
    res.json({ message: Messages.NoDataFoundMsg });
  }
});
// update user password
export const UpdateUserPassword = async (req, res) => {
  const {
    body: { email },
  } = req;

  const user = await User.findOne({ email });
  if (!user) {
    res.status(400).send(Messages.UserIsNotExistMsg);
  } else {
    let token = await ResetToken.findOne({ userId: user._id });
    if (token) await token.deleteOne();
    let resetToken = crypto.randomBytes(32).toString("hex");
    const hash = bcrypt.hashSync(resetToken, 10);
    await new ResetToken({
      userId: user._id,
      token: hash,
      createdAt: Date.now(),
    }).save();
    const link = `${clientURL}/reset-password?token=${resetToken}&id=${user._id}`;
    res.status(200).json({ msg: link });
    return link;
  }
};
// reset password
export const resetPassword = async (req, res) => {
  const {
    body: { userId, token, password },
  } = req;
  let passwordResetToken = await ResetToken.findOne({ userId });

  if (!passwordResetToken) {
    throw new Error(Messages.InvalidTokenMsg);
  }
  const data = token;
  const pass = passwordResetToken.token;
  const isValid = await bcrypt.compare(data, pass);
  if (!isValid) {
    res.status(400);
    throw new Error(Messages.TokenIsNotMatchMsg);
  }
  const hash = await bcrypt.hash(password, Number(BcryptSalt));
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );

  const user = await User.findById({ _id: userId });
  res.status(200).json({ msg: user });
  await passwordResetToken.deleteOne();
  return true;
};

const updatePassword = async (req, res) => {
  const { oldPassword, newPassword, userId } = req.body;
  const user = await User.findById(userId);
  if (!user) {
    res.status(400).send(Messages.UserIsNotExistMsg);
    return;
  }
  const isValid = await bcrypt.compare(oldPassword, user.password);
  if (!isValid) {
    res.status(400).send(Messages.InvalidPasswordMsg);
    return;
  }
  const hash = await bcrypt.hash(newPassword, Number(BcryptSalt));
  await User.updateOne(
    { _id: userId },
    { $set: { password: hash } },
    { new: true }
  );
  res.status(200).json({ msg: Messages.PasswordUpdateMsg });
};

// const updatePassword = asyncHandler(async (req, res) => {
//   const user = await User.findById(req.user._id);

//   if (user) {
//     user.password = req.body.password || user.password;

//     const updatedUser = await user.save();
//     res.json(updatedUser);
//   } else {
//     res.status(404).json({
//       message: Messages.UserIsNotExistMsg,
//     });
//   }
// });

export {
  authUser,
  getUserProfile,
  registerUser,
  updateUserProfile,
  getAllUsers,
  deleteUser,
  getUserById,
  updateUserById,
  updatePassword,
};
