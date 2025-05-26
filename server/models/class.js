const mongoose = require("mongoose");

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
  },
  {
    timestamps: true,
  }
);

module.exports = mongoose.model("class", ClassSchema);
