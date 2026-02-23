/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */

import { useState, useEffect } from 'react';
import { GoogleGenAI, Type } from "@google/genai";
import { motion, AnimatePresence } from "motion/react";
import { 
  Sparkles, 
  Cloud, 
  Sun, 
  Wind, 
  Thermometer, 
  Palette, 
  ShoppingBag, 
  ArrowRight, 
  RefreshCw,
  Shirt,
  CheckCircle2,
  Info
} from 'lucide-react';
import { clsx, type ClassValue } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

// --- Types ---

interface OutfitComponent {
  item: string;
  description: string;
  category: 'top' | 'bottom' | 'outerwear' | 'footwear' | 'accessory';
}

interface OutfitRecommendation {
  title: string;
  colorPalette: {
    name: string;
    colors: string[];
  };
  components: OutfitComponent[];
  layeringAdvice?: string;
  stylePsychology: string;
}

// --- Constants ---

const OCCASIONS = [
  'Casual', 'Office', 'Party', 'Wedding', 'Travel', 'Date Night', 'Formal Event', 'Gym/Athletic', 'Brunch'
];

const MOODS = [
  'Confident', 'Relaxed', 'Bold', 'Elegant', 'Playful', 'Powerful', 'Minimalist', 'Bohemian'
];

// --- Components ---

