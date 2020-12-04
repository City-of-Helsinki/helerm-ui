const dotenv = require('dotenv');
dotenv.config();
const express = require('express');
const bodyParser = require('body-parser');
const cookieParser = require('cookie-parser');
const cookieSession = require('cookie-session');
const path = require('path');
const authRoutes = require('./routes/auth');
const { passport } = require('./controllers/authController');

const app = express();

app.use(cookieParser());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(
  cookieSession({
    name: 's',
    secret: process.env.JWT_TOKEN,
    maxAge: 86400 * 1000
  })
);
app.use(passport.initialize());
app.use(passport.session());
app.use('/auth', authRoutes);

if (process.env.NODE_ENV === 'production') {
  app.use(express.static(path.resolve('./build')));
}
const port = process.env.PORT || 3030;
app.listen(port, () => console.log(`server running on port ${port}`));
