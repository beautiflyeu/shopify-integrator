export interface CategoryRule {
  keywords: string[];
  englishFullName: string;
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["led", "fototerapia", "fototerapii", "światłem", "beautilight", "skinglow", "skinclear"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools > LED Light Therapy Devices",
  },
  {
    keywords: ["hydrodermabrazja", "hydro", "hydraclear", "dermabrazja", "kawitacyjny", "cavitation", "ultrasonic"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools",
  },
  {
    keywords: ["darsonval", "d'arsonval", "ionsteam", "steam", "parowy"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools",
  },
  {
    keywords: ["masażer", "masaż", "massage", "lipomassage", "antycellulitowy", "cellulite"],
    englishFullName: "Health & Beauty > Personal Care > Massage & Relaxation > Massagers",
  },
  {
    keywords: ["ems", "femmeform", "elektrostymulacja", "microcurrent", "rf", "radiofrequency"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Cosmetic Tools > Skin Care Tools > Microcurrent & EMS Facial Devices",
  },
  {
    keywords: ["prostownica", "aeroprostownica", "dualperfection", "straightener"],
    englishFullName: "Health & Beauty > Personal Care > Hair Care > Hair Styling Tools > Hair Straighteners",
  },
  {
    keywords: ["suszarka", "suszarki", "ionboost", "dryer"],
    englishFullName: "Health & Beauty > Personal Care > Hair Care > Hair Styling Tools > Hair Dryers",
  },
  {
    keywords: ["klamra", "opaska", "spinka", "spinki"],
    englishFullName: "Apparel & Accessories > Clothing Accessories > Hair Accessories > Hair Pins, Claws & Clips",
  },
  {
    keywords: ["manicure", "paznokcie", "nail"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Nail Care",
  },
  {
    keywords: ["mist", "skinmist", "nawilżanie", "mgiełka"],
    englishFullName: "Health & Beauty > Personal Care > Cosmetics > Skin Care",
  },
];
