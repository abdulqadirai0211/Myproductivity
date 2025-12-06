const express = require('express');
const router = express.Router();
const Routine = require('../models/Routine');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/routines
// @desc    Get all routines for logged in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const routines = await Routine.find({ user: req.user._id }).sort({ createdAt: -1 });
        res.json(routines);
    } catch (error) {
        console.error('Get routines error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/routines
// @desc    Create a new routine
// @access  Private
router.post('/', async (req, res) => {
    try {
        const routine = await Routine.create({
            ...req.body,
            user: req.user._id,
        });
        res.status(201).json(routine);
    } catch (error) {
        console.error('Create routine error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/routines/:id
// @desc    Update a routine
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this routine' });
        }

        const updatedRoutine = await Routine.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedRoutine);
    } catch (error) {
        console.error('Update routine error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/routines/:id
// @desc    Delete a routine
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this routine' });
        }

        await Routine.findByIdAndDelete(req.params.id);
        res.json({ message: 'Routine deleted successfully' });
    } catch (error) {
        console.error('Delete routine error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/routines/:id/toggle/:date
// @desc    Toggle routine completion for a specific date
// @access  Private
router.post('/:id/toggle/:date', async (req, res) => {
    try {
        const routine = await Routine.findById(req.params.id);

        if (!routine) {
            return res.status(404).json({ message: 'Routine not found' });
        }

        if (routine.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this routine' });
        }

        const date = req.params.date;
        const currentStatus = routine.completions.get(date) || false;
        routine.completions.set(date, !currentStatus);

        await routine.save();
        res.json(routine);
    } catch (error) {
        console.error('Toggle routine error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
