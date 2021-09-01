const router = require("express").Router();
const List = require("../models/List");

const verify = require("../middleware/verifyToken");
//Create
router.post("/", verify, async (req, res) => {
  if (req.user) {
    if (req.user.isAdmin) {
      const newList = new List(req.body);
      try {
        const savedList = await newList.save();
        res.status(201).json(savedList);
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(500).json("You are not allowed");
    }
  }
});
//Delete list
router.delete("/:id", verify, async (req, res) => {
  if (req.user) {
    if (req.user.isAdmin) {
      try {
        await List.findByIdAndDelete(req.params.id);
        res.status(201).json("The list was successfully deleted");
      } catch (error) {
        res.status(500).json(error);
      }
    } else {
      res.status(500).json("You are not allowed");
    }
  }
});

//Get list
router.get("/", verify, async (req, res) => {
  const typeQuery = req.query.type;
  const genreQuery = req.query.genre;
  let list;
  try {
    if (typeQuery) {
      if (genreQuery) {
        if (genreQuery === "all") {
          list = await List.aggregate([
            { $match: { type: typeQuery } },
            { $sample: { size: 10 } },
          ]);
        } else {
          list = await List.aggregate([
            { $match: { type: typeQuery, genre: genreQuery } },
            { $sample: { size: 10 } },
          ]);
        }
      } else {
        list = await List.aggregate([
          { $match: { type: typeQuery } },
          { $sample: { size: 10 } },
        ]);
      }
    } else {
      list = await List.aggregate([{ $sample: { size: 10 } }]);
    }
    res.status(200).json(list);
  } catch (error) {
    res.status(500).json(error);
  }
});

module.exports = router;
