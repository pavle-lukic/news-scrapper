const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const sources = require('./src/source');
const { getDataForKeywords } = require('./src/functions');

const hbs = exphbs.create({
  helpers: {},
});
const app = express();
const port = process.env.PORT || 3000;
app.engine('handlebars', hbs.engine);
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.get('/', async (req, res) => {
  const searchTerm = req.query.search || 'news';
  const requestData = true;
  const promises = sources
    .getAll()
    .map((source) => getDataForKeywords(source, searchTerm.split(',', 4)));
  await Promise.all(promises).then((results) => {
    res.render('home', {
      data: results,
      requestData,
    });
  });
});

app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
