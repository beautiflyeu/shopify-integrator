import { CATEGORY_RULES } from "@/config/category-rules";

export function suggestCategory(name: string, model?: string | null): string | null {
  const text = `${name} ${model ?? ""}`.toLowerCase();

  let best: { category: string; score: number } | null = null;

  for (const rule of CATEGORY_RULES) {
    const score = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { category: rule.category, score };
    }
  }

  return best?.category ?? null;
}

export function suggestTopCategories(name: string, model?: string | null, limit = 3): string[] {
  const text = `${name} ${model ?? ""}`.toLowerCase();
  const seen = new Set<string>();

  return CATEGORY_RULES
    .map((rule) => ({
      category: rule.category,
      score: rule.keywords.filter((kw) => text.includes(kw)).length,
    }))
    .filter(({ score, category }) => {
      if (score === 0 || seen.has(category)) return false;
      seen.add(category);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ category }) => category);
}
