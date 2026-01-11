const mongoose = require('mongoose');
const { hash } = require('bcryptjs');
require('dotenv').config({ path: '.env.local' }); // Try .env.local first
require('dotenv').config(); // Fallback to .env

// Minimal Schemas for Seeding
const RoleSchema = new mongoose.Schema({
  name: { type: String, unique: true },
  permissions: [String]
});
const UserSchema = new mongoose.Schema({
  email: { type: String, unique: true },
  password: String,
  name: String,
  role: mongoose.Schema.Types.ObjectId
});

const Role = mongoose.models.Role || mongoose.model('Role', RoleSchema);
const User = mongoose.models.User || mongoose.model('User', UserSchema);

const MONGODB_URI = process.env.MONGODB_URI || 'mongodb://localhost:27017/loanerp';

const PERMISSIONS = {
    // User Management
    MANAGE_USERS: 'manage_users',
    VIEW_USERS: 'view_users',
    
    // Loan Management
    CREATE_LOAN: 'create_loan',
    VIEW_LOANS: 'view_loans',
    APPROVE_LOAN: 'approve_loan',
    DELETE_LOAN: 'delete_loan',

    // Client Management
    MANAGE_CLIENTS: 'manage_clients',
    VIEW_CLIENTS: 'view_clients',

    // Financials
    VIEW_REPORTS: 'view_reports',
    MANAGE_PAYMENTS: 'manage_payments',

    // System
    MANAGE_SETTINGS: 'manage_settings',
    VIEW_ACTIVITY_LOG: 'view_activity_log',
};

const ROLES = [
    {
        name: 'Admin',
        permissions: Object.values(PERMISSIONS) // All permissions
    },
    {
        name: 'Manager',
        permissions: [
            PERMISSIONS.VIEW_USERS,
            PERMISSIONS.CREATE_LOAN,
            PERMISSIONS.VIEW_LOANS,
            PERMISSIONS.APPROVE_LOAN,
            PERMISSIONS.MANAGE_CLIENTS,
            PERMISSIONS.VIEW_CLIENTS,
            PERMISSIONS.VIEW_REPORTS,
            PERMISSIONS.MANAGE_PAYMENTS,
            PERMISSIONS.VIEW_ACTIVITY_LOG,
        ]
    },
    {
        name: 'Staff',
        permissions: [
            PERMISSIONS.CREATE_LOAN,
            PERMISSIONS.VIEW_LOANS,
            PERMISSIONS.VIEW_CLIENTS,
            PERMISSIONS.MANAGE_PAYMENTS,
        ]
    }
];

async function seed() {
  console.log('Connecting to MongoDB...');
  await mongoose.connect(MONGODB_URI);
  console.log('Connected.');

  try {
    // 1. Create/Update Roles
    const roleMap = {};
    
    for (const r of ROLES) {
        // Use findOneAndUpdate to upsert
        const roleDoc = await Role.findOneAndUpdate(
            { name: r.name },
            { $set: { permissions: r.permissions } },
            { upsert: true, new: true }
        );
        roleMap[r.name] = roleDoc._id;
        console.log(`Synced Role: ${r.name}`);
    }
    //superadmin@fincorperp.com
    // 2. Create User
    let superAdminUser = await User.findOne({ email: 'superadmin@fincorperp.com' });
    if (!superAdminUser) {
      const password = await hash('admin123', 12);
      superAdminUser = await User.create({
        email: 'admin@patnifinance.com',
        name: 'System Root',
        password: password,
        role: roleMap['Admin']
      });
      console.log('Created Super Admin User');
    } else {
      // Ensure role is admin
      if (superAdminUser.role.toString() !== roleMap['Admin'].toString()) {
          superAdminUser.role = roleMap['Admin'];
          await superAdminUser.save();
          console.log('Updated Super Admin Role to Admin');
      }
      console.log('Super Admin User exists and is verified');
    }

  } catch (error) {
    console.error('Seeding Error:', error);
  } finally {
    await mongoose.disconnect();
    console.log('Disconnected');
  }
}

seed();
