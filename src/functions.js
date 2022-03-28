/* eslint-disable function-paren-newline */
/* eslint-disable implicit-arrow-linebreak */
const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');

async function downloadHtml(url, query) {
  return axios.get(`${url}${query}`).then((response) => response.data);
}

async function downloadYT(url, query) {
  const browser = await puppeteer.launch({
    args: ['--no-sandbox', '--disable-setuid-sandbox'],
  });
  const page = await browser.newPage();
  await page.goto(`${url}${query}`);
  const bodyHTML = await page.evaluate(() => document.body.innerHTML);
  browser.close();
  return bodyHTML;
}

function selectYT(source, data) {
  const arrayResults = [];
  const $ = cheerio.load(data);
  const $container = $(source.selector.allResults);
  $($container)
    .find(source.selector.singleResult)
    .each((i, el) => {
      const $title = $(el).find(source.selector.resultName).text();
      const $url = `https://www.youtube.com${$(el)
        .find(source.selector.resultLink)
        .attr('href')}`;
      const $desc = $(el).find(source.selector.resultDesc).text();
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

function getSelector(source) {
  if (source.renderAfterRequest) {
    return selectYT;
  }
  return selectFromHtml;
}

function getDownloader(source) {
  if (source.renderAfterRequest) {
    return downloadYT;
  }
  return downloadHtml;
}

async function getDataFromSource(source, searchTerm) {
  const downloader = getDownloader(source);
  const selector = getSelector(source);

  return downloader(source.url, searchTerm).then((data) => ({
    source,
    results: selector(source, data),
  }));
}

async function getDataForKeywords(source, keywords) {
  const promises = keywords.map((keyword) =>
    getDataFromSource(source, keyword)
  );
  return Promise.all(promises).catch((er) => {
    console.log(er);
    console.log('error happened');
  });
}

module.exports = {
  getDataFromSource,
  getDownloader,
  getSelector,
  selectFromHtml,
  selectYT,
  downloadYT,
  downloadHtml,
  getDataForKeywords,
};
