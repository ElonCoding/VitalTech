require('dotenv').config();
const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const app = express();
const UserModel = require('./models/users');
const nodemailer = require('nodemailer');
// const crypto = require('crypto');
const multer = require('multer');
const path = require('path');

const otpStore = {};

app.use(express.json());
app.use(cors({
    origin: function (origin, callback) {
        const allowed = [
            'http://localhost:5173',
            'http://localhost:3000',
            process.env.FRONTEND_URL,
        ].filter(Boolean);
        if (!origin || allowed.some(o => origin.startsWith(o)) || origin.includes('vercel.app')) {
            callback(null, true);
        } else {
            callback(new Error('Not allowed by CORS'));
        }
    },
    credentials: true
}));

mongoose.connect(process.env.MONGODB_URI)
  
app.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;
        
        if (!email || !password) {
            return res.status(400).json('Email and password are required');
        }

        const user = await UserModel.findOne({ email: email });
        
        if (!user) {
            return res.status(401).json('No user found with this email');
        }

        const isPasswordValid = await user.comparePassword(password);
        if (!isPasswordValid) {
            return res.status(401).json('Incorrect password');
        }

        res.json({
            status: 'Success',
            role: user.role,
            name: user.name || '',
            email: user.email || ''
        });
    } catch (error) {
        console.error('Login error:', error);
        res.status(500).json('Server error occurred');
    }
})

app.post('/register', (req, res)=>{
    UserModel.create(req.body)
    .then(users => res.json(users))
    .catch(err => res.json(err))
})

app.post('/forgot-password', async (req, res) => {
    const { email } = req.body;
    if (!email) return res.status(400).json({ error: 'Email is required' });
    const user = await UserModel.findOne({ email });
    if (!user) return res.status(404).json({ error: 'No user found with this email' });

    const otp = ('' + Math.floor(100000 + Math.random() * 900000)); 
    const expiresAt = Date.now() + 10 * 60 * 1000; 
    otpStore[email] = { otp, expiresAt };

    const transporter = nodemailer.createTransport({
        service: 'gmail',
        auth: {
            user: '70001933arin@gmail.com',
            pass: 'gcdhuatufxpdxpll' 
        }
    });

    const mailOptions = {
        from: 'VitalCheck <70001933arin@gmail.com>',
        to: email,
        subject: 'VitalCheck Password Reset OTP',
        html: `
            <div style="font-family: 'Segoe UI', Arial, sans-serif; background: #f8fafc; padding: 32px; border-radius: 10px; max-width: 480px; margin: auto; border: 1px solid #e7eaf0;">
                <h2 style="color: #2563eb; text-align: center;">VitalCheck Password Reset</h2>
                <p style="font-size: 1.1rem; color: #222;">Hello,</p>
                <p style="font-size: 1.1rem; color: #222;">We received a request to reset your password. Please use the OTP below to proceed:</p>
                <div style="text-align: center; margin: 32px 0;">
                    <span style="display: inline-block; font-size: 2.2rem; letter-spacing: 8px; color: #2563eb; font-weight: bold; background: #e6f0fa; padding: 16px 32px; border-radius: 8px; border: 1px dashed #2563eb;">${otp}</span>
                </div>
                <p style="font-size: 1.05rem; color: #444;">This OTP is valid for <b>10 minutes</b>. If you did not request a password reset, you can safely ignore this email.</p>
                <hr style="margin: 24px 0; border: none; border-top: 1px solid #e7eaf0;" />
                <p style="font-size: 0.98rem; color: #888; text-align: center;">Thank you for using <b>VitalCheck</b>.<br/>Stay healthy, stay secure!</p>
                <p style="font-size: 0.95rem; color: #b91c1c; text-align: center; margin-top: 18px;">If you do not see this email in your inbox, please check your <b>Spam</b> or <b>Junk</b> folder.</p>
            </div>
        `
    };

    try {
        await transporter.sendMail(mailOptions);
        res.json({ status: 'OTP sent to email' });
    } catch (err) {
        console.error('Error sending OTP email:', err);
        res.status(500).json({ error: 'Failed to send OTP email' });
    }
});

app.post('/verify-otp', (req, res) => {
    const { email, otp } = req.body;
    if (!email || !otp) return res.status(400).json({ error: 'Email and OTP are required' });
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });
    if (Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    res.json({ status: 'OTP verified' });
});

