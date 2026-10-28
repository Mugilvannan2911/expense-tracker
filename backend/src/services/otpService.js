const prisma = require("../config/prisma");

const OTP_EXPIRY_MINUTES = 5;
const MAX_ATTEMPTS = 3;
const RESEND_COOLDOWN_SECONDS = 60;

/**
 * Format and normalize a phone number (e.g. 10 digits)
 */
const normalizePhone = (phone) => {
    if (!phone) return null;
    const cleaned = String(phone).replace(/\D/g, "");
    // Standard 10-digit number or 12-digit with country code
    if (cleaned.length === 10) return cleaned;
    if (cleaned.length > 10) return cleaned.slice(-10); // get last 10 digits for local consistency
    return cleaned;
};

/**
 * Generate and send OTP to phone number
 */
const generateAndSendOtp = async (rawPhone) => {
    const phone = normalizePhone(rawPhone);
    if (!phone || phone.length < 10) {
        return {
            success: false,
            statusCode: 400,
            message: "Invalid phone number. Please enter a valid 10-digit mobile number."
        };
    }

    // Check resend cooldown (e.g. 60 seconds)
    const recentOtp = await prisma.otpVerification.findFirst({
        where: {
            phone,
            created_at: {
                gte: new Date(Date.now() - RESEND_COOLDOWN_SECONDS * 1000)
            }
        },
        orderBy: { created_at: "desc" }
    });

    if (recentOtp) {
        const secondsPassed = Math.floor((Date.now() - new Date(recentOtp.created_at).getTime()) / 1000);
        const waitSeconds = RESEND_COOLDOWN_SECONDS - secondsPassed;
        return {
            success: false,
            statusCode: 429,
            message: `Please wait ${waitSeconds} seconds before requesting a new OTP.`
        };
    }

    // Invalidate previous active unverified OTPs for this phone
    await prisma.otpVerification.updateMany({
        where: { phone, verified: false },
        data: { verified: true } // Mark existing as closed so only the new one is active
    });

    // Generate 6-digit numeric OTP
    const otp = Math.floor(100000 + Math.random() * 900000).toString();
    const expiresAt = new Date(Date.now() + OTP_EXPIRY_MINUTES * 60 * 1000);

    // Save to database
    await prisma.otpVerification.create({
        data: {
            phone,
            otp,
            attempts: 0,
            max_attempts: MAX_ATTEMPTS,
            expires_at: expiresAt,
            verified: false
        }
    });

    // Log to console for development / debugging
    console.log(`\n========================================`);
    console.log(`[OTP SENT] Mobile: ${phone} | OTP: ${otp} | Expires in ${OTP_EXPIRY_MINUTES} mins`);
    console.log(`========================================\n`);

    return {
        success: true,
        statusCode: 200,
        message: "OTP sent successfully.",
        phone,
        otp: process.env.NODE_ENV === "production" ? undefined : otp,
        expiresInMinutes: OTP_EXPIRY_MINUTES
    };
};

/**
 * Verify OTP with attempt limiting and lockout
 */
const verifyOtpAttempt = async (rawPhone, inputOtp) => {
    const phone = normalizePhone(rawPhone);
    if (!phone || !inputOtp) {
        return {
            success: false,
            statusCode: 400,
            message: "Mobile number and OTP are required."
        };
    }

    // Find the latest active unverified OTP record
    const record = await prisma.otpVerification.findFirst({
        where: {
            phone,
            verified: false
        },
        orderBy: {
            created_at: "desc"
        }
    });

    if (!record) {
        return {
            success: false,
            statusCode: 404,
            message: "No active OTP found for this mobile number. Please request a new OTP."
        };
    }

    // Check if max attempts already reached
    if (record.attempts >= record.max_attempts) {
        return {
            success: false,
            statusCode: 403,
            message: "Maximum OTP verification attempts exceeded. Please request a new OTP."
        };
    }

    // Check if expired
    if (new Date() > new Date(record.expires_at)) {
        return {
            success: false,
            statusCode: 410,
            message: "OTP has expired. Please request a new OTP."
        };
    }

    // Check if OTP matches
    if (record.otp !== String(inputOtp).trim()) {
        // Increment attempts count
        const updated = await prisma.otpVerification.update({
            where: { id: record.id },
            data: {
                attempts: { increment: 1 }
            }
        });

        const remainingAttempts = Math.max(0, updated.max_attempts - updated.attempts);

        if (remainingAttempts === 0) {
            return {
                success: false,
                statusCode: 403,
                message: "Maximum attempts exceeded. This OTP is now locked. Please request a new OTP.",
                remainingAttempts: 0
            };
        }

        return {
            success: false,
            statusCode: 400,
            message: `Invalid OTP. ${remainingAttempts} attempt${remainingAttempts === 1 ? "" : "s"} remaining.`,
            remainingAttempts
        };
    }

    // OTP is valid! Mark as verified
    await prisma.otpVerification.update({
        where: { id: record.id },
        data: {
            verified: true
        }
    });

    return {
        success: true,
        statusCode: 200,
        message: "OTP verified successfully.",
        phone
    };
};

module.exports = {
    normalizePhone,
    generateAndSendOtp,
    verifyOtpAttempt
};
