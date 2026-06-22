export interface CategoryRule {
  keywords: string[];
  category: string;
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["led", "fototerapia", "fototerapii", "światłem", "light", "glow", "aura", "beautilight", "skinglow", "skinclear"],
    category: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools > LED Light Therapy Devices",
  },
  {
    keywords: ["hydrodermabrazja", "hydro", "hydraclear", "dermabrazja", "peeling"],
    category: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools",
  },
  {
    keywords: ["darsonval", "d'arsonval", "ionsteam", "ion", "steam", "parowy"],
    category: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools",
  },
  {
    keywords: ["masażer", "masaż", "massage", "lipomassage", "antycellulitowy", "cellulite"],
    category: "Health & Beauty > Personal Care > Massage & Relaxation > Massagers",
  },
  {
    keywords: ["ems", "pas", "brzuch", "femmeform", "balance", "elektrostymulacja"],
    category: "Health & Beauty > Personal Care > Massage & Relaxation > Massagers > Electric Massagers",
  },
  {
    keywords: ["prostownica", "aeroprostownica", "dualperfection", "straightener", "flat iron"],
    category: "Health & Beauty > Personal Care > Hair Care > Hair Styling Tools > Hair Straighteners",
  },
  {
    keywords: ["klamra", "opaska", "spinka", "ha-", "spinki", "włosy", "hair"],
    category: "Apparel & Accessories > Clothing Accessories > Hair Accessories > Hair Pins, Claws & Clips",
  },
  {
    keywords: ["manicure", "paznokcie", "nail", "na-"],
    category: "Health & Beauty > Personal Care > Cosmetics > Nail Care",
  },
  {
    keywords: ["mist", "skinmist", "nawilżanie", "mgiełka", "spray"],
    category: "Health & Beauty > Personal Care > Cosmetics > Skin Care",
  },
];
