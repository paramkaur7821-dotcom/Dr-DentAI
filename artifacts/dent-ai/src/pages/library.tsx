import React, { useState } from "react";
import {
  BookOpen,
  Droplets,
  ShieldCheck,
  Apple,
  Clock,
  AlertTriangle,
  Baby,
  ChevronRight,
  X,
} from "lucide-react";

interface Article {
  id: string;
  icon: React.ReactNode;
  iconBg: string;
  category: string;
  title: string;
  summary: string;
  content: string[];
}

const ARTICLES: Article[] = [
  {
    id: "brushing",
    icon: <Droplets className="w-5 h-5" />,
    iconBg: "bg-blue-100 text-blue-600",
    category: "Daily Care",
    title: "Sahi tarike se brush karna",
    summary: "Roz 2 minute brush karo — sahi technique jaan lo",
    content: [
      "🪥 **Soft bristle brush use karo** — hard bristles se enamel damage hota hai",
      "⏱️ **2 minute brush karo** — teen section mein divide karo (upper, lower, tongue side)",
      "🔄 **Circular motion use karo** — straight sawing motion se gum damage hoti hai",
      "🌅 **Din mein 2 baar** — subah aur raat ko sone se pehle",
      "👅 **Jeebh bhi saaf karo** — bad breath zyaadtar yahan se aati hai",
      "🔁 **Har 3 mahine mein brush badlo** — worn bristles sahi saaf nahi karti",
      "💧 **Fluoride toothpaste use karo** — cavities se bachata hai",
    ],
  },
  {
    id: "flossing",
    icon: <ShieldCheck className="w-5 h-5" />,
    iconBg: "bg-green-100 text-green-600",
    category: "Prevention",
    title: "Flossing kyun zaroori hai",
    summary: "Brush se woh jagah saaf nahi hoti jo floss karta hai",
    content: [
      "🦷 **Brush sirf 60% surface saaf karta hai** — baaki 40% daanton ke beech mein hota hai",
      "🧵 **Roz raat ko floss karo** — khane ke particles aur plaque hatao",
      "💉 **Gum disease se bachata hai** — gingivitis ka sabse bada karan yahi particles hain",
      "🩺 **Sahi technique**: C-shape banao, ek ek daant ke around gently slide karo",
      "🔄 **Fresh section use karo** — ek hi piece ko mat reuse karo har daant ke liye",
      "🌿 **Water flosser bhi option hai** — jo log regular floss nahi kar paate unke liye",
    ],
  },
  {
    id: "diet",
    icon: <Apple className="w-5 h-5" />,
    iconBg: "bg-red-100 text-red-600",
    category: "Diet & Nutrition",
    title: "Daanton ke liye healthy diet",
    summary: "Kya khao aur kya avoid karo — complete guide",
    content: [
      "✅ **Kya khao:**",
      "- Dairy products (doodh, dahi, paneer) — calcium se daant strong hote hain",
      "- Crunchy vegetables (gajar, celery) — natural cleaning karte hain",
      "- Leafy greens — vitamins aur calcium bharpoor",
      "- Green tea — bacteria growth rokta hai",
      "❌ **Kya avoid karo:**",
      "- **Sugary drinks aur mithaiyan** — bacteria sugar khaake acid banate hain jo enamel gilaata hai",
      "- Sticky candies (toffee, caramel) — daanton mein chipak jaati hain",
      "- Acidic drinks (cola, nimbu) — enamel erosion",
      "- **Smoking/tobacco** — gum disease aur oral cancer ka sabse bada karan",
      "💡 **Tip:** Meetha khaane ke baad paani piyo ya kulla karo",
    ],
  },
  {
    id: "when-to-visit",
    icon: <Clock className="w-5 h-5" />,
    iconBg: "bg-purple-100 text-purple-600",
    category: "Dentist Visits",
    title: "Dentist kab jaana chahiye",
    summary: "Har 6 mahine mein checkup — aur yeh warning signs bhool mat",
    content: [
      "📅 **Routine checkup: Har 6 mahine** — wait mat karo problem aane tak",
      "🚨 **Turant jao agar:**",
      "- Toothache jo 1-2 din se zyada ho",
      "- Face ya jaw mein swelling",
      "- Gum se khoon baar baar aa raha ho",
      "- Daant toota ya hilne laga",
      "- Muh mein ulcer jo 2 hafte mein nahi bhar raha",
      "⚡ **Emergency signs — abhi jao:**",
      "- Gardan ya gale mein swelling (breathing problem)",
      "- Bahut tej bukhaar + dental dard",
      "- Trauma/injury se daant toot gaya",
      "💰 **Prevention sasta hota hai** — ek filling ₹500-1000, root canal ₹5000-15000",
    ],
  },
  {
    id: "sensitivity",
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: "bg-amber-100 text-amber-600",
    category: "Common Problems",
    title: "Teeth Sensitivity — kya karein",
    summary: "Thanda ya garam lagta hai? Yeh guide padho",
    content: [
      "🥶 **Sensitivity kya hai:** Enamel ya gum recession se dentin expose hoti hai",
      "🔍 **Causes:**",
      "- Enamel erosion (acidic food/drinks)",
      "- Gum recession",
      "- Hard brushing",
      "- Cracked tooth",
      "- Teeth grinding (bruxism)",
      "💊 **Ghar pe relief:**",
      "- Sensitivity toothpaste use karo (Sensodyne, Colgate Sensitive) — 4-6 hafton mein fark padega",
      "- Brush soft-medium bristles se, light pressure",
      "- Acidic cheezein kam karo",
      "🦷 **Dentist pe treatment:**",
      "- Fluoride varnish application",
      "- Dental bonding (exposed dentin cover karna)",
      "- Gum grafting (agar recession zyada ho)",
      "⚠️ Agar ek specific daant mein sharp throbbing pain ho — cavity ya infection bhi ho sakta hai",
    ],
  },
  {
    id: "children",
    icon: <Baby className="w-5 h-5" />,
    iconBg: "bg-pink-100 text-pink-600",
    category: "Children's Dental Health",
    title: "Bachon ke daant — parents guide",
    summary: "Pehle daant se lekar teen saal tak — complete care guide",
    content: [
      "👶 **6-8 mahine:** Pehla daant aata hai — teething normal hai",
      "🧸 **Teething relief:** Chilled (frozen nahi) teething ring, gentle gum massage",
      "🍼 **Avoid:** Raat ko bottle deke sulana — milk sugar daanton mein rehta hai",
      "🪥 **Brushing start karo:**",
      "- Pehle daant se: wet cloth ya finger brush",
      "- 2 saal se: rice-grain size toothpaste (fluoride)",
      "- 3-6 saal: pea-size toothpaste",
      "👁️ **Pehla dental visit: 1 saal ki umar ya pehle daant ke 6 mahine baad**",
      "🍬 **Sugar control:** Candy, juice, biscuit — brush karna mat bhulo",
      "⚽ **Sports:** Mouth guard use karwao contact sports mein",
      "📌 **Parents ko yaad rakhna:** Bacche khud achhi tarah 7-8 saal tak brush nahi kar paate — help karo",
    ],
  },
  {
    id: "bad-breath",
    icon: <Droplets className="w-5 h-5" />,
    iconBg: "bg-teal-100 text-teal-600",
    category: "Common Problems",
    title: "Bad Breath (Halitosis) se kaise bachein",
    summary: "Muh se badboo — causes aur permanent solution",
    content: [
      "🦠 **Sabse common cause:** Jeebh pe bacteria — 80% cases mein",
      "🔍 **Other causes:**",
      "- Dry mouth (paani kam peena)",
      "- Gum disease",
      "- Cavities",
      "- Strong foods (pyaaz, lahsun)",
      "- Tonsil stones",
      "- Sinus infection",
      "✅ **Kya karein:**",
      "- Tongue scraper use karo roz — jeebh saaf karo",
      "- Paani zyada peeyo — dry mouth se bacteria badta hai",
      "- Brush + floss roz",
      "- Mouthwash use karo (alcohol-free better hai)",
      "- Strongly flavored khaane ke baad kulla karo",
      "🚫 **Mint/gum temporary fix hai** — permanent solution brushing + hydration hai",
      "🏥 Agar brushing ke baad bhi problem ho — dentist se milna chahiye (gum disease ho sakti hai)",
    ],
  },
  {
    id: "bruxism",
    icon: <AlertTriangle className="w-5 h-5" />,
    iconBg: "bg-orange-100 text-orange-600",
    category: "Sleep & Dental Health",
    title: "Teeth Grinding (Bruxism) — neend mein daant peesna",
    summary: "Subah jaw mein dard hota hai? Yeh parhlo",
    content: [
      "😴 **Bruxism kya hai:** Neend mein ya jagte waqt daant peesna ya bhenchna",
      "🔍 **Signs:**",
      "- Subah jaw, neck ya head mein dard",
      "- Daant flat ya chip ho rahe hain",
      "- Jaw tight lagta hai",
      "- Partner ne grinding sound suni",
      "😰 **Causes:**",
      "- Stress aur anxiety (sabse common)",
      "- Sleep apnea",
      "- Certain medications",
      "- Caffeine zyada lena",
      "💊 **Treatment:**",
      "- **Night guard (mouth guard)** — dentist banata hai, neend mein lagao",
      "- Stress management — yoga, meditation",
      "- Caffeine kam karo (especially raat ko)",
      "- Jaw exercises aur massage",
      "⚠️ Treatment nahi karwaya toh daant permanently damage ho sakte hain",
    ],
  },
];

