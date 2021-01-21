const bcrypt = require('bcrypt');
const { assert } = require('chai');

const { locateID, emailAuth, loggedIn, usersURL, isRegistered, getUserByEmail } = require('../public/helpers/userAuthenticator');

const hashedPassword = bcrypt.hashSync("purple-monkey-dinosaur", 10);

const testUsers = {
  "userRandomID": {
    id: "userRandomID",
    email: "user@example.com",
    password: hashedPassword
  },
  "user2RandomID": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};

const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "userRandomID" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "userRandomID" }
};

describe('getUserByEmail', function () {
  it('should return a user with valid email', function () {
    const user = getUserByEmail("user@example.com", testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with non existing email', function () {
    const user = getUserByEmail("user3@example.com", testUsers)
    assert.isUndefined(user);
  });
});

describe('locateID', function () {
  it('should return a user with valid email inside object', function () {
    const user = locateID({ email: "user@example.com" }, testUsers)
    const expectedOutput = "userRandomID";
    assert.equal(user, expectedOutput);
  });
  it('should return undefined with non existing email inside an object', function () {
    const user = locateID({ email: "user3@example.com" }, testUsers)
    assert.isUndefined(user);
  });
});

describe('isRegistered', function () {
  it('should return true with valid email inside of an object', function () {
    const user = isRegistered({ email: "user@example.com" }, testUsers);
    assert.isTrue(user);
  });
  it('should return false with non existing email inside of an object', function () {
    const user = isRegistered("user3@example.com", testUsers);
    assert.isFalse(user);
  });
});

describe('isRegistered', function () {
  it('should return true with valid email inside of an object', function () {
    const user = isRegistered({ email: "user@example.com" }, testUsers);
    assert.isTrue(user);
  });
  it('should return false with non existing email inside of an object', function () {
    const user = isRegistered("user3@example.com", testUsers);
    assert.isFalse(user);
  });
});

describe('loggedIn', function () {
  it('should return true with ID', function () {
    const user = loggedIn("randomalueri9ujfn");
    assert.isTrue(user);
  });
  it('should return false for no provided ID', function () {
    const user = loggedIn("");
    assert.isFalse(user);
  });
  it('should return false for undefined', function () {
    const user = loggedIn(undefined);
    assert.isFalse(user);
  });
});

describe('usersURL', function () {
  it('should return object with all shortURL : longURL pairs provided with user and database', function () {
    const userURL = usersURL("userRandomID", urlDatabase);
    const result =
    {
      b2xVn2: "http://www.lighthouselabs.ca",
      "9sm5xK": "http://www.google.com"
    }
    assert.deepEqual(userURL, result);
  });
  it('should return an empty object if user does not exist', function () {
    const userURL = usersURL("doesNotExistUser", urlDatabase);
    assert.deepEqual(userURL, {});
  });
  it('should return an empty object if user exists, but does not have any links', function () {
    const userURL = usersURL("user2RandomID", urlDatabase);
    assert.deepEqual(userURL, {});
  });
});

describe('emailAuth', function () {
  it('should return true if password and email are correct', function () {
    const user = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey-dinosaur"
    };
    const result = emailAuth(user, testUsers);
    assert.isTrue(result);
  });
  it('should return false if password is not correct', function () {
    const user = {
      id: "userRandomID",
      email: "user@example.com",
      password: "purple-monkey"
    };
    const result = emailAuth(user, testUsers);
    assert.isFalse(result);
  });
  it('should return false if email is not correct', function () {
    const user = {
      id: "userRandomID",
      email: "user@example222.com",
      password: "purple-monkey-dinosaur"
    };
    const result = emailAuth(user, testUsers);
    assert.isFalse(result);
  });
});