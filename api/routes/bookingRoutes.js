'use strict';

module.exports = (app) => {
  let bookingController = require('../controllers/bookingController');

  app.route('/:type/login')
    .get(bookingController.loginUser);

  app.route('/communiques/:type')
    .get(bookingController.get_communiques);

  app.route('/reservations/:type/current-user')
    .get(bookingController.get_user_current_reservations);

  app.route('/reservations/:type/all')
    .get(bookingController.get_all_reservations);

  app.route('/infos/:type/current-user')
    .get(bookingController.get_user_current_infos_and_partners);

  app.route('/reservations/:type/book')
    .post(bookingController.book);
};
