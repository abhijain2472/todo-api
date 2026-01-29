const mongoose = require('mongoose');
const { v4: uuidv4 } = require('uuid');

const TodoSchema = new mongoose.Schema(
    {
        _id: {
            type: String,
            default: uuidv4, // UUIDs are better for client-generated IDs in offline apps
        },
        title: {
            type: String,
            required: [true, 'Please add a title'],
            trim: true,
        },
        completed: {
            type: Boolean,
            default: false,
        },
        deletedAt: {
            type: Date,
            default: null, // For soft deletes (tombstoning)
        },
        version: {
            type: Number,
            default: 1, // Simple versioning for conflict resolution
        },
    },
    {
        timestamps: true, // Adds createdAt and updatedAt automatically
    }
);

// Middleware to increment version on updates
// Middleware to increment version on updates
TodoSchema.pre('save', function () {
    if (this.isModified()) {
        this.version += 1;
    }
});

module.exports = mongoose.model('Todo', TodoSchema);
