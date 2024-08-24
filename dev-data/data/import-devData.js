const fs = require('fs');
const mongoose = require('mongoose');
const dotenv = require('dotenv');
const Cuisine = require('../../models/cuisineModel');

dotenv.config({ path: './config.env' });

const DB = process.env.DATABASE.replace(
  '<PASSWORD>',
  process.env.DATABASE_PASSWORD,
);

mongoose.connect(DB, {}).then(() => console.log('data loading successfull'));

//READ JSON FILE
const cuisineData = JSON.parse(
  fs.readFileSync(`${__dirname}/cuisines-simple.json`, 'utf-8'),
);

//IMPORT DATA TO DATABASE
const importData = async () => {
  try {
    await Cuisine.create(cuisineData);
    console.log('Data successfully loaded');
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

// DELETE ALL DATA FROM THE DATABASE
const deleteData = async () => {
  try {
    await Cuisine.deleteMany();
    process.exit();
  } catch (error) {
    console.log(error);
  }
};

if (process.argv[2] === '--import') {
  importData();
} else if (process.argv[2] === '--delete') {
  deleteData();
}
console.log(process.argv);
