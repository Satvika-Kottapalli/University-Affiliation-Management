const mongoose = require('mongoose');

const ApplicationSchema = new mongoose.Schema({
  collegeId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User', required: true
  },
  courseTitle: {
    type: String,
    enum: ['ECE', 'CSE', 'MECH', 'IT', 'AIDS', 'AIML', 'EEE', 'CSBS'], required: true
  },
  courseDuration: {
    type: String,
    enum: ['1 Year', '2 Years', '3 Years', '4 Years'], required: true
  },
  intakeCapacity: {
    type: Number,
    required: true
  },
  facultyCount: {
    type: Number,
    required: true
  },
  infrastructureDetails: {
    type: String,
    required: true
  },
  courseFee: {
    type: Number,
    required: true
  },
  affiliationType: {
    type: String,
    enum: ['New', 'Renewal'], required: true
  },
  supportingDocuments: [{ type: String }],
  status: {
    type: String,
    enum: ['Pending', 'Approved', 'Rejected', 'Assigned', 'Resubmitted'], default: 'Pending'
  },
  appraisalStatus: {
    type: String,
    default: 'Not Verified'
  },
  appraiserId: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User'
  },
  verification: {
    siteVisitDate: Date,
    recommendation: String,
    notes: String,
    priority: String,
    supportingDocuments: [String],
    verifiedBy: { type: mongoose.Schema.Types.ObjectId, ref: 'User' }
}

}, { timestamps: true });

module.exports = mongoose.model('Application', ApplicationSchema);
