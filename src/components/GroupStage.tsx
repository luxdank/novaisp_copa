import React, { useState, useEffect } from "react";
import { Team, Group, GROUPS_CONFIG, TEAMS, getTeamFlagUrl } from "../types";
import { Activity, Award, ChevronLeft, ChevronRight, Check, RotateCcw, Heart, X, Star } from "lucide-react";
import { motion, AnimatePresence } from "motion/react";

interface GroupStageProps {
  groupsState: { [groupLetter: string]: string[] };
  onGroupOrderChange: (groupLetter: string, sortedTeamCodes: string[]) => void;
  globalStats: any;
}

export default function GroupStage({
  groupsState,
  onGroupOrderChange,
  globalStats,
}: GroupStageProps) {
  const [showHexaAlert, setShowHexaAlert] = useState(false);
  const [activeGroupIndex, setActiveGroupIndex] = useState(0);

  // Card Swipe Step: 0, 1, 2, 3 (for the active group)
  // Step 4 represents that the current group classification is complete and shows the recap list.
  const [swipeStep, setSwipeStep] = useState(0);
  const [swipeQualified, setSwipeQualified] = useState<string[]>([]);
  const [swipeEliminated, setSwipeEliminated] = useState<string[]>([]);
  const [dragX, setDragX] = useState(0);

  // Keep track of which groups the user has actively customized for high-fidelity checkmarks
  const [modifiedGroups, setModifiedGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("copa2026_modified_groups");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const activeGroup = GROUPS_CONFIG[activeGroupIndex];
  const activeOrder = groupsState[activeGroup.letter] || activeGroup.teams.map((t) => t.code);

  // When active group index changes, reset the swipe progress state for this group
  useEffect(() => {
    if (modifiedGroups.includes(activeGroup.letter)) {
      setSwipeStep(4);
    } else {
      setSwipeStep(0);
    }
    setSwipeQualified([]);
    setSwipeEliminated([]);
    setDragX(0);
  }, [activeGroupIndex, activeGroup.letter, modifiedGroups]);

  // Swipe Action Handler
  const handleSwipe = (direction: "left" | "right", teamCode: string) => {
    let updatedQualified = [...swipeQualified];
    let updatedEliminated = [...swipeEliminated];

    if (direction === "right") {
      updatedQualified.push(teamCode);
      setSwipeQualified(updatedQualified);
    } else {
      // Put at front of eliminated list so that the first left-swipe is 4th place and second is 3rd place
      updatedEliminated = [teamCode, ...updatedEliminated];
      setSwipeEliminated(updatedEliminated);
    }

    const nextStep = swipeStep + 1;
    setSwipeStep(nextStep);

    // After 3 swipes, the 4th is automatically determined
    if (nextStep >= 3) {
      const allTeams = activeGroup.teams.map(t => t.code);
      const swiped = [...updatedQualified, ...updatedEliminated];
      const remaining = allTeams.filter(code => !swiped.includes(code));

      // Consolidate final rankings
      const finalOrder = [...updatedQualified, ...remaining, ...updatedEliminated];
      
      // Save order
      onGroupOrderChange(activeGroup.letter, finalOrder);

      // Save customized group
      if (!modifiedGroups.includes(activeGroup.letter)) {
        const updated = [...modifiedGroups, activeGroup.letter];
        setModifiedGroups(updated);
        localStorage.setItem("copa2026_modified_groups", JSON.stringify(updated));
      }

      // Trigger Easter egg if Brazil rises to 1st
      if (activeGroup.letter === "C" && finalOrder[0] === "BRA") {
        setShowHexaAlert(true);
        setTimeout(() => setShowHexaAlert(false), 3500);
      }
      
      setSwipeStep(4);
    }
  };

  // Instant Liderança (Super Like Feature / Double Tap)
  const handleSuperLike = (teamCode: string) => {
    const remainingTeams = activeGroup.teams
      .map(t => t.code)
      .filter(code => code !== teamCode);
    
    const finalOrder = [teamCode, ...remainingTeams];
    
    onGroupOrderChange(activeGroup.letter, finalOrder);
    
    if (!modifiedGroups.includes(activeGroup.letter)) {
      const updated = [...modifiedGroups, activeGroup.letter];
      setModifiedGroups(updated);
      localStorage.setItem("copa2026_modified_groups", JSON.stringify(updated));
    }

    if (activeGroup.letter === "C" && teamCode === "BRA") {
      setShowHexaAlert(true);
      setTimeout(() => setShowHexaAlert(false), 3500);
    }

    setSwipeStep(4);
  };

  // Reset progress function for ALL groups
  const handleResetProgress = () => {
    setModifiedGroups([]);
    localStorage.removeItem("copa2026_modified_groups");
    GROUPS_CONFIG.forEach(group => {
      onGroupOrderChange(group.letter, group.teams.map(t => t.code));
    });
    setActiveGroupIndex(0);
    setSwipeStep(0);
  };

  // Reset current selected group back to default order
  const handleResetCurrentGroup = () => {
    setSwipeStep(0);
    setSwipeQualified([]);
    setSwipeEliminated([]);
    setDragX(0);

    const activeLetter = activeGroup.letter;
    const officialGroup = GROUPS_CONFIG.find(g => g.letter === activeLetter);
    if (officialGroup) {
      onGroupOrderChange(activeLetter, officialGroup.teams.map(t => t.code));
    }
    
    // Remove from modified list
    const updated = modifiedGroups.filter(l => l !== activeLetter);
    setModifiedGroups(updated);
    localStorage.setItem("copa2026_modified_groups", JSON.stringify(updated));
  };

  // Automated smart helper to pull general selection statistics
  const getGlobalPercentage = (teamCode: string, positionIndex: number): number => {
    const basePercentages: { [code: string]: number[] } = {
      BRA: [92, 6, 2, 0],
      FRA: [89, 8, 2, 1],
      ARG: [87, 9, 3, 1],
      ESP: [85, 11, 3, 1],
      ENG: [83, 12, 4, 1],
      POR: [80, 14, 5, 1],
      GER: [78, 15, 5, 2],
      NED: [76, 17, 5, 2],
      BEL: [72, 18, 7, 3],
      URU: [68, 22, 8, 2],
      CRO: [65, 24, 8, 3],
      MAR: [60, 26, 10, 4],
      COL: [58, 28, 10, 4],
      USA: [55, 30, 11, 4],
      MEX: [52, 32, 12, 4],
      SUI: [50, 31, 14, 5],
      CAN: [45, 35, 15, 5],
      JPN: [42, 38, 15, 5],
      KOR: [38, 40, 16, 6],
    };

    if (globalStats?.teamSelections?.[teamCode]) {
      const ts = globalStats.teamSelections[teamCode];
      const total = (ts.first || 0) + (ts.second || 0) + (ts.third || 0) + 1;
      if (positionIndex === 0) return Math.round(((ts.first || 0) / total) * 100);
      if (positionIndex === 1) return Math.round(((ts.second || 0) / total) * 100);
      if (positionIndex === 2) return Math.round(((ts.third || 0) / total) * 100);
    }

    const fallback = basePercentages[teamCode] || [25, 25, 25, 25];
    return fallback[positionIndex] || 25;
  };

  return (
    <section className="bg-[#070412] text-white py-12 px-4 md:px-8 relative" id="group-stage-section">
      {/* Background neon light glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hexa Animated Overlay Alert */}
      {showHexaAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce" id="hexa-alert">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-emerald-400 border border-yellow-250 text-slate-950 font-black text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(234,179,8,0.6)]">
            <Award className="w-5 h-5 text-emerald-800 animate-spin" />
            <span>Rumo ao Hexa! Brasil na Liderança! 🇧🇷</span>
            <span>⭐</span>
          </div>
        </div>
      )}

      <div className="max-w-7xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-xs font-mono rounded-full mb-4">
            <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            VOTE RÁPIDO DO SEU JEITO: CLASSIFIQUE DESLIZANDO OS ENVELOPES
          </div>
          
          <h2 className="text-3xl md:text-5xl font-sans lg:text-6xl font-black uppercase italic tracking-tight text-white select-none">
            Fase de Grupos
          </h2>

          <p className="mt-2 text-xs md:text-sm text-purple-300 max-w-xl mx-auto">
            Classifique as seleções de forma intuitiva arrastando para os lados. Decida do Grupo A ao Grupo L em estilo Swipe.
          </p>
        </div>

        {/* ========================================== */}
        {/* SWIPER CONTAINER DECK                      */}
        {/* ========================================== */}
        <div className="w-full max-w-md mx-auto">
          
          <div className="relative min-h-[460px] flex flex-col items-center justify-center">
            
            {swipeStep < 4 ? (
              /* High fidelity floating cards stack deck */
              <div className="relative w-full h-[380px] flex items-center justify-center select-none touch-none">
                <AnimatePresence>
                  {activeGroup.teams.map((team, idx) => {
                    // Only render cards that haven't been swiped yet
                    if (idx < swipeStep) return null;

                    const isTopCard = idx === swipeStep;
                    // Cards behind get natural progressive depth offsets
                    const depth = idx - swipeStep;
                    const scale = 1 - depth * 0.05;
                    const yOffset = depth * 14;
                    const rotateOffset = depth * 1.5;

                    return (
                      <motion.div
                        key={team.code}
                        drag={isTopCard ? "x" : false}
                        dragConstraints={{ left: 0, right: 0 }}
                        dragElastic={0.7}
                        onDrag={(e, info) => {
                          if (isTopCard) {
                            setDragX(info.offset.x);
                          }
                        }}
                        onDragEnd={(e, info) => {
                          if (!isTopCard) return;
                          const threshold = 110;
                          if (info.offset.x > threshold) {
                            handleSwipe("right", team.code);
                          } else if (info.offset.x < -threshold) {
                            handleSwipe("left", team.code);
                          }
                          setDragX(0);
                        }}
                        style={{
                          zIndex: 40 - idx,
                          originY: 1,
                        }}
                        animate={
                          isTopCard
                            ? {
                                x: dragX,
                                rotate: dragX * 0.04,
                                scale: 1,
                                y: 0,
                              }
                            : {
                                x: 0,
                                rotate: rotateOffset,
                                scale: scale,
                                y: yOffset,
                              }
                        }
                        transition={{
                          type: "spring",
                          stiffness: 300,
                          damping: 20,
                        }}
                        className={`absolute w-full h-[360px] bg-gradient-to-b from-[#160f38] to-[#0a0522] rounded-3xl border ${
                          isTopCard ? "border-purple-500/35 shadow-[0_15px_35px_rgba(168,85,247,0.2)]" : "border-purple-950/40 opacity-70"
                        } p-6 flex flex-col justify-between overflow-hidden cursor-grab active:cursor-grabbing`}
                        id={`swipe-card-${team.code}`}
                      >
                        {/* Decorative background glow */}
                        <div className="absolute inset-0 bg-gradient-to-br from-fuchsia-500/5 to-transparent pointer-events-none" />

                        {/* Swipe visual HUD Stamps */}
                        {isTopCard && Math.abs(dragX) > 15 && (
                          <div className="absolute top-8 inset-x-0 flex justify-between px-6 pointer-events-none z-30">
                            {dragX > 15 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: Math.min(1, (dragX - 15) / 60), scale: 1 }}
                                className="border-4 border-emerald-500 text-emerald-400 font-sans font-black text-xs px-4 py-1.5 rounded-xl uppercase tracking-widest rotate-[-12deg]"
                              >
                                2º LUGAR ❤️
                              </motion.div>
                            )}
                            {dragX < -15 && (
                              <motion.div
                                initial={{ opacity: 0, scale: 0.8 }}
                                animate={{ opacity: Math.min(1, (-dragX - 15) / 60), scale: 1 }}
                                className="border-4 border-rose-500 text-rose-400 font-sans font-black text-xs px-4 py-1.5 rounded-xl uppercase tracking-widest rotate-[12deg]"
                              >
                                4º LUGAR ❌
                              </motion.div>
                            )}
                          </div>
                        )}

                        {/* Flag & Team Info Header */}
                        <div className="flex flex-col items-center text-center mt-4">
                          <div className="relative group">
                            <div className="absolute inset-0 bg-purple-500/25 rounded-2xl blur-xl group-hover:bg-purple-500/35 transition-all duration-300" />
                            <img
                              src={getTeamFlagUrl(team.code)}
                              alt={team.name}
                              className="relative w-28 h-20 object-cover rounded-2xl shadow-2xl border-2 border-purple-900/60"
                              referrerPolicy="no-referrer"
                            />
                            {/* Card queue indicators (e.g. 1/4) */}
                            <span className="absolute -bottom-2.5 -right-2 bg-gradient-to-r from-purple-600 to-fuchsia-550 text-white font-mono font-black text-[9px] px-2.5 py-1 rounded-full border border-purple-400/20 shadow-md">
                              {idx + 1} DE 4
                            </span>
                          </div>

                          <h3 className="text-2xl font-black text-white mt-6 tracking-tight uppercase">
                            {team.name}
                          </h3>
                          <p className="text-xs text-purple-400 font-mono mt-1 uppercase tracking-wider">
                            Grupo {activeGroup.letter} • Pote {team.seed}
                          </p>
                        </div>

                        {/* Interactive Selection Stats Panel */}
                        <div className="bg-[#05030e]/80 border border-purple-900/35 p-3 rounded-xl flex items-center justify-between text-xs text-purple-300">
                          <div>
                            <span className="text-[10px] text-purple-500 block uppercase font-mono font-bold leading-tight">Votos 1º Lugar</span>
                            <span className="text-white font-extrabold">{getGlobalPercentage(team.code, 0)}% global</span>
                          </div>
                          <div className="text-right">
                            <span className="text-[10px] text-purple-500 block uppercase font-mono font-bold leading-tight">Objetivo</span>
                            <span className="text-fuchsia-400 font-black">Mata-mata</span>
                          </div>
                        </div>

                        {/* Drag gesture prompt */}
                        {isTopCard && (
                          <div className="text-[10px] text-purple-500/60 text-center font-mono uppercase tracking-widest mt-2">
                            Apenas deslize ou use as ações abaixo
                          </div>
                        )}
                      </motion.div>
                    );
                  })}
                </AnimatePresence>
              </div>
            ) : (
              /* Completed Group Placement Recap */
              <motion.div
                initial={{ opacity: 0, scale: 0.96 }}
                animate={{ opacity: 1, scale: 1 }}
                className="w-full bg-gradient-to-b from-[#130b2c] to-[#05030f] rounded-3xl border border-emerald-500/30 p-5 md:p-6 text-center shadow-[0_20px_45px_rgba(16,185,129,0.12)] mb-4"
                id="group-completed-recap"
              >
                <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4">
                  <Check className="w-7 h-7 text-emerald-400 animate-pulse" />
                </div>
                
                <h3 className="text-xl font-extrabold text-white">
                  Grupo {activeGroup.letter} Classificado!
                </h3>
                <p className="text-xs text-purple-350 mt-1 max-w-xs mx-auto">
                  Os classificados deste grupo foram computados e salvos com sucesso.
                </p>

                {/* Ordered current rankings list */}
                <div className="mt-6 space-y-2.5">
                  {activeOrder.map((teamCode, idx) => {
                    const team = TEAMS[teamCode];
                    if (!team) return null;

                    const placementLabel = ["🏆 1º Colocado", "🥈 2º Colocado", "🥉 Repescagem", "❌ Eliminado"];
                    const ringStyle = [
                      "border-yellow-500/35 text-yellow-400 bg-yellow-500/5 shadow-[0_0_10px_rgba(234,179,8,0.05)]",
                      "border-slate-300/25 text-slate-300 bg-slate-300/5",
                      "border-amber-700/25 text-amber-500 bg-amber-750/5",
                      "border-purple-950 text-[#716e87] bg-purple-950/2 tracking-tight opacity-55"
                    ];

                    return (
                      <div
                        key={teamCode}
                        className={`flex items-center justify-between p-3 rounded-xl border text-left text-xs ${ringStyle[idx]}`}
                      >
                        <div className="flex items-center gap-3">
                          <img
                            src={getTeamFlagUrl(teamCode)}
                            alt={team.name}
                            className="w-6.5 h-4.5 object-cover rounded shadow border border-purple-950"
                            referrerPolicy="no-referrer"
                          />
                          <span className="font-extrabold text-white">{team.name}</span>
                        </div>
                        <span className="font-mono text-[10px] uppercase font-black tracking-wider">
                          {placementLabel[idx]}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="mt-8 flex flex-col gap-2.5">
                  <button
                    onClick={handleResetCurrentGroup}
                    className="w-full inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#05030e] hover:bg-purple-950/50 border border-purple-900/40 text-purple-300 hover:text-white text-xs font-bold uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                  >
                    <RotateCcw className="w-4 h-4" />
                    <span>Alterar Palpites</span>
                  </button>

                  {activeGroupIndex < 11 ? (
                    <button
                      onClick={() => setActiveGroupIndex(prev => prev + 1)}
                      className="w-full inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)] animate-pulse"
                    >
                      <span>Ir para Grupo {GROUPS_CONFIG[activeGroupIndex + 1].letter}</span>
                      <ChevronRight className="w-4 h-4 text-slate-950" />
                    </button>
                  ) : (
                    <div className="bg-emerald-500/10 text-emerald-400 p-2.5 rounded-xl border border-emerald-500/20 text-xs font-mono font-bold uppercase">
                      🎉 Todos os 12 Grupos Definidos! Continue rolando para o Mata-mata!
                    </div>
                  )}
                </div>
              </motion.div>
            )}

            {/* Tactile Action Button row (Visible only during swiping process) */}
            {swipeStep < 4 && (
              <div className="flex items-center justify-center gap-4 mt-6 z-20">
                {/* Reset single group button fallback */}
                <button
                  onClick={handleResetCurrentGroup}
                  title="Recomeçar Grupo"
                  className="w-12 h-12 rounded-full bg-[#130d2f] hover:bg-[#1a1242] border border-purple-900/50 flex items-center justify-center text-purple-400 hover:text-white cursor-pointer transition-all active:scale-95 shadow-md"
                >
                  <RotateCcw className="w-5 h-5" />
                </button>

                {/* Left swipe: Relegate / Eliminate */}
                <button
                  onClick={() => handleSwipe("left", activeGroup.teams[swipeStep].code)}
                  title="Definir como 4º Lugar! (Arraste para a Esquerda)"
                  className="w-16 h-16 rounded-full bg-rose-500/10 hover:bg-rose-500/20 border-2 border-rose-500/40 flex items-center justify-center text-rose-500 hover:text-rose-450 cursor-pointer transition-all active:scale-90 hover:scale-105 shadow-[0_0_15px_rgba(239,68,68,0.2)]"
                >
                  <X className="w-8 h-8 font-black" />
                </button>

                {/* Instant 1st place shortcut */}
                <button
                  onClick={() => handleSuperLike(activeGroup.teams[swipeStep].code)}
                  title="Definir como Primeiro Lugar!"
                  className="w-12 h-12 rounded-full bg-amber-500/10 hover:bg-amber-500/20 border border-amber-500/40 flex items-center justify-center text-amber-500 hover:text-amber-400 cursor-pointer transition-all active:scale-95 hover:scale-105 shadow-md animate-pulse"
                >
                  <Star className="w-5 h-5 fill-amber-500 text-amber-500" />
                </button>

                {/* Right swipe: Classify */}
                <button
                  onClick={() => handleSwipe("right", activeGroup.teams[swipeStep].code)}
                  title="Definir como 2º Lugar! (Arraste para a Direita)"
                  className="w-16 h-16 rounded-full bg-emerald-500/10 hover:bg-emerald-500/100 border-2 border-emerald-500/40 flex items-center justify-center text-emerald-500 hover:text-white hover:bg-emerald-500 cursor-pointer transition-all active:scale-90 hover:scale-105 shadow-[0_0_20px_rgba(16,185,129,0.3)]"
                >
                  <Heart className="w-7 h-7 fill-emerald-500 text-emerald-500 hover:fill-white hover:text-white" />
                </button>
              </div>
            )}
          </div>

          {/* User Guide Caption */}
          <div className="mt-4 bg-purple-950/20 border border-purple-900/40 p-3 rounded-2xl text-center text-[11px] leading-relaxed text-purple-300">
            💡 <b>Como Palpitar:</b> Arraste para a <b>Direita ❤️</b> para definir como <b>2º Lugar</b>. Arraste para a <b>Esquerda ❌</b> para definir como <b>4º Lugar</b>. Use a <b>Estrela ⭐</b> para definir como <b>Primeiro Lugar</b>!
          </div>

          {/* Quick Nav Button footer widget */}
          <div className="flex items-center justify-between mt-6 pt-4 border-t border-purple-900/20 relative z-10">
            <button
              disabled={activeGroupIndex === 0}
              onClick={() => setActiveGroupIndex(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#05030e] hover:bg-purple-950 border border-purple-950 disabled:opacity-30 disabled:pointer-events-none text-xs font-extrabold uppercase tracking-wide text-purple-300 hover:text-white rounded-xl cursor-pointer transition-all"
              id="btn-group-nav-prev"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Grupo Anterior</span>
            </button>

            <span className="text-[11px] font-mono text-purple-400 font-extrabold uppercase text-center hidden xs:inline">
              GRUPO {activeGroup.letter} • {activeGroupIndex + 1} DE 12
            </span>

            {activeGroupIndex < 11 ? (
              <button
                onClick={() => setActiveGroupIndex(prev => Math.min(11, prev + 1))}
                className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#05030e] hover:bg-purple-950 border border-purple-950 text-xs font-extrabold uppercase tracking-wide text-purple-300 hover:text-white rounded-xl cursor-pointer transition-all"
                id="btn-group-nav-next"
              >
                <span>Próximo Grupo</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ) : (
              <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3 py-2 rounded-xl border border-emerald-500/25 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Pronto!</span>
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
}
