import dotEnv from "dotenv";
dotEnv.config();
export const clientURL = process.env.CLIENT_URL;
export const port = process.env.PORT;
export const atlasUrl = process.env.ATLAS_URI;
export const dbName = process.env.DB_NAME;
export const jwtSecrect = process.env.JWT_SECRET;
