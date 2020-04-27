// attempt at making a class that will have some overlaping values
// idea was that to pass everything in the arguments, but with all of the selectors
// it would look messy
class Source {
  constructor(name, url, selector, bool) {
    // name is currently unused, thought about passing it to templating engine
    // instead of hardcoding h2 values
    this.name = name;
    this.url = url;
    this.selector = selector;
    //  this render key should have been used to check if the obj
    // needs to use puppeteer or not, curently not used
    this.renderAfterRequest = bool;
  }
}

const pcGamerSelector = {
  // all of these were added after checking in actual functions if they work
  allResults: 'div.listingResults',
  singleResult: 'div.listingResult.small',
  resultName: 'h3.article-name',
  resultLink: 'a.article-link',
  resultDesc: 'p.synopsis',
  resultImage: 'figure.article-lead-image-wrap',
};

const youtubeSelector = {
  // all of these were added after checking in actual functions if they work
  allResults: 'ytd-search',
  singleResult: 'ytd-video-renderer',
  resultName: 'a.yt-simple-endpoint',
  resultLink: 'a#video-title',
  resultDesc: 'yt-formatted-string.ytd-video-renderer',
  resultImage: 'img.yt-img-shadow',
};

const ignSelector = {
  // all of these were added after checking in actual functions if they work
  allResults: 'div.search-list',
  singleResult: 'div.search-item',
  resultName: 'div.search-item-title',
  resultLink: 'div.search-item-title > a',
  resultDesc: 'div.search-item-description',
  resultImage: 'img',
};

const pcGamer = new Source(
  'PcGamer',
  'https://www.pcgamer.com/search/?searchTerm=',
  pcGamerSelector,
  true
);

const youtube = new Source(
  'YouTube',
  'https://www.youtube.com/results?search_query=',
  youtubeSelector,
  true
);
const ign = new Source(
  'IGN',
  'https://www.ign.com/search?type=article&filter=articles&q=',
  ignSelector,
  true
);

function getAll() {
  return [
    pcGamer,
    youtube,
    ign
  ];
}

// exporting the objects so that they can be used in app.js
module.exports = {
  getAll
};
