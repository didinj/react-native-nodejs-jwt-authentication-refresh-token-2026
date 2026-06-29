const express = require('express');

const authMiddleware = require('../middleware/authMiddleware');

const {
  profile,
} = require('../controllers/userController');

const router = express.Router();

router.get(
  '/profile',
  authMiddleware,
  profile
);

module.exports = router;