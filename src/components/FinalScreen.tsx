import React, { useState, useRef } from "react";
import { Team, TEAMS, getTeamFlagUrl } from "../types";
import html2canvas from "html2canvas";
import { 
  Trophy, 
  Share2, 
  Clipboard, 
  MessageCircle, 
  Check, 
  Download, 
  Instagram, 
  Sparkles, 
  Camera, 
  CheckCircle2, 
  X,
  Smartphone,
  Shield,
  Zap,
  Flame,
  ArrowRight
} from "lucide-react";

interface FinalScreenProps {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  onSubmit?: (name: string, whatsapp: string, city: string) => Promise<boolean>;
  isSubmitting?: boolean;
  hasSubmitted?: boolean;
}

export default function FinalScreen({
  champion,
  runnerUp,
  thirdPlace,
}: FinalScreenProps) {
  const [copied, setCopied] = useState(false);
  const [isCapturing, setIsCapturing] = useState(false);
  const [showGuideModal, setShowGuideModal] = useState(false);

  const storyCardRef = useRef<HTMLDivElement>(null);

  const champObj = TEAMS[champion];
  const rUpObj = TEAMS[runnerUp];
  const thirdObj = TEAMS[thirdPlace];

  const getSimulatedProbability = () => {
    if (!champion || !runnerUp) return 0;
    const cSeed = champObj?.seed || 75;
    const rSeed = rUpObj?.seed || 70;
    const tSeed = thirdObj?.seed || 65;

    const base = Math.round((cSeed * 0.5 + rSeed * 0.3 + tSeed * 0.2) * 1.02);
    return Math.min(Math.max(base, 55), 98);
  };

  const prob = getSimulatedProbability();

  const handleCopyLink = () => {
    try {
      navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch (e) {
      alert("Link copiado para a área de transferência!");
    }
  };

  const handleWhatsAppShare = () => {
    if (!champObj) return;
    const text = `🏆 Meu campeão da Copa do Mundo 2026 é o(a) ${champObj.flag} ${champObj.name}! Monte e envie seu palpite também pelo link: ${window.location.href}`;
    const url = `https://api.whatsapp.com/send?text=${encodeURIComponent(text)}`;
    window.open(url, "_blank");
  };

  const handleInstagramShare = async () => {
    if (!storyCardRef.current) return;
    setIsCapturing(true);

    try {
      // Delay so layout is perfectly drawn in background
      await new Promise((resolve) => setTimeout(resolve, 300));

      const canvas = await html2canvas(storyCardRef.current, {
        useCORS: true,
        allowTaint: false,
        scale: 2, // Scale up for beautiful clarity
        backgroundColor: "#070412",
        logging: false,
        onclone: (clonedDoc) => {
          // Remove all existing style and link tags in the cloned DOM to clean up and prevent html2canvas crashing
          const styleTags = Array.from(clonedDoc.getElementsByTagName("style"));
          const linkTags = Array.from(clonedDoc.getElementsByTagName("link"));
          
          linkTags.forEach(link => {
            if (link.rel === "stylesheet") {
              link.parentNode?.removeChild(link);
            }
          });
          styleTags.forEach(style => {
            style.parentNode?.removeChild(style);
          });

          // Compile all current document styles from memory, sanitizing any oklch or oklab colors
          let compiledCss = "";
          try {
            const sheets = Array.from(document.styleSheets);
            sheets.forEach(sheet => {
              try {
                const rules = Array.from((sheet as CSSStyleSheet).cssRules || (sheet as CSSStyleSheet).rules || []);
                rules.forEach(rule => {
                  compiledCss += rule.cssText + "\n";
                });
              } catch (innerErr) {
                // Ignore cross-origin error sheets (e.g. Google Fonts) gracefully
              }
            });
          } catch (err) {
            console.error("Error reading sheets:", err);
          }

          // Replace oklch/oklab color space functions with fallback rgb/hex format which is fully supported by html2canvas
          const cleanCss = compiledCss
            .replace(/oklch\([^)]+\)/g, "rgb(139, 92, 246)")
            .replace(/oklab\([^)]+\)/g, "rgb(139, 92, 246)");

          // Inject the cleaned and sanitized CSS to style our story card styled container in the cloned context
          const styleElement = clonedDoc.createElement("style");
          styleElement.type = "text/css";
          styleElement.appendChild(clonedDoc.createTextNode(cleanCss));
          clonedDoc.head.appendChild(styleElement);
        }
      });

      const dataUrl = canvas.toDataURL("image/png");

      // Caption message configuration
      const captionText = `🏆 Meu Pódio Oficial da Copa do Mundo 2026 está definido! 🤩\n\n🥇 Campeão: ${champObj?.name || "Indefinido"} ${champObj?.flag || ""}\n🥈 Vice: ${rUpObj?.name || "Indefinido"} ${rUpObj?.flag || ""}\n🥉 3º Lugar: ${thirdObj?.name || "Indefinido"} ${thirdObj?.flag || ""}\n\nSintonize em ultravelocidade e monte seu palpite com a @siganovaisp no link: ${window.location.origin} !\n\n#DesafioNovaISP #MeuPalpite #Copa2026 #NovaISP`;
      
      try {
        await navigator.clipboard.writeText(captionText);
      } catch (err) {
        // Fallback selection copy
        const textarea = document.createElement("textarea");
        textarea.value = captionText;
        document.body.appendChild(textarea);
        textarea.select();
        document.execCommand("copy");
        document.body.removeChild(textarea);
      }

      // Try triggering native sharing on supporting smartphones (Web Share API)
      const blob = await (await fetch(dataUrl)).blob();
      const file = new File([blob], "palpite-copa-2026.png", { type: "image/png" });

      if (navigator.share && navigator.canShare && navigator.canShare({ files: [file] })) {
        try {
          await navigator.share({
            files: [file],
            title: "Meu Desafio Copa 2026",
            text: captionText,
          });
          setIsCapturing(false);
          return;
        } catch (shareErr) {
          // If canceled, fall back to downloading below
        }
      }

      // Safe download anchor trigger
      const link = document.createElement("a");
      link.download = "podio-copa2026-novaisp.png";
      link.href = dataUrl;
      document.body.appendChild(link);
      link.click();
      document.body.removeChild(link);

      // Open instructions overlay
      setShowGuideModal(true);
    } catch (error) {
      console.error("Error capturing canvas image:", error);
      alert("Não foi possível renderizar a imagem automaticamente, mas você pode tirar um print dos seus palpites da tela!");
    } finally {
      setIsCapturing(false);
    }
  };

  const openInstagram = () => {
    window.open("https://www.instagram.com/", "_blank");
  };

  return (
    <section className="bg-[#070412] py-12 px-4 md:px-8 border-t border-purple-900/10 overflow-hidden relative" id="final-screen-section">
      {/* Immersive background glow effects */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] bg-[radial-gradient(circle_at_center,rgba(168,85,247,0.06)_0%,transparent_70%)] pointer-events-none" />
      <div className="absolute bottom-10 left-10 w-40 h-40 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.04)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Concise and impact title headers */}
        <div className="text-center mb-8">
          <span className="text-[10px] font-mono text-fuchsia-400 bg-fuchsia-500/10 px-3.5 py-1.5 rounded-full border border-fuchsia-500/20 uppercase tracking-widest font-black inline-flex items-center gap-1.5 shadow-[0_0_15px_rgba(217,70,239,0.1)]">
            <Sparkles className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            Conexão Sintonizada • Palpite Final Concluído
          </span>
          <h2 className="text-3xl md:text-5xl font-sans lg:text-6xl font-black uppercase text-white mt-4 italic tracking-tight select-none">
            🏆 Seu Pódio Supremo
          </h2>
        </div>

        {/* Screenshot / Print Optimized Frame */}
        <div className="relative border border-fuchsia-500/25 bg-gradient-to-b from-[#0c0622] via-[#06030f] to-[#020106] rounded-3xl p-6 md:p-8 mb-8 shadow-2xl overflow-hidden" id="podium-screenshot-zone">
          {/* Subtle grid pattern background for the screenshot frame */}
          <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:16px_16px] pointer-events-none" />
          
          <div className="absolute top-4 right-4 flex items-center gap-1.5 bg-fuchsia-500/20 border border-fuchsia-500/30 px-3 py-1 rounded-full text-[9px] font-mono font-black text-fuchsia-300 uppercase tracking-widest shadow-md z-10 animate-pulse">
            <Camera className="w-3 h-3 text-fuchsia-300" />
            <span>📸 Pronto para Print</span>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 relative z-10" id="podium-cards-container">
            
            {/* Champion Card (Central Highlighting) */}
            <div className="md:col-start-2 md:row-start-1 bg-gradient-to-b from-purple-950/45 via-[#100a2b] to-[#040108] rounded-3xl border-2 border-fuchsia-500 p-6 flex flex-col items-center justify-between text-center shadow-[0_0_30px_rgba(217,70,239,0.2)] transform md:scale-105 transition-all relative">
              <div className="absolute -top-3.5 left-1/2 -translate-x-1/2 bg-fuchsia-500 text-white text-[9px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider shadow-lg">
                🥇 Campeão Supremo
              </div>
              
              <div className="w-16 h-16 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full flex items-center justify-center text-4xl shadow-md my-4 animate-pulse">
                🏆
              </div>
              
              {champObj ? (
                <div className="flex flex-col items-center">
                  <img
                    src={getTeamFlagUrl(champObj.code)}
                    alt={champObj.name}
                    className="w-16 h-11 object-cover rounded-lg shadow-xl border border-fuchsia-500 mb-2.5"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="text-xl font-extrabold tracking-wide text-white font-sans uppercase">
                    {champObj.name}
                  </h3>
                </div>
              ) : (
                <span className="text-purple-400 text-xs italic">Fase de Bracket Indefinida</span>
              )}
            </div>

            {/* Runner Up Card */}
            <div className="bg-gradient-to-b from-[#0a051d] to-[#030107] rounded-3xl border border-purple-900/40 p-5 flex flex-col items-center text-center justify-between shadow-xl relative mt-4 md:mt-0">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-slate-700 text-white text-[8px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-slate-600">
                🥈 Vice-Campeão
              </div>
              
              <div className="w-12 h-12 bg-[#120a2e]/60 border border-purple-900/30 rounded-full flex items-center justify-center text-2xl my-4">
                🥈
              </div>
              
              {rUpObj ? (
                <div className="flex flex-col items-center">
                  <img
                    src={getTeamFlagUrl(rUpObj.code)}
                    alt={rUpObj.name}
                    className="w-13 h-9 object-cover rounded shadow-md border border-purple-900 mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="text-sm font-bold tracking-wide text-purple-205 py-0.5 uppercase">
                    {rUpObj.name}
                  </h3>
                </div>
              ) : (
                <span className="text-purple-500 text-xs italic">Palpite pendente</span>
              )}
            </div>

            {/* Third Place Card */}
            <div className="bg-gradient-to-b from-[#0a051d] to-[#030107] rounded-3xl border border-purple-900/40 p-5 flex flex-col items-center text-center justify-between shadow-xl relative mt-4 md:mt-0">
              <div className="absolute -top-3 left-1/2 -translate-x-1/2 bg-amber-700 text-white text-[8px] font-extrabold px-3 py-0.5 rounded-full uppercase tracking-wider border border-amber-600">
                🥉 3º Colocado
              </div>
              
              <div className="w-12 h-12 bg-amber-500/5 border border-amber-900/20 rounded-full flex items-center justify-center text-2xl my-4">
                🥉
              </div>
              
              {thirdObj ? (
                <div className="flex flex-col items-center">
                  <img
                    src={getTeamFlagUrl(thirdObj.code)}
                    alt={thirdObj.name}
                    className="w-13 h-9 object-cover rounded shadow-md border border-purple-900 mb-2"
                    referrerPolicy="no-referrer"
                  />
                  <h3 className="text-sm font-bold tracking-wide text-purple-205 py-0.5 uppercase">
                    {thirdObj.name}
                  </h3>
                </div>
              ) : (
                <span className="text-purple-500 text-xs italic">Palpite pendente</span>
              )}
            </div>
          </div>

          <div className="text-center mt-5">
            <span className="inline-block text-[11px] font-mono text-purple-250 font-black uppercase tracking-wider">
              ⚡ Você sempre conectado com a Nova ISP.
            </span>
          </div>
        </div>

        {/* Dynamic Accuracy Gauge */}
        {champObj && rUpObj && (
          <div className="max-w-xs mx-auto bg-purple-950/20 border border-purple-900/40 p-4 rounded-2xl text-center mb-8 shadow-md">
            <h4 className="text-[9px] font-mono font-bold text-purple-400 uppercase tracking-widest">
              Probabilidade Estimada de Acerto
            </h4>
            <div className="mt-2.5 flex items-center justify-center gap-3">
              <div className="relative w-12 h-12 flex items-center justify-center flex-shrink-0">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#1d1230"
                    strokeWidth="3.5"
                    fill="transparent"
                  />
                  <circle
                    cx="24"
                    cy="24"
                    r="20"
                    stroke="#d946ef"
                    strokeWidth="3.5"
                    fill="transparent"
                    strokeDasharray={125}
                    strokeDashoffset={125 - (125 * prob) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-[11px] font-mono font-black text-white">{prob}%</span>
              </div>
              <div className="text-left leading-tight">
                <h5 className="text-[11px] font-bold text-purple-200">
                  {prob >= 80 ? "Palpite Técnico Expert 🤓" : "Palpite Ousado Especialista 🎯"}
                </h5>
                <p className="text-[9px] text-purple-400 mt-0.5">
                  Peso calculado com estatísticas de seeding e conexões otimizadas.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Premium Screen Capturer & Instagram Publishing Zone */}
        <div className="bg-gradient-to-r from-[#170e30]/85 to-[#0b051b]/90 border-2 border-fuchsia-500/30 p-6 md:p-8 rounded-3xl mb-8 shadow-2xl flex flex-col items-center justify-center text-center relative overflow-hidden" id="share-action-card">
          <div className="absolute top-0 right-0 w-32 h-32 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.1)_0%,transparent_70%)] pointer-events-none" />
          
          <div className="p-3 bg-gradient-to-tr from-rose-500/10 to-fuchsia-500/20 text-fuchsia-400 rounded-2xl border border-fuchsia-500/20 mb-3 animate-bounce">
            <Camera className="w-6 h-6 text-fuchsia-400" />
          </div>

          <h3 className="text-lg font-black text-white uppercase tracking-wider flex items-center gap-2">
            Compartilhe no Instagram Stories
          </h3>
          <p className="text-xs text-purple-300 max-w-lg mt-2 mb-6 leading-relaxed">
            Tire um print da área destacada do pódio acima para compartilhar. Ao postar, cole a legenda copiada e não esqueça de <b>marcar a <span className="text-fuchsia-400 font-extrabold">@siganovaisp</span></b>!
          </p>

          <div className="flex flex-col sm:flex-row items-stretch justify-center gap-3.5 w-full max-w-md">
            <button
              onClick={handleWhatsAppShare}
              disabled={!champObj}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-[#0d0a27] hover:bg-purple-950 text-purple-300 hover:text-white font-extrabold rounded-2xl cursor-pointer select-none transition-all text-xs uppercase tracking-wider border border-purple-900/60 flex-1"
            >
              <MessageCircle className="w-4 h-4 text-emerald-400" />
              WhatsApp
            </button>

            <button
              onClick={handleCopyLink}
              className="inline-flex items-center justify-center gap-2 px-5 py-4 bg-[#0d0a27] hover:bg-purple-950 text-purple-300 hover:text-white font-extrabold rounded-2xl cursor-pointer select-none transition-all text-xs uppercase tracking-wider border border-purple-900/60 flex-1"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-emerald-400" />
                  Copiado!
                </>
              ) : (
                <>
                  <Clipboard className="w-4 h-4" />
                  Copiar Link
                </>
              )}
            </button>
          </div>
          
          <span className="block text-[8px] font-mono text-purple-500 uppercase mt-4">
            * Compatível com compartilhamento nativo para celulares iOS e Android.
          </span>
        </div>

        {/* ======================================================= */}
        {/* INSTAGRAM OPTIMIZED HIDDEN RENDERS CONTAINER CARD       */}
        {/* Perfectly rendered in deep DOM to secure html2canvas    */}
        {/* ======================================================= */}
        <div style={{ position: "absolute", left: "-9999px", top: "-9999px" }} id="hidden-story-card-wrapper">
          <div 
            ref={storyCardRef}
            className="w-[432px] h-[768px] relative bg-[#070412] p-8 flex flex-col justify-between overflow-hidden text-white"
            style={{ fontFamily: '"Inter", sans-serif' }}
          >
            {/* Visual background decorations overlay inside story box */}
            <div className="absolute top-0 left-0 w-full h-full bg-[radial-gradient(ellipse_at_top,_var(--tw-gradient-stops))] from-purple-950/70 via-[#070412] to-[#010003] pointer-events-none" />
            <div className="absolute top-1/4 -right-20 w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.08)_0%,transparent_70%)]" />
            <div className="absolute bottom-1/4 -left-20 w-72 h-72 bg-[radial-gradient(circle_at_center,rgba(217,70,239,0.08)_0%,transparent_70%)]" />
            
            {/* Holographic matrix grids */}
            <div className="absolute inset-0 opacity-[0.02] bg-[linear-gradient(to_right,#808080_1px,transparent_1px),linear-gradient(to_bottom,#808080_1px,transparent_1px)] bg-[size:24px_24px]" />

            {/* Header Brand */}
            <div className="relative z-10 text-center pt-2">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-900/35 border border-purple-500/20 rounded-full">
                <Trophy className="w-3.5 h-3.5 text-fuchsia-400" />
                <span className="text-[9px] font-mono font-black uppercase text-purple-300 tracking-wider">Desafio da Copa 2026</span>
              </div>
              <h3 className="text-xl font-black italic tracking-tighter uppercase text-white mt-3">
                MEUS PALPITES SUPREMOS
              </h3>
              <div className="w-16 h-0.5 bg-gradient-to-r from-purple-500 via-fuchsia-500 to-rose-500 mx-auto mt-2" />
            </div>

            {/* Core Podium section styled vertically */}
            <div className="relative z-10 flex flex-col gap-5 justify-center my-auto px-4">
              
              {/* Champion Card Row */}
              <div className="bg-gradient-to-r from-purple-950/40 to-[#120a2e]/80 border-2 border-fuchsia-500 p-4.5 rounded-2xl flex items-center justify-between shadow-[0_0_20px_rgba(217,70,239,0.15)] relative">
                <span className="absolute -top-2.5 right-4 bg-fuchsia-505 bg-fuchsia-600 border border-fuchsia-400 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase">
                  🥇 CAMPEÃO SUPREMO
                </span>
                
                <div className="flex items-center gap-4">
                  {champObj ? (
                    <>
                      <img
                        src={getTeamFlagUrl(champObj.code)}
                        alt={champObj.name}
                        className="w-13 h-9 object-cover rounded shadow border border-fuchsia-500"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="block text-[9px] font-mono text-fuchsia-400 uppercase tracking-widest leading-none mb-1">Copa do Mundo 2026</span>
                        <span className="text-base font-black uppercase text-white">{champObj.name}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs italic text-purple-400">Pêndulo indefinido</span>
                  )}
                </div>
                <span className="text-2xl animate-bounce">🏆</span>
              </div>

              {/* Runner Up Card Row */}
              <div className="bg-[#0b0821]/80 border border-purple-900/50 p-4 rounded-2xl flex items-center justify-between relative">
                <span className="absolute -top-2.5 right-4 bg-slate-700 text-white text-[7px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  🥈 VICE-CAMPEÃO
                </span>
                <div className="flex items-center gap-3">
                  {rUpObj ? (
                    <>
                      <img
                        src={getTeamFlagUrl(rUpObj.code)}
                        alt={rUpObj.name}
                        className="w-12 h-8 object-cover rounded shadow border border-purple-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white uppercase">{rUpObj.name}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs italic text-purple-400">Indefinido</span>
                  )}
                </div>
                <span className="text-xl">🥈</span>
              </div>

              {/* Third Place Card Row */}
              <div className="bg-[#0b0821]/80 border border-purple-900/50 p-4 rounded-2xl flex items-center justify-between relative">
                <span className="absolute -top-2.5 right-4 bg-amber-700 text-white text-[7px] font-black px-2.5 py-0.5 rounded-full uppercase">
                  🥉 TERCEIRO LUGAR
                </span>
                <div className="flex items-center gap-3">
                  {thirdObj ? (
                    <>
                      <img
                        src={getTeamFlagUrl(thirdObj.code)}
                        alt={thirdObj.name}
                        className="w-12 h-8 object-cover rounded shadow border border-purple-900"
                        referrerPolicy="no-referrer"
                      />
                      <div className="text-left">
                        <span className="text-xs font-bold text-white uppercase">{thirdObj.name}</span>
                      </div>
                    </>
                  ) : (
                    <span className="text-xs italic text-purple-400">Indefinido</span>
                  )}
                </div>
                <span className="text-xl">🥉</span>
              </div>

              {/* Small dynamic rating badge */}
              <div className="border border-purple-950/80 bg-purple-950/20 p-3 rounded-xl flex items-center justify-between text-left mt-1 gap-2">
                <div>
                  <span className="block text-[8px] font-mono text-purple-450 uppercase tracking-widest">Estatística de Acerto</span>
                  <span className="text-[10px] font-bold text-purple-300">Classificação Preditiva Otimizada</span>
                </div>
                <span className="font-mono text-sm font-black text-fuchsia-400 bg-fuchsia-500/5 px-2 py-1 rounded border border-fuchsia-500/15">{prob}%</span>
              </div>
            </div>

            {/* Footer branded bar */}
            <div className="relative z-10 border-t border-purple-950/40 pt-4 pb-2 text-center">
              <span className="block text-[9px] text-fuchsia-400 font-mono tracking-widest uppercase font-black">
                SINTONIZADO POR NOVA ISP FIBRA
              </span>
              <p className="text-[8px] text-purple-500 font-mono mt-1 uppercase">
                Acesse e monte o seu palpite: {window.location.origin.replace(/^https?:\/\//, "")}
              </p>
            </div>
          </div>
        </div>

        {/* ======================================================= */}
        {/* STEP-BY-STEP DIALOG GUIDE MODAL                         */}
        {/* ======================================================= */}
        {showGuideModal && (
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-[#03010a]/90 backdrop-blur-md animate-fade-in">
            <div className="bg-[#0b071d] border-2 border-fuchsia-500/40 max-w-sm w-full rounded-3xl p-6 shadow-[0_0_50px_rgba(168,85,247,0.3)] relative overflow-hidden">
              <div className="absolute top-0 right-0 w-24 h-24 bg-fuchsia-500/5 rounded-full blur-2xl" />
              
              <button 
                onClick={() => setShowGuideModal(false)}
                className="absolute top-4 right-4 p-1 rounded-full bg-purple-950/60 text-purple-400 hover:text-white cursor-pointer"
              >
                <X className="w-4 h-4" />
              </button>

              <div className="text-center mb-5">
                <div className="w-12 h-12 bg-emerald-500/10 border border-emerald-500/30 rounded-full flex items-center justify-center text-emerald-400 mx-auto mb-3">
                  <CheckCircle2 className="w-6 h-6 text-emerald-400" />
                </div>
                <h4 className="text-base font-black text-white uppercase tracking-wider">
                  Palpite Pronto para Brilhar!
                </h4>
                <p className="text-[11px] text-purple-400 mt-1 uppercase">
                  Imagens e Legendagens Concluídas
                </p>
              </div>

              {/* Interactive Steps list */}
              <div className="space-y-4 mb-6">
                
                {/* Step 1 */}
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-full flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0 mt-0.5">
                    1
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white uppercase">Imagem Salva!</h5>
                    <p className="text-[10px] text-purple-400 mt-0.5 leading-normal">
                      A foto vertical com seu pódio supremo de alta qualidade foi baixada no seu celular/computador.
                    </p>
                  </div>
                </div>

                {/* Step 2 */}
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-full flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0 mt-0.5">
                    2
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white uppercase">Legenda Copiada!</h5>
                    <p className="text-[10px] text-purple-400 mt-0.5 leading-normal">
                      A legenda oficial da torcida sintonizada foi copiada para sua área de transferência. Basta "colar" quando publicar!
                    </p>
                  </div>
                </div>

                {/* Step 3 */}
                <div className="flex gap-3 items-start">
                  <div className="w-5 h-5 bg-fuchsia-500/10 border border-fuchsia-500/20 text-fuchsia-400 rounded-full flex items-center justify-center text-[10px] font-black font-mono flex-shrink-0 mt-0.5">
                    3
                  </div>
                  <div>
                    <h5 className="text-[11px] font-bold text-white uppercase">Mencione @siganovaisp</h5>
                    <p className="text-[10px] text-purple-400 mt-0.5 leading-normal">
                      Ao postar nos seus Stories do Instagram, <b>marque a conta oficial <span className="text-fuchsia-400 font-bold">@siganovaisp</span></b> e cole a legenda oficial com as hashtags!
                    </p>
                  </div>
                </div>

              </div>

              <div className="flex flex-col gap-2">
                <button
                  onClick={openInstagram}
                  className="w-full py-3 bg-gradient-to-r from-rose-500 to-fuchsia-600 hover:from-rose-400 hover:to-fuchsia-500 text-white font-black rounded-xl cursor-pointer select-none text-xs uppercase tracking-wider transition-all text-center flex items-center justify-center gap-2"
                >
                  <Instagram className="w-4 h-4" />
                  Abrir Instagram Agora
                </button>
                <button
                  onClick={() => setShowGuideModal(false)}
                  className="w-full py-2.5 bg-purple-950/40 hover:bg-purple-950/80 text-purple-400 text-xs font-bold uppercase rounded-xl cursor-pointer"
                >
                  Entendi, Fechar
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </section>
  );
}
