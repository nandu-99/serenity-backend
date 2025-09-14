const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getProfile = async (req, res) => {
  const user = await prisma.user.findUnique({ where: { id: req.user.userId } });
  res.json(user);
};

const getUserData = async (req, res) => {
  const { role, userId } = req.user;
  const userData = await prisma.user.findUnique({
    where: { id: parseInt(userId), role: 'THERAPIST' },
    include: { therapistDetails: true },
  })

  try {
    if (role === 'ADMIN') {
      const therapists = await prisma.user.findMany({
        where: { role: 'THERAPIST' },
        include: { therapistDetails: true },
      });
      const users = await prisma.user.findMany({
        where: { role: 'USER' },
      });
      const therapies = await prisma.therapy.findMany({
        include: { bookings: true },
      });
      return res.json({ therapists, users, therapies });
    }

    if (role === 'THERAPIST') {

      if (!userData.approved) {
        if(userData.firstName) {
          return res.json({ approved: false, submitted: true });
        }
        return res.json({ approved: false, submitted: false });
      }
      const therapies = await prisma.therapy.findMany({
        where: { therapistId: userId },
        include: { bookings: true },
      });
      return res.json({ therapies });
    }

    if (role === 'USER') {
      const bookings = await prisma.booking.findMany({
        where: { userId },
        include: { therapy: true },
      });
      const therapies = bookings.map(booking => booking.therapy);
      return res.json({ therapies });
    }

    return res.status(403).json({ error: 'Invalid role' });
  } catch (error) {
    return res.status(500).json({ error: 'Internal server error' });
  }
};

module.exports = {
    getProfile, 
    getUserData
}
