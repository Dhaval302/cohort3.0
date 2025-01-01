const express = require("express");
const cors = require("cors");
const jwt = require("jsonwebtoken");

const app = express();

app.use(express.json())
app.use(cors()); // 

const JWT_SECRET = "USER_APP";

const users = []

app.post("/signup", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    if (users.find(user => user.username === username)) {
        res.send({
            message: "Username already exists"
        })
        return;
    }

    users.push({
        username,
        password
    })
    res.send({
        message: "You have signed up"
    })
});

function auth(req, res, next) {
    const token = req.headers.authorization;

    if (token) {
        jwt.verify(token, JWT_SECRET, (err, decoded) => {
            if (err) {
                res.status(401).send({
                    message: "Unauthorized"
                })
            } else {
                req.user = decoded;
                next();
            }
        })
    } else {
        res.status(401).send({
            message: "Unauthorized"
        })
    }
}


app.post("/signin", (req, res) => {
    const username = req.body.username;
    const password = req.body.password;

    const user = users.find(user => user.username === username && user.password === password);

    if (user) {
        const token = jwt.sign({
            username: user.username
        }, JWT_SECRET);

        res.header("jwt", token);
        res.json({
            token
        })

        console.log(users);
    } else {
        res.status(401).send({
            message: "Invalid username or password"
        })
    }
});


app.get("/me", auth, (req, res) => {
    const token = req.headers.authorization;
    const userDetails = jwt.verify(token, JWT_SECRET);

    const username =  userDetails.username;
    const user = users.find(user => user.username === username);

    if (user) {
        res.send({
            username: user.username
        })
    } else {
        res.status(401).send({
            message: "Unauthorized"
        })
    }
})



app.get("/", function(req, res) {
    res.sendFile(__dirname + "/public/index.html");
});

app.listen(3000);