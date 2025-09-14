const express = require('express');
const dotenv = require('dotenv');
const authRoutes = require('./routes/authRoutes');
const adminRoutes = require('./routes/adminRoutes');
const therapistRoutes = require('./routes/therapistRoutes');
const userRoutes = require('./routes/userRoutes');
const therapyRoutes = require('./routes/therapyRoutes');
const cors = require('cors')
const path = require("path");

dotenv.config();

const app = express();
app.use(express.json());
app.use(cors())
// Routes
app.use('/auth', authRoutes);
app.use('/admin', adminRoutes);
app.use('/therapist', therapistRoutes);
app.use('/user', userRoutes);
app.use('/therapy', therapyRoutes);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
});
