const express = require('express');
const router = express.Router();
const Goal = require('../models/Goal');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/goals
// @desc    Get all goals for logged in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const goals = await Goal.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(goals);
    } catch (error) {
        console.error('Get goals error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/goals
// @desc    Create a new goal
// @access  Private
router.post('/', async (req, res) => {
    try {
        const goal = await Goal.create({
            ...req.body,
            user: req.user._id,
        });
        res.status(201).json(goal);
    } catch (error) {
        console.error('Create goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/goals/:id
// @desc    Update a goal
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this goal' });
        }

        const updatedGoal = await Goal.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedGoal);
    } catch (error) {
        console.error('Update goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/goals/:id
// @desc    Delete a goal
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const goal = await Goal.findById(req.params.id);

        if (!goal) {
            return res.status(404).json({ message: 'Goal not found' });
        }

        if (goal.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this goal' });
        }

        await Goal.findByIdAndDelete(req.params.id);
        res.json({ message: 'Goal deleted successfully' });
    } catch (error) {
        console.error('Delete goal error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
