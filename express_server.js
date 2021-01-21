const express = require("express");
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieSession = require('cookie-session');
const { generateRandomString, locateID, emailAuth, loggedIn, usersURL, isRegistered, numberOfVisits } = require('./public/helpers/userAuthenticator');
const methodOverride = require('method-override');

//The server w/ configs
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(methodOverride('_method'));
app.use(express.static("public"));
app.use(cookieSession({
  name: 'session',
  keys: ['key1'],
}));

app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": { longURL: "http://www.lighthouselabs.ca", userID: "34dt4f" },
  "9sm5xK": { longURL: "http://www.google.com", userID: "34dt4f" }
};

const users = {
  "34dt4f": {
    id: "userRandomID",
    email: "user@example.com",
    password: "purple-monkey-dinosaur"
  },
  "3f5g3h": {
    id: "user2RandomID",
    email: "user2@example.com",
    password: "dishwasher-funk"
  }
};



//<-------Main Page------->


app.get("/", (req, res) => {
  res.send("Main Page");
});



//<-------register------->


app.get('/register', (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: users[id], urls: urlDatabase };
  res.render("urls_reg", templateVars);
});

//adds new user to DB (does not overwrite existing ID's)
app.post('/register', (req, res) => {
  if (isRegistered(req.body, users)) {
    res.redirect("/400");
  } else {
    const id = generateRandomString(users);
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser =
    {
      id,
      email,
      password: hashedPassword
    };
    users[id] = newUser;
    req.session.user_id = id;
    res.redirect('/urls');
  }
});



//<-------login------->


app.get("/login", (req, res) => {
  const id = req.session.user_id;
  const templateVars = { user: users[id], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

//checks if user exists for login
app.post("/login", (req, res) => {
  if (emailAuth(req.body, users)) {
    const id = locateID(req.body, users);
    req.session.user_id = id;
    res.redirect('/urls');
  } else {
    res.redirect("/403");
  }
});


//<-------URLS------->


app.get("/urls", (req, res) => {
  const id = req.session.user_id;
  if (loggedIn(id)) {
    const templateVars = { user: users[id], urls: usersURL(id, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//creates unique ID for urlDB (does not overwrite existing);
app.post("/urls", (req, res) => {
  const userID = req.session.user_id;
  if (loggedIn(userID)) {
    const id = generateRandomString(urlDatabase);
    urlDatabase[id] = { longURL: req.body.longURL, userID, visits: 0, visitors: [] };
    res.redirect(`/urls/`);
  } else {
    res.redirect("/login");
  }
});



//<-------logout------->


app.post("/logout", (req, res) => {
  req.session.user_id = null;
  res.redirect('/urls');
});


//<-------NEW URL------->


//create new shorthand URL
app.get("/urls/new", (req, res) => {
  const id = req.session.user_id;
  if (loggedIn(id)) {
    const templateVars = { user: users[id] };
    res.render("urls_new", templateVars);
  } else {
    res.redirect('/login');
  }
});



//<-------JSON FILE------->


//returns json file of DB
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});



//<-------shortURL------->


//redirects to the edit page if it exists in DB
app.get("/urls/:shortURL", (req, res) => {
  const id = req.session.user_id;
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/404');
  } else if (loggedIn(id) && urlDatabase[req.params.shortURL].userID === id) {
    const templateVars =
    {
      user: users[id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL,
      visits: urlDatabase[req.params.shortURL].visits,
      visitors: urlDatabase[req.params.shortURL].visitors.length
    };
    res.render("urls_show", templateVars);
  } else if (loggedIn(id)) {
    res.redirect('/401');
  } else {
    res.render("urls_show", { user: false });
  }
});


//pairs short URL with New (edited) Long URL
app.put('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  //checks if logged in and own url to be edited
  if (loggedIn(id) && urlDatabase[req.params.shortURL].userID === id) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: id };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});


//redirects from shortURL if it exists in DB
app.get("/u/:shortURL", (req, res) => {
  const shortURL = req.params.shortURL;
  const longURL = urlDatabase[shortURL] ? urlDatabase[shortURL].longURL : false;
  if (!longURL) {
    res.redirect('/404');
  } else {
    numberOfVisits(shortURL, urlDatabase);
    res.redirect(longURL);
  }
});



//<-------Delete------->


//event listener for delete buttons.
app.delete('/urls/:shortURL', (req, res) => {
  const id = req.session.user_id;
  if (id) {
    delete urlDatabase[req.params.shortURL];
    res.redirect("/urls");
  } else {
    res.redirect("/401");
  }
});




//<-------400's------->


app.get('/400', (req, res) => {
  res.status(400);
  const templateVars = { statusCode: 400 };
  res.render('urls_4xx', templateVars);
});

app.get('/401', (req, res) => {
  res.status(401);
  const templateVars = { statusCode: 401 };
  res.render('urls_4xx', templateVars);
});

app.get('/403', (req, res) => {
  res.status(403);
  const templateVars = { statusCode: 403 };
  res.render('urls_4xx', templateVars);
});

app.get('/404', (req, res) => {
  res.status(404);
  const templateVars = { statusCode: 404 };
  res.render('urls_4xx', templateVars);
});

app.get('*', (req, res) => {
  res.status(404);
  const templateVars = { statusCode: 404 };
  res.render('urls_4xx', templateVars);
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});