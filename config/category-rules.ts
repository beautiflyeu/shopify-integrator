export interface CategoryRule {
  keywords: string[];
  category: string;
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["led", "fototerapia", "fototerapii", "światłem", "light", "glow", "aura", "beautilight", "skinglow", "skinclear"],
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care > Skin Care Devices",
  },
  {
    keywords: ["hydrodermabrazja", "hydro", "hydraclear", "dermabrazja", "peeling"],
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care > Skin Care Devices",
  },
  {
    keywords: ["darsonval", "d'arsonval", "ionsteam", "ion", "steam", "parowy"],
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care > Skin Care Devices",
  },
  {
    keywords: ["masażer", "masaż", "massage", "lipomassage", "antycellulitowy", "cellulite"],
    category: "Health & Beauty > Personal Care > Massagers",
  },
  {
    keywords: ["ems", "pas", "brzuch", "femmeform", "balance", "elektrostymulacja"],
    category: "Health & Beauty > Personal Care > Massagers",
  },
  {
    keywords: ["prostownica", "aeroprostownica", "dualperfection", "straightener", "flat iron"],
    category: "Health & Beauty > Personal Care > Hair Care > Hair Straighteners & Flat Irons",
  },
  {
    keywords: ["klamra", "opaska", "spinka", "ha-", "spinki", "włosy", "hair"],
    category: "Health & Beauty > Personal Care > Hair Care > Hair Accessories",
  },
  {
    keywords: ["manicure", "paznokcie", "nail", "na-"],
    category: "Health & Beauty > Personal Care > Nail Care",
  },
  {
    keywords: ["mist", "skinmist", "nawilżanie", "mgiełka", "spray"],
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care",
  },
];
