import { ensureDatabase } from "../../db/bootstrap";

export type MealUnitPrices = { bun: number; egg: number; banana: number };

const DEFAULT_MEAL_UNIT_PRICES: MealUnitPrices = { bun: 13.5, egg: 10, banana: 6 };

export const MEAL_PRICE_SETTING_KEYS = {
  bun: "meal_price_bun",
  egg: "meal_price_egg",
  banana: "meal_price_banana",
} as const;

export async function getMealUnitPrices(
  db: Awaited<ReturnType<typeof ensureDatabase>>,
): Promise<MealUnitPrices> {
  const rows = await db.prepare(
    "SELECT setting_key, setting_value FROM system_settings WHERE setting_key IN ('meal_price_bun','meal_price_egg','meal_price_banana')",
  ).all<{ setting_key: string; setting_value: string }>();
  const values = new Map(rows.results.map((row) => [row.setting_key, Number(row.setting_value)]));
  return Object.fromEntries(
    Object.entries(MEAL_PRICE_SETTING_KEYS).map(([code, key]) => {
      const value = values.get(key);
      const fallback = DEFAULT_MEAL_UNIT_PRICES[code as keyof MealUnitPrices];
      return [code, Number.isFinite(value) && Number(value) > 0 ? Number(value) : fallback];
    }),
  ) as MealUnitPrices;
}

export function validateMealUnitPrices(value: unknown): MealUnitPrices {
  const input = value && typeof value === "object" ? value as Record<string, unknown> : {};
  const prices = {} as MealUnitPrices;
  for (const code of Object.keys(DEFAULT_MEAL_UNIT_PRICES) as Array<keyof MealUnitPrices>) {
    const price = Number(input[code]);
    if (!Number.isFinite(price) || price <= 0 || price > 1000) {
      throw new Error("প্রতিটি পণ্যের সঠিক ক্রয়মূল্য দিন (৳০.০১ থেকে ৳১০০০)।");
    }
    prices[code] = Math.round(price * 100) / 100;
  }
  return prices;
}