export default function App() {
  const [occasion, setOccasion] = useState('');
  const [weather, setWeather] = useState('');
  const [mood, setMood] = useState('');
  const [loading, setLoading] = useState(false);
  const [recommendation, setRecommendation] = useState<OutfitRecommendation | null>(null);
  const [error, setError] = useState<string | null>(null);

  const generateOutfit = async () => {
    if (!occasion) return;

    setLoading(true);
    setError(null);
    
    try {
      const ai = new GoogleGenAI({ apiKey: process.env.GEMINI_API_KEY });
      const model = "gemini-3-flash-preview";

      const prompt = `You are "CoutureMind," an elite AI fashion stylist. 
      Curate a personalized outfit for the following:
      Occasion: ${occasion}
      Weather: ${weather || 'Not specified'}
      Mood/Vibe: ${mood || 'Not specified'}

      Provide a complete, head-to-toe outfit recommendation.
      The response must be in JSON format.`;

      const response = await ai.models.generateContent({
        model,
        contents: [{ parts: [{ text: prompt }] }],
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.OBJECT,
            properties: {
              title: { type: Type.STRING, description: "A catchy title for the look" },
              colorPalette: {
                type: Type.OBJECT,
                properties: {
                  name: { type: Type.STRING },
                  colors: { type: Type.ARRAY, items: { type: Type.STRING }, description: "Hex codes or color names" }
                },
                required: ["name", "colors"]
              },
              components: {
                type: Type.ARRAY,
                items: {
                  type: Type.OBJECT,
                  properties: {
                    item: { type: Type.STRING },
                    description: { type: Type.STRING },
                    category: { type: Type.STRING, enum: ['top', 'bottom', 'outerwear', 'footwear', 'accessory'] }
                  },
                  required: ["item", "description", "category"]
                }
              },
              layeringAdvice: { type: Type.STRING },
              stylePsychology: { type: Type.STRING }
            },
            required: ["title", "colorPalette", "components", "stylePsychology"]
          }
        }
      });

      const result = JSON.parse(response.text || '{}');
      setRecommendation(result);
    } catch (err) {
      console.error(err);
      setError("The stylist is currently unavailable. Please try again in a moment.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-[#f5f2ed] text-[#1a1a1a] font-sans selection:bg-[#1a1a1a] selection:text-white">
      {/* Header */}
      <header className="border-b border-black/10 px-6 py-4 flex justify-between items-center sticky top-0 bg-[#f5f2ed]/80 backdrop-blur-md z-50">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 bg-[#1a1a1a] rounded-full flex items-center justify-center">
            <Sparkles className="text-white w-4 h-4" />
          </div>
          <span className="font-serif text-xl tracking-tight font-bold">CoutureMind</span>
        </div>
        <nav className="hidden md:flex gap-8 text-[11px] uppercase tracking-[0.2em] font-semibold">
          <a href="#" className="hover:opacity-50 transition-opacity">Collections</a>
          <a href="#" className="hover:opacity-50 transition-opacity">Trends</a>
          <a href="#" className="hover:opacity-50 transition-opacity">About</a>
        </nav>
      </header>

      <main className="max-w-6xl mx-auto px-6 py-12 md:py-20">
        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* Left Column: Form */}
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="space-y-12"
          >
            <div className="space-y-4">
              <h1 className="font-serif text-6xl md:text-8xl leading-[0.9] tracking-tighter">
                Your Personal <br />
                <span className="italic font-light">Stylist</span>
              </h1>
              <p className="text-black/60 max-w-md text-lg leading-relaxed">
                Elevate your presence with AI-curated looks tailored to your occasion, mood, and the elements.
              </p>
            </div>

            <div className="space-y-8">
              {/* Occasion Selection */}
              <div className="space-y-4">
                <label className="text-[11px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                  <ShoppingBag className="w-3 h-3" /> Select Occasion
                </label>
                <div className="flex flex-wrap gap-2">
                  {OCCASIONS.map((o) => (
                    <button
                      key={o}
                      onClick={() => setOccasion(o)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-all duration-300",
                        occasion === o 
                          ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg" 
                          : "border-black/10 hover:border-black/40"
                      )}
                    >
                      {o}
                    </button>
                  ))}
                </div>
              </div>

              {/* Weather Input */}
              <div className="space-y-4">
                <label className="text-[11px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                  <Cloud className="w-3 h-3" /> Current Weather
                </label>
                <input 
                  type="text"
                  placeholder="e.g. Sunny 75°F, Rainy, Cold morning..."
                  value={weather}
                  onChange={(e) => setWeather(e.target.value)}
                  className="w-full bg-transparent border-b border-black/20 py-3 focus:outline-none focus:border-black transition-colors text-xl font-serif italic"
                />
              </div>

              {/* Mood Selection */}
              <div className="space-y-4">
                <label className="text-[11px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                  <Palette className="w-3 h-3" /> Desired Vibe
                </label>
                <div className="flex flex-wrap gap-2">
                  {MOODS.map((m) => (
                    <button
                      key={m}
                      onClick={() => setMood(m)}
                      className={cn(
                        "px-4 py-2 rounded-full border text-sm transition-all duration-300",
                        mood === m 
                          ? "bg-[#1a1a1a] border-[#1a1a1a] text-white shadow-lg" 
                          : "border-black/10 hover:border-black/40"
                      )}
                    >
                      {m}
                    </button>
                  ))}
                </div>
              </div>

              <button
                disabled={!occasion || loading}
                onClick={generateOutfit}
                className={cn(
                  "w-full py-6 rounded-full flex items-center justify-center gap-3 text-lg font-medium transition-all duration-500 group relative overflow-hidden",
                  !occasion || loading 
                    ? "bg-black/5 text-black/20 cursor-not-allowed" 
                    : "bg-[#1a1a1a] text-white hover:scale-[1.02] active:scale-[0.98]"
                )}
              >
                {loading ? (
                  <>
                    <RefreshCw className="w-5 h-5 animate-spin" />
                    <span>Curating your look...</span>
                  </>
                ) : (
                  <>
                    <span>Generate Outfit</span>
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </button>

              {error && (
                <p className="text-red-500 text-sm text-center font-medium">{error}</p>
              )}
            </div>
          </motion.div>

          {/* Right Column: Result */}
          <div className="relative min-h-[600px]">
            <AnimatePresence mode="wait">
              {!recommendation && !loading && (
                <motion.div 
                  key="empty"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full border border-dashed border-black/20 rounded-[40px] flex flex-col items-center justify-center p-12 text-center space-y-6"
                >
                  <div className="w-20 h-20 bg-black/5 rounded-full flex items-center justify-center">
                    <Shirt className="w-8 h-8 text-black/20" />
                  </div>
                  <div className="space-y-2">
                    <h3 className="font-serif text-2xl">Your Lookbook Awaits</h3>
                    <p className="text-black/40 max-w-[280px]">
                      Select an occasion and vibe to see your personalized recommendation.
                    </p>
                  </div>
                </motion.div>
              )}

              {loading && (
                <motion.div 
                  key="loading"
                  initial={{ opacity: 0 }}
                  animate={{ opacity: 1 }}
                  exit={{ opacity: 0 }}
                  className="h-full bg-white rounded-[40px] shadow-2xl flex flex-col items-center justify-center p-12 space-y-8"
                >
                  <div className="relative">
                    <div className="w-24 h-24 border-4 border-black/5 border-t-black rounded-full animate-spin" />
                    <Sparkles className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-8 h-8 text-black animate-pulse" />
                  </div>
                  <div className="text-center space-y-2">
                    <p className="text-[11px] uppercase tracking-[0.3em] font-bold text-black/40">Analyzing Trends</p>
                    <h3 className="font-serif text-3xl italic">Crafting Perfection...</h3>
                  </div>
                </motion.div>
              )}

              {recommendation && !loading && (
                <motion.div 
                  key="result"
                  initial={{ opacity: 0, scale: 0.95, y: 20 }}
                  animate={{ opacity: 1, scale: 1, y: 0 }}
                  className="bg-white rounded-[40px] shadow-2xl overflow-hidden flex flex-col h-full"
                >
                  {/* Result Header */}
                  <div className="p-8 md:p-10 border-b border-black/5 space-y-6">
                    <div className="flex justify-between items-start">
                      <div className="space-y-1">
                        <p className="text-[11px] uppercase tracking-widest font-bold text-black/40">Curated Look</p>
                        <h2 className="font-serif text-4xl leading-tight">{recommendation.title}</h2>
                      </div>
                      <div className="flex -space-x-2">
                        {recommendation.colorPalette.colors.map((color, i) => (
                          <div 
                            key={i}
                            className="w-8 h-8 rounded-full border-2 border-white shadow-sm"
                            style={{ backgroundColor: color }}
                            title={color}
                          />
                        ))}
                      </div>
                    </div>
                    
                    <div className="flex items-center gap-4 text-sm font-medium text-black/60">
                      <span className="flex items-center gap-1.5">
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {occasion}
                      </span>
                      {mood && (
                        <span className="flex items-center gap-1.5">
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" /> {mood}
                        </span>
                      )}
                    </div>
                  </div>

                  {/* Result Content */}
                  <div className="flex-1 p-8 md:p-10 space-y-10 overflow-y-auto max-h-[500px] custom-scrollbar">
                    {/* Components Grid */}
                    <div className="grid gap-6">
                      {recommendation.components.map((comp, i) => (
                        <div key={i} className="flex gap-4 group">
                          <div className="w-12 h-12 rounded-2xl bg-[#f5f2ed] flex items-center justify-center shrink-0 group-hover:bg-[#1a1a1a] group-hover:text-white transition-colors">
                            <CategoryIcon category={comp.category} />
                          </div>
                          <div className="space-y-1">
                            <h4 className="font-bold text-sm uppercase tracking-wide">{comp.item}</h4>
                            <p className="text-sm text-black/60 leading-relaxed">{comp.description}</p>
                          </div>
                        </div>
                      ))}
                    </div>

                    {/* Layering Advice */}
                    {recommendation.layeringAdvice && (
                      <div className="p-6 bg-[#f5f2ed] rounded-3xl space-y-3">
                        <h4 className="text-[11px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                          <Wind className="w-3 h-3" /> Layering Strategy
                        </h4>
                        <p className="text-sm italic leading-relaxed text-black/70">
                          "{recommendation.layeringAdvice}"
                        </p>
                      </div>
                    )}

                    {/* Style Psychology */}
                    <div className="space-y-3">
                      <h4 className="text-[11px] uppercase tracking-widest font-bold text-black/40 flex items-center gap-2">
                        <Info className="w-3 h-3" /> Style Psychology
                      </h4>
                      <p className="text-sm leading-relaxed text-black/80 font-medium">
                        {recommendation.stylePsychology}
                      </p>
                    </div>
                  </div>

                  {/* Footer Action */}
                  <div className="p-8 border-t border-black/5 bg-[#f5f2ed]/30">
                    <button 
                      onClick={() => setRecommendation(null)}
                      className="text-sm font-bold uppercase tracking-widest flex items-center gap-2 hover:gap-3 transition-all"
                    >
                      <RefreshCw className="w-4 h-4" /> Start New Curation
                    </button>
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="max-w-6xl mx-auto px-6 py-12 border-t border-black/10 mt-20">
        <div className="flex flex-col md:flex-row justify-between items-center gap-8">
          <div className="font-serif text-2xl font-bold">CoutureMind</div>
          <p className="text-sm text-black/40">© 2026 CoutureMind AI. All rights reserved.</p>
          <div className="flex gap-6 text-[11px] uppercase tracking-widest font-bold">
            <a href="#" className="hover:opacity-50 transition-opacity">Privacy</a>
            <a href="#" className="hover:opacity-50 transition-opacity">Terms</a>
            <a href="#" className="hover:opacity-50 transition-opacity">Instagram</a>
          </div>
        </div>
      </footer>

      <style dangerouslySetInnerHTML={{ __html: `
        .custom-scrollbar::-webkit-scrollbar {
          width: 4px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: transparent;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(0,0,0,0.1);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(0,0,0,0.2);
        }
      `}} />
    </div>
  );
}

function CategoryIcon({ category }: { category: OutfitComponent['category'] }) {
  switch (category) {
    case 'top': return <Shirt className="w-5 h-5" />;
    case 'bottom': return <div className="w-5 h-5 border-2 border-current rounded-sm" />;
    case 'outerwear': return <Wind className="w-5 h-5" />;
    case 'footwear': return <ArrowRight className="w-5 h-5 rotate-45" />;
    case 'accessory': return <Sparkles className="w-5 h-5" />;
    default: return <Shirt className="w-5 h-5" />;
  }
}
