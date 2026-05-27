import { Router, type IRouter } from "express";
import { db, achievementsTable } from "@workspace/db";

const router: IRouter = Router();

router.get("/achievements", async (_req, res): Promise<void> => {
  const achievements = await db.select().from(achievementsTable);
  res.json(achievements);
});

export default router;
