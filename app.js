require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const path = require('path');
const session = require('express-session');
const bodyParser = require('body-parser');

// Import routes
const authRoutes = require('./routes/auth');
const collegeRoutes = require('./routes/college');
const appraiserRoutes = require('./routes/appraiser');
const adminRoutes = require('./routes/admin'); 

const app = express();
const PORT = process.env.PORT || 3000;

// MongoDB Connection
mongoose.connect(process.env.MONGO_URI, {})
  .then(() => console.log('MongoDB Connected'))
  .catch(err => console.error('Mongo Error:', err));

// Middleware
app.set('view engine', 'ejs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static(path.join(__dirname, 'public')));
app.use(bodyParser.urlencoded({ extended: true }));

// Session middleware is still needed for login
app.use(session({
  secret: 'affiliationSecretKey',
  resave: false,
  saveUninitialized: true,
  cookie: { secure: false }
}));

// --- Use Routes ---
app.use('/', authRoutes);
app.use('/college', collegeRoutes);
app.use('/appraiser', appraiserRoutes); 
app.use('/admin', adminRoutes);


// Welcome Page Route
app.get('/', (req, res) => {
  res.render('welcome');
});

// Server Start
app.listen(PORT, () => {
  console.log(`Server is running on http://localhost:${PORT}`);
});