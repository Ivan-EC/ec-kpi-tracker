import {sqliteTable,text,integer} from "drizzle-orm/sqlite-core";
export const trackerValues=sqliteTable("tracker_values",{key:text("key").primaryKey(),value:text("value").notNull(),version:integer("version").notNull().default(1)});
