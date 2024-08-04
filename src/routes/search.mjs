import express from "express";
import { search as searchController } from "../controllers/searchController.mjs";

const router = express.Router();

router.get("/search", searchController);

export default router;
