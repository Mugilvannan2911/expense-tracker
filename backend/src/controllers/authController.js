const bcrypt = require("bcrypt");
const prisma = require("../config/prisma");
const jwt = require("jsonwebtoken");
const {
    normalizePhone,
    generateAndSendOtp,
    verifyOtpAttempt
} = require("../services/otpService");

/**
 * Generate JWT token and set authentication cookie
 */
const setAuthCookie = (res, user) => {
    const token = jwt.sign(
        {
            id: user.id,
            username: user.username,
            email: user.email,
            phone: user.phone
        },
        process.env.JWT_SECRET,
        {
            expiresIn: process.env.JWT_EXPIRES_IN || "7d"
        }
    );

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("token", token, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000
    });

    return token;
};

/**
 * Login with Username / Email / Phone and Password
 */
const loginUser = async (req, res) => {
    try {
        const { username, password } = req.body;

        if (!username || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username/Email/Phone and password are required"
            });
        }

        const normalized = normalizePhone(username);

        // Allow logging in with username, email, or phone
        const user = await prisma.user.findFirst({
            where: {
                OR: [
                    { username: username },
                    { email: username },
                    ...(normalized ? [{ phone: normalized }] : [])
                ]
            }
        });

        if (!user) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return res.status(401).json({
                status: "error",
                message: "Invalid credentials"
            });
        }

        const token = setAuthCookie(res, user);

        return res.json({
            status: "success",
            message: "User logged in successfully",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error logging in user",
            error: error.message
        });
    }
};

/**
 * Register new user with username, email, optional phone, and password
 */
const registerUser = async (req, res) => {
    try {
        const { username, email, phone, password } = req.body;

        if (!username || !email || !password) {
            return res.status(400).json({
                status: "error",
                message: "Username, email, and password are required"
            });
        }

        const normalizedPhone = phone ? normalizePhone(phone) : null;

        // Check if user already exists with username, email, or phone
        const existingUser = await prisma.user.findFirst({
            where: {
                OR: [
                    { username },
                    { email },
                    ...(normalizedPhone ? [{ phone: normalizedPhone }] : [])
                ]
            }
        });

        if (existingUser) {
            let conflictField = "User";
            if (existingUser.username === username) conflictField = "Username";
            else if (existingUser.email === email) conflictField = "Email";
            else if (normalizedPhone && existingUser.phone === normalizedPhone) conflictField = "Phone number";

            return res.status(409).json({
                status: "error",
                message: `${conflictField} is already registered`
            });
        }

        const hashedPassword = await bcrypt.hash(password, 10);

        const user = await prisma.user.create({
            data: {
                username,
                email,
                phone: normalizedPhone,
                password: hashedPassword
            }
        });

        return res.status(201).json({
            status: "success",
            message: "User Registered Successfully",
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error registering user",
            error: error.message
        });
    }
};

/**
 * Send OTP to mobile number
 */
const sendOtp = async (req, res) => {
    try {
        const { phone } = req.body;

        if (!phone) {
            return res.status(400).json({
                status: "error",
                message: "Phone number is required"
            });
        }

        const result = await generateAndSendOtp(phone);

        return res.status(result.statusCode).json({
            status: result.success ? "success" : "error",
            message: result.message,
            phone: result.phone,
            otp: result.otp, // Returned in dev mode for easy testing
            expiresInMinutes: result.expiresInMinutes
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error sending OTP",
            error: error.message
        });
    }
};

/**
 * Verify OTP with attempt limits
 */
const verifyOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                status: "error",
                message: "Phone number and OTP are required"
            });
        }

        const result = await verifyOtpAttempt(phone, otp);

        return res.status(result.statusCode).json({
            status: result.success ? "success" : "error",
            message: result.message,
            remainingAttempts: result.remainingAttempts
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error verifying OTP",
            error: error.message
        });
    }
};

/**
 * Login with Mobile Number and OTP
 */
const loginWithOtp = async (req, res) => {
    try {
        const { phone, otp } = req.body;

        if (!phone || !otp) {
            return res.status(400).json({
                status: "error",
                message: "Phone number and OTP are required"
            });
        }

        // Verify the OTP attempt
        const verifyResult = await verifyOtpAttempt(phone, otp);

        if (!verifyResult.success) {
            return res.status(verifyResult.statusCode).json({
                status: "error",
                message: verifyResult.message,
                remainingAttempts: verifyResult.remainingAttempts
            });
        }

        const normalized = normalizePhone(phone);

        // Find user by phone number
        const user = await prisma.user.findUnique({
            where: {
                phone: normalized
            }
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "No registered account found with this phone number. Please register first.",
                phone: normalized,
                verified: true
            });
        }

        // Set token cookie & return session
        const token = setAuthCookie(res, user);

        return res.json({
            status: "success",
            message: "Logged in successfully with OTP",
            token,
            user: {
                id: user.id,
                username: user.username,
                email: user.email,
                phone: user.phone
            }
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error during OTP login",
            error: error.message
        });
    }
};

/**
 * Get current authenticated user profile
 */
const getMe = async (req, res) => {
    try {
        const user = await prisma.user.findUnique({
            where: { id: parseInt(req.user.id, 10) },
            select: {
                id: true,
                username: true,
                email: true,
                phone: true,
                created_at: true
            }
        });

        if (!user) {
            return res.status(404).json({
                status: "error",
                message: "User not found"
            });
        }

        return res.json({
            status: "success",
            user
        });
    } catch (error) {
        return res.status(500).json({
            status: "error",
            message: "Error fetching user profile",
            error: error.message
        });
    }
};

/**
 * Logout user and clear authentication cookie
 */
const logoutUser = (req, res) => {
    const isProduction = process.env.NODE_ENV === "production";

    res.clearCookie("token", {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax"
    });

    return res.json({
        status: "success",
        message: "Logged out successfully"
    });
};

module.exports = {
    loginUser,
    registerUser,
    sendOtp,
    verifyOtp,
    loginWithOtp,
    getMe,
    logoutUser
};