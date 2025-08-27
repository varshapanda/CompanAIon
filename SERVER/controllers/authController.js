const jwt = require("jsonwebtoken");
const User = require('../models/User.js');

const isProduction = process.env.NODE_ENV === "production" || false;

const validatePassword = (password) => {
  if (!password || password.length < 6) {
    return false;
  }
  const hasLetter = /[A-Za-z]/.test(password);
  const hasNumber = /\d/.test(password);
  const hasSpecialChar = /[^A-Za-z0-9]/.test(password);

  return hasLetter && hasNumber && hasSpecialChar;
};

const generateTokens = (userId) => {
  const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, {
    expiresIn: "15m",
  });

  const refreshToken = jwt.sign(
    { id: userId },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: "7d" }
  );
  return { token, refreshToken };
};

const register = async (req, res) => {
  try {
    const { name, email, password } = req.body;
    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        message: "User already exists",
      });
    }
    if (!validatePassword(password)) {
      return res.status(400).json({
        success: false,
        message:
          "Password must be at least 6 characters and include a letter, number, and special character",
      });
    }
    const newUser = new User({
      name,
      email,
      password,
    });

    const { token, refreshToken } = generateTokens(newUser._id);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);

    newUser.refreshToken = refreshToken;
    newUser.refreshTokenExpiry = refreshExpiry;
    await newUser.save();

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });

    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });

    res.status(201).json({
      success: true,
      expiresIn: 15 * 60,
      user: {
        id: newUser._id,
        name: newUser.name,
        email: newUser.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during registration",
    });
  }
};

const login = async (req, res) => {
  try {
    const { email, password, rememberMe } = req.body;
    if (!email || !password) {
      return res.status(400).json({
        success: false,
        message: "Please provide email and password",
      });
    }

    const user = await User.findOne({ email }).select("+password");

    if (!user) {
      return res.status(401).json({
        success: false,
        message: "Invalid credentials",
      });
    }
    const isPasswordCorrect = await user.matchPassword(password);
    if (!isPasswordCorrect) {
      return res.status(401).json({
        success: false,
        message: "Invalid Password",
      });
    }

    const { token, refreshToken } = generateTokens(user._id);
    const refreshExpiry = new Date(Date.now() + 7 * 24 * 60 * 60 * 1000);
    user.refreshToken = refreshToken;
    user.refreshTokenExpiry = refreshExpiry;
    await user.save();

    const accessTokenExpiry = rememberMe ? 15 * 60 * 1000 : undefined; // 15 minutes if remember me
    const refreshTokenExpiry = rememberMe ? 7 * 24 * 60 * 60 * 1000 : undefined; // 7 days if remember me

    res.cookie("accessToken", token, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: accessTokenExpiry,
    });
    res.cookie("refreshToken", refreshToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: refreshTokenExpiry,
    });

    res.status(200).json({
      success: true,
      expiresIn: 15 * 60,
      user: {
        id: user._id,
        name: user.name,
        email: user.email,
      },
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during login",
    });
  }
};
const verifyAuth = async (req, res) => {
  try {
    if (req.user) {
      return res.status(200).json({
        success: true,
        message: "User is authenticated",
      });
    }
    return res.status(401).json({
      success: false,
      message: "User is not authenticated",
    });
  } catch (error) {
    console.error(error);
    res.status(500).json({
      success: false,
      message: "Server error during authentication verification",
    });
  }
};

const refreshAccessToken = async (req, res) => {
  try {
    let refreshToken = req.cookies.refreshToken;
    if (
      !refreshToken &&
      req.headers.authorization &&
      req.headers.authorization.startsWith("Bearer")
    ) {
      refreshToken = req.headers.authorization.split(" ")[1];
    }
    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: "No refresh Token provided",
      });
    }
    const decoded = jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET);
    const user = await User.findById(decoded.id).select(
      "+refreshToken +refreshTokenExpiry"
    );

    if (
      !user ||
      user.refreshToken !== refreshToken ||
      user.refreshTokenExpiry < new Date()
    ) {
      return res.status(401).json({
        success: false,
        message: "Invalid refresh token",
      });
    }
    const newToken = jwt.sign({ id: user._id }, process.env.JWT_SECRET, {
      expiresIn: "15m",
    });

    res.cookie("accessToken", newToken, {
      httpOnly: true,
      secure: isProduction,
      sameSite: "Strict",
      maxAge: 15 * 60 * 1000,
    });
    res.status(200).json({
      success: true,
      expiresIn: 15 * 60,
    });
  } catch (error) {
    console.error(error);
    return res
      .status(401)
      .json({ success: false, message: "Invalid refresh Token" });
  }
};

const logout = async (req, res) => {
  try {
    if (req.user) {
      const user = await User.findById(req.user.id);
      if (user) {
        user.refreshToken = undefined;
        user.refreshTokenExpiry = undefined;
        await user.save();
      }
    }
    res.clearCookie("accessToken");
    res.clearCookie("refreshToken");

    res.status(200).json({
      success: true,
      message: "User logged out successfully",
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: "Server error during logout",
    });
  }
};
module.exports = { register, login, logout, refreshAccessToken, verifyAuth };
