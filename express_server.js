const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');
const { generateRandomString, locateID, emailAuth, loggedIn, usersURL } = require('./public/helpers/userAuthenticator');


//The server w/ configs
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": { longURl: "http://www.lighthouselabs.ca", userID: "34dt4f" },
  "9sm5xK": { longURl: "http://www.google.com", userID: "34dt4f" }
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
  const id = req.cookies["user_id"];
  const templateVars = { user: users[id], urls: urlDatabase };
  res.render("urls_reg", templateVars);
});

//adds new user to DB (does not overwrite existing ID's)
app.post('/register', (req, res) => {
  if (emailAuth(users, req.body, { registration: true })) {
    res.redirect("/400");
  } else {
    let id = '';
    do {
      id = generateRandomString();
    } while (users[id]);
    req.body.id = id;
    users[id] = req.body;
    res.cookie('user_id', id);
    res.redirect('/urls');
  }
});



//<-------login------->


app.get("/login", (req, res) => {
  const id = req.cookies["user_id"];
  const templateVars = { user: users[id], urls: urlDatabase };
  res.render("urls_login", templateVars);
});

//checks if user exists for login
app.post("/login", (req, res) => {
  if (emailAuth(users, req.body)) {
    const id = locateID(users, req.body);
    res.cookie('user_id', id);
    res.redirect('/urls');
  } else {
    res.redirect("/403");
  }
});


//<-------URLS------->


app.get("/urls", (req, res) => {
  const id = req.cookies["user_id"];
  if (loggedIn(id)) {
    const templateVars = { user: users[id], urls: usersURL(id, urlDatabase) };
    res.render("urls_index", templateVars);
  } else {
    res.redirect("/login");
  }
});

//creates unique ID for urlDB (does not overwrite existing);
app.post("/urls", (req, res) => {
  const userID = req.cookies["user_id"];
  if (loggedIn(userID)) {
    let id = '';
    do {
      id = generateRandomString();
    } while (urlDatabase[id]);
    urlDatabase[id] = { longURL: req.body.longURL, userID };
    res.redirect(`/urls/`);
  } else {
    res.redirect("/login");
  }
});



//<-------logout------->


app.post("/logout", (req, res) => {
  res.clearCookie("user_id");
  res.redirect('/urls');
});


//<-------NEW URL------->


//create new shorthand URL
app.get("/urls/new", (req, res) => {
  const id = req.cookies["user_id"];
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


//redirects from shortURL if it exists in DB
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/404');
  } else {
    const id = req.cookies["user_id"];
    const templateVars = { user: users[id], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  }
});

//event listener for delete buttons.
app.post('/urls/:shortURL/delete', (req, res) => {
  delete urlDatabase[req.params.shortURL];
  res.redirect("/urls");
});

//pairs short URL with New (edited) Long URL
app.post('/urls/:shortURL/edit', (req, res) => {
  urlDatabase[req.params.shortURL] = req.body.longURL;
  res.redirect("/urls");
});

//redirects from shortURL if it exists in DB
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if (!longURL) {
    res.redirect('/404');
  } else {
    res.redirect(longURL);
  }
});



//<-------400's------->


app.get('/400', (req, res) => {
  res.status(400);
  res.render('urls_400');
});

app.get('/403', (req, res) => {
  res.status(403);
  res.render('urls_403');
});

app.get('/404', (req, res) => {
  res.send(`404 Page Not Found`);
});

app.get('*', (req, res) => {
  res.redirect('/404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});