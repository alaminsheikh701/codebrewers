import jwt from "jsonwebtoken";
import User from "../models/userModel.js";
import asyncHandler from "express-async-handler";
import { jwtSecrect } from "../constants/envConstants.js";
const protect = asyncHandler(async (req, res, next) => {
  let token;

  if (
    req.headers.authorization &&
    req.headers.authorization.startsWith("Bearer")
  ) {
    try {
      token = req.headers.authorization.split(" ")[1];

      const decode = jwt.verify(token, jwtSecrect);

      req.user = await User.findById(decode.id).select("-password");

      next();
    } catch (error) {
      res.status(401);
      throw new Error("Not Authorized TOken Failed");
    }
  }

  if (!token) {
    res.status(401);
    res.send("UnAuthorized Access");
  }
});

const isAdmin = (req, res, next) => {
  if (req.user && req.user.role === "admin") {
    next();
  } else {
    res.json({ message: "Not Authorized As Admin" });
  }
};

export { protect, isAdmin };
