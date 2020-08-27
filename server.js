let express = require('express'),
  app = express(),
  port = process.env.PORT || 3000,
  bodyParser = require('body-parser');

app.use(bodyParser.urlencoded({ extended: true }));
app.use(bodyParser.json());

let routes = require('./api/routes/bookingRoutes');
routes(app);

app.use((req, res) => {
  res.status(404).send({url: req.originalUrl + ' not found'})
});


app.listen(port);

console.log('Booking Crawler RESTful API server started on: ' + port);