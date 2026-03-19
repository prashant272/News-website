const express = require('express');
const router = express.Router();
const InternationalProgram = require('../Models/InternationalProgram');

// @route   GET /api/international-programs
// @desc    Get all international programs
// @access  Public
router.get('/', async (req, res) => {
    try {
        const query = req.query.all === 'true' ? {} : { isActive: true };
        const programs = await InternationalProgram.find(query).sort({ createdAt: -1 });
        res.status(200).json({ success: true, data: programs });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   POST /api/international-programs
// @desc    Create a new international program
// @access  Private (Admin)
router.post('/', async (req, res) => {
    try {
        const { title, link } = req.body;
        if (!title || !link) {
            return res.status(400).json({ success: false, message: 'Title and link are required' });
        }
        const program = await InternationalProgram.create({ title, link });
        res.status(201).json({ success: true, data: program });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   PUT /api/international-programs/:id
// @desc    Update an international program
// @access  Private (Admin)
router.put('/:id', async (req, res) => {
    try {
        const program = await InternationalProgram.findByIdAndUpdate(req.params.id, req.body, { new: true });
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.status(200).json({ success: true, data: program });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

// @route   DELETE /api/international-programs/:id
// @desc    Delete an international program
// @access  Private (Admin)
router.delete('/:id', async (req, res) => {
    try {
        const program = await InternationalProgram.findByIdAndDelete(req.params.id);
        if (!program) {
            return res.status(404).json({ success: false, message: 'Program not found' });
        }
        res.status(200).json({ success: true, message: 'Program deleted successfully' });
    } catch (err) {
        res.status(500).json({ success: false, message: err.message });
    }
});

module.exports = router;
