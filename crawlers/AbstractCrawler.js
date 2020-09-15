'use strict';

const puppeteer = require('puppeteer');

module.exports = class AbstractCrawler {
  constructor() {
    this.browser = null;
    this.page = null;
  }

  async loginUser(clubId, username, password) {
  }

  async getAllUsers(clubId, username, password) {
  }

  async getCommuniques(clubId, username, password) {
  }

  async getUserCurrentReservations(clubId, username, password) {
  }

  async getAllReservations(clubId, username, password) {
  }

  async getAllInfosAndPartners(clubId, username, password) {
  }

  async book(clubId, username, password, startDate, startTime, duration, court, partner) {
  }

  async cancelBooking(clubId, username, password, startDate, startTime, duration, court, partner) {
  }

  async changePartner(clubId, username, password, startDate, startTime, duration, court, partner) {
  }

  async startBrowser(clubId) {
    this.browser = await puppeteer.launch({headless: false});
    this.page = await this.browser.newPage();
  }

  async closeBrowser() {
    await this.page.screenshot({path: './screenshots/example.png'});
    await this.browser.close();
  }

  async clickIfPresent(selector, doubleClick = false) {
    return await this.page.evaluate((selector, doubleClick) => {
      let element = document.querySelector(selector);

      if (element) {

        if(doubleClick) {
          const clickEvent  = document.createEvent ('MouseEvents');
          clickEvent.initEvent ('dblclick', true, true);
          element.dispatchEvent (clickEvent);
        } else {
          element.click();
        }

        return true;
      }

      return false;
    }, selector, doubleClick);
  }
};
