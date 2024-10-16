const mongoose = require('mongoose');
const { trim, isLowercase } = require('validator');

const foodItemSchema = new mongoose.Schema({
  name: {
    type: String,
    required: true,
    trim: true,
    lowercase: true,
    unique: true,
  },
  prices: {
    type: Object,
    required: true,
  },
  quantityPerServing: {
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  type: {
    // veg, non-veg
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  category: {
    //
    type: String,
    trim: true,
    lowercase: true,
    required: true,
  },
  mainIngredients: {
    type: [String],
    trim: true,
    lowercase: true,
    required: true,
  },
  image: {
    type: String,
    // default: 'food-001.jpg',
  },
});

const foodMenuSchema = new mongoose.Schema({
  foodItems: [foodItemSchema],
  categories: {
    type: [String],
  },
  cuisineId: {
    type: mongoose.Schema.ObjectId,
    ref: 'Cuisine',
  },
});
const FoodMenu = mongoose.model('FoodMenu', foodMenuSchema);
module.exports = FoodMenu;

// "foodMenu" : [
//   {"name" : "Steamed momos", "price" : 23, "category" : "momo", "type" : "veg", "quantityPerServing" : "10pcs", "mainIngredients" : ["onion", "capcicum","cheese", "olive oil"]},
//       {"name" : "Hakka noodle", "price" : 23, "category" : "noodle", "type" : "veg", "quantityPerServing" : "1", "mainIngredients" : ["onion", "capcicum","cheese", "olive oil"]},
//       {"name" : "Farmhouse pizza", "price" : 23,"category" : "pizza", "type" : "non-veg", "size" : "m", "quantityPerServing" : "1", "mainIngredients" : ["onion", "capcicum","cheese", "olive oil"]},
//       {"name" : "Chicken fiesta pizza", "price" : 23, "category" : "momo", "type" : "veg", "size" : "m", "quantityPerServing" : "1", "mainIngredients" : ["onion", "capcicum","cheese", "olive oil"]}
// ]
