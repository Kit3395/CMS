const bcrypt = require('bcryptjs');

const seedUsers = [
  { id: 1, email: 'su@cms.local', password: 'su123456', role: 'SU', name: 'Super User' },
  { id: 2, email: 'admin@cms.local', password: 'admin123456', role: 'ADMIN', name: 'Admin User' },
  { id: 3, email: 'resident@cms.local', password: 'resident123456', role: 'RESIDENT', name: 'Resident User' }
];

let users = [];

function initUsers() {
  users = seedUsers.map((u) => ({
    ...u,
    passwordHash: bcrypt.hashSync(u.password, 12),
    password: undefined
  }));
}

function findByEmail(email) {
  return users.find((u) => u.email === email);
}

function findById(id) {
  return users.find((u) => u.id === id);
}

initUsers();

module.exports = {
  findByEmail,
  findById,
  initUsers
};
