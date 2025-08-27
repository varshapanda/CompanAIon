const mongoose = require('mongoose');

const CareerProfileSchema = new mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  education: {
    type: String,
    required: true
  },
  interests: {
    type: [String],
    required: true
  },
  goals: {
    type: String,
    required: true
  },
  skills: [{
    name: String,
    proficiency: {
      type: String,
      enum: ['Beginner', 'Intermediate', 'Advanced'],
      default: 'Beginner'
    }
  }],
  recommendations: {
    career_paths: [{
      title: String,
      description: String,
      isSaved: {
        type: Boolean,
        default: false
      }
    }],
    skills_to_learn: [{
      skill: String,
      importance: String,
      isSaved: {
        type: Boolean,
        default: false
      }
    }],
    recommended_courses: [{
      title: String,
      platform: String,
      url: String,
      isSaved: {
        type: Boolean,
        default: false
      }
    }],
    job_roles: [{
      role: String,
      companies: [String],
      isSaved: {
        type: Boolean,
        default: false
      }
    }]
  },
  createdAt: {
    type: Date,
    default: Date.now
  },
  updatedAt: {
    type: Date,
    default: Date.now
  }
});

CareerProfileSchema.pre('save', function(next) {
  this.updatedAt = Date.now();
  next();
});

module.exports = mongoose.model('CareerProfile', CareerProfileSchema);