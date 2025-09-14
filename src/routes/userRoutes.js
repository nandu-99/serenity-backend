const express = require('express');
const userController = require('../controllers/userController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware(['USER', 'THERAPIST', 'ADMIN']));


router.get('/profile', userController.getProfile);
router.get('/', userController.getUserData);

module.exports = router;
