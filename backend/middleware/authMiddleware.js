const jwt = require("jsonwebtoken")
const blacklistModel = require("../models/blacklist")
const authMiddle = async (req, res, next) => {
console.log(req)
    try {
console.log("hello")
        const accesstoken = req.cookies.token.accesstoken || null;
        const rToken = req.cookies.token.refreshToken || null;
console.log(rToken,accesstoken,"hello")
        if (accesstoken) {

            let existingToken = await blacklistModel.find({ blacklist: { $in: accesstoken } });

            if (existingToken.length > 0) {

                res.status(400).send({ error: "Please login again" });
            }

            jwt.verify(accesstoken, "pravin", (err, decoded) => {

                if (decoded) {

                    req.userid = decoded.user_id;
                    req.username = decoded.username;
                    console.log(req.userid)
                    next();
                }
                else {


                    jwt.verify(rToken, "pravin", (err, decoded) => {

                        if (decoded) {
                
                            const accesstoken = jwt.sign({ user_id: User._id, username: User.username }, "pravin", { expiresIn: "1d" });

                            jwt.verify(accesstoken, "pravin", (err, decoded) => {

                                if (decoded) {
                
                                    req.userid = decoded.user_id;
                                    req.username = decoded.username;
                                    next();
                                }
                            })
                
                        }
                        else {
                
                            res.send({ "error": "Please login Again" })
                        }
                    })
                }
            })
        }
        else {

            res.status(400).send("Please login first")

        }

    } catch (error) {

        res.status(400).send({error})

    }




}

module.exports = authMiddle;