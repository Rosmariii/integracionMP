const fs = require('fs');
const path = require('path');
const usersFile = path.join(__dirname, 'users.json');

function readUsers() {
  if (!fs.existsSync(usersFile)) return [];
  const data = fs.readFileSync(usersFile, 'utf8');
  try {
    return JSON.parse(data);
  } catch {
    return [];
  }
}

function writeUsers(users) {
  fs.writeFileSync(usersFile, JSON.stringify(users, null, 2), 'utf8');
}

const bcrypt = require('bcryptjs');

function addUser(user) {
  const users = readUsers();
  users.push(user);
  writeUsers(users);
}

function findUserByEmail(email) {
  const users = readUsers();
  return users.find(u => u.email === email);
}

function findUserByUsername(username) {
  const users = readUsers();
  return users.find(u => u.username === username);
}

function verifyPassword(user, password) {
  if (!user || !user.password) return false;
  return bcrypt.compareSync(password, user.password);
}

function hashPassword(password) {
  return bcrypt.hashSync(password, 10);
}

module.exports = { addUser, findUserByEmail, findUserByUsername, verifyPassword, hashPassword };
