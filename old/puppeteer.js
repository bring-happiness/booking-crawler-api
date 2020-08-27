// todo: passer les identifiants/motdepasse de l'extérieur + les hacher
const puppeteer = require('puppeteer');

const clubId = '32920066';
const username = 'rialla';
const password = '426j';

let getCommuniques = () => {
  let communiques = {
    title: '',
    text: ''
  };

  communiques.title = document.querySelector('#titre_fenetre').innerText.replace('Retour', ' ').trim();
  communiques.text = document.querySelector('.message').innerText;

  return communiques;
};

let getPlayerCurrentReservations = () => {
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
};

let getAllReservations = () => {
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

  return [...document.querySelectorAll('p.ho, p.fo')].map(p => {
    let idSplitted = p.id.split('_');
    let backgroundColor = p.style.backgroundColor;

    return {
      label: p.innerText.trim(),
      courtId: idSplitted[2],
      startTime: {
        hours: idSplitted[0],
        minutes: idSplitted[1]
      },
      type: getReservationType(backgroundColor),
      isFree: p.childNodes.length === 0,
      width: Number(p.style.width.replace('px', ''))
    }
  });
};

let clickIfPresent = async (page, selector) => {
  let element = await page.$(selector);

  if (element) {
    page.click(selector);
  }
};

(async () => {
  const browser = await puppeteer.launch({headless: false});
  const page = await browser.newPage();
  await page.goto('https://www.adsltennis.fr/_start/index.php?club=' + clubId);

  await page.waitForSelector('.bloc');

  await page.type('.bloc p input[type="text"]', username);
  await page.type('.bloc p input[type="password"]', password);

  try {
    let time1 = new Date();
    await Promise.all([
      page.waitForSelector('.fiche_messages', {timeout: 3000}),
      page.click('#btn_identification'),
    ]);

    let communiques = await page.evaluate(getCommuniques);
    let time2 = new Date();
    console.log(time2 - time1);
    console.log(communiques)
  } catch (error) {
    console.error(error)
  }

  /*try {
    let time1 = new Date();
    await Promise.all([
      page.waitForSelector('.fic_adherent_reservation', {timeout: 3000}),
      page.click('#btn_identification'),
    ]);

    let currentReservations = await page.evaluate(getPlayerCurrentReservations);
    let time2 = new Date();
    console.log(time2 - time1);
    console.log(currentReservations)
  } catch (error) {
    console.error(error)
  }*/

  try {
    let time1 = new Date();
    await Promise.all([
      page.waitForSelector('.fiche_reservation', {timeout: 3000}),
      clickIfPresent(page, '#liste_reservation + button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-icon-primary'),
      clickIfPresent(page, '.message + button.ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-icon-primary'),
    ]);

    await page.waitFor(800);

    let allReservations = await page.evaluate(getAllReservations);
    console.log(allReservations);
    let time2 = new Date();
    console.log(time2 - time1);
  } catch (error) {
    console.error(error)
  }

  await page.screenshot({path: 'example.png'});
  await browser.close();
})();

