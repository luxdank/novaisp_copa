import React, { useState, useEffect } from "react";
import { Team, BRACKET_MAP, TEAMS, getTeamFlagUrl } from "../types";
import { Trophy, ChevronLeft, ChevronRight, Swords, Star, Info, Zap, CheckCircle, HelpCircle } from "lucide-react";
import confetti from "canvas-confetti";
import { motion, AnimatePresence } from "motion/react";

interface BracketStageProps {
  groupsState: { [groupLetter: string]: string[] };
  bracketState: { [matchId: string]: string };
  onBracketChange: (matchId: string, winningTeamCode: string) => void;
  onFinalWinnersChange: (champion: string, runnerUp: string, thirdPlace: string) => void;
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  selectedThirds: string[];
}

const ALL_MATCHES_SEQUENCE = [
  ...Array.from({ length: 16 }, (_, i) => ({ id: `R32_${i + 1}`, label: `Jogo ${i + 1} • Fase de 32`, round_id: "R32" as const, name: "Fase de 32" })),
  ...Array.from({ length: 8 }, (_, i) => ({ id: `R16_${i + 1}`, label: `Jogo ${16 + i + 1} • Oitavas de Final`, round_id: "R16" as const, name: "Oitavas" })),
  ...Array.from({ length: 4 }, (_, i) => ({ id: `QF_${i + 1}`, label: `Jogo ${24 + i + 1} • Quartas de Final`, round_id: "QF" as const, name: "Quartas" })),
  ...Array.from({ length: 2 }, (_, i) => ({ id: `SF_${i + 1}`, label: `Jogo ${28 + i + 1} • Semifinal`, round_id: "SF" as const, name: "Semifinal" })),
  { id: "TP_1", label: "Jogo 31 • Decisão de 3º Lugar", round_id: "FI" as const, name: "3º Lugar" },
  { id: "FI_1", label: "Jogo 32 • Grande Finalíssima", round_id: "FI" as const, name: "Grande Final" }
];

