const { PrismaClient } = require('@prisma/client');
const multer = require('multer');

const prisma = new PrismaClient();

const requestApproval = async (req, res) => {
  const { firstName, lastName, email, phoneNumber, bio, experienceYears } = req.body;
  const documentUrl = req.cloudinaryUrl || null; // comes from middleware

  try {
    await prisma.therapistDetails.upsert({
      where: { userId: req.user.userId },
      update: {
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        experienceYears: parseInt(experienceYears),
        documentPath: documentUrl, 
      },
      create: {
        userId: req.user.userId,
        firstName,
        lastName,
        email,
        phoneNumber,
        bio,
        experienceYears: parseInt(experienceYears),
        documentPath: documentUrl, 
      },
    });

    res.json({ message: 'Approval requested', documentUrl });
  } catch (error) {
    console.error(error);
    res.status(400).json({ error: 'Invalid data or email already exists' });
  }
};


const getMyTherapiesCounts = async (req, res) => {
  const therapies = await prisma.therapy.findMany({
    where: { therapistId: req.user.userId },
    include: { bookings: true },
  });
  const counts = therapies.map(t => ({ id: t.id, count: t.bookings.length }));
  res.json(counts);
};

module.exports = {
    requestApproval, 
    getMyTherapiesCounts
}
