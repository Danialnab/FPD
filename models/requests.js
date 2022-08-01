const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosepaginate = require("mongoose-paginate-v2");

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

ReqSchema.plugin(mongoosepaginate);
module.exports = mongoose.model("Request", ReqSchema);
