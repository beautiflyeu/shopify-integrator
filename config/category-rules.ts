export interface CategoryRule {
  keywords: string[];
  category: string;
}

export const CATEGORY_RULES: CategoryRule[] = [
  {
    keywords: ["led", "fototerapia", "fototerapii", "światłem", "beautilight", "skinglow", "skinclear"],
    category: "Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy > Urządzenia do terapii światłem LED",
  },
  {
    keywords: ["hydrodermabrazja", "hydro", "hydraclear", "dermabrazja", "peeling"],
    category: "Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy",
  },
  {
    keywords: ["darsonval", "d'arsonval", "ionsteam", "steam", "parowy"],
    category: "Zdrowie i uroda > Higiena osobista > Kosmetyki > Akcesoria kosmetyczne > Akcesoria do pielęgnacji twarzy",
  },
  {
    keywords: ["masażer", "masaż", "massage", "lipomassage", "antycellulitowy", "cellulite"],
    category: "Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery",
  },
  {
    keywords: ["ems", "femmeform", "elektrostymulacja"],
    category: "Zdrowie i uroda > Higiena osobista > Masaż i relaks > Masażery > Masażery elektryczne",
  },
  {
    keywords: ["prostownica", "aeroprostownica", "dualperfection", "straightener"],
    category: "Zdrowie i uroda > Higiena osobista > Pielęgnacja włosów > Narzędzia do stylizacji włosów > Prostownice do włosów",
  },
  {
    keywords: ["klamra", "opaska", "spinka", "spinki"],
    category: "Ubrania i akcesoria > Akcesoria do ubrań > Akcesoria do włosów > Szpilki, klamry i spinki do włosów",
  },
  {
    keywords: ["manicure", "paznokcie", "nail"],
    category: "Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja paznokci",
  },
  {
    keywords: ["mist", "skinmist", "nawilżanie", "mgiełka"],
    category: "Zdrowie i uroda > Higiena osobista > Kosmetyki > Pielęgnacja skóry",
  },
];
