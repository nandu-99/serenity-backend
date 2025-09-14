const express = require('express');
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');
const fs = require('fs');

const upload = multer({ dest: 'uploads/' });
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('THERAPIST'));

router.post('/request-approval', upload.single('document'), async (req, res, next) => {
  try {
    const filePath = req.file.path;

    let compressedPath = filePath;
    if (req.file.mimetype.startsWith('image/')) {
      compressedPath = `uploads/compressed-${Date.now()}.jpg`;
      await sharp(filePath)
        .jpeg({ quality: 70 }) 
        .toFile(compressedPath);
    }

    const result = await cloudinary.uploader.upload(compressedPath, {
      folder: 'therapist_docs',
    });

    fs.unlinkSync(filePath);
    if (compressedPath !== filePath) fs.unlinkSync(compressedPath);

    req.cloudinaryUrl = result.secure_url;
    return therapistController.requestApproval(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/my-therapies/counts', therapistController.getMyTherapiesCounts);

module.exports = router;
