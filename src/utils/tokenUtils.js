import jwt from "jsonwebtoken";
import crypto from "node:crypto";

export const createAccessToken =(user)=>{
    return jwt.sign(
        {
            sub:user._id.toString(),
            role:user.role,
            type:"access"
        },
        process.env.JWT_ACCESS_SECRET,
        {
            expiresIn:process.env.ACCESS_TOKEN_EXPIRES_IN || "15m"
        }
    );
};

export const createRefreshToken=(user)=>{
    return jwt.sign(
        {
            sub:user._id.toString(),
            type:"refresh"
        },
        process.env.JWT_REFRESH_SECRET,
        {
            expiresIn:process.env.REFRESH_TOKEN_EXPIRES_IN || "7d"
        }
    );
};

export const hashToken=(token)=>{
    return crypto.createHash("sha256").update(token).digest("hex");
}

export const getRefreshExpiryDate = () => {
  return new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
};