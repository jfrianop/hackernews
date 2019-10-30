const mongoose = require("mongoose");
//Post Schema
const PostSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    name: {
        type: String,
        required: [true, "is required"]
    },
    description: String,
    creationDate: Date
});

//Post Model
module.exports = mongoose.model("Post", PostSchema);