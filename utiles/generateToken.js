import jwt from "jsonwebtoken";
import { jwtSecrect } from "../constants/envConstants.js";
const generateAuthToken = (id) => {
  return jwt.sign({ id }, jwtSecrect, {
    expiresIn: "30d",
  });
};

export default generateAuthToken;
