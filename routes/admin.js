const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Applications');
const CollegeDetails = require('../models/CollegeDetails');

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
            .populate('collegeId')
            .populate('appraiserId');
        const appraisers = await User.find({ role: 'appraiser' });
        const colleges = await User.find({ role: 'college' });

        const collegeDetails = await CollegeDetails.find({});

        // create a map { collegeId: details }
        const detailsMap = {};
        collegeDetails.forEach(d => {
            detailsMap[d.collegeId.toString()] = d;
        });

        // KPI counts
        const totalApplications = applications.length;
        const pendingReview = applications.filter(a => a.status === 'Pending').length;
        const approved = applications.filter(a => a.status === 'Approved').length;
        const rejected = applications.filter(a => a.status === 'Rejected').length;
        const verified = applications.filter(a => a.status === 'Verified').length;


        res.render('admin_dashboard', {
            applications,
            appraisers,
            colleges,
            detailsMap,
            totalApplications,
            pendingReview,
            approved,
            rejected,
            verified
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


// POST - Update application status (Approve / Reject / Resubmission)
router.post('/application/:id/status', ensureAdmin, async (req, res) => {
    try {
        const { status } = req.body; // Expected: "Approved", "Rejected", "Resubmission"
        await Application.findByIdAndUpdate(req.params.id, { status });
        res.json({ success: true, message: `Application ${status}` });
    } catch (error) {
        console.error("Error updating status:", error);
        res.status(500).json({ success: false, error: "Failed to update status" });
    }
});


module.exports = router;
