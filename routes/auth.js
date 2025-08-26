const express = require('express');
const router = express.Router();
const User = require('../models/User');

// GET Login Page
router.get('/login/:role', (req, res) => {
  const { role } = req.params;
  const validRoles = ['admin', 'appraiser', 'college'];
  if (validRoles.includes(role)) {
    res.render('login', { role, error: null });
  } else {
    res.status(404).send('Role not found');
  }
});

// POST Login Submission
router.post('/login', async (req, res) => {
  const { email, password, role } = req.body;
  try {
    const user = await User.findOne({ email, role });
    if (!user || user.password !== password) {
      return res.render('login', { role, error: 'Invalid email or password.' });
    }
    req.session.user = { _id: user._id, email: user.email, role: user.role, name: user.name };

    if (role === 'college') {
      res.redirect('/college/dashboard');
    } else if (role === 'appraiser') {
      res.redirect('/appraiser/dashboard');   // ✅ send to appraiser dashboard
    } else if (role === 'admin') {
      res.redirect('/admin/dashboard');       // (optional: for later admin route)
    } else {
      res.redirect('/');
    }
  } catch (error) {
    console.error("Login error:", error);
    res.render('login', { role, error: 'An error occurred.' });
  }
});

router.get('/logout', (req, res, next) => {
  req.session.destroy((err) => {
    if (err) {
      return next(err);
    }
    res.redirect('/'); // Redirect to the welcome page after logout
  });
});



module.exports = router;