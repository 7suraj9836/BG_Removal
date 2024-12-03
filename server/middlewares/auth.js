import jwt from 'jsonwebtoken';

// Middleware function to decode JWT token and get clerkId
const authUser = async (req, res, next) => {
    try {
        const authHeader = req.headers.authorization;
        // Check if the authorization header exists and starts with 'Bearer '
        if (!authHeader || !authHeader.startsWith("Bearer ")) {
            return res.status(401).json({ success: false, message: "Not Authorized, please log in again" });
        }
        // Extract the token from 'Bearer <token>'
        const token = authHeader.split(" ")[1];
        console.log("Extracted token:", token); // Log the extracted token for debugging

        // Decode the token to get the clerkId
        const token_decode = jwt.decode(token);
        console.log('token_decode',token_decode);
        if (!token_decode) {
            return res.status(401).json({ success: false, message: "Invalid token" });
        }

        // Attach clerkId to the request for downstream use
        req.body.clerkId = token_decode.clerkId;
        next();
    } catch (error) {
        console.log("Error in authUser middleware:", error.message);
        res.status(500).json({ success: false, message: "Internal Server Error" });
    }
};

export default authUser;
