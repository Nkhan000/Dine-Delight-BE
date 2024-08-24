const jwt = require('jsonwebtoken');
exports.signToken = (id) => {
  return jwt.sign({ id }, process.env.JWT_SECRET, {
    expiresIn: process.env.JWT_EXPIRES_IN,
  });
};
// exports.createAndSendToken = (user, statusCode, res) => {
//   const token = signToken(user._id);
//   const cookieOptions = {
//     expiresIn: new Date(
//       Date.now() + process.env.COOKIE_EXPIRES_IN * 24 * 60 * 60 * 1000,
//     ),
//     httpOnly: true,
//   };
//   res.cookie('jwt', token, cookieOptions);

//   if (process.env.NODE_ENV === 'production') cookieOptions.secure = true;
//   res.status(statusCode).json({
//     status: 'success',
//     token,
//     user,
//   });
// };
