const express = require('express');
const adminController = require('../controllers/adminController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('ADMIN'));

router.get('/therapists', adminController.getTherapists);
router.put('/therapists/:id/approve', adminController.approveTherapist);
router.put('/therapists/:id/reject', adminController.rejectTherapist);
router.get('/users', adminController.getUsers);
router.get('/therapies/counts', adminController.getTherapyCounts);

module.exports = router;
