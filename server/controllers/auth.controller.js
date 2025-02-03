import transporter from '../config/nodemailer.js';
import userModal from '../models/userModel.js';
import jwt from "jsonwebtoken";
import bcrypt from "bcryptjs";
import { EMAIL_VERIFY_TEMPLATE, PASSWORD_RESET_TEMPLATE } from '../config/emailTemplate.js';

export const register = async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        return res.json({
            success: false,
            message: 'Seems you missed one or more details'
        })
    }

    try {

        const user = await userModal.isEmailTaken(email);
        if (user) {
            return res.json({
                success: false,
                message: 'Email is already taken'
            })
        }

        const newUser = new userModal({
            name,
            email,
            password
        });

        await newUser.save();

        const token = jwt.sign({ id: newUser._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: email,
            subject: `Welcome ${name}`,
            text: 'Welcome, Your account has been created.'
        };

        await transporter.sendMail(mailOptions);

        return res.json({
            success: true
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
}

export const login = async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.json({
            success: false,
            message: 'Seems like you missed out some fields.'
        });
    }

    try {

        const user = await userModal.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'Invalid email'
            });
        }

        const isPassMatch = await user.isPasswordMatch(password);

        if (!isPassMatch) {
            return res.json({
                success: false,
                message: 'Incorrect password'
            });
        }

        const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET_KEY, {
            expiresIn: '1d'
        });

        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict',
            maxAge: 24 * 60 * 60 * 1000
        })

        return res.json({ success: true });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
}

export const logout = async (req, res) => {
    try {
        res.clearCookie('token', {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'strict'
        });
        return res.json({
            success: true,
            message: 'Logged out!!!'
        })
    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        })
    }
};

export const sendVerifyOtp = async (req, res) => {
    try {
        const { userId } = req.body;

        const user = await userModal.findById(userId);

        if (user.isAccountVerified) {
            return res.json({
                success: false,
                message: 'Account already verified.'
            });
        }

        const otp = String(100000 + Math.floor(Math.random() * 900000));

        user.verifyOtp = otp;
        user.verifyOtpExpireAt = Date.now() + 60 * 60 * 1000;

        await user.save();

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Account Verification OTP`,
            text: `Your OTP is ${otp}. Verify your account using this OTP.`,
            html: EMAIL_VERIFY_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };
        await transporter.sendMail(mailOptions);

        return res.json({
            success: true,
            message: 'Verification OTP sent'
        });

    } catch (error) {
        res.json({
            success: false,
            message: error.message
        });
    }
};

export const verifyEmail = async (req, res) => {
    try {
        const { userId, otp } = req.body;

        if (!userId || !otp) {
            return res.json({
                success: false,
                message: 'Missing details'
            });
        }

        const user = await userModal.findById(userId);

        if (!user) {
            return res.json({
                success: false,
                message: "User not found"
            });
        }

        if (user.verifyOtp === "" || user.verifyOtp !== otp) {
            return res.json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.verifyOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: 'OTP Expired'
            });
        }

        user.isAccountVerified = true;

        user.verifyOtp = '';
        user.verifyOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true,
            message: 'Email verified successfully'
        });

    } catch (error) {
        return res.json({
            success: false,
            message: error.message
        });
    }
};

export const isAuthenticated = async (req, res) => {
    try {
        return res.json({ success: true });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
};

export const sendResetOtp = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.json({
                success: false,
                message: 'Email is required'
            });
        }

        const user = await userModal.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'User is not registered'
            });
        }

        const otp = String(100000 + Math.floor(Math.random() * 900000));

        const mailOptions = {
            from: process.env.SENDER_EMAIL,
            to: user.email,
            subject: `Password Reset OTP`,
            text: `Your OTP to reset password is ${otp}.`,
            html: PASSWORD_RESET_TEMPLATE.replace("{{otp}}", otp).replace("{{email}}", user.email)
        };

        user.resetOtp = otp;
        user.resetOtpExpireAt = Date.now() + 15 * 60 * 1000;

        await user.save();

        await transporter.sendMail(mailOptions);


        return res.json({
            success: true,
            message: 'OTP sent to your email'
        });


    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
};

export const resetPassword = async (req, res) => {
    const { email, otp, newPassword } = req.body;

    if (!email || !otp || !newPassword) {
        return res.json({
            success: false,
            message: 'Email, OTP, New Password required'
        });
    }
    try {
        const user = await userModal.findOne({ email });

        if (!user) {
            return res.json({
                success: false,
                message: 'User not found'
            });
        }

        if (user.resetOtp === "" || user.resetOtp !== otp) {
            return res.json({
                success: false,
                message: 'Invalid OTP'
            });
        }

        if (user.resetOtpExpireAt < Date.now()) {
            return res.json({
                success: false,
                message: 'OTP expired'
            });
        }

        user.password = newPassword;
        user.resetOtp = '';
        user.resetOtpExpireAt = 0;

        await user.save();

        return res.json({
            success: true
        });
    } catch (error) {
        res.json({
            success: false,
            message: error.message
        })
    }
};