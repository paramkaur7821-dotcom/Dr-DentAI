import React, { useState } from "react";
import { Search, Pill, AlertTriangle, Info, ChevronDown, ChevronUp } from "lucide-react";

interface Medicine {
  id: string;
  name: string;
  genericName: string;
  category: string;
  categoryColor: string;
  usedFor: string;
  howItWorks: string;
  commonSideEffects: string[];
  importantNotes: string[];
  whenToAvoid: string;
}

const MEDICINES: Medicine[] = [
  {
    id: "amoxicillin",
    name: "Amoxicillin",
    genericName: "Amoxicillin",
    category: "Antibiotic",
    categoryColor: "bg-blue-100 text-blue-700",
    usedFor: "Dental infections, tooth abscess, gum infections ke liye use hoti hai. Yeh bacteria ko khatam karti hai.",
    howItWorks: "Yeh ek penicillin-type antibiotic hai jo bacteria ki cell wall ko destroy karti hai, jis se infection khatam hoti hai.",
    commonSideEffects: ["Nausea ya pet dard", "Diarrhea", "Skin rash (rare)", "Allergic reaction (rare — doctor ko batao)"],
    importantNotes: [
      "Doctor ki prescription ke bina mat lena",
      "Poora course complete karo — bich mein band mat karo",
      "Penicillin allergy hai toh zaroor batao",
      "Khane ke saath ya baad mein lena behtar hai",
    ],
    whenToAvoid: "Penicillin ya amoxicillin se allergy ho, ya pregnancy mein doctor se poochho.",
  },
  {
    id: "metronidazole",
    name: "Metronidazole",
    genericName: "Metronidazole (Flagyl)",
    category: "Antibiotic",
    categoryColor: "bg-blue-100 text-blue-700",
    usedFor: "Gum disease (periodontitis), anaerobic bacterial infections, aur dental abscess mein use hoti hai. Aksar amoxicillin ke saath diya jata hai.",
    howItWorks: "Yeh anaerobic bacteria (jo oxygen ke bina rehte hain) ko target karke unhe khatam karta hai — gum infections mein yahi bacteria hote hain.",
    commonSideEffects: ["Nausea, metallic taste muh mein", "Dizziness", "Diarrhea", "Tongue ka rang change ho sakta hai"],
    importantNotes: [
      "Alcohol bilkul mat peeyo — bahut bura reaction hoga",
      "Doctor ki prescription zaruri hai",
      "Poora course complete karo",
      "Pregnant women avoid karein (1st trimester)",
    ],
    whenToAvoid: "Alcohol use karne walon mein, pregnancy ke pehle 3 mahine mein, ya liver disease mein.",
  },
  {
    id: "ibuprofen",
    name: "Ibuprofen",
    genericName: "Ibuprofen (Brufen, Advil)",
    category: "Painkiller / Anti-inflammatory",
    categoryColor: "bg-orange-100 text-orange-700",
    usedFor: "Toothache, post-extraction dard, jaw dard, gum swelling mein relief deta hai. NSAID hai — dard aur swelling dono kam karta hai.",
    howItWorks: "Prostaglandins ko block karta hai — yahi chemicals dard aur swelling ka karan hote hain. Isliye double action karta hai.",
    commonSideEffects: ["Pet mein jalan ya acidity", "Nausea", "Headache (overdose mein)", "BP thoda badh sakta hai"],
    importantNotes: [
      "Khane ke baad lena — khali pet se acidity hoti hai",
      "Max 400–600mg per dose (adult) — doctor se confirm karo",
      "3 din se zyada khud se mat lo",
      "Children mein pediatric dose alag hoti hai",
    ],
    whenToAvoid: "Stomach ulcer, kidney disease, blood thinners le rahe ho, ya last trimester pregnancy mein avoid karo.",
  },
  {
    id: "paracetamol",
    name: "Paracetamol",
    genericName: "Paracetamol / Acetaminophen (Crocin, Dolo)",
    category: "Painkiller",
    categoryColor: "bg-green-100 text-green-700",
    usedFor: "Mild to moderate toothache, fever jo infection ke saath aaye, post-dental procedure pain mein safe aur effective painkiller.",
    howItWorks: "Brain mein pain signals ko reduce karta hai. Swelling pe koi effect nahi hota, lekin dard aur bukhaar mein reliable relief deta hai.",
    commonSideEffects: ["Safe dose mein side effects bahut kam hain", "Overdose se liver damage ho sakta hai — yeh sabse badi risk hai"],
    importantNotes: [
      "Adult dose: 500mg–1g (max 4g per day)",
      "Alcohol ke saath mat lo",
      "Liver problems ho toh doctor se poochho",
      "Ibuprofen se zyada gentle — stomach ke liye better",
    ],
    whenToAvoid: "Liver disease mein cautiously use karo. Alcohol use ke saath avoid karo.",
  },
  {
    id: "chlorhexidine",
    name: "Chlorhexidine Mouthwash",
    genericName: "Chlorhexidine Gluconate (Hexidine, Clohex)",
    category: "Antiseptic Mouthwash",
    categoryColor: "bg-purple-100 text-purple-700",
    usedFor: "Gum disease (gingivitis), mouth ulcers, post-surgery wound care, aur plaque control ke liye use hota hai. Dentist aksar yeh prescribe karta hai.",
    howItWorks: "Bacteria ki cell membrane ko damage karta hai aur unhe kill karta hai. Tooth aur gum surface pe lamba time tak active rehta hai.",
    commonSideEffects: ["Daanton pe brown/yellow staining (temporary)", "Taste alter ho sakta hai", "Muh sukh sakta hai (dry mouth)", "Tongue pe burning sensation"],
    importantNotes: [
      "Sirf prescribed duration ke liye use karo (usually 1–2 weeks)",
      "Khane/peene ke 30 min baad use karo",
      "Isko swallow mat karo — spit karo",
      "Brush ke turant baad nahi — 30 min ka gap rakho",
    ],
    whenToAvoid: "Children under 6 mein avoid karo. Long-term use se teeth staining aur taste change hoti hai.",
  },
  {
    id: "benzocaine",
    name: "Benzocaine Gel",
    genericName: "Benzocaine (Anbesol, Orajel)",
    category: "Topical Anesthetic",
    categoryColor: "bg-yellow-100 text-yellow-700",
    usedFor: "Toothache, mouth ulcers, teething pain (bachon mein), injection site numbing ke liye topically use hota hai.",
    howItWorks: "Local nerve signals ko temporarily block karta hai — jis jagah lagaao, wahan numbness aa jati hai. Effect 15–20 min rehta hai.",
    commonSideEffects: ["Temporary numbness (expected effect)", "Swallowing se throat numb ho sakta hai", "Rare allergic reaction"],
    importantNotes: [
      "Sirf thodi matra apply karo",
      "2 saal se chote bachon mein mat use karo",
      "Zyada use se methemoglobinemia ka risk (blood oxygen problem)",
      "Temporary relief hai — dentist visit zaruri hai",
    ],
    whenToAvoid: "Chhote bachon mein avoid karo. Baar baar use se problem mask hoti hai — underlying issue ka treat karo.",
  },
  {
    id: "clindamycin",
    name: "Clindamycin",
    genericName: "Clindamycin (Dalacin C)",
    category: "Antibiotic",
    categoryColor: "bg-blue-100 text-blue-700",
    usedFor: "Jab penicillin/amoxicillin se allergy ho, tab dental infections ke liye yeh antibiotic use ki jati hai. Serious infections mein bhi effective hai.",
    howItWorks: "Bacteria ke protein synthesis ko rok deta hai — bacteria reproduce nahi kar paata aur infection khatam hoti hai.",
    commonSideEffects: ["Diarrhea (common)", "C. difficile infection ka risk (serious)", "Nausea, vomiting", "Skin rash"],
    importantNotes: [
      "Penicillin allergy waalon ke liye alternative",
      "Diarrhea agar shuru ho — turant doctor ko batao (C. diff risk)",
      "Poora course complete karo",
      "Doctor ki prescription zaruri hai",
    ],
    whenToAvoid: "Colitis history ho, ya severe diarrhea pehle hua ho toh cautiously use karo.",
  },
  {
    id: "fluoride",
    name: "Fluoride (Gel / Varnish)",
    genericName: "Sodium Fluoride",
    category: "Preventive / Cavity Protection",
    categoryColor: "bg-teal-100 text-teal-700",
    usedFor: "Tooth enamel ko strong banata hai, cavities se bachata hai, sensitivity kam karta hai. Dentist office mein varnish apply hoti hai, ya ghar mein gel use hota hai.",
    howItWorks: "Enamel mein absorb hoke hydroxyapatite ko fluorapatite mein convert karta hai — jo acid attack se zyada resistant hoti hai.",
    commonSideEffects: ["Safe dose mein koi side effect nahi", "Fluorosis (zyada dose se — white spots on teeth) — sirf developing teeth mein"],
    importantNotes: [
      "Fluoride toothpaste roz use karo",
      "Bachon mein pea-size amount hi use karo",
      "After fluoride varnish — 30 min kuch mat khao/peeyo",
      "Best preventive measure for cavities",
    ],
    whenToAvoid: "Fluoride overdose se fluorosis hoti hai — isliye bachon mein measured amount use karo.",
  },
  {
    id: "dexamethasone",
    name: "Dexamethasone",
    genericName: "Dexamethasone (Decadron)",
    category: "Corticosteroid",
    categoryColor: "bg-red-100 text-red-700",
    usedFor: "Wisdom tooth removal ya major dental surgery ke baad swelling aur inflammation reduce karne ke liye. Doctor specifically prescribe karta hai.",
    howItWorks: "Powerful anti-inflammatory steroid hai — immune response ko temporarily suppress karta hai, jis se post-surgical swelling dramatically kam hoti hai.",
    commonSideEffects: ["Blood sugar temporarily badh sakta hai", "Appetite increase", "Short course mein serious side effects rare hain"],
    importantNotes: [
      "Sirf dentist/doctor ki prescription pe lena",
      "Short course hota hai (1–3 din) — abruptly band nahi karna",
      "Diabetic patients — blood sugar monitor karo",
      "Self-medicate bilkul mat karo",
    ],
    whenToAvoid: "Uncontrolled diabetes, active infection (without antibiotic cover), ya immunocompromised patients mein caution.",
  },
];

