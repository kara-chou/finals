const mongoose = require("mongoose");

const CategorySchema = new mongoose.Schema({
  name: String,
  weight: String,
  weightValue: Number,
  cutoff: String,
  cutoffValue: Number,
  grade: String,
  gradeValue: Number,
});

const ClassSchema = new mongoose.Schema(
  {
    userId: {
      type: String,
      required: true,
    },
    name: {
      type: String,
      required: true,
    },
    currentGrade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    desiredGrade: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    finalWeight: {
      type: Number,
      required: true,
      min: 0,
      max: 100,
    },
    isUsingCategories: {
      type: Boolean,
      default: false,
    },
    categories: {
      type: [CategorySchema],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("class", ClassSchema);
