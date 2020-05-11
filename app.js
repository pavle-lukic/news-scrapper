const express = require('express');
const exphbs = require('express-handlebars');
const path = require('path');
const morgan = require('morgan');
const sources = require('./sources/source');
const { getDataForKeywords } = require('./public/js/functions');

const app = express();
const port = process.env.PORT || 3000;
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

app.use(express.static(path.join(__dirname, '/public')));
app.use(morgan('dev'));
app.get('/', async (req, res) => {
  const searchTerm = req.query.search || 'news';
  const promises = sources
    .getAll()
    .map((source) => getDataForKeywords(source, searchTerm.split(',', 4)));
  await Promise.all(promises).then((results) => {
    res.render('home', {
      data: results,
    });
  });
});
// app.get('/:id', async (req, res) => {
//   console.time('start');
//   const searchTerm = req.params.id;
//   const promises = sources
//     .getAll()
//     .map((source) => getDataFromSource(source, searchTerm));
//   await Promise.all(promises).then((results) => {
//     res.render('home', {
//       data: results,
//     });
//     console.timeEnd('start');
//   });
// });
// starting server
app.listen(port, () => {
  console.log(`Server running on ${port}`);
});
