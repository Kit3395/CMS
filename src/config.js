module.exports = {
  jwtSecret: process.env.JWT_SECRET || 'change-this-in-production',
  jwtExpiresIn: '2h'
};
