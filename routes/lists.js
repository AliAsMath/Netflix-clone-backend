const router = require("express").Router();
const List = require("../model/List");
const tokenVerify = require("../middleware/token-verify");

//create list
router.post("/", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can create list");

  try {
    const newList = new List(req.body);
    const list = await newList.save();

    res.status(201).json(list);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//delete list
router.delete("/:id", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can delete list");

  try {
    await List.findByIdAndDelete(req.params.id);

    res.status(201).json("List was deleted!");
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get random lists
router.get("/", tokenVerify, async (req, res) => {
  const type = req.query.type;
  const genre = req.query.genre;

  let lists;

  try {
    //specific list
    if (type && genre) {
      lists = await List.aggregate([
        { $sample: { size: 10 } },
        { $match: { type, genre } },
      ]);
    }
    //movie or series page
    else if (type && !genre) {
      lists = await List.aggregate([
        { $sample: { size: 10 } },
        { $match: { type } },
      ]);
    }
    //home page
    else if (!type) {
      lists = await List.aggregate([{ $sample: { size: 10 } }]);
    }

    res.status(201).json(lists);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;
