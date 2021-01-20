const express = require("express");
const PORT = 8080; // default port 8080
const bcrypt = require('bcrypt');
const bodyParser = require("body-parser");
const cookieParser = require('cookie-parser');
const { generateRandomString, locateID, emailAuth, loggedIn, usersURL } = require('./public/helpers/userAuthenticator');


//The server w/ configs
const app = express();
app.use(bodyParser.urlencoded({ extended: true }));
app.use(cookieParser());
app.use(express.static("public"));
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
    
    const { email, password } = req.body;
    const hashedPassword = bcrypt.hashSync(password, 10);
    const newUser = 
    {
      id,
      email,
      password: hashedPassword
    };
    users[id] = newUser;
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


//redirects to the edit page if it exists in DB
app.get("/urls/:shortURL", (req, res) => {
  if (!urlDatabase[req.params.shortURL]) {
    res.redirect('/404');
  } else {
    const id = req.cookies["user_id"];
    const templateVars =
    {
      user: users[id],
      shortURL: req.params.shortURL,
      longURL: urlDatabase[req.params.shortURL].longURL
    };
    res.render("urls_show", templateVars);
  }
});


//pairs short URL with New (edited) Long URL
app.post('/urls/:shortURL/edit', (req, res) => {
  const id = req.cookies["user_id"];
  if (loggedIn(id)) {
    urlDatabase[req.params.shortURL] = { longURL: req.body.longURL, userID: id };
    res.redirect("/urls");
  } else {
    res.redirect("/login");
  }
});

//redirects from shortURL if it exists in DB
app.get("/u/:shortURL", (req, res) => {
  const longURL = urlDatabase[req.params.shortURL].longURL;
  if (!longURL) {
    res.redirect('/404');
  } else {
    res.redirect(longURL);
  }
});



//<-------Delete------->


//event listener for delete buttons.
app.post('/urls/:shortURL/delete', (req, res) => {
  const id = req.cookies["user_id"];
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