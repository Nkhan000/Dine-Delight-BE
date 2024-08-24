class APIFeatures {
  constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
  }

  filter() {
    // FILTERING
    const queryObj = { ...this.queryString };
    const excludedFields = ['page', 'sort', 'limit', 'fields'];
    excludedFields.forEach((el) => delete queryObj[el]);

    // console.log(queryObj);
    // ADVANCE FILTERING
    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

    // console.log(JSON.parse(queryStr));

    this.query = this.query.find(JSON.parse(queryStr));
    // let query = Cuisine.find(JSON.parse(queryStr));
    return this;
  }

  // SORTING
  sort() {
    if (this.queryString.sort) {
      const sortBy = this.queryString.sort().split(',').join(' ');
      this.query = this.query.sort(sortBy);
    }
    // else {
    // this.query = this.query.sort('ratingsAverage');
    // return this;
    // }
    return this;
  }

  // FIELD LIMITING
  limitFields() {
    if (this.queryString.field) {
      const fields = this.queryString.field.split(',').join(' ');
      this.query = this.query.select(fields);
    } else {
      this.query = this.query.select('-__v');
    }
    return this;
  }

  // PAGINATION
  pagination() {
    const page = parseInt(this.queryString.page, 10) || 1;
    const limit = parseInt(this.queryString.limit, 10);
    const skip = (page - 1) * limit;

    this.query = this.query.skip(skip).limit(limit);
    console.log(this.query);
    return this;
  }
}

module.exports = APIFeatures;

// DIRECT IMPLEMENTATION BEFORE REFACTORING
// Query Building
// // FILTERING
// const queryObj = { ...req.query };
// const excludedFields = ['page', 'sort', 'limit', 'fields'];
// excludedFields.forEach((el) => delete queryObj[el]);

// console.log(queryObj);
// // ADVANCE FILTERING
// let queryStr = JSON.stringify(queryObj);
// queryStr = queryStr.replace(/\b(gte|gt|lt|lte)\b/g, (match) => `$${match}`);

// console.log(JSON.parse(queryStr));

// let query = Cuisine.find(JSON.parse(queryStr));

// // SORTING
// if (req.query.sort) {
//   const sortBy = req.query.sort().split(',').join(' ');
//   query = query.sort(sortBy);
// } else {
//   query = query.sort('ratingsAverage');
// }

// // FIELD LIMITING
// if (req.query.field) {
//   const fields = req.query.field.split(',').join(' ');
//   query = query.select(fields);
// } else {
//   query = query.select('-__v');
// }

// // PAGINATION
// const page = req.query.page * 1 || 1;
// const limit = req.query.limit * 1 || 5;
// const skip = (page - 1) * limit;

// query = query.skip(skip).limit(limit);

// if (req.query.page) {
//   const numDocuments = await Cuisine.countDocuments();
//   if (skip > numDocuments) throw new Error('This page does not exist');
// }
