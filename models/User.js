/* const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
  },
  email: {
    type: String,
    required: true,
    unique: true,
    trim: true,
    lowercase: true,
  },
  password: {
    type: String,
    required: true,
  },
  role: {
    type: String,
    required: true,
    enum: ['admin', 'appraiser', 'college'], // Role must be one of these values
  },
}, {
  timestamps: true // Automatically adds createdAt and updatedAt fields
});

module.exports = mongoose.model('User', userSchema); */


const mongoose = require('mongoose');

const userSchema = new mongoose.Schema({
  name: {
    type: String,

    required: true
  },
  email: {
    type: String, required:
      true, unique: true,
    lowercase: true, trim: true
  },
  password: {
    type: String,
    required: true
  },
  role: {
    type: String,
    enum: ['admin', 'appraiser', 'college'], required: true
  }
}, { timestamps: true });

module.exports = mongoose.model('User', userSchema);
