const { PrismaClient } = require('@prisma/client');

const prisma = new PrismaClient();
// Create Therapy Function
const createTherapy = async (req, res) => {
  const { title, description, scheduledAt, type, recurrence, recurrenceDay, recurrenceRangeStart, recurrenceRangeEnd, duration, cost } = req.body;

  // Validate required fields
  if (!title || !scheduledAt || !type || !duration) {
    return res.status(400).json({ error: 'Missing required fields: title, scheduledAt, type, and duration are required' });
  }

  // Validate recurrence if provided
  if (recurrence && !['DAILY', 'WEEKLY', 'MONTHLY', 'YEARLY'].includes(recurrence)) {
    return res.status(400).json({ error: 'Invalid recurrence type' });
  }

  // Validate recurrence-specific fields
  if (recurrence) {
    // WEEKLY requires recurrenceDay
    if (recurrence === 'WEEKLY' && !recurrenceDay) {
      return res.status(400).json({ error: 'recurrenceDay is required for WEEKLY recurrence' });
    }
    if (recurrenceDay && !['MONDAY', 'TUESDAY', 'WEDNESDAY', 'THURSDAY', 'FRIDAY', 'SATURDAY', 'SUNDAY'].includes(recurrenceDay)) {
      return res.status(400).json({ error: 'Invalid recurrenceDay' });
    }

    // DAILY, MONTHLY, YEARLY require recurrenceRangeStart
    if (['DAILY', 'MONTHLY', 'YEARLY'].includes(recurrence) && !recurrenceRangeStart) {
      return res.status(400).json({ error: 'recurrenceRangeStart is required for DAILY, MONTHLY, or YEARLY recurrence' });
    }

    // Validate date formats for recurrenceRangeStart and recurrenceRangeEnd
    if (recurrenceRangeStart && isNaN(Date.parse(recurrenceRangeStart))) {
      return res.status(400).json({ error: 'Invalid recurrenceRangeStart date format' });
    }
    if (recurrenceRangeEnd && isNaN(Date.parse(recurrenceRangeEnd))) {
      return res.status(400).json({ error: 'Invalid recurrenceRangeEnd date format' });
    }

    // Ensure recurrenceRangeEnd is after recurrenceRangeStart if provided
    if (recurrenceRangeStart && recurrenceRangeEnd && new Date(recurrenceRangeEnd) <= new Date(recurrenceRangeStart)) {
      return res.status(400).json({ error: 'recurrenceRangeEnd must be after recurrenceRangeStart' });
    }
  }

  const randomMeetingId = Math.floor(
    100000000 + Math.random() * 900000000,
  );


  try {
    const therapy = await prisma.therapy.create({
      data: {
        title,
        description,
        scheduledAt: new Date(scheduledAt),
        type,
        recurrence,
        recurrenceDay,
        recurrenceRangeStart: recurrenceRangeStart ? new Date(recurrenceRangeStart) : null,
        recurrenceRangeEnd: recurrenceRangeEnd ? new Date(recurrenceRangeEnd) : null,
        duration,
        cost,
        meetingLink: `https://zoom.us/j/${randomMeetingId}`,
        therapistId: req.user.userId
      },
    });
    return res.status(201).json(therapy);
  } catch (error) {
    console.error('Error creating therapy:', error);
    return res.status(500).json({ error: 'Failed to create therapy' });
  }
};

const getTherapies = async (req, res) => {
  const therapies = await prisma.therapy.findMany({
    include: { therapist: true, bookings: true },
  });
  const formattedTherapies = therapies.map((therapy)=>{
    return {
      ...therapy, booked: therapy.bookings.find((booking)=>{
        return booking.userId === req.user.userId
      }) ? true: false
    }
  })
  res.json(formattedTherapies);
};

const getTherapy = async (req, res) => {
  const {id} = req.params;
  const therapies = await prisma.therapy.findMany({
    where: { id: parseInt(id) },
    include: { therapist: true, bookings: true },
  });
  const formattedTherapies = therapies.map((therapy)=>{
    return {
      ...therapy, booked: therapy.bookings.find((booking)=>{
        return booking.userId === req.user.userId
      }) ? true: false
    }
  })
  res.json(formattedTherapies[0]);
};

const joinTherapy = async (req, res) => {
  const { therapyId } = req.params;
  await prisma.booking.create({
    data: { userId: req.user.userId, therapyId: parseInt(therapyId) },
  });
  res.json({ message: 'Joined therapy' });
};

module.exports = {
    createTherapy, 
    getTherapies, 
    getTherapy,
    joinTherapy
}
