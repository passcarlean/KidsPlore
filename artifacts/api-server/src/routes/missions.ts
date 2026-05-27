import { Router, type IRouter } from "express";
import { db, missionsTable } from "@workspace/db";
import { asc } from "drizzle-orm";

const router: IRouter = Router();

router.get("/progress/missions", async (_req, res): Promise<void> => {
  const missions = await db
    .select()
    .from(missionsTable)
    .orderBy(asc(missionsTable.id));
  res.json(missions);
});

export default router;
