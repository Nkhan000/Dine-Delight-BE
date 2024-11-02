const express = require('express');
const morgan = require('morgan');
const cuisineRoute = require('./routes/cuisineRouter');
const venueRoute = require('./routes/venueBookingRouter');
const highlightRoute = require('./routes/highlightsRouter');
const reservationRoute = require('./routes/reservationRouter');
const OAuthRoute = require('./routes/OAuthRouter');
const userRoute = require('./routes/userRouter');
const AppError = require('./utils/appError');
const globalErrorHandler = require('./controller/errorController');
const rateLimit = require('express-rate-limit');
const session = require('express-session');
const helmet = require('helmet');
const mongoSanitize = require('express-mongo-sanitize');
const xss = require('xss-clean');
const hpp = require('hpp');
const cookieParser = require('cookie-parser');
const cors = require('cors');

const app = express();

app.use(cookieParser());

// GLOBAL MIDDLEWARES
// IMPORT MIDDLEWARE TO ACCEPT CROSS ORIGIN REQUESTS
// app.use(
//   cors({
//     origin: 'http://localhost:5173',
//     credentials: true,
//     allowedHeaders: ['X-Requested-With', 'Content-Type', 'credentials'],
//     methods: ['GET', 'POST'],
//   }),
// );

app.use(
  cors({
    origin: 'http://localhost:5173', // Allow your frontend URL
    credentials: true, // Allow credentials (cookies, authorization headers)
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE'], // Allowed methods
    allowedHeaders: ['Content-Type', 'Authorization'], // Allow these headers
  }),
);

if (process.env.NODE_ENV === 'development') {
  app.use(morgan('dev'));
}

// const limiter = rateLimit({
//   max: 100,
//   windowMs: 60 * 60 * 100,
//   message:
//     'Too many request from the same IP. Please try again later in an hour',
// });
// app.use('/api', limiter);

// SET Securit HTTP headers
app.use(helmet());

//middleware serving static file
app.use('/public', express.static(`${__dirname}/public`));
// app.use('/public', express.static(`public`));
// app.use('/public', express.static(path.join(__dirname, 'public')));

//middleware -> data from the body is added to the request using this middleware
app.use(express.json({ limit: '10kb' }));

// Data sanitization against NoSql query inejction
app.use(mongoSanitize());

// Data sanitization against XSS
app.use(xss());

// preventing paramater pollution
app.use(
  hpp({
    whitelist: ['sort'],
  }),
);

app.use(
  session({
    secret: process.env.SESSION_SECRET,
    resave: false,
    saveUninitialized: false,
  }),
);

// routes
app.use('/api/v1/cuisines', cuisineRoute);
app.use('/api/v1/user', userRoute);
app.use('/api/v1/auth', OAuthRoute);
app.use('/api/v1/reservations', reservationRoute);
app.use('/api/v1/venue', venueRoute);
app.use('/api/v1/highlights', highlightRoute);
app.use((req, res, next) => {
  console.log('Cookies:', req.cookies);
  next();
});

// for undefined routes
app.all('*', (req, res, next) => {
  next(
    new AppError(
      `Can't find any resources for ${req.originalUrl} on this server`,
      404,
    ),
  );
});

// error handling middleware
app.use(globalErrorHandler);

module.exports = app;
