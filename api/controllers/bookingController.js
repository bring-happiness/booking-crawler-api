'use strict';

let crawlerManager = require('./../../crawlers/crawler-manager');

exports.loginUser = async (req, res) => {
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;

  res.json(await crawlerManager.loginUser(type, clubId, username, password));
};

exports.get_communiques = async (req, res) => {
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;

  res.json(await crawlerManager.getCommuniques(type, clubId, username, password));
};

exports.get_user_current_reservations = async (req, res) => {
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;

  res.json(await crawlerManager.getUserCurrentReservations(type, clubId, username, password));
};

exports.get_all_reservations = async (req, res) => {
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;

  res.json(await crawlerManager.getAllReservations(type, clubId, username, password));
};

exports.get_user_current_infos_and_partners = async (req, res) => {
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;

  res.json(await crawlerManager.getAllInfosAndPartners(type, clubId, username, password));
};

exports.book = async (req, res) => {
  console.log(req.body, req.headers)
  const type = req.params.type;
  const clubId = req.headers.club_id;
  const username = req.headers.username;
  const password = req.headers.password;
  const startDate = req.body.start_date;
  const startTime = req.body.start_time;
  const duration = req.body.duration;
  const court = req.body.court;
  const partner = req.body.partner;

  res.json(await crawlerManager.book(type, clubId, username, password, startDate, startTime, duration, court, partner));
};
