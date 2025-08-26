const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Applications');
const AppraiserDetails = require('../models/AppraiserDetails');

// Middleware to ensure the user is an authenticated appraiser
const ensureAppraiser = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'appraiser') {
    return next();
  }
  res.redirect('/login/appraiser');
};

// GET Appraiser Dashboard
router.get('/dashboard', ensureAppraiser, async (req, res) => {
  try {
    const appraiser = await User.findById(req.session.user._id);
    const details = await AppraiserDetails.findOne({ appraiserId: appraiser._id });

    const applications = await Application.find({ appraiserId: appraiser._id })
      .populate('collegeId');

    res.render('appraiser-dashboard', {
      appraiser,
      details,
      applications,
      totalAssignments: applications.length,
      pendingReview: applications.filter(app => app.status === 'Assigned').length,
      approved: applications.filter(app => app.status === 'Approved').length,
      rejected: applications.filter(app => app.status === 'Rejected').length,
    });
  } catch (error) {
    console.error('Error fetching appraiser dashboard data:', error);
    res.status(500).send("Server Error");
  }
});

// POST update profile
router.post('/update-profile', ensureAppraiser, async (req, res) => {
  try {
    const { name, email, contactNumber, department, designation, experience, bio, newPassword } = req.body;
    const appraiserId = req.session.user._id;

    // Update base User info
    const userUpdate = { name, email };
    if (newPassword) {
      userUpdate.password = newPassword; // ⚠️ Hash with bcrypt in production
    }
    await User.findByIdAndUpdate(appraiserId, userUpdate);

    // Update or create AppraiserDetails
    await AppraiserDetails.findOneAndUpdate(
      { appraiserId },
      { contactNumber, department, designation, experience, bio },
      { upsert: true }
    );

    // Refresh session user
    req.session.user = await User.findById(appraiserId);

    res.redirect('/appraiser/dashboard');
  } catch (error) {
    console.error('Error updating profile:', error);
    res.redirect('/appraiser/dashboard');
  }
});

module.exports = router;
