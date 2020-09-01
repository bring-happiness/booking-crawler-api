'use strict';

let AbstractCrawler = require('./AbstractCrawler');

module.exports = class AdslCrawler extends AbstractCrawler {
  constructor() {
    super();
    this.baseUrl = 'https://www.adsltennis.fr/_start/index.php?club=';
  }

  async goToPage(clubId) {
    await this.page.goto(this.baseUrl + clubId);
  }

  async login(username, password) {
    await this.page.waitForSelector('.bloc');

    await this.page.type('.bloc p input[type="text"]', username);
    await this.page.type('.bloc p input[type="password"]', password);

    await this.clickIfPresent('.bloc .bouton_valider');
  }

  async clickBtnNextMonth() {
    return await this.clickIfPresent('.ui-datepicker-next.ui-corner-all:not(.ui-state-disabled)');
  }

  async getAllDatesOnDatepicker() {
    return this.page.evaluate(() => {
      const DATE_ID_PREFIX = 'DATE_ID_PREFIX_';

      return [...document.querySelectorAll('[data-handler][data-year]')].map((tdDatePicker, index) => {
        tdDatePicker.id = DATE_ID_PREFIX + index;

        return {
          id: '#' + tdDatePicker.id,
          year: tdDatePicker.dataset.year,
          month: tdDatePicker.dataset.month,
          day: tdDatePicker.innerText
        }
      });
    });
  }

  findElementWithDate(allDates, year, month, day) {
    return allDates.find(date => date.year === year && date.month === month && date.day === day)
  }

  async clickDateOnDatepicker(year, month, day) {
    year = year.toString();
    month = month.toString();
    day = day.toString();

    let date = null;
    let hasNextMonth;

    do {
      hasNextMonth = false;

      let dates = await this.getAllDatesOnDatepicker();
      date = this.findElementWithDate(dates, year, month, day);

      if (!date) {
        hasNextMonth = await this.clickBtnNextMonth();
      }

    } while (hasNextMonth);

    if (date) {
      await this.clickIfPresent(date.id);
      await this.page.waitFor(800);
    }

    return date;
  }

  async getError() {
    return await this.page.evaluate(() => {
      const error = document.querySelector('.erreur');

      if (error) {
        return error.innerText;
      }

      return '';
    });
  }

  async waitFicheReservation() {
    await Promise.all([
      this.page.waitForSelector('.bouton_resag', {timeout: 3000}),
      this.clickIfPresent('.bouton_resag'),
    ]);

    await this.page.waitFor(800);
  }

  async waitFicheAdherentReservationModification() {
    return this.page.waitForSelector('.fic_adherent_reservation_modification', {timeout: 3000})
  }

  async getAllUsers(clubId, username, password) {
    // todo: to implement
    // type every first name
    // And store every result
  }

  async getCommuniques(clubId, username, password) {
    await this.startBrowser(clubId);
    await this.goToPage(clubId);

    await this.login(username, password);

    let communiques = await this.manageCommuniques(true);

    await this.closeBrowser();

    return communiques;
  }

  async getUserCurrentReservations(clubId, username, password) {
    await this.startBrowser(clubId);
    await this.goToPage(clubId);

    await this.login(username, password);

    const communiques = await this.manageCommuniques();
    let userCurrentReservations = await this.manageUserCurrentReservations(communiques !== '', true);

    await this.closeBrowser();

    return userCurrentReservations;
  }

  async getAllReservations(clubId, username, password) {
    await this.startBrowser(clubId);
    await this.goToPage(clubId);

    await this.login(username, password);

    const communiques = await this.manageCommuniques();
    await this.manageUserCurrentReservations(communiques !== '', true);

    await this.waitFicheReservation();
    let allReservations = await this.manageAllReservations(true);

    await this.closeBrowser();

    return allReservations;
  }

  async getAllInfosAndPartners(clubId, username, password) {
    const infosAndPartners = {
      civility: '',
      firstname: '',
      lastname: '',
      birthdate: '',
      license: '',
      ranking: '',
      partners: [],
    };

    await this.startBrowser(clubId);
    await this.goToPage(clubId);

    await this.login(username, password);

    const communiques = await this.manageCommuniques();
    await this.manageUserCurrentReservations(communiques !== '', true);

    // Tab Formation
    await this.clickIfPresent('#tab_formation');
    const allFormationFields = await this.page.evaluate(() => {
      return Array.from(document.querySelectorAll('#bloc_formation .champ'),
        e => e.innerText)
    });
    infosAndPartners.license = allFormationFields[1].split('°')[1].split(' ')[0];
    infosAndPartners.ranking = allFormationFields[2].split(': ')[1].split(' ')[0];

    // Tab Informations
    await this.clickIfPresent('#tab_information');
    const allInformationFields = await this.page.evaluate(() => {
      return Array.from([
        document.querySelector('#bloc_coordonnees_ouvert #L_CIVILITE'),
        document.querySelector('#bloc_coordonnees_ouvert input[name="L_NOM"]'),
        document.querySelector('#bloc_coordonnees_ouvert input[name="L_PRENOM"]'),
        document.querySelector('#bloc_coordonnees_ouvert input[name="D_NAISSANCE"]'),
      ], e => e.value)
    });
    infosAndPartners.civility = allInformationFields[0];
    infosAndPartners.lastname = allInformationFields[1];
    infosAndPartners.firstname = allInformationFields[2];
    infosAndPartners.birthdate = allInformationFields[3];

    await this.waitFicheReservation();
    infosAndPartners.partners = await this.managePartners(true);

    await this.closeBrowser();

    return infosAndPartners;
  }

  async book(clubId, username, password, startDate, startTime, duration, court, partner) {
    await this.startBrowser(clubId);
    await this.goToPage(clubId);
    await this.login(username, password);

    const communiques = await this.manageCommuniques();
    // compare before and after to know if book is a success
    let oldCurrentReservations = (await this.manageUserCurrentReservations(communiques !== '',true)).reservations;

    await this.waitFicheReservation();

    // todo: handler book errors
    let bookResponse = await this.manageBook(startDate, startTime, duration, court, partner);

    await this.page.waitFor(1000);

    await this.clickIfPresent('.bouton_espaceperso');

    await this.page.waitFor(1000);

    const newCurrentReservations = await this.page.evaluate(() =>{
      return Array.from(document.querySelectorAll('#bloc_resa_resa #liste_reservation tr:not(#r-entete)'),
        element => ({ id: element.id })
      )
    });

    bookResponse.success = oldCurrentReservations.length === (newCurrentReservations.length - 1)

    await this.closeBrowser();

    return bookResponse;
  }

  async cancelBooking(clubId, username, password, startDate, startTime, duration, court, partner) {
    // todo: to implement (cancel and check if the banner "réservation bien supprimée" is shown
  }

  async changePartner(clubId, username, password, startDate, startTime, duration, court, partner) {
    // todo: to implement
  }

  async manageCommuniques(isReturningCommuniques = false) {
    try {
      let time1 = new Date();
      await Promise.all([
        this.page.waitForSelector('.fiche_messages', {timeout: 1500}),
        this.clickIfPresent('#btn_identification'),
      ]);

      if (isReturningCommuniques) {
        return await this.page.evaluate(this.crawlCommuniques);
      }

      let time2 = new Date();
      console.log(time2 - time1);
    } catch (error) {
      //console.error(error);
      return '';
    }
  }

  async manageUserCurrentReservations(hasCommuniques = false, isReturningReservations = false) {
    try {
      let time1 = new Date();

      if (hasCommuniques) {
        await Promise.all([
          this.page.waitForSelector('.fic_adherent_reservation', {timeout: 1500}),
          this.clickIfPresent('.bouton_publipostage'),
        ]);
      } else {
        await Promise.all([
          this.page.waitForSelector('.fic_adherent_reservation', {timeout: 1500}),
          this.clickIfPresent('.bouton_espaceperso'),
        ]);
      }

      if (isReturningReservations) {
        return await this.page.evaluate(this.crawlUserCurrentReservations);
      }

      let time2 = new Date();
      console.log(time2 - time1);
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async manageBook(startDate, startTime, duration, court, partner) {

    let response = {
      success: false,
      text: ''
    };

    try {
      let time1 = new Date();

      let startDateSplitted = startDate.split('-');
      let year = startDateSplitted[0];
      let month = startDateSplitted[1];
      let day = startDateSplitted[2];

      month = Number(month - 1).toString(); // We decrement because ADSL month starts at 0
      day = Number(day).toString();

      const date = await this.clickDateOnDatepicker(year, month, day);

      if (date) {
        let startTimeSplitted = startTime.split(':');
        let hours = Number(startTimeSplitted[0]);
        let minutes = Number(startTimeSplitted[1]);

        let bookSelector = `[id="${hours}_${minutes}_${court}"]`;

        await Promise.all([
          this.waitFicheAdherentReservationModification(),
          this.clickIfPresent(bookSelector, true)
        ]);
      }

      const partners = await this.page.evaluate(() =>
        Array.from(document.querySelectorAll('#CHAMP_TYPE_1 option[value*="-"]'),
          element => ({ value: element.value, name: element.textContent })
        )
      );

      const partnerOptionValue = partners.find(_partner => _partner.name.toLowerCase() === partner.toLowerCase()).value;

      // Select partner
      await this.page.evaluate(() => {
        const select = document.querySelector('#CHAMP_TYPE_1');
        select.style.display = 'block';
      });
      await this.clickIfPresent('#CHAMP_TYPE_1');
      await this.page.select('#CHAMP_TYPE_1', partnerOptionValue);

      await this.page.waitFor(1000);

      // Submit the booking
      this.clickIfPresent('#workpage button:nth-of-type(2)');

      let time2 = new Date();
      console.log(time2 - time1);

      return response;
    } catch (error) {
      response.text = await this.getError();
      return response;
    }
  }

  async managePartners(isReturningPartners = false) {
    try {
      let time1 = new Date();

      let partners = [];

      let bookSuccess = false;
      let dateIterator = new Date();

      do {
        let oneDayAfter = new Date(dateIterator);
        oneDayAfter.setDate(oneDayAfter.getDate() + 1);
        dateIterator = oneDayAfter;

        const date = await this.clickDateOnDatepicker(dateIterator.getFullYear(), dateIterator.getMonth(), dateIterator.getDate());

        if (date) {
          bookSuccess = await this.page.evaluate(() => {
            let exitForEach = false;

            [...document.querySelectorAll('.ho[style*="background-color: var(--resa-libre);"]')].forEach(freeReservation => {
              if (exitForEach) {
                return;
              }

              try {
                const clickEvent = document.createEvent('MouseEvents');
                clickEvent.initEvent('dblclick', true, true);
                freeReservation.dispatchEvent(clickEvent);

                exitForEach = true;
              } catch (error) {
                exitForEach = false;
              }
            });

            return exitForEach;
          });
        }

      } while (!bookSuccess);

      await this.waitFicheAdherentReservationModification();

      partners = await this.page.evaluate(() =>
        Array.from(document.querySelectorAll('#CHAMP_TYPE_1 option[value*="-"]'),
          element => element.textContent
        )
      );

      this.clickIfPresent('.bouton_supprimer');
      this.clickIfPresent('#modal_confirmation .bouton_supprimer');

      let time2 = new Date();
      console.log(time2 - time1);

      return partners;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  async manageAllReservations(isReturningAllReservations = false) {

    let allReservations = [];

    try {
      let time1 = new Date();

      let isBtnNextMonthEnable = false;

      do {
        let allDateCalendar = await this.getAllDatesOnDatepicker();
        console.log(allDateCalendar)
        let iterator = 0;
        let exitLoop = false;

        while (!exitLoop) {

          if (iterator < allDateCalendar.length) {
            let dateCalendarId = allDateCalendar[iterator].id;

            iterator++;
            await this.page.evaluate((dateCalendarId) => {
              document.querySelector(dateCalendarId).click()
            }, dateCalendarId);

            await this.page.waitFor(1000);
          } else {
            exitLoop = true;
          }

          if (isReturningAllReservations) {
            allReservations.push(...await this.page.evaluate(this.crawlAllReservations));
          }
        }

        isBtnNextMonthEnable = await this.clickBtnNextMonth();

      } while (isBtnNextMonthEnable);

      let time2 = new Date();
      console.log(time2 - time1);

      return allReservations;
    } catch (error) {
      console.error(error);
      return [];
    }
  }

  crawlCommuniques() {
    let communiques = {
      title: '',
      text: []
    };

    communiques.title = document.querySelector('#titre_fenetre').innerText.replace('Retour', ' ').trim();
    communiques.text = Array.from(document.querySelectorAll('.message'), element => element.innerText);//document.querySelectorAll('.message').innerText;

    return communiques;
  }

  async crawlUserCurrentReservations() {
    const tableCurrentReservations = {
      id: 'r-entete'
    };

    let reservationHeaderColumns = [];
    let reservations = [];

    [...document.querySelectorAll('#liste_reservation tr')].forEach(tableRow => {
      if (tableRow.id === tableCurrentReservations.id) {
        reservationHeaderColumns = [...tableRow.children].map(node => node.className);
      } else {
        let reservation = {};

        reservation.id = tableRow.id;

        [...tableRow.children].map(node => {
          reservation[node.className] = node.innerText;
        });

        reservations.push(reservation);
      }
    });

    return {
      reservationHeaderColumns,
      reservations
    }
  }

  async crawlAllReservations() {
    const TYPE_PLAYERS = 'TYPE_PLAYERS';
    const TYPE_RED_ALERT = 'TYPE_RED_ALERT';
    const TYPE_BLUE_LESSON = 'TYPE_BLUE_LESSON';
    const TYPE_CLEAN_COURT = 'TYPE_CLEAN_COURT';
    const TYPE_CLOSE = 'TYPE_CLOSE';
    const TYPE_DARK_RED_ALERT = 'TYPE_DARK_RED_ALERT';

    let getReservationType = (backgroundColor) => {
      if (backgroundColor === 'rgb(255, 204, 204)' || backgroundColor === 'rgb(255, 255, 204)') return TYPE_PLAYERS;
      if (backgroundColor === 'rgb(255, 128, 128)') return TYPE_RED_ALERT;
      if (backgroundColor === 'rgb(128, 128, 255)') return TYPE_BLUE_LESSON;
      if (backgroundColor === 'rgb(255, 255, 128)') return TYPE_CLEAN_COURT;
      if (backgroundColor === 'rgb(204, 204, 204)') return TYPE_CLOSE;
      if (backgroundColor === 'rgb(191, 96, 96)') return TYPE_DARK_RED_ALERT;
    };

    let date = null;
    try {
      date = document.getElementById('CHAMP_SELECTEUR_JOUR').value.split(' ')[0];
    } catch (error) {
    }

    return [...document.querySelectorAll('p.ho, p.fo')].map(p => {
      let idSplitted = p.id.split('_');
      let backgroundColor = p.style.backgroundColor;

      return {
        label: p.innerText.trim(),
        courtId: idSplitted[2],
        date: date,
        startTime: {
          hours: idSplitted[0],
          minutes: idSplitted[1]
        },
        type: getReservationType(backgroundColor),
        isFree: p.childNodes.length === 0,
        width: Number(p.style.width.replace('px', ''))
      }
    }).filter(reservation => reservation.width !== 0);
  }
};
