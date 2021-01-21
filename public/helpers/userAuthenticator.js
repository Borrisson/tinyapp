const bcrypt = require('bcrypt');


const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

const emailAuth = function(user, database) {
  for (let { email, password } of Object.values(database)) {
    if (email === user.email && bcrypt.compareSync(user.password, password)) {
      return true;
    }
  }
  return false;
};

const locateID = function({ email }, database) {
  return getUserByEmail(email, database);
};

const isRegistered = function({ email }, database) {
  return getUserByEmail(email, database) ? true : false;
};

const loggedIn = function(userId) {
  return userId ? true : false;
};

const usersURL = function(user, database) {
  let output = {};
  for (let [id, { longURL, userID }] of Object.entries(database)) {
    if (user === userID) {
      output[id] = longURL;
    }
  }
  return output;
};

const getUserByEmail = function(srchEmail, database) {
  for (let { id, email } of Object.values(database)) {
    if (email === srchEmail) {
      return id;
    }
  }
};

module.exports = { generateRandomString, locateID, emailAuth, loggedIn, usersURL, isRegistered };