import { Router } from "express";
import {
  getBarChartData,
  getCategory,
  getData,
  getStats,
  postData,
} from "../controllers/data.controller.js";
const router = Router();

router.route("/post-data").post(postData);
router.route("/get-data").get(getData);
router.route("/get-stats").get(getStats);
router.route("/get-barchart-data").get(getBarChartData);
router.route("/get-categories").get(getCategory);

export default router;