app.post('/reset-password', async (req, res) => {
    const { email, otp, newPassword } = req.body;
    if (!email || !otp || !newPassword) return res.status(400).json({ error: 'Email, OTP, and new password are required' });
    const record = otpStore[email];
    if (!record) return res.status(400).json({ error: 'No OTP requested for this email' });
    if (Date.now() > record.expiresAt) return res.status(400).json({ error: 'OTP expired' });
    if (record.otp !== otp) return res.status(400).json({ error: 'Invalid OTP' });
    try {
        const user = await UserModel.findOne({ email });
        if (!user) return res.status(404).json({ error: 'User not found' });
        user.password = newPassword;
        await user.save();
        delete otpStore[email]; 
        res.json({ status: 'Password reset successful' });
    } catch (err) {
        console.error('Password reset error:', err);
        res.status(500).json({ error: 'Failed to reset password' });
    }
});
function generatePatientEmail() {
    const unique = Math.floor(100000 + Math.random() * 900000);
    return `patient${unique}@vitalcheck.com`;
}
function generatePassword(length = 8) {
    const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let pass = '';
    for (let i = 0; i < length; i++) {
        pass += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return pass;
}

const upload = multer({
    dest: path.join(__dirname, 'uploads/'),
    limits: { fileSize: 5 * 1024 * 1024 }, // 5MB
    fileFilter: (req, file, cb) => {
        if (!file.mimetype.startsWith('image/')) {
            return cb(new Error('Only image files are allowed!'), false);
        }
        cb(null, true);
    }
});

app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

app.post('/register-patient', upload.single('profileImage'), async (req, res) => {
    try {
        const { name, age, gender, contactNumber, address, medicalHistory, bloodGroup, emergencyContact, allergies, occupation } = req.body;
        if (!name || !age || !gender || !contactNumber) {
            return res.status(400).json({ error: 'Missing required fields' });
        }
        let email;
        let exists = true;
        while (exists) {
            email = generatePatientEmail();
            exists = await UserModel.findOne({ email });
        }
        const password = generatePassword(10);
        let profileImage = req.file ? `/uploads/${req.file.filename}` : '/uploads/default-user.png';
        const newPatient = new UserModel({
            name,
            email,
            password,
            role: 'patient',
            age,
            gender,
            contactNumber,
            address,
            medicalHistory,
            bloodGroup,
            emergencyContact,
            allergies,
            occupation,
            profileImage
        });
        await newPatient.save();
        res.json({
            status: 'success',
            patient: {
                _id: newPatient._id,
                name,
                email,
                password,
                role: 'patient',
                age,
                gender,
                contactNumber,
                address,
                medicalHistory,
                bloodGroup,
                emergencyContact,
                allergies,
                occupation,
                profileImage
            }
        });
    } catch (err) {
        console.error('Register patient error:', err);
        res.status(500).json({ error: 'Failed to register patient' });
    }
});

app.get('/patients', async (req, res) => {
    try {
        const patients = await UserModel.find({ role: 'patient' });
        res.json({ patients });
    } catch (err) {
        console.error('Fetch patients error:', err);
        res.status(500).json({ error: 'Failed to fetch patients' });
    }
});

app.patch('/patients/:id/password', async (req, res) => {
    try {
        const { id } = req.params;
        const { newPassword } = req.body;
        if (!newPassword) return res.status(400).json({ error: 'New password is required' });
        const patient = await UserModel.findById(id);
        if (!patient) return res.status(404).json({ error: 'Patient not found' });
        patient.password = newPassword;
        await patient.save();
        res.json({
            status: 'success',
            patient: {
                _id: patient._id,
                name: patient.name,
                email: patient.email,
                plainPassword: newPassword,
                role: patient.role,
                age: patient.age,
                gender: patient.gender,
                contactNumber: patient.contactNumber,
                address: patient.address,
                medicalHistory: patient.medicalHistory,
            }
        });
    } catch (err) {
        console.error('Update patient password error:', err);
        res.status(500).json({ error: 'Failed to update password' });
    }
});

app.delete('/patients/:id', async (req, res) => {
    try {
        const { id } = req.params;
        const deleted = await UserModel.findByIdAndDelete(id);
        if (!deleted) return res.status(404).json({ error: 'Patient not found' });
        res.json({ status: 'success' });
    } catch (err) {
        console.error('Delete patient error:', err);
        res.status(500).json({ error: 'Failed to delete patient' });
    }
    
});

// Health check endpoint
app.get('/health', (req, res) => res.json({ status: 'ok' }));

const PORT = process.env.PORT || 3001;
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
    // Self-ping every 14 min to prevent Render free tier from sleeping
    if (process.env.RENDER_EXTERNAL_URL) {
        const https = require('https');
        setInterval(() => {
            https.get(`${process.env.RENDER_EXTERNAL_URL}/health`, (res) => {
                console.log('Keep-alive ping sent, status:', res.statusCode);
            }).on('error', (err) => {
                console.error('Keep-alive failed:', err.message);
            });
        }, 14 * 60 * 1000);
    }
});

module.exports = app;