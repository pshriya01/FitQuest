const express = require("express");
const user = require("../models/userModel")
const route = express.Router()
const bcrypt = require("bcrypt")
const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist")


// {
//     "name": "ttstgsr",
//     "email": "sdggdfgs",
//     "password": "sdggdfgs",
//     "city": "sdfg",
//     "age": 56
//   }



//Logout Functionality
route.get("/logout", async (req, res) => {

    const { authorization } = req.headers;

    const token = authorization?.split(" ")[1] || null;

    if (token) {

        let arr = await blacklistModel.find();

        if (arr.length === 0) {

            await blacklistModel.insertMany({ blacklist: token })
            res.send({ "msg": "User has been logged out" })
        }
        else {

            await blacklistModel.updateMany({},
                { $push: { blacklist: token } })

            res.send({ "msg": "User has been logged out" })

        }



    }
    else {

        res.send("Login First")

    }

})



//Login Functionality
route.post("/login", async (req, res) => {

    const { email, password } = req.body
    try {
        const User = await user.findOne({ email });

        if (User) {
            const verify = await bcrypt.compare(password, User.password)

            if (verify) {

                const token = jwt.sign({ user_id: User._id, username: User.username }, "pravin", { expiresIn: "1d" });

                const refreshToken = jwt.sign({ user_id: User._id, username: User.username }, "pravin", { expiresIn: "2d" });

                res.status(200).send({ "msg": "Login successfull", "token": token, "rToen": refreshToken })
            }
            else {

                res.status(400).send({ "error": "Wrong credentials" })
            }

        }
        else {

            res.status(400).send("User not found")
        }


    } catch (error) {

        res.status(400).send(error)
    }
})




//Register Functionality
route.post("/register", async (req, res) => {
    const { username, email, password, confirm_password } = req.body;

    try {
        const User = await user.findOne({ email })
        const newpass = await bcrypt.hash(password, 10)
        if (User === null) {
            user.create({ ...req.body, password: newpass });

            res.status(200).send({ "msg": "The new user has been registered" })

        }

        else {

            res.send({ "msg": "The user already exist" })
        }


    }
    catch (error) {

        res.status(400).send({ "error": error })
    }
})



//Refresh Token functionality
route.get("/refreshtoken", async(req, res) => {

    const { authorization } = req.headers;

    const rToken = authorization?.split(" ")[1] || null;

    if (!rToken) {

        res.status(400).send({ error: "Please login again" })
    }

    const { email, password } = req.body
    const User = await user.findOne({email});


    jwt.verify(rToken, "pravin", (err, decoded) => {

        if (decoded) {

            const token = jwt.sign({ user_id: User._id, username: User.username }, "pravin", { expiresIn: "1d" });

            res.status(200).send({ "msg": "Login successfull", "token": token })
        }
        else {

            res.send({ "error": "Something went wrong" })
        }
    })
})

module.exports = route