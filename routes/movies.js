const router = require("express").Router();
const Movie = require("../model/Movie");
const tokenVerify = require("../middleware/token-verify");

//create movie
router.post("/", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can create movie");

  try {
    const newMovie = new Movie(req.body);
    const movie = await newMovie.save();

    res.status(201).json(movie);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//update movie
router.put("/:id", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can update movie");

  try {
    const updatedMovie = await Movie.findByIdAndUpdate(
      req.params.id,
      { $set: req.body },
      { new: true }
    );

    res.status(200).json({ movie: updatedMovie });
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//delete movie
router.delete("/:id", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can delete movie");

  try {
    await Movie.findByIdAndDelete(req.params.id);

    res.status(200).json("Movie was deleted!");
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get movie
router.get("/find/:id", tokenVerify, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);

    res.status(200).json(movie);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get random movie
router.get("/random", tokenVerify, async (req, res) => {
  try {
    const movie = await Movie.aggregate([
      { $match: { isSeries: req.query.type === "series" } },
      { $sample: { size: 1 } },
    ]);

    res.status(200).json(movie);
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

//get all movie
router.get("/", tokenVerify, async (req, res) => {
  if (!req.user.isAdmin)
    return res.status(403).json("Admin just can get all movie");

  try {
    const movies = await Movie.find();

    res.status(200).json(movies.reverse());
  } catch (err) {
    console.log(err);
    res.status(500).json(err.message);
  }
});

module.exports = router;
