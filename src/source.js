class Source {
  constructor(name, url, selector, bool) {
    this.name = name;
    this.url = url;
    this.selector = selector;
    this.renderAfterRequest = bool;
  }
}

const pcGamerSelector = {
  allResults: 'div.listingResults',
  singleResult: 'div.listingResult.small',
  resultName: 'h3.article-name',
  resultLink: 'a.article-link',
  resultDesc: 'p.synopsis',
  resultImage: 'figure.article-lead-image-wrap',
};

const youtubeSelector = {
  allResults: 'ytd-search',
  singleResult: 'ytd-video-renderer',
  resultName: 'a.yt-simple-endpoint',
  resultLink: 'a#video-title',
  resultDesc: 'yt-formatted-string.ytd-video-renderer',
  resultImage: 'img.yt-img-shadow',
};

const ignSelector = {
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
  false
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
  false
);

function getAll() {
  return [pcGamer, youtube, ign];
}

module.exports = {
  getAll,
};
