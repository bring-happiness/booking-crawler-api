let getCrawler = (type) => {
  let typePascalCase = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  return require('./' + typePascalCase + 'Crawler');
};

exports.getCommuniques = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getCommuniques(clubId, username, password);
};

exports.getUserCurrentReservations = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getUserCurrentReservations(clubId, username, password);
};


exports.getAllReservations = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getAllReservations(clubId, username, password);
};

exports.getAllPartners = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getAllPartners(clubId, username, password);
};

exports.book = async (type, clubId, username, password, startDate, startTime, duration, court) => {
  let crawler = new (getCrawler(type));

  return await crawler.book(clubId, username, password, startDate, startTime, duration, court);
};