import mongoose from "mongoose";
import bcrypt from "bcryptjs";

const userSchema = mongoose.Schema({
    name: {
        type: String,
        required: true
    },
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    },
    verifyOtp: {
        type: String,
        default: ''
    },
    verifyOtpExpireAt: {
        type: Number,
        default: 0
    },
    isAccountVerified: {
        type: Boolean,
        default: false
    },
    resetOtp: {
        type: String,
        default: ''
    },
    resetOtpExpireAt: {
        type: Number,
        default: 0
    }
});

userSchema.statics.isEmailTaken = async function (email) {
    const isEmailUnique = await this.findOne({ email: email });
    return isEmailUnique;
};

userSchema.pre('save', async function (next) {
    const user = this;
    if (!user.isModified('password')) return next();
    this.password = await bcrypt.hash(user.password, 10);
    next();
});

userSchema.methods.isPasswordMatch = async function (password) {
    return bcrypt.compare(password, this.password);
};

const userModal = mongoose.models.user || mongoose.model('user', userSchema);

export default userModal;