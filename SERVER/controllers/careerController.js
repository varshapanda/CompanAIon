const { generateCareerRecommendation } = require('../services/geminiService.js');
const CareerProfile = require('../models/CareerProfile.js');

const getCareerRecommendations = async (req, res) => {
  try {
    const { education, interests, goals } = req.body;
    
    if (!education || !interests || !goals) {
      return res.status(400).json({
        success: false,
        message: "Education, interests, and goals are required"
      });
    }
    
    const recommendations = await generateCareerRecommendation({
      education,
      interests: Array.isArray(interests) ? interests : [interests],
      goals
    });
    
    const careerProfile = new CareerProfile({
      user: req.user.id,
      education,
      interests: Array.isArray(interests) ? interests : [interests],
      goals,
      recommendations
    });
    
    await careerProfile.save();
    
    res.status(200).json({
      success: true,
      data: recommendations,
      profileId: careerProfile._id
    });
  } catch (error) {
    console.error("Error in getCareerRecommendations:", error);
    res.status(500).json({
      success: false,
      message: "Failed to generate career recommendations"
    });
  }
};

// Get all career profiles for a user
const getCareerProfiles = async (req, res) => {
  try {
    const profiles = await CareerProfile.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .select('-recommendations');
    
    res.status(200).json({
      success: true,
      data: profiles
    });
  } catch (error) {
    console.error("Error in getCareerProfiles:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career profiles"
    });
  }
};

// Get a specific career profile
const getCareerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CareerProfile.findOne({ 
      _id: id, 
      user: req.user.id 
    });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Career profile not found"
      });
    }
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error("Error in getCareerProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to fetch career profile"
    });
  }
};

// Update a career profile (e.g., mark items as saved)
const updateCareerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    const { updates } = req.body;
    
    const profile = await CareerProfile.findOne({ 
      _id: id, 
      user: req.user.id 
    });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Career profile not found"
      });
    }
    
    // Apply updates
    if (updates.recommendations) {
      if (updates.recommendations.career_paths) {
        updates.recommendations.career_paths.forEach(updatedPath => {
          const path = profile.recommendations.career_paths.id(updatedPath._id);
          if (path) {
            path.set(updatedPath);
          }
        });
      }
      
      if (updates.recommendations.skills_to_learn) {
        updates.recommendations.skills_to_learn.forEach(updatedSkill => {
          const skill = profile.recommendations.skills_to_learn.id(updatedSkill._id);
          if (skill) {
            skill.set(updatedSkill);
          }
        });
      }
      
      if (updates.recommendations.recommended_courses) {
        updates.recommendations.recommended_courses.forEach(updatedCourse => {
          const course = profile.recommendations.recommended_courses.id(updatedCourse._id);
          if (course) {
            course.set(updatedCourse);
          }
        });
      }
      
      if (updates.recommendations.job_roles) {
        updates.recommendations.job_roles.forEach(updatedJob => {
          const job = profile.recommendations.job_roles.id(updatedJob._id);
          if (job) {
            job.set(updatedJob);
          }
        });
      }
    }
    
    await profile.save();
    
    res.status(200).json({
      success: true,
      data: profile
    });
  } catch (error) {
    console.error("Error in updateCareerProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to update career profile"
    });
  }
};

// Delete a career profile
const deleteCareerProfile = async (req, res) => {
  try {
    const { id } = req.params;
    
    const profile = await CareerProfile.findOne({ 
      _id: id, 
      user: req.user.id 
    });
    
    if (!profile) {
      return res.status(404).json({
        success: false,
        message: "Career profile not found"
      });
    }
    
    await CareerProfile.deleteOne({ _id: id });
    
    res.status(200).json({
      success: true,
      message: "Career profile deleted successfully"
    });
  } catch (error) {
    console.error("Error in deleteCareerProfile:", error);
    res.status(500).json({
      success: false,
      message: "Failed to delete career profile"
    });
  }
};

module.exports = {
  getCareerRecommendations,
  getCareerProfiles,
  getCareerProfile,
  updateCareerProfile,
  deleteCareerProfile
};