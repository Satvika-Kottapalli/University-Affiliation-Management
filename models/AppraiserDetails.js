const mongoose = require('mongoose');

const AppraiserDetailsSchema = new mongoose.Schema({
  // Link to the User document
  appraiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // One details doc per appraiser
  },
  contactNumber: {
    type: String,
    default: '',
  },
  department: {
    type: String,
    default: '',
  },
  designation: {
    type: String,
    default: '',
  },
  experience: {
    type: Number,
    default: 0,
  },
  bio: {
    type: String,
    default: '',
  },
}, { timestamps: true });

module.exports = mongoose.model('AppraiserDetails', AppraiserDetailsSchema);
