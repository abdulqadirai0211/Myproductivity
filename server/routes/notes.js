const express = require('express');
const router = express.Router();
const Note = require('../models/Note');
const { protect } = require('../middleware/auth');

router.use(protect);

// @route   GET /api/notes
// @desc    Get all notes for logged in user
// @access  Private
router.get('/', async (req, res) => {
    try {
        const notes = await Note.find({ user: req.user._id }).sort({ updatedAt: -1 });
        res.json(notes);
    } catch (error) {
        console.error('Get notes error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   POST /api/notes
// @desc    Create a new note
// @access  Private
router.post('/', async (req, res) => {
    try {
        const note = await Note.create({
            ...req.body,
            user: req.user._id,
        });
        res.status(201).json(note);
    } catch (error) {
        console.error('Create note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   PUT /api/notes/:id
// @desc    Update a note
// @access  Private
router.put('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to update this note' });
        }

        const updatedNote = await Note.findByIdAndUpdate(
            req.params.id,
            req.body,
            { new: true, runValidators: true }
        );

        res.json(updatedNote);
    } catch (error) {
        console.error('Update note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

// @route   DELETE /api/notes/:id
// @desc    Delete a note
// @access  Private
router.delete('/:id', async (req, res) => {
    try {
        const note = await Note.findById(req.params.id);

        if (!note) {
            return res.status(404).json({ message: 'Note not found' });
        }

        if (note.user.toString() !== req.user._id.toString()) {
            return res.status(403).json({ message: 'Not authorized to delete this note' });
        }

        await Note.findByIdAndDelete(req.params.id);
        res.json({ message: 'Note deleted successfully' });
    } catch (error) {
        console.error('Delete note error:', error);
        res.status(500).json({ message: 'Server error' });
    }
});

module.exports = router;
