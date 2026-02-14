require('dotenv').config();
const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const User = require('./models/User');

const seedEngineer = async () => {
  try {
    await mongoose.connect(process.env.MONGO_URI || 'mongodb://localhost:27017/inventory-db');
    console.log('MongoDB connected');

    const email = process.env.ENGINEER_EMAIL || 'engineer@example.com';
    const password = process.env.ENGINEER_PASSWORD || 'password123';
    const role = 'site_engineer';

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const existingUser = await User.findOne({ email });
    if (existingUser) {
      existingUser.role = role;
      existingUser.isVerified = true;
      existingUser.password = hashedPassword;
      await existingUser.save();
      console.log('Engineer user updated successfully');
      console.log(`Email: ${email}`);
      console.log(`Password: ${password}`);
      process.exit(0);
    }

    const user = new User({
      email,
      password: hashedPassword,
      role,
      isVerified: true
    });

    await user.save();
    console.log('Engineer user created successfully');
    console.log(`Email: ${email}`);
    console.log(`Password: ${password}`);
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
};

seedEngineer();
