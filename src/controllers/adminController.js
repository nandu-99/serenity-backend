const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();

const getTherapists = async (req, res) => {
  const therapists = await prisma.user.findMany({
    where: { role: 'THERAPIST' },
    include: { therapistDetails: true },
  });
  res.json(therapists);
};

const approveTherapist = async (req, res) => {
  const { id } = req.params;
  await prisma.user.update({ where: { id: parseInt(id) }, data: { approved: true } });
  res.json({ message: 'Therapist approved' });
};

const rejectTherapist = async (req, res) => {
  const { id } = req.params;
  await prisma.user.update({ where: { id: parseInt(id) }, data: { approved: false, rejected: true } });
  res.json({ message: 'Therapist rejected' });
};

const getUsers = async (req, res) => {
  const users = await prisma.user.findMany({ where: { role: 'USER' } });
  res.json(users);
};

const getTherapyCounts = async (req, res) => {
  const therapies = await prisma.therapy.findMany({
    include: { bookings: true },
  });
  const counts = therapies.map(t => ({ id: t.id, count: t.bookings.length }));
  res.json(counts);
};

module.exports = {
    getTherapists, 
    approveTherapist, 
    rejectTherapist, 
    getUsers, 
    getTherapyCounts
}
