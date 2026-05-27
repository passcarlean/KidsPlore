import { Router, type IRouter } from "express";
import healthRouter from "./health";
import scoresRouter from "./scores";
import achievementsRouter from "./achievements";
import progressRouter from "./progress";
import missionsRouter from "./missions";

const router: IRouter = Router();

router.use(healthRouter);
router.use(scoresRouter);
router.use(achievementsRouter);
router.use(progressRouter);
router.use(missionsRouter);

export default router;
