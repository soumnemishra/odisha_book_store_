/**
 * Seed Admin User Script
 * 
 * Creates an admin user for testing the admin panel.
 * Run with: node src/seed/seedAdmin.js
 */

import mongoose from 'mongoose';
import User from '../models/User.js';
import { config } from '../config/env.js';

// Admin credentials should be set via environment variables
const ADMIN_EMAIL = process.env.ADMIN_SEED_EMAIL || 'admin@odishabookstore.com';
const ADMIN_PASSWORD = process.env.ADMIN_SEED_PASSWORD;

if (!ADMIN_PASSWORD) {
    console.error('ERROR: ADMIN_SEED_PASSWORD environment variable is not set');
    console.error('Please set ADMIN_SEED_PASSWORD in your .env file');
    console.error('Password must meet requirements: uppercase, lowercase, number, 8+ chars');
    process.exit(1);
}

const adminUser = {
    name: 'Admin User',
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: 'admin',
};

async function seedAdmin() {
    try {
        // Connect to MongoDB
        await mongoose.connect(config.MONGODB_URI);
        console.log('Connected to MongoDB');

        // Check if admin already exists
        const existingAdmin = await User.findOne({ email: adminUser.email });

        if (existingAdmin) {
            console.log('Admin user already exists:', existingAdmin.email);
            console.log('Role:', existingAdmin.role);

            // Ensure role is admin
            if (existingAdmin.role !== 'admin') {
                existingAdmin.role = 'admin';
                await existingAdmin.save();
                console.log('Updated user role to admin');
            }
        } else {
            // Create new admin user
            const admin = await User.create(adminUser);
            console.log('Admin user created successfully!');
            console.log('Email:', admin.email);
            console.log('Name:', admin.name);
            console.log('Role:', admin.role);
        }

        console.log('\n📧 Login credentials:');
        console.log(`   Email: ${ADMIN_EMAIL}`);
        console.log('   Password: (as set in ADMIN_SEED_PASSWORD env variable)');

    } catch (error) {
        console.error('Error seeding admin:', error.message);
    } finally {
        await mongoose.connection.close();
        console.log('\nDatabase connection closed');
        process.exit(0);
    }
}

seedAdmin();
