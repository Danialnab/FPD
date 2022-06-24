const mongoose = require("mongoose");
const Schema = mongoose.Schema;

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

module.exports = mongoose.model("Log", LogSchema);