export default function BracketStage({
  groupsState,
  bracketState,
  onBracketChange,
  onFinalWinnersChange,
  champion,
  runnerUp,
  thirdPlace,
  selectedThirds,
}: BracketStageProps) {
  
  const thirdsCandidates = Object.entries(groupsState).map(([letter, teamCodes]) => {
    const code = teamCodes[2];
    return { code, letter, team: TEAMS[code] };
  }).filter(t => t.team !== undefined) as { code: string; letter: string; team: Team }[];

  // Get selected thirds objects, sorted by seed (strength) to sustain fair pairings (1 vs 8, 2 vs 7, etc.)
  const bestThirds = thirdsCandidates
    .filter(t => selectedThirds.includes(t.code))
    .sort((a, b) => (b.team?.seed || 0) - (a.team?.seed || 0));
  const bestThirdsCodes = bestThirds.map((t) => t.code);

  // Round of 32 Matches setup
  const getR32Teams = (matchIndex: number): [string, string] => {
    const pairings: { [idx: number]: [string, string] } = {
      0: [groupsState["A"]?. [0], groupsState["C"]?. [1]],
      1: [groupsState["B"]?. [0], groupsState["D"]?. [1]],
      2: [groupsState["C"]?. [0], groupsState["E"]?. [1]],
      3: [groupsState["D"]?. [0], groupsState["F"]?. [1]],
      4: [groupsState["E"]?. [0], groupsState["G"]?. [1]],
      5: [groupsState["F"]?. [0], groupsState["H"]?. [1]],
      6: [groupsState["G"]?. [0], groupsState["I"]?. [1]],
      7: [groupsState["H"]?. [0], groupsState["J"]?. [1]],
      8: [groupsState["I"]?. [0], groupsState["K"]?. [1]],
      9: [groupsState["J"]?. [0], groupsState["L"]?. [1]],
      10: [groupsState["K"]?. [0], groupsState["A"]?. [1]],
      11: [groupsState["L"]?. [0], groupsState["B"]?. [1]],
      12: [bestThirdsCodes[0] || "", bestThirdsCodes[7] || ""],
      13: [bestThirdsCodes[1] || "", bestThirdsCodes[6] || ""],
      14: [bestThirdsCodes[2] || "", bestThirdsCodes[5] || ""],
      15: [bestThirdsCodes[3] || "", bestThirdsCodes[4] || ""],
    };
    return pairings[matchIndex] || ["", ""];
  };

  // Resolve competitor chains
  const resolveCompetitors = (matchId: string): [string, string] => {
    if (matchId.startsWith("R32_")) {
      const idx = parseInt(matchId.split("_")[1]) - 1;
      return getR32Teams(idx);
    }

    if (matchId.startsWith("R16_")) {
      const num = parseInt(matchId.split("_")[1]);
      const child1 = `R32_${num * 2 - 1}`;
      const child2 = `R32_${num * 2}`;
      return [bracketState[child1] || "", bracketState[child2] || ""];
    }

    if (matchId.startsWith("QF_")) {
      const num = parseInt(matchId.split("_")[1]);
      const child1 = `R16_${num * 2 - 1}`;
      const child2 = `R16_${num * 2}`;
      return [bracketState[child1] || "", bracketState[child2] || ""];
    }

    if (matchId.startsWith("SF_")) {
      const num = parseInt(matchId.split("_")[1]);
      const child1 = `QF_${num * 2 - 1}`;
      const child2 = `QF_${num * 2}`;
      return [bracketState[child1] || "", bracketState[child2] || ""];
    }

    if (matchId === "FI_1") {
      return [bracketState["SF_1"] || "", bracketState["SF_2"] || ""];
    }

    if (matchId === "TP_1") {
      const sf1Winner = bracketState["SF_1"] || "";
      const sf2Winner = bracketState["SF_2"] || "";
      const sf1Competitors = resolveCompetitors("SF_1");
      const sf2Competitors = resolveCompetitors("SF_2");

      const sf1Loser = sf1Competitors.find((c) => c && c !== sf1Winner) || "";
      const sf2Loser = sf2Competitors.find((c) => c && c !== sf2Winner) || "";

      return [sf1Loser, sf2Loser];
    }

    return ["", ""];
  };

  // Active match sequence pointer management
  const [currentMatchIndex, setCurrentMatchIndex] = useState(() => {
    const firstUnresolved = ALL_MATCHES_SEQUENCE.findIndex(m => !bracketState[m.id]);
    return firstUnresolved !== -1 ? firstUnresolved : 0;
  });

  const activeMatch = ALL_MATCHES_SEQUENCE[currentMatchIndex];
  const [t1Code, t2Code] = resolveCompetitors(activeMatch.id);
  const t1 = TEAMS[t1Code];
  const t2 = TEAMS[t2Code];
  const activeWinner = bracketState[activeMatch.id];

  const handleSelectWinner = (matchId: string, teamCode: string) => {
    if (!teamCode) return;
    onBracketChange(matchId, teamCode);

    if (matchId === "FI_1") {
      const sides = resolveCompetitors("FI_1");
      const rUp = sides.find((s) => s !== teamCode) || "";
      onFinalWinnersChange(teamCode, rUp, thirdPlace);

      confetti({
        particleCount: 150,
        spread: 80,
        origin: { y: 0.6 },
        colors: ["#a855f7", "#d946ef", "#6366f1", "#ffffff"],
      });
    }

    if (matchId === "TP_1") {
      onFinalWinnersChange(champion, runnerUp, teamCode);
    }

    // Smart Auto-Advance to next match with a brief visual feedback pause
    if (currentMatchIndex < ALL_MATCHES_SEQUENCE.length - 1) {
      setTimeout(() => {
        setCurrentMatchIndex(prev => prev + 1);
      }, 350);
    }
  };

  // Safe validation check if other groups state altered
  useEffect(() => {
    const allMatchIds = Object.keys(BRACKET_MAP);
    allMatchIds.forEach((mId) => {
      const winner = bracketState[mId];
      if (winner) {
        const competitors = resolveCompetitors(mId);
        if (!competitors.includes(winner)) {
          onBracketChange(mId, "");
        }
      }
    });

    const finalWinner = bracketState["FI_1"];
    if (finalWinner) {
      const finalSiders = resolveCompetitors("FI_1");
      const rUp = finalSiders.find((s) => s && s !== finalWinner) || "";
      const tpWinner = bracketState["TP_1"] || "";
      if (champion !== finalWinner || runnerUp !== rUp || thirdPlace !== tpWinner) {
        onFinalWinnersChange(finalWinner, rUp, tpWinner);
      }
    }
  }, [groupsState, bracketState]);

  // Jump to first unresolved match easily
  const handleJumpToFirstPending = () => {
    const firstUnresolved = ALL_MATCHES_SEQUENCE.findIndex(m => !bracketState[m.id]);
    if (firstUnresolved !== -1) {
      setCurrentMatchIndex(firstUnresolved);
    } else {
      setCurrentMatchIndex(ALL_MATCHES_SEQUENCE.length - 1);
    }
  };

  // Jump index to starting of rounds
  const jumpToRound = (roundId: "R32" | "R16" | "QF" | "SF" | "FI") => {
    const targetIdx = ALL_MATCHES_SEQUENCE.findIndex(m => m.round_id === roundId);
    if (targetIdx !== -1) {
      setCurrentMatchIndex(targetIdx);
    }
  };

  // Unique lists representing tournament categories summary
  const roundTabs = [
    { id: "R32" as const, name: "R32" },
    { id: "R16" as const, name: "Oitavas" },
    { id: "QF" as const, name: "Quartas" },
    { id: "SF" as const, name: "Semifinal" },
    { id: "FI" as const, name: "Decisão" },
  ];

  // Calculated overall bracket counts
  const totalCompleted = ALL_MATCHES_SEQUENCE.filter(m => !!bracketState[m.id]).length;
  const isAllResolved = totalCompleted === ALL_MATCHES_SEQUENCE.length;

  return (
    <section className="bg-[#070412] text-white py-12 px-4 md:px-8 relative min-h-[calc(100vh-70px)] flex flex-col justify-between" id="bracket-stage-section">
      {/* Decorative cosmic neon glow fields */}
      <div className="absolute top-1/4 right-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[130px] pointer-events-none" />
      <div className="absolute bottom-1/4 left-1/4 w-[400px] h-[400px] bg-fuchsia-900/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-3xl mx-auto w-full relative z-10 flex-grow flex flex-col justify-center">
        
        {/* Compact elegant title header */}
        <div className="text-center mb-6">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-mono rounded-full mb-3 uppercase tracking-wider">
            <Swords className="w-3.5 h-3.5 text-fuchsia-400 animate-pulse" />
            Etapa 3: Mata-Mata Direto • Jogo por Jogo
          </div>
          
          <h2 className="text-2xl md:text-4xl font-sans lg:text-5xl font-black uppercase italic tracking-tight text-white select-none">
            Caminho do Campeão
          </h2>

          <p className="mt-1.5 text-xs text-purple-355 max-w-md mx-auto">
            Decida os classificados clicando no envelope da equipe vencedora. Uma rodada por vez.
          </p>
        </div>

        {/* Global Match Progression Line Tracker */}
        <div className="mb-6 bg-[#0e0a29]/65 border border-purple-900/35 p-3.5 rounded-2xl">
          <div className="flex items-center justify-between text-xs font-mono text-purple-400 font-bold uppercase mb-2">
            <span>Progresso Geral do Mata-Mata:</span>
            <span className={isAllResolved ? "text-emerald-400" : "text-fuchsia-400 animate-pulse"}>
              {totalCompleted} de 32 decisões
            </span>
          </div>

          <div className="w-full h-1.5 bg-[#05030e] rounded-full overflow-hidden border border-purple-950">
            <div
              className="h-full bg-gradient-to-r from-purple-500 via-violet-500 to-fuchsia-500 transition-all duration-300"
              style={{ width: `${(totalCompleted / 32) * 100}%` }}
            />
          </div>

          {/* Quick skip button bar */}
          <div className="grid grid-cols-5 gap-1.5 mt-3.5 pt-2 border-t border-purple-950/40">
            {roundTabs.map((tab) => {
              const currentRoundId = activeMatch.round_id;
              const isTabActive = currentRoundId === tab.id;
              
              // Count how many matches in this category are already completed
              const matchesInTab = ALL_MATCHES_SEQUENCE.filter(m => m.round_id === tab.id);
              const completedInTab = matchesInTab.filter(m => !!bracketState[m.id]).length;
              const isTabDone = completedInTab === matchesInTab.length;

              return (
                <button
                  key={tab.id}
                  onClick={() => jumpToRound(tab.id)}
                  className={`py-1.5 px-0.5 text-center rounded-lg font-mono text-[9px] font-black uppercase transition-all duration-300 select-none cursor-pointer border ${
                    isTabActive
                      ? "bg-gradient-to-tr from-rose-500 to-fuchsia-550 border-fuchsia-455 text-white shadow-[0_0_10px_rgba(244,63,94,0.35)]"
                      : isTabDone
                      ? "bg-emerald-950/40 text-emerald-400 border-emerald-500/30"
                      : "bg-[#090518]/60 text-purple-400 border-purple-955/70 hover:border-purple-800"
                  }`}
                >
                  <span className="block text-[8px] tracking-tight leading-none">{tab.name}</span>
                  <span className="block text-[7px] text-purple-500 font-bold mt-0.5 lowercase">
                    {completedInTab}/{matchesInTab.length}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* The Decisive Matchup Card Swiper Area */}
        <div className="relative min-h-[290px] flex flex-col items-center justify-center">
          <AnimatePresence mode="wait">
            <motion.div
              key={activeMatch.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              transition={{ duration: 0.25 }}
              className="w-full max-w-md bg-gradient-to-b from-[#130b2c] to-[#05030f] border border-purple-900/40 rounded-3xl p-5 md:p-6 shadow-[0_20px_50px_rgba(168,85,247,0.15)] flex flex-col justify-between"
              id="active-matchup-card"
            >
              
              {/* Active match identification block */}
              <div className="flex items-center justify-between text-xs font-mono text-purple-400 border-b border-purple-950/80 pb-3 mb-5 select-none uppercase">
                <span className="font-extrabold tracking-widest bg-purple-950/90 text-fuchsia-400 px-2.5 py-1 rounded-md border border-purple-550/15">
                  {activeMatch.label}
                </span>
                <span className="text-[10px] text-purple-500">
                  {currentMatchIndex + 1} de 32
                </span>
              </div>

              {/* Combatants interaction cards */}
              {(!t1Code && !t2Code) || (!t1 && !t2) ? (
                /* Unresolved predecessor stage slot placeholder */
                <div className="py-12 px-4 text-center flex flex-col items-center justify-center h-[180px]">
                  <HelpCircle className="w-10 h-10 text-purple-600 animate-bounce mb-3" />
                  <h4 className="text-sm font-extrabold text-purple-300">Confronte os Jogos Anteriores</h4>
                  <p className="text-[11px] text-purple-500 max-w-xs mt-1.5 leading-relaxed">
                    Os competidores desta partida serão definidos automaticamente conforme você preenche as rodadas anteriores.
                  </p>
                  <button
                    onClick={handleJumpToFirstPending}
                    className="mt-4 px-4 py-2 bg-purple-900/30 hover:bg-purple-900/60 text-white rounded-lg text-[10px] font-black uppercase tracking-wider transition-colors border border-purple-500/20"
                  >
                    Ir para Jogo Pendente
                  </button>
                </div>
              ) : (
                /* Interactive Side by Side selection */
                <div className="space-y-4">
                  {/* Challenger 1 Card */}
                  {t1 ? (
                    <button
                      onClick={() => handleSelectWinner(activeMatch.id, t1.code)}
                      className={`w-full p-4 rounded-2xl border text-left select-none transition-all duration-300 relative group flex items-center justify-between ${
                        activeWinner === t1.code
                          ? "bg-gradient-to-r from-emerald-950/40 via-[#0e0a26] to-[#04020a] border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                          : "bg-[#0b0821]/45 border-purple-900/30 hover:border-purple-500 text-purple-400 hover:text-white"
                      }`}
                      id={`matchup-button-${t1.code}`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getTeamFlagUrl(t1.code)}
                          alt={t1.name}
                          className="w-12 h-8.5 object-cover rounded-md shadow-lg border border-purple-950 group-hover:scale-103"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="block text-sm font-extrabold text-white tracking-wide">
                            {t1.name}
                          </span>
                          <span className="inline-block text-[8px] font-mono font-bold text-fuchsia-400 bg-fuchsia-500/5 px-1.5 py-0.5 rounded border border-fuchsia-400/20 mt-1 uppercase">
                            POTE {t1.seed} • CLASSE
                          </span>
                        </div>
                      </div>

                      {activeWinner === t1.code ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-black">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-950/30 border border-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-purple-400 uppercase font-black font-mono">
                          ELEG
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full p-4 rounded-2xl border border-purple-950/40 bg-purple-950/5 opacity-55 text-center flex items-center justify-center text-[11px] italic font-light text-purple-450 h-[68px]">
                      Aguardando vencedor de outro jogo...
                    </div>
                  )}

                  {/* VS Indicator line */}
                  <div className="flex items-center justify-center gap-3">
                    <div className="h-[1px] bg-purple-950 flex-1" />
                    <span className="text-[9px] font-mono font-black text-purple-500 uppercase select-none tracking-widest bg-[#05030f] px-2.5 py-0.5 rounded border border-purple-950">
                      QUEM AVANÇA?
                    </span>
                    <div className="h-[1px] bg-purple-950 flex-1" />
                  </div>

                  {/* Challenger 2 Card */}
                  {t2 ? (
                    <button
                      onClick={() => handleSelectWinner(activeMatch.id, t2.code)}
                      className={`w-full p-4 rounded-2xl border text-left select-none transition-all duration-300 relative group flex items-center justify-between ${
                        activeWinner === t2.code
                          ? "bg-gradient-to-r from-emerald-950/40 via-[#0e0a26] to-[#04020a] border-emerald-500 text-white shadow-[0_0_20px_rgba(16,185,129,0.15)]"
                          : "bg-[#0b0821]/45 border-purple-900/30 hover:border-purple-500 text-purple-400 hover:text-white"
                      }`}
                      id={`matchup-button-${t2.code}`}
                    >
                      <div className="flex items-center gap-4">
                        <img
                          src={getTeamFlagUrl(t2.code)}
                          alt={t2.name}
                          className="w-12 h-8.5 object-cover rounded-md shadow-lg border border-purple-950 group-hover:scale-103"
                          referrerPolicy="no-referrer"
                        />
                        <div>
                          <span className="block text-sm font-extrabold text-white tracking-wide">
                            {t2.name}
                          </span>
                          <span className="inline-block text-[8px] font-mono font-bold text-fuchsia-400 bg-fuchsia-500/5 px-1.5 py-0.5 rounded border border-fuchsia-400/20 mt-1 uppercase">
                            POTE {t2.seed} • CLASSE
                          </span>
                        </div>
                      </div>

                      {activeWinner === t2.code ? (
                        <div className="w-6 h-6 rounded-full bg-emerald-500/20 border border-emerald-500 flex items-center justify-center text-emerald-400 text-xs font-black">
                          ✓
                        </div>
                      ) : (
                        <div className="w-6 h-6 rounded-full bg-purple-950/30 border border-purple-900/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center text-[10px] text-purple-400 uppercase font-black font-mono">
                          ELEG
                        </div>
                      )}
                    </button>
                  ) : (
                    <div className="w-full p-4 rounded-2xl border border-purple-950/40 bg-purple-950/5 opacity-55 text-center flex items-center justify-center text-[11px] italic font-light text-purple-450 h-[68px]">
                      Aguardando vencedor de outro jogo...
                    </div>
                  )}
                </div>
              )}

              {/* Status caption overlay helper */}
              <p className="mt-4 text-[10px] leading-relaxed text-purple-500 font-mono text-center select-none uppercase">
                * Escolha uma seleção acima para avançar automaticamente para a próxima disputa.
              </p>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Action Bottom Navigation Row */}
        <div className="mt-8 flex items-center justify-between gap-4 max-w-sm mx-auto w-full pt-4 border-t border-purple-900/20">
          <button
            disabled={currentMatchIndex === 0}
            onClick={() => setCurrentMatchIndex(prev => Math.max(0, prev - 1))}
            className="inline-flex items-center gap-1 px-4 py-2 bg-[#0d0a27] hover:bg-purple-950/60 border border-purple-900/45 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-white rounded-xl cursor-pointer disabled:opacity-25 disabled:pointer-events-none transition-all"
            id="btn-bracket-back"
          >
            <ChevronLeft className="w-4 h-4" />
            <span>Voltar Jogo</span>
          </button>

          <span className="text-[11px] font-mono text-purple-400 font-black uppercase text-center hidden xs:inline">
            JOGO {currentMatchIndex + 1} DE 32
          </span>

          {currentMatchIndex < ALL_MATCHES_SEQUENCE.length - 1 ? (
            <button
              onClick={() => setCurrentMatchIndex(prev => Math.min(ALL_MATCHES_SEQUENCE.length - 1, prev + 1))}
              className="inline-flex items-center gap-1 px-4 py-2 bg-[#0d0a27] hover:bg-purple-950/60 border border-purple-900/45 text-xs font-bold uppercase tracking-wider text-purple-300 hover:text-white rounded-xl cursor-pointer transition-all"
              id="btn-bracket-next"
            >
              <span>Próximo</span>
              <ChevronRight className="w-4 h-4" />
            </button>
          ) : (
            <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-1.5 rounded-xl border border-emerald-500/25 flex items-center gap-1 select-none">
              <CheckCircle className="w-3.5 h-3.5 text-emerald-400" />
              <span>Finalizado!</span>
            </div>
          )}
        </div>

      </div>
    </section>
  );
}

