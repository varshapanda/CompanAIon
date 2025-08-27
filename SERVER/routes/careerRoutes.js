const express = require('express');
const { getCareerRecommendations, getCareerProfiles, getCareerProfile, updateCareerProfile, deleteCareerProfile } = require('../controllers/careerController');
const authMiddleware = require('../middleware/authMiddleware');

const router = express.Router();

router.post('/recommendations', authMiddleware, getCareerRecommendations);
router.get('/profiles', authMiddleware, getCareerProfiles);
router.get('/profiles/:id', authMiddleware, getCareerProfile);
router.put('/profiles/:id', authMiddleware, updateCareerProfile);
router.delete('/profiles/:id', authMiddleware, deleteCareerProfile);

module.exports = router;