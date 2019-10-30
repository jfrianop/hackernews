const express = require("express");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const User = require("./schemas/User");
const Post = require("./schemas/Post");
const Comment = require("./schemas/Comment");

const app = express();

//Connect to database
mongoose.connect(process.env.MONGODB_URI || 'mongodb://127.0.0.1:27017/hackernews', { useNewUrlParser: true, useUnifiedTopology: true });

//Middlewares
app.use(express.json());
app.use(function (req, res, next) {
    res.header("Access-Control-Allow-Origin", "*"); // update to match the domain you will make the request from
    res.header("Access-Control-Allow-Headers", "Origin, X-Requested-With, Content-Type, Accept");
    next();
});

// verificar si existe un header Authorization y si valor de ese header
// es un JWT válido. Si no es válido, devolvemos un 401.
const requireUser = async (req, res, next) => {
    const token = req.headers["authorization"];
    console.log("Request with Token: ", token)
    if (!token) {
        res.status(401).json({ error: "Not authorized" });
    } else {
        try {
            const payload = jwt.verify(token, "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E");
            const userId = payload.userId;
            const user = await User.findById(userId)
            if (user) {
                console.log("Valid user id: ", userId);
                next();
            } else {
                console.log("Invalid user id: ", userId);
                res.status(401).json({ error: "Invalid user" });
            }
        } catch (err) {
            res.status(401).json({ error: "Invalid token" });
        }
    }
};

//GET posts
app.get("/posts", async (req, res, next) => {
    try {
        const posts = await Post.find();
        console.log("Posts :", posts);

        res.json(posts);
    } catch (err) {
        next(err);
    }
});

//GET post comments by postId
app.get("/posts/:id/comments", requireUser, async (req, res, next) => {
    try {
        const post = await Post.findById(req.params.id);
        const comments = await Comment.find({ post });

        res.json(comments);
    } catch (err) {
        next(err);
    }
});

//POST Comment
app.post("/posts/:id/comments", requireUser, async (req, res, next) => {
    const newComment = { name: req.body.name, description: req.body.description };
    newComment.creationDate = new Date();

    //Get user from authorization
    const payload = jwt.verify(req.headers["authorization"], "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E")
    const userId = payload.userId
    const user = await User.findById(userId);

    //Get post from req.body
    const postId = req.params.id;
    const post = await Post.findById(postId);

    //Assign user and post to comment
    newComment.user = user;
    newComment.post = post;

    try {
        const comment = await Comment.create(newComment)
        res.json(comment);
    } catch (err) {
        next(err);
    }
});

//DELETE Comment
app.delete("/posts/:postId/comments/:commentId", requireUser, async (req, res, next) => {

    //Get user from authorization
    const payload = jwt.verify(req.headers["authorization"], "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E")
    const userId = payload.userId
    const user = await User.findById(userId);

    //Get post from req.body
    const postId = req.params.postId;
    const post = await Post.findById(postId);

    try {
        const deleted = await Comment.deleteOne({ user, post, _id: req.params.commentId })
        if (deleted.deletedCount == 0) {
            res.status(401).json({ error: "Not Authorized to Delete Comment" })
        } else {
            res.json({ ok: true });
        }
    } catch (err) {
        next(err);
    }


});

//POST posts
app.post("/posts", requireUser, async (req, res, next) => {
    const newPost = { name: req.body.name, description: req.body.description };
    newPost.creationDate = new Date();
    const payload = jwt.verify(req.headers["authorization"], "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E")
    const userId = payload.userId
    console.log("User Id: ", userId);
    const user = await User.findById(userId);
    newPost.user = user;
    console.log("Usuario Servidor : ", newPost.user);
    try {
        const post = await Post.create(newPost)
        res.json(post);
    } catch (err) {
        next(err);
    }
});



//New User
app.post("/register", async (req, res, next) => {
    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.create({ email, password });
        console.log("New User", user);
        const token = jwt.sign({ userId: user._id }, "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E")
        res.json(token);
    } catch (err) {
        next(err);
    }
});


//New Login
app.post("/login", async (req, res, next) => {

    const email = req.body.email;
    const password = req.body.password;

    try {
        const user = await User.findOne({ email });
        console.log("New Login: ", user);
        if (user && user.password === password) {
            const token = jwt.sign({ userId: user._id }, "B6419BAC2B4A48A6DBE702F8BC19EDAF301D56656CCE03639DEF2B6C0C05454E")
            res.json(token);
        } else {
            res.status(401).json({ error: "Invalid credentials " });
        }
    } catch (err) {
        next(err);
    }
});

// Error Handling
app.use((err, req, res, next) => {
    if (err.name === "ValidationError") {
        console.log(err);

        res.status(422).json({ errors: err.errors });
    } else {
        // error inesperado
        console.log(err);
        res.status(500).json({ error: err.message });
    }
});

//Initialize Server
app.listen(3001, () => {
    console.log("Listening on port 3001");
});
