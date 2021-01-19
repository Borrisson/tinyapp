const express = require("express");
const bodyParser = require("body-parser");
const PORT = 8080; // default port 8080
const cookieParser = require('cookie-parser');

const generateRandomString = function() {
  return Math.random().toString(36).substring(2, 8);
};

//The server w/ configs
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use( express.static( "public" ) );
app.set("view engine", "ejs");


const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Main Page");
});

app.get("/urls", (req, res) => {
  const templateVars = { username: req.cookies["username"], urls: urlDatabase };
  res.render("urls_index", templateVars);
});

//creates unique ID for urlDB (does not overwrite existing);
app.post("/urls", (req, res) => {
  let id = '';
  do {
    id = generateRandomString();
  } while (urlDatabase[id]);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`);
});

app.get('/register', (req, res) => {
  res.render('urls_reg');
});

app.post("/login", (req, res) => {
  res.cookie('username', req.body.username);
  res.redirect('/urls');
});

app.post("/logout", (req, res) => {
  res.clearCookie("username");
  res.redirect('/urls');
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

//create new shorthand URL
app.get("/urls/new", (req, res) => {
  const templateVars = { username: req.cookies["username"] };
  res.render("urls_new", templateVars);
});

//redirects from shortURL if it exists in DB
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/404');
  } else {
    const templateVars = { username: req.cookies["username"], shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
    res.render("urls_show", templateVars);
  }
});

//returns json file of DB
app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
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

app.get('/404', (req, res) => {
  res.send(`404 Page Not Found`);
});

app.get('*', (req, res) => {
  res.redirect('/404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});