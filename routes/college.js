const express = require('express');
const router = express.Router();
const User = require('../models/User');
const Application = require('../models/Applications');
const CollegeDetails = require('../models/CollegeDetails'); // <-- Import the new model
const multer = require('multer');
const path = require('path');

// Configure storage for uploaded files
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, path.join(__dirname, '../public/uploads')); // make sure "uploads" folder exists
  },
  filename: function (req, file, cb) {
    cb(null, Date.now() + '-' + file.originalname);
  }
});

// Limit to max 5 files
const upload = multer({ storage: storage }).array('supportingDocuments', 5);


// Middleware to protect routes
const isCollege = (req, res, next) => {
  if (req.session.user && req.session.user.role === 'college') {
    return next();
  }
  res.redirect('/login/college');
};

// GET College Dashboard Route
router.get('/dashboard', isCollege, async (req, res) => {
  try {
    const collegeId = req.session.user._id;
    // Fetch all data in parallel for better performance
    const [college, collegeDetails, applications] = await Promise.all([
      User.findById(collegeId),
      CollegeDetails.findOne({ collegeId: collegeId }), // <-- Find the associated college details
      Application.find({ collegeId: collegeId }).sort({ createdAt: -1 })
    ]);
    
    res.render('college-dashboard', { 
      college, 
      // Pass an empty object if no details are found yet
      collegeDetails: collegeDetails || {}, 
      applications 
    });
  } catch (error) {
    console.error("Dashboard error:", error);
    res.status(500).send("Error loading dashboard.");
  }
});


// POST Route to Update College Details (req.flash removed)
router.post('/dashboard/update-details', isCollege, async (req, res) => {
  try {
    await CollegeDetails.findOneAndUpdate(
      { collegeId: req.session.user._id },
      { $set: req.body },
      { upsert: true }
    );
    res.redirect('/college/dashboard'); // Simply redirect
  } catch (error) {
    console.error("Failed to update college details:", error);
    res.redirect('/college/dashboard'); // Redirect even on error
  }
});

// POST Route for New Application Submission
router.post('/application/submit', isCollege, (req, res) => {
  upload(req, res, async (err) => {
    if (err) {
      console.error("Upload error:", err);
      return res.redirect('/college/dashboard');
    }

    try {
      const newApplication = new Application({
        collegeId: req.session.user._id,
        courseTitle: req.body.courseTitle,
        courseDuration: req.body.courseDuration,
        intakeCapacity: req.body.intakeCapacity,
        facultyCount: req.body.facultyCount,
        infrastructureDetails: req.body.infrastructureDetails,
        courseFee: req.body.courseFee,
        affiliationType: req.body.affiliationType,
        supportingDocuments: req.files.map(file => file.path) // stores uploaded file paths
      });

      await newApplication.save();

      res.redirect('/college/dashboard');
    } catch (dbErr) {
      console.error("DB save error:", dbErr);
      res.redirect('/college/dashboard');
    }
  });
});

// Get details of a specific application (AJAX endpoint)
router.get('/application/:id', isCollege, async (req, res) => {
  try {
    const application = await Application.findOne({
      _id: req.params.id,
      collegeId: req.session.user._id
    });

    if (!application) return res.status(404).json({ error: "Application not found" });

    res.json(application);
  } catch (err) {
    console.error("Fetch application error:", err);
    res.status(500).json({ error: "Error fetching application details" });
  }
});




module.exports = router;