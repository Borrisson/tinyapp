const bcrypt = require('bcrypt');


const generateRandomString = function(database) {
  let output = "";
  do {
    output = Math.random().toString(36).substring(2, 8);
  } while (database[output])
  return output;
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
  return undefined;
};


const numberOfVisits = function(shortURL, urlDatabase) {
  for (let [shortId, properties] of Object.entries(urlDatabase)) {
    if (shortURL === shortId) {
      return properties.visits++;
    }
  }
};


module.exports = { generateRandomString, locateID, emailAuth, loggedIn, usersURL, isRegistered, getUserByEmail, numberOfVisits};