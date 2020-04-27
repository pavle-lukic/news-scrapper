const express = require('express');

// axios for HTTP request
const axios = require('axios');

// headles browser
const puppeteer = require('puppeteer');

// traversing HTML
const cheerio = require('cheerio');

// handlebars templating engide for rendering
const exphbs = require('express-handlebars');
const path = require('path');

// module exports for each source
const sources = require('./sources/source');

const app = express();
const port = process.env.PORT || 3000;

// telling the app to use handlebars as templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

function getDownloader(source) {
  if (source.name === 'YouTube') {
    return downloadYT;
  }

  return downloadHtml;
}

function getSelector(source) {
  if (source.name === 'YouTube') {
    return selectYT;
  }

  return selectFromHtml;
}

async function getDataFromSource(source, searchTerm) {
  const downloader = getDownloader(source);
  const selector = getSelector(source);

  return downloader(source.url, searchTerm).then((data) => {
    return {
      source,
      results: selector(source, data),
    };
  });
}

// defining a basic function for axios HTTP call
async function downloadHtml(url, query) {
  return axios.get(`${url}${query}`).then((response) => response.data);
}

// function for starting headless browser and returning YT html
async function downloadYT(url, query) {
  // starting the browser
  // note all of these functions return a promise so either use await or .then()
  const browser = await puppeteer.launch();
  // opening a new page
  const page = await browser.newPage();
  // opening the provided url via function arguments
  await page.goto(`${url}${query}`);
  // page.evaluate() looks at the html code of page
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  // after the returned html is stored somewhere
  // the browser needs to be closed, otherwise the resourcess will be wasted
  browser.close();
  return bodyHTML;
}

// function for traversing the YT Html page, similar to the others, atleast in the begining
// difference is in the actual selector part
function selectYT(source, data) {
  const arrayResults = [];
  const $ = cheerio.load(data);
  const $container = $(source.selector.allResults);
  $($container)
    .find(source.selector.singleResult)
    .each((i, el) => {
      const $title = $(el).find(source.selector.resultName).text();
      // actual href value looks like /watch+somestring so i need to add it to original site link
      const $url = `https://www.youtube.com${$(el)
        .find(source.selector.resultLink)
        .attr('href')}`;
      const $desc = $(el).find(source.selector.resultDesc).text();
      // also img is format that you cannot actually select it from dom,
      // but luckily the only thing that changes is the middle part
      // now that i see, there is no need to add url.slice to template litteral,
      // could have used el.find.source.selector.resultLink
      // with a shorter slice, might be better for performance
      const $img = `https://i.ytimg.com/vi/${$url.slice(32)}/hqdefault.jpg?`;
      arrayResults.push({
        title: $title,
        url: $url,
        desc: $desc,
        img: $img,
      });
    });
  return arrayResults;
}

function selectFromHtml(source, data) {
  const $ = cheerio.load(data);
  const $container = $(source.selector.allResults);
  const arrayResults = [];
  $($container)
    .find(source.selector.singleResult)
    .each((i, el) => {
      const $title = $(el).find(source.selector.resultName).text();
      const $url = $(el).find(source.selector.resultLink).attr('href');
      const $desc = $(el).find(source.selector.resultDesc).text();
      const $img = $(el)
        .find(source.selector.resultImage)
        .attr('data-original');
      arrayResults.push({
        title: $title,
        url: $url,
        desc: $desc,
        img: $img,
      });
    });
  return arrayResults;
}

// allow express to use static folder, where the css/js etc will be placed
// otherwise it wont be loaded
app.use(express.static(path.join(__dirname, '/public')));

// function for responding to a get request from search form
// same as regular app.get('/') except for url concat it used
// query.searchfield instead of params.id
// router options available?
// additionaly callback function needs to be async
app.get('/', async (req, res) => {
  const searchTerm = req.query.searchField;
  const promises = sources
    .getAll()
    .map((source) => getDataFromSource(source, searchTerm));

  await Promise.all(promises).then((results) => {
    res.render('home', {
      data: results,
    });
  });
});
// same as above, but this time the get request should look like localhost:port/keyword
app.get('/:id', async (req, res) => {
  const searchTerm = req.params.id;
  const promises = sources
    .getAll()
    .map((source) => getDataFromSource(source, searchTerm));

  await Promise.all(promises).then((results) => {
    res.render('home', {
      data: results,
    });
  });
});
// starting server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
