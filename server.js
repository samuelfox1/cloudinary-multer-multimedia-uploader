const express = require('express');
const { engine } = require('express-handlebars').create({});
const morgan = require('morgan')
const path = require('path');
const controller = require('./controller')

const PORT = process.env.PORT || 3001;

const app = express();
app.engine('handlebars', engine);
app.set('view engine', 'handlebars');
app.use(express.static(path.join(__dirname, 'public')));
app.use('/', controller)
app.use(morgan('dev')) // log traffic activity to console
app.listen(PORT, () => console.log('Server listening on: http://localhost:' + PORT));