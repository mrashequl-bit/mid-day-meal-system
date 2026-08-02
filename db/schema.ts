import { sql } from "drizzle-orm";
import {
  index,
  integer,
  sqliteTable,
  text,
  uniqueIndex,
} from "drizzle-orm/sqlite-core";

export const areasTable = sqliteTable(
  "areas",
  {
    code: text("code").primaryKey(),
    nameBn: text("name_bn").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    managerName: text("manager_name"),
    managerMobile: text("manager_mobile"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [uniqueIndex("areas_name_bn_unique").on(table.nameBn)],
);

export const schoolsTable = sqliteTable(
  "schools",
  {
    emisCode: text("emis_code").primaryKey(),
    nameBn: text("name_bn").notNull(),
    areaCode: text("area_code")
      .notNull()
      .references(() => areasTable.code),
    headTeacher: text("head_teacher"),
    legacyMobile: text("legacy_mobile"),
    currentDailyDemand: integer("current_daily_demand").notNull(),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("schools_area_code_idx").on(table.areaCode),
    index("schools_name_bn_idx").on(table.nameBn),
  ],
);

export const demandHistoryTable = sqliteTable(
  "school_demand_history",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    schoolEmisCode: text("school_emis_code")
      .notNull()
      .references(() => schoolsTable.emisCode),
    previousDemand: integer("previous_demand").notNull(),
    newDemand: integer("new_demand").notNull(),
    effectiveFrom: text("effective_from").notNull(),
    reason: text("reason").notNull(),
    status: text("status", {
      enum: ["draft", "submitted", "verified", "approved", "rejected"],
    })
      .notNull()
      .default("approved"),
    changedBy: text("changed_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("demand_history_school_date_idx").on(
      table.schoolEmisCode,
      table.effectiveFrom,
    ),
  ],
);

export const auditLogsTable = sqliteTable(
  "audit_logs",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    actor: text("actor").notNull(),
    action: text("action").notNull(),
    entityType: text("entity_type").notNull(),
    entityId: text("entity_id").notNull(),
    beforeJson: text("before_json"),
    afterJson: text("after_json"),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("audit_entity_idx").on(table.entityType, table.entityId),
    index("audit_created_at_idx").on(table.createdAt),
  ],
);

export const stockBalancesTable = sqliteTable("stock_balances", {
  itemCode: text("item_code").primaryKey(),
  itemNameBn: text("item_name_bn").notNull(),
  unit: text("unit").notNull().default("piece"),
  currentQuantity: integer("current_quantity").notNull().default(0),
  minimumLevel: integer("minimum_level").notNull().default(0),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const suppliersTable = sqliteTable(
  "suppliers",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    itemCode: text("item_code")
      .notNull()
      .references(() => stockBalancesTable.itemCode),
    name: text("name").notNull(),
    ownerName: text("owner_name"),
    mobile: text("mobile"),
    address: text("address"),
    defaultUnitPricePoisha: integer("default_unit_price_poisha")
      .notNull()
      .default(0),
    isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("suppliers_item_code_idx").on(table.itemCode),
    uniqueIndex("suppliers_item_name_unique").on(table.itemCode, table.name),
  ],
);

export const stockTransactionsTable = sqliteTable(
  "stock_transactions",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    itemCode: text("item_code")
      .notNull()
      .references(() => stockBalancesTable.itemCode),
    transactionType: text("transaction_type", {
      enum: [
        "opening",
        "stock_in",
        "stock_out",
        "damaged",
        "returned",
        "adjustment_add",
        "adjustment_sub",
      ],
    }).notNull(),
    quantity: integer("quantity").notNull(),
    previousBalance: integer("previous_balance").notNull(),
    newBalance: integer("new_balance").notNull(),
    transactionDate: text("transaction_date").notNull(),
    note: text("note"),
    supplierId: integer("supplier_id").references(() => suppliersTable.id),
    areaCode: text("area_code").references(() => areasTable.code),
    unitPricePoisha: integer("unit_price_poisha").notNull().default(0),
    totalAmountPoisha: integer("total_amount_poisha").notNull().default(0),
    paidAmountPoisha: integer("paid_amount_poisha").notNull().default(0),
    dueAmountPoisha: integer("due_amount_poisha").notNull().default(0),
    actor: text("actor").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("stock_transactions_item_date_idx").on(
      table.itemCode,
      table.transactionDate,
    ),
    index("stock_transactions_supplier_idx").on(table.supplierId),
  ],
);

export const distributionReportsTable = sqliteTable(
  "distribution_reports",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    date: text("date").notNull(),
    schoolEmisCode: text("school_emis_code")
      .notNull()
      .references(() => schoolsTable.emisCode),
    areaCode: text("area_code")
      .notNull()
      .references(() => areasTable.code),
    plannedBread: integer("planned_bread").notNull().default(0),
    plannedEgg: integer("planned_egg").notNull().default(0),
    plannedBanana: integer("planned_banana").notNull().default(0),
    receivedBread: integer("received_bread").notNull().default(0),
    receivedEgg: integer("received_egg").notNull().default(0),
    receivedBanana: integer("received_banana").notNull().default(0),
    shortageBread: integer("shortage_bread").notNull().default(0),
    shortageEgg: integer("shortage_egg").notNull().default(0),
    shortageBanana: integer("shortage_banana").notNull().default(0),
    excessBread: integer("excess_bread").notNull().default(0),
    excessEgg: integer("excess_egg").notNull().default(0),
    excessBanana: integer("excess_banana").notNull().default(0),
    problemType: text("problem_type").notNull(),
    reason: text("reason").notNull(),
    comments: text("comments"),
    proofUrl: text("proof_url"),
    status: text("status", {
      enum: ["new", "under_review", "partially_resolved", "resolved", "cancelled"],
    })
      .notNull()
      .default("new"),
    reportedBy: text("reported_by").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
    updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    uniqueIndex("dist_rep_date_school_unique").on(
      table.date,
      table.schoolEmisCode,
    ),
    index("dist_rep_area_idx").on(table.areaCode),
    index("dist_rep_date_idx").on(table.date),
  ],
);

export const notificationsTable = sqliteTable(
  "notifications",
  {
    id: integer("id").primaryKey({ autoIncrement: true }),
    type: text("type").notNull(),
    title: text("title").notNull(),
    message: text("message").notNull(),
    link: text("link"),
    isRead: integer("is_read", { mode: "boolean" }).notNull().default(false),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("notifications_is_read_idx").on(table.isRead),
  ],
);

export const usersTable = sqliteTable("users", {
  id: integer("id").primaryKey({ autoIncrement: true }),
  username: text("username").notNull().unique(),
  password: text("password").notNull(),
  name: text("name").notNull(),
  role: text("role").notNull(),
  areaCode: text("area_code").references(() => areasTable.code),
  isActive: integer("is_active", { mode: "boolean" }).notNull().default(true),
  createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  updatedAt: text("updated_at").notNull().default(sql`CURRENT_TIMESTAMP`),
});

export const sessionsTable = sqliteTable(
  "sessions",
  {
    tokenHash: text("token_hash").primaryKey(),
    userId: integer("user_id")
      .notNull()
      .references(() => usersTable.id, { onDelete: "cascade" }),
    expiresAt: text("expires_at").notNull(),
    createdAt: text("created_at").notNull().default(sql`CURRENT_TIMESTAMP`),
  },
  (table) => [
    index("sessions_user_id_idx").on(table.userId),
    index("sessions_expires_at_idx").on(table.expiresAt),
  ],
);
