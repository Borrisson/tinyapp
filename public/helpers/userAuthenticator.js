const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//checks if email exists, second optional param(is for id lookup)
const emailAuth = function(users, body, { lookupID = false, registration = false } = {}) {
  for (let [id, { email, password }] of Object.entries(users)) {
    if (email === body.email && password === body.password && lookupID) {
      return id;
      //for login, must match
    } else if (email === body.email && password === body.password) {
      return true;
      //for registration, if email exists don't create another
    } else if (email === body.email && registration) {
      return true;
    }
  }
  return false;
};

const locateID = function(users, body) {
  return emailAuth(users, body, { lookupID: true });
};

module.exports = { generateRandomString, locateID, emailAuth };