//jshint esversion:6
import dotenv from "dotenv"
import express from "express";
import bodyParser from "body-parser";
import mongoose from "mongoose"
import encrypt from "mongoose-encryption"

dotenv.config(); 

const app = express();
const port = 3000;

app.use(express.static("public"));
app.set('view engine', 'ejs');
app.use(bodyParser.urlencoded({
    extended: true
}))

mongoose.connect("mongodb://localhost:27017/userDB", {useNewUrlParser: true})
.then(() => console.log("Connected to MongoDB"))
.catch(err => console.error("Could not connect to MongoDB", err));

const userSchema = new mongoose.Schema({
    email: String,
    password: String
})

userSchema.plugin(encrypt, { secret: process.env.SECRET, encryptedFields: ["password"] });

const User = new mongoose.model("User", userSchema);

app.get("/", function(req, res) {
    res.render("home");
});
 
app.get("/login", function(req, res) {
    res.render("login");
});

app.get("/register", function(req, res) {
    res.render("register");
});

app.post("/register",async function(req, res) {
    const newUser = new User ({
        email: req.body.username,
        password: req.body.password
    });
    try {
        await newUser.save();
        res.render("secrets");
    } catch (err) {
        console.log(err);
    }
})

app.post("/login", async function(req, res) {
    const username = req.body.username;
    const password = req.body.password;

    try{
        const foundUser = await User.findOne({ email: username });
        if(foundUser) {
            if(foundUser.password === password) {
                res.render("secrets");
            }
            else {
                res.send("Incorrect Password");
            }
        } else {
            res.send("User not found");
        }
    } catch(err) {
        console.log(err);
        res.send("An error occured");
    }
})

app.listen(port, () => {
    console.log(`Server is running at http://localhost:${port}`);
});