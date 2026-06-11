import React, { useState } from "react";
import { Team, GROUPS_CONFIG, TEAMS, getTeamFlagUrl } from "../types";
import { Trophy, ChevronLeft, ChevronRight, Info, Check, ShieldAlert } from "lucide-react";

interface ThirdsStageProps {
  groupsState: { [groupLetter: string]: string[] };
  selectedThirds: string[];
  onToggleThird: (teamCode: string) => void;
  onNavigateBack: () => void;
  onNavigateForward: () => void;
}

export default function ThirdsStage({
  groupsState,
  selectedThirds,
  onToggleThird,
  onNavigateBack,
  onNavigateForward,
}: ThirdsStageProps) {
  const [errorText, setErrorText] = useState("");

  const thirdsCandidates = Object.entries(groupsState).map(([letter, teamCodes]) => {
    const code = teamCodes[2]; // 3º Colocado is index 2
    return { code, letter, team: TEAMS[code] };
  }).filter(t => t.team !== undefined) as { code: string; letter: string; team: Team }[];

  const handleToggle = (code: string) => {
    if (!selectedThirds.includes(code) && selectedThirds.length >= 8) {
      setErrorText("Limite alcançado! Desmarque outra seleção se quiser incluir esta.");
      setTimeout(() => setErrorText(""), 4000);
      return;
    }
    setErrorText("");
    onToggleThird(code);
  };

  const isReady = selectedThirds.length === 8;

  return (
    <section className="bg-[#070412] text-white py-12 px-4 md:px-8 relative min-h-[calc(100vh-70px)] flex flex-col justify-between" id="thirds-stage-section">
      {/* Visual background atmospheric lights */}
      <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[350px] h-[350px] bg-[radial-gradient(circle_at_center,rgba(147,51,234,0.06)_0%,transparent_70%)] pointer-events-none" />

      <div className="max-w-4xl mx-auto w-full relative z-10 flex-grow flex flex-col justify-center">
        
        {/* Title area */}
        <div className="text-center mb-8">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-mono rounded-full mb-3 uppercase tracking-wider">
            <Trophy className="w-3.5 h-3.5 text-fuchsia-400" />
            Etapa 2: Repescagem de Terceiros Colocados
          </div>
          
          <h2 className="text-2xl md:text-4xl font-sans lg:text-5xl font-black uppercase italic tracking-tight text-white select-none">
            Os 8 Melhores Terceiros
          </h2>

          <p className="mt-2 text-xs md:text-sm text-purple-300 max-w-xl mx-auto leading-relaxed">
            Selecione as 8 melhores seleções que ficaram em 3º lugar nos seus grupos para preencher as últimas vagas do Mata-Mata.
          </p>
        </div>

        {/* Counter Progress Bar panel */}
        <div className="mb-6 bg-[#0e0a29]/60 border border-purple-900/40 p-4 rounded-3xl max-w-md mx-auto w-full backdrop-blur-md">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-mono text-purple-300 font-bold uppercase">SELEÇÕES SELECIONADAS:</span>
            <span className={`text-sm font-mono font-black ${isReady ? "text-emerald-400" : "text-amber-400 animate-pulse"}`}>
              {selectedThirds.length} de 8
            </span>
          </div>

          <div className="w-full h-2.5 bg-[#05030e] rounded-full overflow-hidden border border-purple-950">
            <div
              className={`h-full transition-all duration-300 ${
                isReady ? "bg-gradient-to-r from-emerald-500 to-teal-400" : "bg-gradient-to-r from-fuchsia-500 to-purple-500"
              }`}
              style={{ width: `${(selectedThirds.length / 8) * 100}%` }}
            />
          </div>

          {errorText && (
            <div className="mt-3 py-2 px-3 rounded-lg bg-red-950/40 border border-red-500/20 text-red-400 text-[11px] font-semibold flex items-center gap-1.5 animate-pulse">
              <ShieldAlert className="w-3.5 h-3.5" />
              <span>{errorText}</span>
            </div>
          )}
        </div>

        {/* Interactive 3rd Place Cards list */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3 max-w-3xl mx-auto w-full">
          {thirdsCandidates.map(({ code, letter, team }) => {
            const isSelected = selectedThirds.includes(code);

            return (
              <div
                key={code}
                onClick={() => handleToggle(code)}
                className={`relative p-4 rounded-2xl border cursor-pointer select-none transition-all duration-200 group flex flex-col items-center justify-between min-h-[140px] ${
                  isSelected
                    ? "bg-gradient-to-b from-[#1c114d] to-[#0a0624] border-emerald-500 shadow-[0_0_20px_rgba(16,185,129,0.15)] text-white"
                    : "bg-[#0b0821]/45 border-purple-900/30 hover:border-purple-550 text-purple-400 hover:text-purple-200"
                }`}
                id={`third-select-card-${code}`}
              >
                {/* Visual Check Indicator badge */}
                <span className={`absolute top-2.5 right-2.5 w-4.5 h-4.5 rounded-full border flex items-center justify-center transition-all ${
                  isSelected
                    ? "bg-emerald-500 border-emerald-400 text-[#070412] text-[9.5px] font-black"
                    : "border-purple-950"
                }`}>
                  {isSelected && "✓"}
                </span>

                {/* Team content */}
                <div className="flex flex-col items-center text-center gap-2.5 mt-2 justify-center">
                  <img
                    src={getTeamFlagUrl(code)}
                    alt={team.name}
                    className="w-12 h-8.5 object-cover rounded-md shadow-md border border-purple-950 group-hover:scale-105 transition-transform duration-200"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="leading-tight">
                    <span className="block text-xs font-black tracking-wide text-white group-hover:text-fuchsia-300 transition-colors">
                      {team.name}
                    </span>
                    <span className="inline-block text-[8px] font-mono font-bold text-fuchsia-400 bg-fuchsia-500/5 px-1.5 py-0.5 rounded border border-fuchsia-400/20 mt-1.5 uppercase">
                      GP {letter} • Pote {team.seed}
                    </span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>

        {/* Action Bottom Navigation Row */}
        <div className="mt-10 flex flex-col sm:flex-row items-center justify-between gap-4 max-w-xl mx-auto w-full pt-6 border-t border-purple-900/20">
          <button
            onClick={onNavigateBack}
            className="w-full sm:w-auto inline-flex items-center justify-center gap-1.5 px-6 py-3 bg-[#0d0a27] hover:bg-purple-950/60 border border-purple-900/45 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-white rounded-xl cursor-pointer transition-all"
            id="btn-thirds-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Fase de Grupos</span>
          </button>

          {isReady ? (
            <button
              onClick={onNavigateForward}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-8 py-3.5 bg-gradient-to-r from-emerald-500 to-teal-400 hover:from-emerald-400 hover:to-teal-350 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-[0_0_20px_rgba(16,185,129,0.3)] hover:scale-[1.02] active:scale-[0.98]"
              id="btn-thirds-forward"
            >
              <span>Ir para o Mata-Mata</span>
              <ChevronRight className="w-4 h-4 text-slate-950" />
            </button>
          ) : (
            <div className="w-full sm:w-auto text-center text-xs text-amber-500 font-bold bg-amber-550/5 px-5 py-3 rounded-xl border border-amber-500/15 animate-bounce">
              Selecione exatamente 8 para avançar!
            </div>
          )}
        </div>

        {/* Extra info helper */}
        <p className="mt-6 text-[10px] text-purple-500 text-center font-mono uppercase tracking-wider max-w-sm mx-auto">
          * A seleção de terceiros garante um emparceiramento ideal com base na classificação e desempenho técnico real dos potes de cada equipe.
        </p>

      </div>
    </section>
  );
}
