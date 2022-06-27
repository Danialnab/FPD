const mongoose = require("mongoose");
const Schema = mongoose.Schema;
const mongoosepaginate = require("mongoose-paginate-v2");

const LogSchema = new Schema(
  {
    action: String,
    owner: {
      type: Schema.Types.ObjectId,
      ref: "User",
    },
  },
  { timestamps: true }
);

LogSchema.plugin(mongoosepaginate);

module.exports = mongoose.model("Log", LogSchema);
