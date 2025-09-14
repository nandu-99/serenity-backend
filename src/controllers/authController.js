const { PrismaClient } = require('@prisma/client');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');

const prisma = new PrismaClient();

const signup = async (req, res) => {
  const { email, password, role, fullName } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const user = await prisma.user.create({
      data: { fullName, email, password: hashedPassword, role: role.toUpperCase() },
    });
    const token = jwt.sign(
        { userId: user.id, role: user.role },
        process.env.JWT_SECRET || 'secret',
      );

    res.status(201).json({ message: 'User created', userId: user.id, token, fullName, role  });
  } catch (error) {
    res.status(400).json({ error: 'User already exists or invalid data' });
  }
};

const login = async (req, res) => {
  const { email, password } = req.body;
  const user = await prisma.user.findUnique({ where: { email } });
  if (!user || !(await bcrypt.compare(password, user.password))) {
    return res.status(401).json({ error: 'Invalid credentials' });
  }
  const token = jwt.sign({ userId: user.id, role: user.role }, process.env.JWT_SECRET || 'secret');
  res.json({ token, fullName: user.fullName, role: user.role });
};

module.exports = {
    signup, login
}
