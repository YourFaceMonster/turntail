import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", { code: text("code").primaryKey(), revision: integer("revision").notNull().default(0), state: text("state").notNull(), updated: integer("updated").notNull() });
export const matchRecords = sqliteTable("match_records", {
 id: text("id").primaryKey(), device: text("device").notNull(), name: text("name").notNull(),
 at: integer("at").notNull(), win: integer("win").notNull(), points: integer("points").notNull(),
 size: integer("size").notNull(), result: text("result").notNull()
});
export const sharedScores = sqliteTable("shared_scores", {
 id:text("id").primaryKey(),device:text("device").notNull(),name:text("name").notNull(),
 mode:text("mode").notNull(),size:integer("size").notNull(),kind:text("kind").notNull(),
 score:integer("score").notNull(),at:integer("at").notNull(),entryId:text("entry_id").notNull()
});

export const recordRetention=sqliteTable('record_retention',{id:text('id').primaryKey(),cursor:text('cursor').notNull().default(''),complete:integer('complete').notNull().default(0)});
