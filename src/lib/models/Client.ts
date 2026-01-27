import mongoose from "mongoose";

// Force model rebuild in dev to handle schema changes hot-reloading
if (process.env.NODE_ENV === 'development') {
    delete mongoose.models['Client'];
}

const ClientSchema = new mongoose.Schema({
    firstName: {
        type: String,
        required: [true, "First name is required"],
        trim: true,
    },
    lastName: {
        type: String,
        trim: true,
    },
    mobile: {
        type: String,
        required: [true, "Mobile number is required"],
        unique: true,
        trim: true,
    },
    email: {
        type: String,
        trim: true,
        lowercase: true,
    },
    address: {
        type: String,
        required: [true, "Address is required"],
    },
    aadhar: {
        type: String,
        trim: true,
    },
    pan: {
        type: String,
        trim: true,
        uppercase: true,
    },
    photoUrl: {
        type: String, // Cloudinary URL
    },
    status: {
        type: String,
        enum: ['active', 'inactive', 'blacklisted'],
        default: 'active',
    }
}, {
    timestamps: true // Automatically handles createdAt and updatedAt
});

export default mongoose.models.Client || mongoose.model("Client", ClientSchema);
