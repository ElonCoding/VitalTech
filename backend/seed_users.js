require('dotenv').config();
const mongoose = require('mongoose');
const UserModel = require('./models/users');

const uri = process.env.MONGODB_URI;

async function seedUsers() {
    try {
        await mongoose.connect(uri);
        console.log("Connected to MongoDB for seeding...");

        // Check if any users already exist
        const count = await UserModel.countDocuments();
        console.log(`Current user count: ${count}`);

        const testUsers = [
            {
                name: "Admin User",
                email: "admin@vitaltech.com",
                password: "Password123!",
                role: "admin"
            },
            {
                name: "Doctor User",
                email: "doctor@vitaltech.com",
                password: "Password123!",
                role: "doctor"
            }
        ];

        for (const user of testUsers) {
            const existingUser = await UserModel.findOne({ email: user.email });
            if (!existingUser) {
                await UserModel.create(user);
                console.log(`User created: ${user.email} with password: ${user.password}`);
            } else {
                console.log(`User already exists: ${user.email}`);
            }
        }

        await mongoose.disconnect();
        console.log("Seeding complete!");
    } catch (err) {
        console.error("Seeding failed:", err);
    }
}

seedUsers();
