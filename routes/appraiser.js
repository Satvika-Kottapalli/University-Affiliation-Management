const express = require('express');
const router = express.Router();
const User = require('../models/User'); // Main user model
const Application = require('../models/Applications'); // Application model
const AppraiserDetails = require('../models/AppraiserDetails'); // Appraiser-specific details model

// Middleware to ensure the user is an authenticated appraiser
const ensureAppraiser = (req, res, next) => {
    if (req.session.user && req.session.user.role === 'appraiser') {
        return next();
    }
    res.redirect('/login/appraiser');
};


const multer = require('multer');
const storage = multer.diskStorage({
    destination: (req, file, cb) => cb(null, 'public/uploads/verification'),
    filename: (req, file, cb) => cb(null, Date.now() + '-' + file.originalname)
});
const upload = multer({ storage });


// GET Appraiser Dashboard
router.get('/dashboard', ensureAppraiser, async (req, res) => {
    try {
        const appraiser = await User.findById(req.session.user._id);
        const details = await AppraiserDetails.findOne({ appraiserId: appraiser._id });
        const applications = await Application.find({ appraiserId: appraiser._id }).populate('collegeId');

        res.render('appraiser-dashboard', {
            appraiser,
            details: details || {}, // Pass an empty object if no details exist
            applications,
            totalAssignments: applications.length,
            pendingReview: applications.filter(app => app.status === 'Assigned').length,
            verified: applications.filter(app => app.status === 'Verified').length,
            rejected: applications.filter(app => app.status === 'Rejected').length,
        });
    } catch (error) {
        console.error('Error fetching appraiser dashboard data:', error);
        res.status(500).send("Server Error");
    }
});

// GET the review page for a specific application
router.get('/review/:appId', ensureAppraiser, async (req, res) => {
    try {
        const application = await Application.findById(req.params.appId).populate('collegeId');
        const appraiser = await User.findById(req.session.user._id);

        // Ensure the appraiser is assigned to this application
        if (!application || application.appraiserId.toString() !== appraiser._id.toString()) {
            return res.redirect('/appraiser/dashboard');
        }

        res.render('review_application', {
            application,
            appraiser
        });
    } catch (error) {
        console.error('Error fetching application for review:', error);
        res.redirect('/appraiser/dashboard');
    }
});

// POST to update the appraiser's profile
router.post('/update-profile', ensureAppraiser, async (req, res) => {
    try {
        const { name, email, contactNumber, department, designation, experience, bio, newPassword } = req.body;
        const appraiserId = req.session.user._id;

        // Update the base User model info
        const userUpdate = { name, email };
        if (newPassword) {
            // In a real application, you MUST hash the password before saving it.
            // Example: userUpdate.password = await bcrypt.hash(newPassword, 10);
            userUpdate.password = newPassword;
        }
        await User.findByIdAndUpdate(appraiserId, userUpdate);

        // Find and update (or create) the appraiser-specific details
        await AppraiserDetails.findOneAndUpdate(
            { appraiserId: appraiserId },
            { contactNumber, department, designation, experience, bio },
            { upsert: true, new: true } // upsert:true creates the document if it doesn't exist
        );

        // Refresh session data after update
        req.session.user = await User.findById(appraiserId);

        res.redirect('/appraiser/dashboard');
    } catch (error) {
        console.error('Error updating profile:', error);
        res.redirect('/appraiser/dashboard');
    }
});

// POST to submit the verification form for an application
router.post('/submit-verification/:appId', ensureAppraiser, upload.array('supportingDocuments', 5), async (req, res) => {
    try {
        const { siteVisitDate, recommendation, verificationNotes } = req.body;
        const { appId } = req.params;

        // Collect file paths
        const uploadedFiles = req.files ? req.files.map(f => '/uploads/verification/' + f.filename) : [];

        const updateData = {
            status: 'Verified',
            'verification.siteVisitDate': siteVisitDate,
            'verification.recommendation': recommendation,
            'verification.notes': verificationNotes,
            'verification.verifiedBy': req.session.user._id,
            $push: { 'verification.supportingDocuments': { $each: uploadedFiles } }
        };

        await Application.findByIdAndUpdate(appId, updateData, { new: true });
        res.redirect('/appraiser/dashboard');

    } catch (error) {
        console.error('Error submitting verification:', error);
        res.redirect(`/appraiser/review/${req.params.appId}`);
    }
});


module.exports = router;
