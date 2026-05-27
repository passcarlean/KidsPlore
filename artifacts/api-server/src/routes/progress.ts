import { Router, type IRouter } from "express";
import { eq } from "drizzle-orm";
import { db, progressTable } from "@workspace/db";
import {
  GetProgressQueryParams,
  SaveProgressBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/progress", async (req, res): Promise<void> => {
  const parsed = GetProgressQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { playerName } = parsed.data;

  if (playerName) {
    const [record] = await db
      .select()
      .from(progressTable)
      .where(eq(progressTable.playerName, playerName));

    if (!record) {
      const [newRecord] = await db
        .insert(progressTable)
        .values({ playerName, totalPoints: 0, level: 1, missionsCompleted: 0, gamesPlayed: 0, animationsCreated: 0 })
        .returning();
      res.json(newRecord);
      return;
    }

    res.json(record);
    return;
  }

  const [first] = await db.select().from(progressTable).limit(1);
  if (!first) {
    res.json({ id: 0, playerName: "Explorer", totalPoints: 0, level: 1, missionsCompleted: 0, gamesPlayed: 0, animationsCreated: 0 });
    return;
  }
  res.json(first);
});

router.post("/progress", async (req, res): Promise<void> => {
  const parsed = SaveProgressBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { playerName, ...updates } = parsed.data;

  const [existing] = await db
    .select()
    .from(progressTable)
    .where(eq(progressTable.playerName, playerName));

  if (existing) {
    const [updated] = await db
      .update(progressTable)
      .set(updates)
      .where(eq(progressTable.playerName, playerName))
      .returning();
    res.status(201).json(updated);
    return;
  }

  const [created] = await db
    .insert(progressTable)
    .values({ playerName, ...updates })
    .returning();
  res.status(201).json(created);
});

export default router;
