const jwt = require('jsonwebtoken');

const User = require('../models/User');
const RefreshToken = require('../models/RefreshToken');

const {
  generateAccessToken,
  generateRefreshToken
} = require('../services/tokenService');

exports.register = async (req, res) => {
  try {
    const { name, email, password } = req.body;

    const existingUser = await User.findOne({ email });

    if (existingUser) {
      return res.status(409).json({
        success: false,
        message: 'Email already exists'
      });
    }

    const user = await User.create({
      name,
      email,
      password
    });

    res.status(201).json({
      success: true,
      message: 'User registered successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email });

    if (
      !user ||
      !(await user.comparePassword(password))
    ) {
      return res.status(401).json({
        success: false,
        message: 'Invalid email or password'
      });
    }

    const accessToken = generateAccessToken(user);

    const refreshToken = generateRefreshToken(user);

    const decoded = jwt.decode(refreshToken);

    await RefreshToken.create({
      user: user._id,
      token: refreshToken,
      expiresAt: new Date(decoded.exp * 1000)
    });

    res.json({
      success: true,
      accessToken,
      refreshToken,
      user: {
        id: user._id,
        name: user.name,
        email: user.email
      }
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.refresh = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    if (!refreshToken) {
      return res.status(401).json({
        success: false,
        message: 'Refresh token required'
      });
    }

    const storedToken =
      await RefreshToken.findOne({
        token: refreshToken,
        revoked: false
      });

    if (!storedToken) {
      return res.status(401).json({
        success: false,
        message: 'Invalid refresh token'
      });
    }

    const payload = jwt.verify(
      refreshToken,
      process.env.JWT_REFRESH_SECRET
    );

    const user = await User.findById(payload.userId);

    const newAccessToken =
      generateAccessToken(user);

    res.json({
      success: true,
      accessToken: newAccessToken
    });
  } catch (error) {
    res.status(401).json({
      success: false,
      message: 'Refresh token expired'
    });
  }
};

exports.logout = async (req, res) => {
  try {
    const { refreshToken } = req.body;

    await RefreshToken.findOneAndUpdate(
      {
        token: refreshToken
      },
      {
        revoked: true
      }
    );

    res.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};

exports.me = async (req, res) => {
  try {
    const user = await User.findById(
      req.user.userId
    ).select('-password');

    res.json({
      success: true,
      user
    });
  } catch (error) {
    res.status(500).json({
      success: false,
      message: error.message
    });
  }
};