const multer = require('multer');
const AppError = require('../utils/appError');

exports.imageUploader = () => {
  // const multerStorage = multer.diskStorage({
  //   destination: (req, file, cb) => {
  //     cb(null, `public/img/${fileName}`);
  //   },
  //   filename: (req, file, cb) => {
  //     const extension = file.mimetype.split('/')[1];
  //     cb(
  //       null,
  //       `${req.body.name.split(' ').join('_')}-${req.user._id}-${Date.now()}.${extension}`,
  //     );
  //   },
  // });
  const multerStorage = multer.memoryStorage();

  const multerFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image')) {
      cb(null, true);
    } else {
      cb(
        new AppError(
          'Not an image. Please upload only image files. (jpg, jpeg, png, ...etc)',
        ),
      );
    }
  };

  const upload = multer({
    limits: { fileSize: 20 * 1024 * 1024 },
    storage: multerStorage,
    fileFilter: multerFilter,
  });
  return upload;
};