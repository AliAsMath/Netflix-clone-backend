const router = require("express").Router();
const User = require("../model/User");
const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

//register user
router.post("/register", async (req, res) => {
  const newUser = new User({
    username: req.body.username,
    email: req.body.email,

    password: CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString(),
  });

  try {
    const user = await newUser.save();
    const { password, ...info } = user._doc;

    res.status(201).json({ user: info });
  } catch (err) {
    res.status(500).json(err.message);
    console.log(err.message);
  }
});

//login user
router.post("/login", async (req, res) => {
  try {
    const user = await User.findOne({ email: req.body.email });
    if (!user) return res.status(404).json("User not found");

    const bytes = CryptoJS.AES.decrypt(user.password, process.env.SECRET_KEY);
    const originalPassword = bytes.toString(CryptoJS.enc.Utf8);

    if (req.body.password !== originalPassword)
      return res.status(403).json("Password incorrect");

    const { password, ...info } = user._doc;

    const token = jwt.sign(
      { id: user._id, isAdmin: user.isAdmin },
      process.env.SECRET_KEY,
      { expiresIn: "5d" }
    );

    res.cookie("token", token, { sameSite: "none", secure: true });
    res.status(201).json(info);
  } catch (err) {
    res.status(500).json(err.message);
    console.log(err.message);
  }
});

module.exports = router;
