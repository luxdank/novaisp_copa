import React, { useState, useEffect } from "react";
import { Play, Flame, Trophy, Send, Sparkles } from "lucide-react";
import NovaIspLogo from "./NovaIspLogo";

interface CompactHeroProps {
  onStart: () => void;
  participantCount: number;
}

export default function CompactHero({ onStart, participantCount }: CompactHeroProps) {
  const [timeLeft, setTimeLeft] = useState({
    days: 3,
    hours: 11,
    minutes: 45,
    seconds: 22,
  });

  // Tick countdown timer
  useEffect(() => {
    const interval = setInterval(() => {
      setTimeLeft((prev) => {
        if (prev.seconds > 0) {
          return { ...prev, seconds: prev.seconds - 1 };
        } else if (prev.minutes > 0) {
          return { ...prev, minutes: prev.minutes - 1, seconds: 59 };
        } else if (prev.hours > 0) {
          return { ...prev, hours: prev.hours - 1, minutes: 59, seconds: 59 };
        } else if (prev.days > 0) {
          return { days: prev.days - 1, hours: 23, minutes: 59, seconds: 59 };
        } else {
          return { days: 0, hours: 0, minutes: 0, seconds: 0 };
        }
      });
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="relative w-full h-[calc(100vh-68px)] flex flex-col items-center justify-center bg-gradient-to-b from-[#0b071a] via-[#070412] to-[#04020a] px-4 py-4 text-center select-none overflow-hidden" id="compact-hero-container">
      
      {/* Decorative cyber grid overlay */}
      <div className="absolute inset-0 bg-[linear-gradient(rgba(147,51,234,0.01)_1px,transparent_1px),linear-gradient(90deg,rgba(147,51,234,0.01)_1px,transparent_1px)] bg-[size:40px_40px] opacity-40 pointer-events-none" />

      {/* Cyber lights */}
      <div className="absolute top-[-200px] left-1/2 -translate-x-1/2 w-[600px] h-[400px] bg-purple-600/10 rounded-full blur-[110px] pointer-events-none" />
      <div className="absolute bottom-[-100px] right-[-100px] w-72 h-72 bg-fuchsia-500/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative max-w-2xl w-full flex flex-col items-center justify-center gap-4 sm:gap-5 py-2">
        
        {/* Top brand header */}
        <div className="flex flex-col items-center gap-2">
          <div className="transform hover:scale-103 transition-transform duration-300">
            <NovaIspLogo size="lg" className="h-12 md:h-14" />
          </div>
          <div className="inline-flex items-center gap-1.5 px-3 py-1 bg-purple-950/45 border border-purple-500/20 text-fuchsia-400 text-[10px] font-mono tracking-widest uppercase rounded-full shadow-lg">
            <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
            CONEXÃO INSTANTÂNEA NOVA ISP • ATIVA
          </div>
        </div>

        {/* Dynamic mini-countdown & active counter in single line */}
        <div className="grid grid-cols-2 gap-3 w-full max-w-sm sm:max-w-md">
          <div className="bg-[#120930]/40 border border-purple-900/30 px-3.5 py-2.0 rounded-xl text-left">
            <span className="text-[9px] text-purple-400 font-mono block uppercase">CONEXÕES ATIVAS</span>
            <span className="text-sm font-mono font-black text-white">
              {(participantCount + 28410).toLocaleString()}
            </span>
          </div>
          <div className="bg-[#120930]/40 border border-purple-900/30 px-3.5 py-2.0 rounded-xl text-left">
            <span className="text-[9px] text-purple-400 font-mono block uppercase">FECHAMENTO EM</span>
            <span className="text-sm font-mono font-black text-fuchsia-400">
              {timeLeft.days}d : {timeLeft.hours}h : {timeLeft.minutes}m
            </span>
          </div>
        </div>

        {/* Main core punchy text */}
        <div className="my-1">
          <h1 className="text-2xl md:text-4xl font-sans lg:text-5xl font-black uppercase italic tracking-tight text-white leading-tight">
            Desafio Copa 2026
          </h1>
          <p className="text-xs text-purple-300 max-w-md mx-auto mt-1 font-light">
            Monte os palpites oficiais em velocidade máxima e dispute o ranking geral em tempo real.
          </p>
        </div>

        {/* 3 Steps - Minimalist quick instructions panel */}
        <div className="w-full max-w-md bg-[#0e0a29]/50 border border-purple-900/35 p-4 rounded-2xl grid grid-cols-3 gap-2.5 shadow-xl relative backdrop-blur-md">
          
          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-rose-500/10 border border-rose-500/20 flex items-center justify-center text-rose-400 mb-2">
              <Flame className="w-4 h-4 fill-rose-500 text-rose-500" />
            </div>
            <h3 className="text-[11px] font-black uppercase text-white mb-0.5">1. Deslize</h3>
            <p className="text-[9px] text-purple-300 leading-tight">Arraste para os lados na fase de grupos</p>
          </div>

          <div className="flex flex-col items-center text-center p-1 border-x border-purple-950/60">
            <div className="w-8 h-8 rounded-full bg-purple-500/10 border border-purple-500/20 flex items-center justify-center text-purple-400 mb-2">
              <Trophy className="w-4 h-4 text-fuchsia-400 fill-fuchsia-500/10" />
            </div>
            <h3 className="text-[11px] font-black uppercase text-white mb-0.5">2. Chaveie</h3>
            <p className="text-[9px] text-purple-300 leading-tight">Monte a fase de mata-mata</p>
          </div>

          <div className="flex flex-col items-center text-center p-1">
            <div className="w-8 h-8 rounded-full bg-emerald-500/10 border border-emerald-500/20 flex items-center justify-center text-emerald-400 mb-2">
              <Send className="w-4 h-4 text-emerald-400" />
            </div>
            <h3 className="text-[11px] font-black uppercase text-white mb-0.5">3. Salve</h3>
            <p className="text-[9px] text-purple-300 leading-tight">Cadastre seus dados e conclua</p>
          </div>

        </div>

        {/* Huge glowing launch button */}
        <div className="w-full max-w-sm">
          <button
            onClick={onStart}
            className="w-full flex items-center justify-center gap-3 py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-450 text-white font-black text-sm uppercase tracking-wider rounded-xl cursor-pointer hover:scale-[1.02] transition-all duration-300 shadow-[0_0_20px_rgba(168,85,247,0.3)] hover:shadow-[0_0_30px_rgba(217,70,239,0.55)] border border-fuchsia-400/20 active:scale-[0.98]"
            id="btn-compact-hero-start"
          >
            <Play className="w-4 h-4 fill-white stroke-none" />
            <span>Começar o Desafio</span>
          </button>
          
          <p className="text-[10px] text-purple-500/80 font-mono mt-2 uppercase tracking-wide">
            ⚡ Tempo estimado: 2 minutos • Grátis e seguro
          </p>
        </div>

      </div>
    </div>
  );
}
