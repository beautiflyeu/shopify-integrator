"use client";

import { useState } from "react";
import { Plus, RotateCcw, Trash2, Pencil } from "lucide-react";
import { useCategoryRulesStore } from "@/stores/category-rules";
import { RuleEditor } from "@/components/rule-editor";
import { Switch } from "@/components/ui/switch";
import type { CategoryRule } from "@/config/category-rules";

export default function RulesPage() {
  const { rules, autoSuggest, addRule, updateRule, deleteRule, resetToDefaults, setAutoSuggest } = useCategoryRulesStore();
  const [adding, setAdding] = useState(false);
  const [editingIndex, setEditingIndex] = useState<number | null>(null);

  function handleAdd(rule: CategoryRule) {
    addRule(rule);
    setAdding(false);
  }

  function handleUpdate(index: number, rule: CategoryRule) {
    updateRule(index, rule);
    setEditingIndex(null);
  }

  return (
    <div className="p-6 max-w-3xl space-y-4">
      <div className="rounded-lg border border-border bg-muted/30 px-4 py-3 flex items-center justify-between gap-4">
        <div>
          <p className="text-sm font-medium">Auto-sugestia kategorii</p>
          <p className="text-xs text-muted-foreground mt-0.5">
            Automatycznie proponuje kategorię przy wejściu w produkt (jeśli żadna nie jest przypisana)
          </p>
        </div>
        <Switch checked={autoSuggest} onCheckedChange={setAutoSuggest} />
      </div>

      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-lg font-semibold">Reguły kategorii</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Słowa kluczowe → automatyczne mapowanie na kategorię Shopify
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => { if (confirm("Przywrócić domyślne reguły?")) resetToDefaults(); }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm text-muted-foreground border border-border hover:bg-muted transition-colors"
          >
            <RotateCcw className="h-3.5 w-3.5" />
            Resetuj
          </button>
          <button
            type="button"
            onClick={() => { setAdding(true); setEditingIndex(null); }}
            className="flex items-center gap-1.5 rounded-md px-3 py-1.5 text-sm font-medium bg-primary text-primary-foreground hover:bg-primary/90 transition-colors"
          >
            <Plus className="h-3.5 w-3.5" />
            Dodaj regułę
          </button>
        </div>
      </div>

      {adding && (
        <RuleEditor onSave={handleAdd} onCancel={() => setAdding(false)} />
      )}

      <div className="space-y-2">
        {rules.map((rule, i) => (
          <div key={i} className="rounded-md border border-border bg-background">
            {editingIndex === i ? (
              <div className="p-3">
                <RuleEditor
                  initial={rule}
                  onSave={(r) => handleUpdate(i, r)}
                  onCancel={() => setEditingIndex(null)}
                />
              </div>
            ) : (
              <div className="flex items-start justify-between gap-4 px-4 py-3">
                <div className="flex-1 min-w-0 space-y-1.5">
                  <div className="flex flex-wrap gap-1">
                    {rule.keywords.map((kw) => (
                      <span key={kw} className="inline-block rounded bg-muted px-1.5 py-0.5 font-mono text-[10px]">
                        {kw}
                      </span>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground truncate">
                    <span className="text-foreground font-medium">
                      {rule.englishFullName.split(" > ").pop()}
                    </span>
                  </p>
                </div>
                <div className="flex items-center gap-1 shrink-0">
                  <button
                    type="button"
                    onClick={() => { setEditingIndex(i); setAdding(false); }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground transition-colors"
                  >
                    <Pencil className="h-3.5 w-3.5" />
                  </button>
                  <button
                    type="button"
                    onClick={() => { if (confirm("Usunąć tę regułę?")) deleteRule(i); }}
                    className="rounded p-1.5 text-muted-foreground hover:bg-destructive/10 hover:text-destructive transition-colors"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
