
const express = require('express');
const therapyController = require('../controllers/therapyController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');

const router = express.Router();

router.use(authMiddleware);

router.post('/', roleMiddleware('THERAPIST'), therapyController.createTherapy);

router.get('/:id', therapyController.getTherapy);
router.get('/', therapyController.getTherapies);


router.post('/:therapyId/join', roleMiddleware(['USER', 'ADMIN', 'THERAPIST']), therapyController.joinTherapy);

module.exports = router;
