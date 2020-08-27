let casper = require('casper').create();
let utils = require('utils');

let informationsToReturn = {
  clubCommnunications: [],
  currentReservationsList: []
};

// START
casper.start('http://www.adsltennis.fr/_start/index.php?club=32920066');

// LOGIN
casper.then(function () {
  this.waitForSelector('.bloc');
});

casper.then(function () {
  this.sendKeys('.bloc p input[type="text"]', 'rialla');
  this.sendKeys('.bloc p input[type=password]', '426j');
  this.click('#btn_identification');
});

// FIRST PAGE WITH CLUB COMMUNICATIONS
casper.then(function () {
  this.waitForSelector('.messages .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-icon-primary');
});

casper.then(function () {
  informationsToReturn.clubCommnunications = this.evaluate(function () {
    let messages = __utils__.findAll('.messages .message .contenu');

    return messages.map(function (htmlElement) {
      return htmlElement.innerHTML;
    });
  });
  this.click('.messages .ui-button.ui-widget.ui-state-default.ui-corner-all.ui-button-text-icon-primary')
});

casper.then(function () {

  this.waitForSelector('#liste_reservation', function success() {
    informationsToReturn.currentReservationsList = casper.evaluate(function getReservationsInfos() {
      var selector = 'table#liste_reservation tbody tr:not(#r-entete)';
      var currentReservations = __utils__.findAll(selector);

      function getReservationDetail(id, className) {
        return document.querySelector(selector + '[id="' + id + '"] .' + className).innerText;
      }

      return currentReservations.map(function (htmlElement) {
        var id = htmlElement.id;

        return {
          id: id,
          date: getReservationDetail(id, 'date'),
          heure: getReservationDetail(id, 'heure'),
          site: getReservationDetail(id, 'site'),
          court: getReservationDetail(id, 'court'),
          jeu: getReservationDetail(id, 'jeu'),
          type: getReservationDetail(id, 'type')
        };
      });
    });
  }, function failed() {
  }, 1000);

  this.waitForSelector('#bloc_reservation', function () {
    utils.dump('2 OK');
  }, function () {
    utils.dump('2 PAS OK');
  }, 1000);
});

casper.then(function () {
  // this.capture('test.png');
  utils.dump('END');
  utils.dump(informationsToReturn);
});

casper.run();
