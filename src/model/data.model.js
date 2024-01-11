import mongoose from "mongoose";

const dataSchema = mongoose.Schema({
  id: Number,
  title: String,
  price: Number,
  description: String,
  category: String,
  image: String,
  sold: Boolean,
  dateOfSale: Date,
});

const Data = mongoose.model("Data", dataSchema);
export default Data;
