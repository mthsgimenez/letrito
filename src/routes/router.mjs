import express from "express";
import searchController from "../controllers/searchController.mjs";
import lyricsController from "../controllers/lyricsController.mjs";
import imageController from "../controllers/imageController.mjs";

const router = express.Router();

router.get("/", (req, res) => {
   res.render("home", { title: "Home" });
});

router.get("/search", searchController);

router.post("/lyrics", lyricsController);

router.post("/image", imageController);

export default router;
