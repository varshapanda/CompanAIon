const jwt = require('jsonwebtoken');
const User = require('../models/User.js');

const authMiddleware = async (req, res, next) => {
  try {
    let token;

    if(req.cookies.accessToken){
      token = req.cookies.accessToken;
    }
    
    // Get token from header
    else if (req.headers.authorization && 
        req.headers.authorization.startsWith('Bearer')) {
      token = req.headers.authorization.split(' ')[1];
    }
    
    // Check if token exists
    if (!token) {
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
    
    try {
      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);
      const user = await User.findById(decoded.id);
      
      if (!user) {
        return res.status(401).json({
          success: false,
          message: 'User not found'
        });
      }
      // Set user in request
      req.user = await User.findById(decoded.id);
      next();
    } catch (error) {
      if (error.name === 'TokenExpiredError' && req.cookies.refreshToken) {
        return res.status(401).json({
          success: false,
          message: 'Token expired',
          tokenExpired: true
        });
      }
      return res.status(401).json({
        success: false,
        message: 'Not authorized to access this route'
      });
    }
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: 'Server error in authentication'
    });
  }
};

module.exports = authMiddleware;