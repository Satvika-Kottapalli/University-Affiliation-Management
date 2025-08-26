const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Applications'); // Assuming you have this model

// Middleware to ensure the user is an authenticated admin
const ensureAdmin = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'admin') {
        return next();
    }
    res.redirect('/login/admin');
};

// GET Admin Dashboard
router.get('/dashboard', ensureAdmin, async (req, res) => {
    try {
        const applications = await Application.find({})
            .populate('collegeId') // Populates college details
            .populate('appraiserId'); // Populates appraiser details
        const appraisers = await User.find({ role: 'appraiser' });
        const colleges = await User.find({ role: 'college' });

        res.render('admin_dashboard', {
            applications,
            appraisers,
            colleges
        });
    } catch (error) {
        console.error('Error fetching admin dashboard data:', error);
        res.status(500).send("Server Error");
    }
});

router.get('/application/:id', ensureAdmin, async (req, res) => {
    try {
        const app = await Application.findById(req.params.id)
            .populate('collegeId')
            .populate('appraiserId');
        res.json(app);
    } catch (error) {
        console.error('Error fetching application details:', error);
        res.status(500).json({ error: 'Failed to fetch application details' });
    }
});

// POST to assign an appraiser to an application
router.post('/assign-appraiser/:appId', ensureAdmin, async (req, res) => {
    try {
        const { appId } = req.params;
        const { appraiserId } = req.body;
        await Application.findByIdAndUpdate(appId, {
            appraiserId: appraiserId,
            status: 'Assigned'
        });
        res.redirect('/admin/dashboard');
    } catch (error) {
        console.error('Error assigning appraiser:', error);
        res.redirect('/admin/dashboard');
    }
});

module.exports = router;
