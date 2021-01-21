const bcrypt = require('bcrypt');


const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//checks if email exists, third optional param(is for id lookup, or for registration check)
const emailAuth = function(database, user, { lookupID = false, registration = false } = {}) {
  for (let [id, { email, password }] of Object.entries(database)) {
    if (email === user.email && bcrypt.compareSync(user.password, password) && lookupID) {
      return id;
      //for login, must match
    } else if (email === user.email && bcrypt.compareSync(user.password, password)) {
      return true;
      //for registration, if email exists don't create another
    } else if (email === user.email && registration) {
      return true;
    }
  }
  return false;
};

const locateID = function(userInfo, database) {
  return emailAuth(database, userInfo, { lookupID: true });
};

const loggedIn = function(userId) {
  return userId ? true : false;
};

const usersURL = function(user, database) {
  let output = {};
  for (let [id, {longURL, userID}] of Object.entries(database)) {
    if (user === userID) {
      output[id] = longURL;
    }
  }
  return output;
};

const getUserByEmail = function(email, database) {

};

module.exports = { generateRandomString, locateID, emailAuth, loggedIn, usersURL };