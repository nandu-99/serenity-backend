const express = require('express');
const therapistController = require('../controllers/therapistController');
const authMiddleware = require('../middlewares/authMiddleware');
const roleMiddleware = require('../middlewares/roleMiddleware');
const multer = require('multer');
const sharp = require('sharp');
const cloudinary = require('../config/cloudinary');

const upload = multer({ storage: multer.memoryStorage() });
const router = express.Router();

router.use(authMiddleware);
router.use(roleMiddleware('THERAPIST'));

router.post('/request-approval', upload.single('document'), async (req, res, next) => {
  try {
    let buffer = req.file.buffer;

    // Compress image if it's an image file
    if (req.file.mimetype.startsWith('image/')) {
      buffer = await sharp(req.file.buffer)
        .jpeg({ quality: 70 })
        .toBuffer();
    }

    // Upload directly from buffer to Cloudinary
    const result = await new Promise((resolve, reject) => {
      const stream = cloudinary.uploader.upload_stream(
        { folder: 'therapist_docs' },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      stream.end(buffer);
    });

    req.cloudinaryUrl = result.secure_url;
    return therapistController.requestApproval(req, res, next);
  } catch (err) {
    next(err);
  }
});

router.get('/my-therapies/counts', therapistController.getMyTherapiesCounts);

module.exports = router;
