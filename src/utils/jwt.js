import jwt from "jsonwebtoken";

const generateTokens = (user) => {
    try {
        if (!process.env.ACCESS_SECRET || !process.env.REFRESH_SECRET) {
            throw new Error("JWT secrets missing");
        }

        const payload = {
            id: user._id,
        };

        // 🔐 Access Token
        const accessToken = jwt.sign(
            payload,
            process.env.ACCESS_SECRET,
            { expiresIn: "30m" }
        );

        // 🔁 Refresh Token
        const refreshToken = jwt.sign(
            payload,
            process.env.REFRESH_SECRET,
            { expiresIn: "7d" }
        );

        return { accessToken, refreshToken };

    } catch (error) {
        console.error("Token generation error:", error.message);
        throw error;
    }
};

export default generateTokens;