const jwt = require("jsonwebtoken");

const authMiddleware = (req, res, next) => {
    try {
        let token = req.cookies?.token;

        if (!token && req.headers.authorization && req.headers.authorization.startsWith("Bearer ")) {
            token = req.headers.authorization.split(" ")[1];
        }

        if (!token) {
            return res.status(401).json({
                status: "error",
                message: "Unauthorized - No authentication token provided"
            });
        }

        const decoded = jwt.verify(
            token,  
            process.env.JWT_SECRET
        );

        req.user = decoded;

        next();

    } catch (error) {
        return res.status(401).json({
            status: "error",
            message: "Invalid or expired token"
        });
    }
};

module.exports = authMiddleware;