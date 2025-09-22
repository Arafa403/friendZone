// userModel.js
const mongoose = require('mongoose');

// تحديد شكل البيانات (Schema)
const userSchema = new mongoose.Schema({
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    name: { type: String, required: true },
    gender: { type: String },
    country: { type: String },
    age: { type: Number }
}, { timestamps: true });

// إنشاء موديل من الـ Schema
const User = mongoose.model('User', userSchema);

module.exports = User;
