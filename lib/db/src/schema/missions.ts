import { pgTable, text, serial, integer, boolean } from "drizzle-orm/pg-core";
import { createInsertSchema } from "drizzle-zod";
import { z } from "zod/v4";

export const missionsTable = pgTable("missions", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  description: text("description").notNull(),
  difficulty: text("difficulty").notNull(),
  world: text("world").notNull(),
  starCount: integer("star_count").notNull().default(0),
  isUnlocked: boolean("is_unlocked").notNull().default(false),
});

export const insertMissionSchema = createInsertSchema(missionsTable).omit({ id: true });
export type InsertMission = z.infer<typeof insertMissionSchema>;
export type Mission = typeof missionsTable.$inferSelect;
