const express = require('express');
const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const exphbs = require('express-handlebars');
const path = require('path');

const sources = require('./sources/source');

const PcGamer = sources.pcGamer;
const YouTube = sources.youtube;

const app = express();
const port = process.env.PORT || 3000;
app.engine('handlebars', exphbs());
app.set('view engine', 'handlebars');

function downloadHtml(url, query) {
  return axios.get(`${url}${query}`).then((response) => response.data);
}

async function downloadYT(url, query) {
  const browser = await puppeteer.launch();
  const page = await browser.newPage();
  await page.goto(`${url}${query}`);
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  browser.close();
  return bodyHTML;
}

function selectYT(obj, query) {
  return downloadYT(obj.url, query).then((data) => {
    const arrayResults = [];
    const $ = cheerio.load(data);
    const $container = $(obj.selector.allResults);
    $($container)
      .find(obj.selector.singleResult)
      .each((i, el) => {
        const $title = $(el).find(obj.selector.resultName).text();
        const $url = `https://www.youtube.com${$(el)
          .find(obj.selector.resultLink)
          .attr('href')}`;
        const $desc = $(el).find(obj.selector.resultDesc).text();
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

function selectFromHtml(obj, query) {
  return downloadHtml(obj.url, query)
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
    .catch((err) => {
      console.log(err);
    });
}

app.use(express.static(path.join(__dirname, '/public')));

app.get('/search', async (req, res) => {
  console.log(req.query.searchField);
  const pcg = await selectFromHtml(PcGamer, req.query.searchField).catch(
    (err) => {
      console.log(err);
    }
  );
  const yt = await selectYT(YouTube, req.query.searchField);
  res.render('home', {
    pcg,
    yt,
  });
});
app.get('/:id', async (req, res) => {
  const pcg = await selectFromHtml(PcGamer, req.params.id).catch((err) => {
    console.log(err);
  });
  const yt = await selectYT(YouTube, req.params.id);
  res.render('home', {
    pcg,
    yt,
  });
});

process.on('warning', (e) => console.warn(e.stack()));

app.listen(port, () => {
  console.log(`Listening on port ${port}`);
});
