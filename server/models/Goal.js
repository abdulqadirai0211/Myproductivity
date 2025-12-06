const mongoose = require('mongoose');

const milestoneSchema = new mongoose.Schema({
    title: {
        type: String,
        required: true,
    },
    completed: {
        type: Boolean,
        default: false,
    },
    linkedTasks: [{
        type: String, // Task IDs
    }],
});

const goalSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true,
    },
    title: {
        type: String,
        required: [true, 'Goal title is required'],
        trim: true,
    },
    description: {
        type: String,
        trim: true,
    },
    period: {
        type: String,
        enum: ['weekly', 'monthly', 'custom'],
        default: 'monthly',
    },
    targetDate: {
        type: Date,
    },
    progress: {
        type: Number,
        default: 0,
        min: 0,
        max: 100,
    },
    milestones: [milestoneSchema],
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
goalSchema.pre('save', function (next) {
    this.updatedAt = Date.now();
    next();
});

module.exports = mongoose.model('Goal', goalSchema);
