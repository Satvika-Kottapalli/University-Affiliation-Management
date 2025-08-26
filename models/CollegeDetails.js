const mongoose = require('mongoose');

const CollegeDetailsSchema = new mongoose.Schema({
  // This creates a direct link to the User document for the college
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true,
    unique: true, // Each college user can only have one details document
  },
  address: {
    type: String,
    default: '',
  },
  contactPerson: {
    type: String,
    default: '',
  },
  contactNumber: {
    type: String,
    default: '',
  },
  // You can add more college-specific fields here
  // establishmentYear: Number,
  // website: String,
}, { timestamps: true });

module.exports = mongoose.model('CollegeDetails', CollegeDetailsSchema);