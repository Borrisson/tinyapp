const express = require("express");
const app = express();
const PORT = 8080; // default port 8080
const bodyParser = require("body-parser");

function generateRandomString() {
  return Math.random().toString(36).substring(2, 8);
}

app.use(bodyParser.urlencoded({extended: true}));
app.set("view engine", "ejs");

const urlDatabase = {
  "b2xVn2": "http://www.lighthouselabs.ca",
  "9sm5xK": "http://www.google.com"
};

app.get("/", (req, res) => {
  res.send("Main Page");
});

app.get("/urls", (req, res) => {
  const templateVars = {urls: urlDatabase};
  res.render("urls_index", templateVars);
});

//creates unique ID for urlDB
app.post("/urls", (req, res) => { 
  let id = '';
  do {
    id = generateRandomString();
  } while(urlDatabase[id]);
  urlDatabase[id] = req.body.longURL;
  res.redirect(`/urls/${id}`)   
});

//redirects from shortURL if it exists in DB
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL];
  if(!longURL) {
    res.redirect('/404');
  };
  res.redirect(longURL);
});

app.get("/urls/new", (req, res) => {
  res.render("urls_new");
});

//redirects from shortURL if it exists in DB
app.get("/urls/:shortURL", (req, res) => {
  if(!urlDatabase[req.params.shortURL]) {
    res.redirect('/404');
  };
  const templateVars = { shortURL: req.params.shortURL, longURL: urlDatabase[req.params.shortURL] };
  res.render("urls_show", templateVars);
});

app.get("/urls.json", (req, res) => {
  res.json(urlDatabase);
});

app.get('/404', (req, res) => {
  res.send(`404 Page Not Found`)
});

app.get('*', (req, res) => {
  res.redirect('/404');
});

app.listen(PORT, () => {
  console.log(`Example app listening on port ${PORT}!`);
});