const CATEGORIES = ["Sabhi", "Antibiotic", "Painkiller", "Painkiller / Anti-inflammatory", "Antiseptic Mouthwash", "Topical Anesthetic", "Preventive / Cavity Protection", "Corticosteroid"];

function MedicineCard({ medicine }: { medicine: Medicine }) {
  const [expanded, setExpanded] = useState(false);

  return (
    <div className="bg-card border border-border/60 rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow">
      <button
        className="w-full text-left p-4 md:p-5"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-start justify-between gap-3">
          <div className="flex items-start gap-3 min-w-0">
            <div className="shrink-0 w-10 h-10 rounded-xl bg-primary/10 flex items-center justify-center mt-0.5">
              <Pill className="w-5 h-5 text-primary" />
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2 flex-wrap">
                <h3 className="font-semibold text-foreground text-base">{medicine.name}</h3>
                <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${medicine.categoryColor}`}>
                  {medicine.category}
                </span>
              </div>
              <p className="text-sm text-muted-foreground mt-0.5">{medicine.genericName}</p>
              <p className="text-sm text-foreground/80 mt-2 leading-relaxed line-clamp-2">{medicine.usedFor}</p>
            </div>
          </div>
          <div className="shrink-0 text-muted-foreground mt-1">
            {expanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
          </div>
        </div>
      </button>

      {expanded && (
        <div className="px-4 pb-5 md:px-5 border-t border-border/40 pt-4 space-y-4">
          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1.5 flex items-center gap-1.5">
              <Info className="w-3.5 h-3.5 text-primary" /> Kaise kaam karta hai
            </h4>
            <p className="text-sm text-muted-foreground leading-relaxed">{medicine.howItWorks}</p>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1.5">Common Side Effects</h4>
            <ul className="space-y-1">
              {medicine.commonSideEffects.map((se, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-primary mt-0.5">•</span>
                  {se}
                </li>
              ))}
            </ul>
          </div>

          <div>
            <h4 className="text-sm font-semibold text-foreground mb-1.5">Zaruri Baatein</h4>
            <ul className="space-y-1">
              {medicine.importantNotes.map((note, i) => (
                <li key={i} className="text-sm text-muted-foreground flex items-start gap-2">
                  <span className="text-amber-500 mt-0.5">✓</span>
                  {note}
                </li>
              ))}
            </ul>
          </div>

          <div className="bg-destructive/8 border border-destructive/20 rounded-xl p-3">
            <p className="text-sm text-destructive/80 flex items-start gap-2">
              <AlertTriangle className="w-4 h-4 shrink-0 mt-0.5 text-destructive" />
              <span><strong>Kab avoid karein:</strong> {medicine.whenToAvoid}</span>
            </p>
          </div>
        </div>
      )}
    </div>
  );
}

export default function MedicinesPage() {
  const [search, setSearch] = useState("");
  const [activeCategory, setActiveCategory] = useState("Sabhi");

  const filtered = MEDICINES.filter((m) => {
    const matchSearch =
      search === "" ||
      m.name.toLowerCase().includes(search.toLowerCase()) ||
      m.genericName.toLowerCase().includes(search.toLowerCase()) ||
      m.usedFor.toLowerCase().includes(search.toLowerCase());
    const matchCategory = activeCategory === "Sabhi" || m.category === activeCategory;
    return matchSearch && matchCategory;
  });

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/50 px-4 md:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <h1 className="text-xl font-bold text-foreground">Dental Medicines</h1>
          <p className="text-sm text-muted-foreground mt-0.5">
            Common dental medicines ki general information — sirf awareness ke liye
          </p>

          <div className="mt-3 relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Medicine ka naam search karein..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1 scrollbar-hide">
            {["Sabhi", "Antibiotic", "Painkiller", "Antiseptic Mouthwash", "Topical Anesthetic", "Preventive / Cavity Protection", "Corticosteroid"].map((cat) => (
              <button
                key={cat}
                onClick={() => setActiveCategory(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  activeCategory === cat
                    ? "bg-primary text-primary-foreground border-primary"
                    : "bg-card text-muted-foreground border-border hover:border-primary/50"
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="flex-1 overflow-y-auto px-4 md:px-6 py-4">
        <div className="max-w-3xl mx-auto space-y-3">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <Pill className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>Koi medicine nahi mili "{search}" ke liye</p>
            </div>
          ) : (
            filtered.map((m) => <MedicineCard key={m.id} medicine={m} />)
          )}
        </div>

        <div className="max-w-3xl mx-auto mt-6 mb-4">
          <div className="flex items-start gap-2 text-xs text-muted-foreground bg-muted/50 rounded-xl p-3">
            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5 text-amber-500" />
            <p>Yeh information sirf general awareness ke liye hai. Koi bhi medicine apne aap mat lo — hamesha licensed dentist ya doctor ki prescription lein. Yeh AI advice hai, professional medical advice ki jagah nahi.</p>
          </div>
        </div>
      </main>
    </div>
  );
}
