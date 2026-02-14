require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedAdmin = async () => {
    try {
        await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db');
        console.log('MongoDB connected');

        const email = process.env.ADMIN_EMAIL || 'superadmin@example.com';
        const password = process.env.ADMIN_PASSWORD || 'password123';
        const role = 'admin';

        const existingUser = await User.findOne({ email });
        if (existingUser) {
            const salt = await bcrypt.genSalt(10);
            const hashedPassword = await bcrypt.hash(password, salt);

            existingUser.role = role;
            existingUser.isVerified = true;
            existingUser.password = hashedPassword;
            await existingUser.save();

            console.log('Admin user updated successfully');
            console.log(`Email: ${email}`);
            console.log(`Password: ${password}`);
            process.exit(0);
        }

        const salt = await bcrypt.genSalt(10);
        const hashedPassword = await bcrypt.hash(password, salt);

        const user = new User({
            email,
            password: hashedPassword,
            role,
            isVerified: true
        });

        await user.save();
        console.log(`Super Admin created successfully`);
        console.log(`Email: ${email}`);
        console.log(`Password: ${password}`);
        
        process.exit(0);
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
};

seedAdmin();
