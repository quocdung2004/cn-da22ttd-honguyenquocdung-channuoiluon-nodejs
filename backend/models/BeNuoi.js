const mongoose = require("mongoose");

const tankSchema = new mongoose.Schema({
  name: { type: String, required: [true, "Tên bể không được để trống"], trim: true },
  type: { type: String, required: [true, "Tên lươn không được để trống"] },
  size: { type: Number, required: [true, "Dung tích bể không được để trống"] },
  location: { type: String, trim: true }
}, { timestamps: true });

module.exports = mongoose.model("Tank", tankSchema);
