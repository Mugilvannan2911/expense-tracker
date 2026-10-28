const express = require("express");

const {
    loginUser,
    registerUser,
    sendOtp,
    verifyOtp,
    loginWithOtp,
    getMe,
    logoutUser
} = require("../controllers/authController");
const authMiddleware = require("../middleware/authMiddleware");

const router = express.Router();

// Username / Email / Phone + Password login
router.post("/login", loginUser);

// User registration (username, email, phone, password)
router.post("/register", registerUser);

// Current user profile check (protected)
router.get("/me", authMiddleware, getMe);

// Logout (clears session cookie)
router.post("/logout", logoutUser);

// Send OTP to mobile number (with 60s cooldown)
router.post("/send-otp", sendOtp);

// Verify OTP (with 3-attempt limit and lockout)
router.post("/verify-otp", verifyOtp);

// Login with mobile number and verified OTP
router.post("/login-otp", loginWithOtp);

module.exports = router;