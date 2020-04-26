class Source {
  constructor(name, url, selector, bool) {
    this.name = name;
    this.url = url;
    this.selector = selector;
    this.renderAfterRequest = bool;
  }
}
// image needs attr data-original
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
  // attr title
  resultLink: 'a#video-title',
  // attr href
  resultDesc: 'yt-formatted-string.ytd-video-renderer',
  resultImage: 'img.yt-img-shadow',
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

module.exports = {
  pcGamer,
  youtube,
};
