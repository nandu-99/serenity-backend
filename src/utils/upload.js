const multer = require('multer');

// Use memory storage instead of disk storage
const upload = multer({ storage: multer.memoryStorage() });

module.exports = upload;
