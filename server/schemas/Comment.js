const mongoose = require("mongoose");
//Coment Schema
const CommentSchema = mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    post: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "User"
    },
    description: {
        type: String,
        required: [true, "is required"]
    },
    creationDate: Date
});

//Post Model
module.exports = mongoose.model("Comment", CommentSchema);