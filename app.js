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

// try object destructuring
const PcGamer = sources.pcGamer;
const YouTube = sources.youtube;
const Ign = sources.ign;

const app = express();
const port = process.env.PORT || 3000;

// telling the app to use handlebars as templating engine
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

// defining a basic function for axios HTTP call
function downloadHtml(url, query) {
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

// function for traversing HTML page from IGN
function selectIgn(obj, query) {
  // maybe do await instead of .then()? code might look cleaner
  return downloadHtml(obj.url, query).then((data) => {
    // loading the returned html from function
    const $ = cheerio.load(data);
    // traversing the html based on the passed object properties
    // NOTE, no need to use $ in front of container in declaration
    const $container = $(obj.selector.allResults);
    const arrayResults = [];
    $($container)
      // find the selector in the provided html
      .find(obj.selector.singleResult)
      // loop through every element for the found selector, i->index, el->element
      .each((i, el) => {
        const $title = $(el).find(obj.selector.resultName).text();
        const $url = $(el)
          .find(obj.selector.resultName)
          // need to use children here since the a tag doesn't have a class selector to be used
          // additionally for some reason if 'a' is used as a selector it returns empty string
          .children('a')
          .attr('href');
        const $desc = $(el).find(obj.selector.resultDesc).text();
        // at the end of every itteration add the object with above values to the array
        arrayResults.push({
          title: $title,
          url: $url,
          desc: $desc,
        });
      });
    return arrayResults;
  });
}

// function for traversing the YT Html page, similar to the others, atleast in the begining
// difference is in the actual selector part
function selectYT(obj, query) {
  return downloadYT(obj.url, query).then((data) => {
    const arrayResults = [];
    const $ = cheerio.load(data);
    const $container = $(obj.selector.allResults);
    $($container)
      .find(obj.selector.singleResult)
      .each((i, el) => {
        const $title = $(el).find(obj.selector.resultName).text();
        // actual href value looks like /watch+somestring so i need to add it to original site link
        const $url = `https://www.youtube.com${$(el)
          .find(obj.selector.resultLink)
          .attr('href')}`;
        const $desc = $(el).find(obj.selector.resultDesc).text();
        // also img is format that you cannot actually select it from dom,
        // but luckily the only thing that changes is the middle part
        // now that i see, there is no need to add url.slice to template litteral,
        // could have used el.find.obj.selector.resultLink
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
  });
}

// function for selecting html of Pcgamer,
// although there is no indication in the name
// again different selectors but the beggining is same
function selectFromHtml(obj, query) {
  return (
    downloadHtml(obj.url, query)
      .then((data) => {
        const $ = cheerio.load(data);
        const $container = $(obj.selector.allResults);
        const arrayResults = [];
        $($container)
          .find(obj.selector.singleResult)
          .each((i, el) => {
            const $title = $(el).find(obj.selector.resultName).text();
            const $url = $(el).find(obj.selector.resultLink).attr('href');
            const $desc = $(el).find(obj.selector.resultDesc).text();
            const $img = $(el)
              .find(obj.selector.resultImage)
              .attr('data-original');
            arrayResults.push({
              title: $title,
              url: $url,
              desc: $desc,
              img: $img,
            });
          });
        return arrayResults;
      })
      // figure out what to do with err
      .catch((err) => {
        console.log(err);
      })
  );
}

// allow express to use static folder, where the css/js etc will be placed
// otherwise it wont be loaded
app.use(express.static(path.join(__dirname, '/public')));

// function for responding to a get request from search form
// same as regular app.get('/') except for url concat it used
// query.searchfield instead of params.id
// router options available?
// additionaly callback function needs to be async
app.get('/search', async (req, res) => {
  console.log(req.query.searchField);
  // save the returned value in a const
  // same for other sources
  const pcg = await selectFromHtml(PcGamer, req.query.searchField).catch(
    (err) => {
      console.log(err);
    }
  );
  const yt = await selectYT(YouTube, req.query.searchField);
  const ign = await selectIgn(Ign, req.query.searchField).catch((err) => {
    console.log(err);
  });
  // render the page named home in layouts, pass in the object with provided values
  res.render('home', {
    pcg,
    yt,
    ign,
  });
});
// same as above, but this time the get request should look like localhost:port/keyword
app.get('/:id', async (req, res) => {
  const pcg = await selectFromHtml(PcGamer, req.params.id).catch((err) => {
    console.log(err);
  });
  const yt = await selectYT(YouTube, req.params.id);
  const ign = await selectIgn(Ign, req.params.id).catch((err) => {
    console.log(err);
  });
  console.log(ign);

  res.render('home', {
    pcg,
    yt,
    ign,
  });
});
// starting server
app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
