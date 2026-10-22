import { sqliteTable, text, integer } from "drizzle-orm/sqlite-core";
export const rooms = sqliteTable("rooms", { code: text("code").primaryKey(), revision: integer("revision").notNull().default(0), state: text("state").notNull(), updated: integer("updated").notNull() });
export const matchRecords = sqliteTable("match_records", {
 id: text("id").primaryKey(), device: text("device").notNull(), name: text("name").notNull(),
 at: integer("at").notNull(), win: integer("win").notNull(), points: integer("points").notNull(),
 size: integer("size").notNull(), result: text("result").notNull()
});
