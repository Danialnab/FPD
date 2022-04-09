const mongoose = require("mongoose");
const Schema = mongoose.Schema;

const ReqSchema = new Schema(
  {
    name: String,
    link: String,
    image: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model("Request", ReqSchema);
