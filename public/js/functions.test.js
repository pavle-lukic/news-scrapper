const axios = require('axios');
const puppeteer = require('puppeteer');
const cheerio = require('cheerio');
const fs = require('fs');
const sources = require('../../sources/source');

const {
  getDataFromSource,
  getDownloader,
  getSelector,
  selectFromHtml,
  selectYT,
  downloadYT,
  downloadHtml,
} = require('./functions');
const text = fs.readFileSync(`${__dirname}/regHtml.txt`, 'utf8');
const yt = fs.readFileSync(`${__dirname}/ytHtml.txt`, 'utf8');

test('Selectors for regular sources find the right parts of html', async () => {
  expect(text).toBeTruthy();
  expect(text).toMatch(/html/);
  expect(yt).toBeTruthy();
  expect(yt).toMatch(/html/);
});

test('Getting sources should return an array of objects', async () => {
  const arr = await sources.getAll();
  expect(Array.isArray(arr)).toBe(true);

  arr.forEach((el) => {
    expect(typeof el).toBe('object');
  });
});
