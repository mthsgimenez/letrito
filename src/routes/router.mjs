import express from "express";
import asyncHandler from "express-async-handler";
import searchController from "../controllers/searchController.mjs";
import lyricsController from "../controllers/lyricsController.mjs";
import imageController from "../controllers/imageController.mjs";

const router = express.Router();

router.get("/", (req, res) => {
   res.render("home", { title: "Home" });
});

router.get("/search", asyncHandler(searchController));

router.post("/lyrics", asyncHandler(lyricsController));

router.post("/image", asyncHandler(imageController));

export default router;
