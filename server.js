const express = require('express');
const mongoose = require('mongoose');
const shortUrl = require('./models/shortUrl');

const app = express();



const connectionString = `mongodb+srv://kalebalebachew4:kalebalebachew@kaleb.x3cfdzk.mongodb.net/`;

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
