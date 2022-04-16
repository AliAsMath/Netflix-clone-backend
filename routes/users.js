const router = require("express").Router();
const User = require("../model/User");
const CryptoJS = require("crypto-js");
const tokenVerify = require("../middleware/token-verify");

//update user
router.put("/:id", tokenVerify, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin)
    return res.status(403).json("You cant update other users");

  if (req.body.password)
    req.body.password = CryptoJS.AES.encrypt(
      req.body.password,
      process.env.SECRET_KEY
    ).toString();

  try {
    const updatedUser = await User.findByIdAndUpdate(
      req.params.id,
      { $set: { ...req.body } },
      { new: true }
    );

    const { password, ...info } = updatedUser._doc;

    res.status(200).json({ user: info });
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//Delete
router.delete("/:id", tokenVerify, async (req, res) => {
  if (req.user.id !== req.params.id && !req.user.isAdmin)
    return res.status(403).json("You cant delete other users");

  try {
    await User.findByIdAndDelete(req.params.id);

    res.status(200).json("User deleted");
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get
router.get("/find/:id", async (req, res) => {
  try {
    const user = await User.findById(req.params.id);

    const { password, ...info } = user._doc;

    res.status(201).json({ user: info });
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get all
router.get("/", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin) return res.status(403).json("You are not admin");
  try {
    const users = req.query.new
      ? await User.find({}, { password: 0 }).sort({ createdAt: -1 }).limit(5)
      : await User.find({}, { password: 0 });

    res.status(201).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get stat
router.get("/stats", async (req, res) => {
  try {
    const users = await User.aggregate([
      {
        $project: {
          monthDate: { $month: "$createdAt" },
        },
      },
      {
        $group: {
          _id: "$monthDate",
          total: { $sum: 1 },
        },
      },
    ]).sort({ _id: 1 });

    res.status(201).json(users);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;
