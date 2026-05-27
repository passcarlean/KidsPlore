import { Router, type IRouter } from "express";
import { desc, eq, avg, count, sql } from "drizzle-orm";
import { db, scoresTable } from "@workspace/db";
import {
  ListScoresQueryParams,
  SubmitScoreBody,
} from "@workspace/api-zod";

const router: IRouter = Router();

router.get("/scores", async (req, res): Promise<void> => {
  const parsed = ListScoresQueryParams.safeParse(req.query);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const { game, limit = 20 } = parsed.data;

  let query = db.select().from(scoresTable).orderBy(desc(scoresTable.score));

  if (game) {
    query = db
      .select()
      .from(scoresTable)
      .where(eq(scoresTable.game, game))
      .orderBy(desc(scoresTable.score)) as typeof query;
  }

  const scores = await query.limit(Number(limit));
  res.json(
    scores.map((s) => ({
      ...s,
      createdAt: s.createdAt.toISOString(),
    }))
  );
});

router.post("/scores", async (req, res): Promise<void> => {
  const parsed = SubmitScoreBody.safeParse(req.body);
  if (!parsed.success) {
    res.status(400).json({ error: parsed.error.message });
    return;
  }

  const [score] = await db.insert(scoresTable).values(parsed.data).returning();
  res.status(201).json({
    ...score,
    createdAt: score.createdAt.toISOString(),
  });
});

router.get("/scores/stats", async (_req, res): Promise<void> => {
  const [totalPlayersResult] = await db
    .select({ count: sql<number>`cast(count(distinct ${scoresTable.playerName}) as integer)` })
    .from(scoresTable);

  const [totalGamesResult] = await db
    .select({ count: sql<number>`cast(count(*) as integer)` })
    .from(scoresTable);

  const [avgResult] = await db
    .select({ avg: avg(scoresTable.score) })
    .from(scoresTable);

  const topGameResult = await db
    .select({
      game: scoresTable.game,
      cnt: sql<number>`cast(count(*) as integer)`,
    })
    .from(scoresTable)
    .groupBy(scoresTable.game)
    .orderBy(desc(sql`count(*)`))
    .limit(1);

  res.json({
    totalPlayers: totalPlayersResult?.count ?? 0,
    totalGamesPlayed: totalGamesResult?.count ?? 0,
    topGame: topGameResult[0]?.game ?? "Robotics",
    averageScore: Math.round(Number(avgResult?.avg ?? 0)),
  });
});

export default router;
