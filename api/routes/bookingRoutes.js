'use strict';

module.exports = (app) => {
  let bookingController = require('../controllers/bookingController');

  app.route('/communiques/:type')
    .get(bookingController.get_communiques);

  app.route('/reservations/:type/current-user')
    .get(bookingController.get_user_current_reservations);

  app.route('/reservations/:type/all')
    .get(bookingController.get_all_reservations);

  app.route('/partners/:type/current-user')
    .get(bookingController.get_user_current_partners);

  app.route('/reservations/:type/book')
    .post(bookingController.book);
};