const fs = require('fs');
const sources = require('./source');

const {
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

  const arr = await sources.getAll();
  arr.forEach((el) => {
    const htmlArr = selectFromHtml(el, text);
    expect(Array.isArray(htmlArr)).toBe(true);
    htmlArr.forEach((obj) => {
      expect(typeof obj).toBe('object');
      expect(obj).toHaveProperty('title');
      expect(obj).toHaveProperty('url');
      expect(obj).toHaveProperty('desc');
      expect(obj).toHaveProperty('img');
    });
  });
});

test('Getting sources should return an array of objects', async () => {
  const arr = await sources.getAll();
  expect(Array.isArray(arr)).toBe(true);
  arr.forEach((el) => {
    expect(typeof el).toBe('object');
  });
});
test('Getting a selector and downloader returns the correct value based on property renderAfterRequest', async () => {
  const arr = await sources.getAll();
  arr.forEach((el) => {
    if (el.renderAfterRequest === true) {
      expect(getSelector(el)).toEqual(selectYT);
      expect(getDownloader(el)).toEqual(downloadYT);
    } else {
      expect(getSelector(el)).toEqual(selectFromHtml);
      expect(getDownloader(el)).toEqual(downloadHtml);
    }
  });
});
