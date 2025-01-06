require("dotenv").config();

const express = require("express");
const bodyParser = require("body-parser");
const _ = require("lodash");

const mongoose = require("mongoose");

const encrypt = require("mongoose-encryption");

const app = express();

app.set('view engine', 'ejs');

app.use(bodyParser.urlencoded({extended: true}));
app.use(express.static("public"));

mongoose.connect("mongodb://localhost:27017/userDB")
    .then(() => console.log("Database Connected!"))
    .catch((err) => console.log(err));

const usersSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true
    },
    password: {
        type: String,
        required: true
    }
});

const secret = process.env.SECRET;

usersSchema.plugin(encrypt, {secret: secret, encryptedFields: ["password"]});

const User = mongoose.model("User", usersSchema);


app.get("/", (req, res) => {
    res.render("home");
});

app.route("/login")

    .get((req, res) => {
        res.render("login");
    })

    .post(async (req, res) => {

        await User.findOne({email: req.body.username})
            .then((foundUser) => {
                console.log("here");
                if(foundUser) {
                    if(foundUser.password === req.body.password) {
                        res.render("secrets");
                    } else {
                        res.send("Invaild password");
                    }
                } else {
                    res.send("No match User!");
                }
            })
            .catch((err) => console.log(err));

    });


app.route("/register")

    .get((req, res) => {
        res.render("register");
    })

    .post((req, res) => {

        const newUser = new User({
            email: req.body.username,
            password: req.body.password
        });

        newUser.save()
            .then((savedUser) => {
                console.log("User saved!");
                res.render("secrets");
            })
            .catch((err) => console.log(err));

    });



app.listen("3000", () => console.log("Server started on port 3000"));