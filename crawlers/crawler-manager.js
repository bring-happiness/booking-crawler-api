let getCrawler = (type) => {
  let typePascalCase = type.charAt(0).toUpperCase() + type.slice(1).toLowerCase();

  return require('./' + typePascalCase + 'Crawler');
};

exports.loginUser = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.loginUser(clubId, username, password);
};

exports.getCommuniques = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getCommuniques(clubId, username, password);
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

exports.getAllInfosAndPartners = async (type, clubId, username, password) => {
  let crawler = new (getCrawler(type));

  return await crawler.getAllInfosAndPartners(clubId, username, password);
};

exports.cancel = async (type, clubId, username, password, bookingId) => {
  let crawler = new (getCrawler(type));

  return await crawler.cancel(clubId, username, password, bookingId);
};

exports.book = async (type, clubId, username, password, startDate, startTime, duration, court, partner) => {
  let crawler = new (getCrawler(type));

  return await crawler.book(clubId, username, password, startDate, startTime, duration, court, partner);
};