function ArticleCard({ article, onOpen }: { article: Article; onOpen: () => void }) {
  return (
    <button
      onClick={onOpen}
      className="w-full text-left bg-card border border-border/60 rounded-2xl p-4 hover:shadow-md hover:border-border transition-all group"
    >
      <div className="flex items-start gap-3">
        <div className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${article.iconBg}`}>
          {article.icon}
        </div>
        <div className="flex-1 min-w-0">
          <span className="text-xs text-primary font-medium">{article.category}</span>
          <h3 className="font-semibold text-foreground text-sm mt-0.5 leading-snug">{article.title}</h3>
          <p className="text-xs text-muted-foreground mt-1 leading-relaxed">{article.summary}</p>
        </div>
        <ChevronRight className="w-4 h-4 text-muted-foreground/50 shrink-0 mt-1 group-hover:text-primary group-hover:translate-x-0.5 transition-all" />
      </div>
    </button>
  );
}

function ArticleModal({ article, onClose }: { article: Article; onClose: () => void }) {
  return (
    <div className="fixed inset-0 z-50 flex items-end md:items-center justify-center p-0 md:p-4 bg-black/40 backdrop-blur-sm" onClick={onClose}>
      <div
        className="w-full md:max-w-lg bg-card rounded-t-3xl md:rounded-2xl border border-border shadow-2xl max-h-[90dvh] flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center gap-3 px-5 py-4 border-b border-border/50 shrink-0">
          <div className={`w-9 h-9 rounded-xl flex items-center justify-center ${article.iconBg} shrink-0`}>
            {article.icon}
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-xs text-primary font-medium">{article.category}</p>
            <h2 className="font-semibold text-foreground text-sm leading-tight">{article.title}</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-lg hover:bg-muted transition-colors text-muted-foreground"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="overflow-y-auto flex-1 px-5 py-4 space-y-1.5">
          {article.content.map((line, i) => {
            if (line.startsWith("- ")) {
              return (
                <p key={i} className="text-sm text-muted-foreground leading-relaxed pl-3 flex gap-2">
                  <span className="text-primary shrink-0 mt-0.5">•</span>
                  <span dangerouslySetInnerHTML={{ __html: line.slice(2).replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") }} />
                </p>
              );
            }
            const htmlLine = line.replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>");
            return (
              <p key={i} className={`text-sm leading-relaxed ${line.startsWith("✅") || line.startsWith("❌") || line.startsWith("🚨") || line.startsWith("⚡") ? "font-semibold text-foreground mt-3" : "text-muted-foreground"}`}
                dangerouslySetInnerHTML={{ __html: htmlLine }}
              />
            );
          })}
        </div>

        <div className="px-5 py-3 border-t border-border/40 shrink-0">
          <p className="text-xs text-muted-foreground/60 text-center">
            Yeh general information hai — dentist se consult zaroor karein
          </p>
        </div>
      </div>
    </div>
  );
}

export default function LibraryPage() {
  const [openArticle, setOpenArticle] = useState<Article | null>(null);
  const [search, setSearch] = useState("");

  const filtered = ARTICLES.filter(
    (a) =>
      search === "" ||
      a.title.toLowerCase().includes(search.toLowerCase()) ||
      a.category.toLowerCase().includes(search.toLowerCase()) ||
      a.summary.toLowerCase().includes(search.toLowerCase())
  );

  const categories = Array.from(new Set(ARTICLES.map((a) => a.category)));

  return (
    <div className="flex flex-col h-[100dvh] bg-background">
      <header className="sticky top-0 z-10 bg-background/90 backdrop-blur border-b border-border/50 px-4 md:px-6 py-4">
        <div className="max-w-3xl mx-auto">
          <div className="flex items-center gap-3 mb-1">
            <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
              <BookOpen className="w-4 h-4 text-primary" />
            </div>
            <div>
              <h1 className="text-lg font-bold text-foreground leading-none">Doctor's Library</h1>
              <p className="text-xs text-muted-foreground mt-0.5">Dental health ki poori jaankari — Hinglish mein</p>
            </div>
          </div>

          <div className="mt-3 relative">
            <BookOpen className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
            <input
              type="text"
              placeholder="Article dhundho..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-9 pr-4 py-2.5 rounded-xl border border-input bg-card text-sm focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
            <button
              onClick={() => setSearch("")}
              className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                search === ""
                  ? "bg-primary text-primary-foreground border-primary"
                  : "bg-card text-muted-foreground border-border hover:border-primary/50"
              }`}
            >
              Sabhi ({ARTICLES.length})
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSearch(cat)}
                className={`shrink-0 text-xs px-3 py-1.5 rounded-full border transition-colors ${
                  search === cat
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
        <div className="max-w-3xl mx-auto">
          {filtered.length === 0 ? (
            <div className="text-center py-12 text-muted-foreground">
              <BookOpen className="w-10 h-10 mx-auto mb-3 opacity-30" />
              <p>"{search}" ke liye koi article nahi mila</p>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {filtered.map((article) => (
                <ArticleCard key={article.id} article={article} onOpen={() => setOpenArticle(article)} />
              ))}
            </div>
          )}
        </div>
      </main>

      {openArticle && (
        <ArticleModal article={openArticle} onClose={() => setOpenArticle(null)} />
      )}
    </div>
  );
}
