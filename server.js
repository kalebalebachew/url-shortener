const express = require('express');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');
const User = require('./models/Users')
var LocalStrategy = require('passport-local');
var crypto = require('crypto');


const app = express();



const connectionString = `mongodb://localhost:27017/url-short`;

mongoose.connect(connectionString, {
  useNewUrlParser: true,
  useUnifiedTopology: true
}).then(() => {
  console.log('Connected to MongoDB');
}).catch((error) => {
  console.error('Error connecting to MongoDB:', error);
});

app.set('view engine', 'ejs');
app.use(express.urlencoded({ extended: false }));

/// Passport configuration
passport.use(new LocalStrategy(async function(username, password, cb) {
  try {
    const user = await User.findOne({ username: username });

    if (!user) {
      return cb(null, false, { message: 'Incorrect username or password.' });
    }

    crypto.pbkdf2(password, user.salt, 310000, 32, 'sha256', function(err, hashedPassword) {
      if (err) { return cb(err); }
      if (!crypto.timingSafeEqual(Buffer.from(user.hashed_password), Buffer.from(hashedPassword))) {
        return cb(null, false, { message: 'Incorrect username or password.' });
      }
      return cb(null, user);
    });
  } catch (err) {
    return cb(err);
  }
}));

app.use(passport.initialize());

// Registration endpoint
app.post('/reg', async (req, res) => {
  const { username, password } = req.body;

  if (!username || !password) {
    return res.sendStatus(400).send("You should provide a username and password to register.");
  }

  try {
    // You should create the user and save it in the database
    const newUser = await User.create({ username, password });
    res.redirect('/signin');
  } catch (error) {
    console.error(error);
    res.sendStatus(500).send("Registration failed.");
  }
});

// Login endpoint
app.post('/login', passport.authenticate('local', {
  successRedirect: '/success', // Redirect on successful login
  failureRedirect: '/failure', // Redirect on failed login
  failureFlash: true, // Enable flash messages
}));




  




//url
app.get('/', async (req, res) => {
  const shortUrls = await shortUrl.find();
  res.render('index', { shortUrls: shortUrls });
});

app.post('/shortUrls', async (req, res) => {
  await shortUrl.create({ full: req.body.fullUrl });
  res.redirect('/');
});

app.get('/:shortUrl', async (req, res) => {
  const url = await shortUrl.findOne({ short: req.params.shortUrl });

  if (url == null) {
    return res.sendStatus(404);
  }

  url.clicks++;
  url.save();

  res.redirect(url.full);
});

app.listen(process.env.PORT || 5000, () => {
  console.log('Server is running on port 5000');
});
