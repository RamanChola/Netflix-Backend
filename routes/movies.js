const router = require("express").Router();
const Movie = require("../models/Movie");

const verify = require("../middleware/verifyToken");
//Create
router.post("/", verify, async (req, res) => {
  if (req.user) {
    if (req.user.isAdmin) {
      const newMovie = new Movie(req.body);
      try {
        const savedMovie = await newMovie.save();
        res.status(201).json(savedMovie);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(500).json("You are not allowed");
    }
  }
});

//Update Movie

router.put("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const updatedMovie = await Movie.findByIdAndUpdate(
        req.params.id,
        {
          $set: req.body,
        },
        { new: true, useFindAndModify: false }
      );
      res.status(201).json(updatedMovie);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

// Delete Movie

router.delete("/:id", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      await Movie.findByIdAndDelete(req.params.id);
      res.status(201).json("Movie has been deleted");
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

// Get movie

router.get("/find/:id", verify, async (req, res) => {
  try {
    const movie = await Movie.findById(req.params.id);
    res.status(201).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

// Get random movie

router.get("/random", verify, async (req, res) => {
  const type = req.query.type;
  let movie;
  try {
    if (type === "series") {
      movie = await Movie.aggregate([
        { $match: { isSeries: true } },
        { $sample: { size: 1 } },
      ]);
    } else {
      movie = await Movie.aggregate([
        { $match: { isSeries: false } },
        { $sample: { size: 1 } },
      ]);
    }
    res.status(200).json(movie);
  } catch (error) {
    res.status(500).json(error);
  }
});

//Get all movies
router.get("/", verify, async (req, res) => {
  if (req.user.isAdmin) {
    try {
      const movies = await Movie.find();
      res.status(201).json(movies);
    } catch (error) {
      res.status(500).json(error);
    }
  } else {
    res.status(403).json("You are not allowed");
  }
});

module.exports = router;
