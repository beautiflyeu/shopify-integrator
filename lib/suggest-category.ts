import { CATEGORY_RULES, type CategoryRule } from "@/config/category-rules";

export function suggestCategory(
  name: string,
  model?: string | null,
  rules: CategoryRule[] = CATEGORY_RULES
): string | null {
  const text = `${name} ${model ?? ""}`.toLowerCase();
  let best: { english: string; score: number } | null = null;

  for (const rule of rules) {
    const score = rule.keywords.filter((kw) => text.includes(kw)).length;
    if (score > 0 && (!best || score > best.score)) {
      best = { english: rule.englishFullName, score };
    }
  }

  return best?.english ?? null;
}

export function suggestTopCategories(
  name: string,
  model?: string | null,
  limit = 3,
  rules: CategoryRule[] = CATEGORY_RULES
): string[] {
  const text = `${name} ${model ?? ""}`.toLowerCase();
  const seen = new Set<string>();

  return rules
    .map((rule) => ({
      english: rule.englishFullName,
      score: rule.keywords.filter((kw) => text.includes(kw)).length,
    }))
    .filter(({ score, english }) => {
      if (score === 0 || seen.has(english)) return false;
      seen.add(english);
      return true;
    })
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map(({ english }) => english);
}
