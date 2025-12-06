const mongoose = require('mongoose');

const routineSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Routine title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    startTime: {
        type: String, // Format: "HH:MM"
    },
    endTime: {
        type: String, // Format: "HH:MM"
    },
    category: {
        type: String,
        enum: ['health', 'fitness', 'work', 'learning', 'mindfulness', 'personal', 'other'],
        default: 'other',
    },
    active: {
        type: Boolean,
        default: true,
    },
    completions: {
        type: Map,
        of: Boolean,
        default: new Map(), // Key: date (YYYY-MM-DD), Value: completed (boolean)
    },
    createdAt: {
        type: Date,
        default: Date.now,
    },
    updatedAt: {
        type: Date,
        default: Date.now,
    },
});

// Update updatedAt on save
routineSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Routine', routineSchema);
