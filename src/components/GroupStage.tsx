import React, { useState, useEffect } from "react";
import { Team, Group, GROUPS_CONFIG, TEAMS, getTeamFlagUrl } from "../types";
import { Activity, Award, ChevronLeft, ChevronRight, Check, RotateCcw, Star, X, Sparkles, Move, Info, CheckCircle2 } from "lucide-react";
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

  // Active state slots (1st, 2nd, 3rd, 4th)
  const [slots, setSlots] = useState<(string | null)[]>([null, null, null, null]);

  // Track hover states for each of the 4 slots during dragging
  const [dragOverIndex, setDragOverIndex] = useState<number | null>(null);

  // Keep track of which groups the user has actively customized
  const [modifiedGroups, setModifiedGroups] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("copa2026_modified_groups");
      return saved ? JSON.parse(saved) : [];
    } catch (e) {
      return [];
    }
  });

  const activeGroup = GROUPS_CONFIG[activeGroupIndex];

  // Sync slots from global storage or default order
  useEffect(() => {
    const isMod = modifiedGroups.includes(activeGroup.letter);
    if (isMod) {
      const currentOrder = groupsState[activeGroup.letter] || activeGroup.teams.map(t => t.code);
      setSlots(currentOrder);
    } else {
      setSlots([null, null, null, null]);
    }
    setDragOverIndex(null);
  }, [activeGroupIndex, activeGroup.letter, modifiedGroups, groupsState]);

  const handleSlotsComplete = (newSlots: string[]) => {
    // Save order
    onGroupOrderChange(activeGroup.letter, newSlots);

    // Save customized group identifier
    if (!modifiedGroups.includes(activeGroup.letter)) {
      const updated = [...modifiedGroups, activeGroup.letter];
      setModifiedGroups(updated);
      localStorage.setItem("copa2026_modified_groups", JSON.stringify(updated));
    }

    // Trigger Easter egg if Brazil rises to 1st in group C
    if (activeGroup.letter === "C" && newSlots[0] === "BRA") {
      setShowHexaAlert(true);
      setTimeout(() => setShowHexaAlert(false), 3500);
    }
  };

  // Drag and Drop handlers
  const handleDragStart = (e: React.DragEvent, teamCode: string, fromSlotIndex: number | null) => {
    e.dataTransfer.setData("text/plain", JSON.stringify({ teamCode, fromSlotIndex }));
    e.dataTransfer.effectAllowed = "move";
  };

  const handleDragOver = (e: React.DragEvent, index: number) => {
    e.preventDefault();
    setDragOverIndex(index);
  };

  const handleDragLeave = () => {
    setDragOverIndex(null);
  };

  const handleDrop = (e: React.DragEvent, targetIndex: number) => {
    e.preventDefault();
    setDragOverIndex(null);
    try {
      const dataStr = e.dataTransfer.getData("text/plain");
      if (!dataStr) return;
      
      const { teamCode, fromSlotIndex } = JSON.parse(dataStr);
      if (!teamCode) return;

      const newSlots = [...slots];

      if (fromSlotIndex !== null && fromSlotIndex !== undefined) {
        // Dragged from one slot to another slot
        const previousOccupant = newSlots[targetIndex];
        newSlots[targetIndex] = teamCode;
        newSlots[fromSlotIndex] = previousOccupant;
      } else {
        // Dragged from pool
        // Check if this team is already placed in another slot
        const existingSlotIdx = newSlots.indexOf(teamCode);
        if (existingSlotIdx !== -1) {
          newSlots[existingSlotIdx] = null;
        }

        const previousOccupant = newSlots[targetIndex];
        newSlots[targetIndex] = teamCode;
        // previousOccupant goes back to the pool automatically
      }

      setSlots(newSlots);

      // Save if fully complete
      if (newSlots.every(s => s !== null)) {
        handleSlotsComplete(newSlots as string[]);
      }
    } catch (err) {
      console.error("Drop error:", err);
    }
  };

  // Click / Tap Handler for Mobile and accessibility
  const handleTeamTap = (teamCode: string) => {
    const existingIndex = slots.indexOf(teamCode);
    if (existingIndex !== -1) {
      // Already associated, remove it from that slot
      const newSlots = [...slots];
      newSlots[existingIndex] = null;
      setSlots(newSlots);

      // Also remove from modified if they cleared it
      const updatedModList = modifiedGroups.filter(g => g !== activeGroup.letter);
      setModifiedGroups(updatedModList);
      localStorage.setItem("copa2026_modified_groups", JSON.stringify(updatedModList));
      return;
    }

    // Assign to first empty slot
    const emptyIndex = slots.indexOf(null);
    if (emptyIndex !== -1) {
      const newSlots = [...slots];
      newSlots[emptyIndex] = teamCode;
      setSlots(newSlots);

      if (newSlots.every(s => s !== null)) {
        handleSlotsComplete(newSlots as string[]);
      }
    }
  };

  const handleRemoveFromSlot = (slotIndex: number) => {
    const newSlots = [...slots];
    newSlots[slotIndex] = null;
    setSlots(newSlots);

    // Remove from modified groups list immediately so they are in editing state
    const updatedModList = modifiedGroups.filter(g => g !== activeGroup.letter);
    setModifiedGroups(updatedModList);
    localStorage.setItem("copa2026_modified_groups", JSON.stringify(updatedModList));
  };

  // Instant prefill order based on team strength seeds
  const handleSuggestClassification = () => {
    const sorted = [...activeGroup.teams]
      .sort((a, b) => b.seed - a.seed)
      .map(t => t.code);
    
    setSlots(sorted);
    handleSlotsComplete(sorted);
  };

  // Reset selected group back to default
  const handleResetCurrentGroup = () => {
    setSlots([null, null, null, null]);
    const activeLetter = activeGroup.letter;
    
    const updated = modifiedGroups.filter(l => l !== activeLetter);
    setModifiedGroups(updated);
    localStorage.setItem("copa2026_modified_groups", JSON.stringify(updated));

    // Reset parent/global state to default initial order
    const officialGroup = GROUPS_CONFIG.find(g => g.letter === activeLetter);
    if (officialGroup) {
      onGroupOrderChange(activeLetter, officialGroup.teams.map(t => t.code));
    }
  };

  // Percent stats fallback
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

  const isGroupCompleted = slots.every(s => s !== null);

  return (
    <section className="bg-[#070412] text-white py-12 px-4 md:px-8 relative" id="group-stage-section">
      {/* Background neon light glow */}
      <div className="absolute top-0 left-1/4 w-[500px] h-[500px] bg-purple-900/10 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute top-1/2 right-1/4 w-[600px] h-[600px] bg-fuchsia-900/5 rounded-full blur-[140px] pointer-events-none" />

      {/* Hexa Animated Overlay Alert */}
      {showHexaAlert && (
        <div className="fixed top-24 left-1/2 -translate-x-1/2 z-50 pointer-events-none animate-bounce" id="hexa-alert">
          <div className="flex items-center gap-3 px-6 py-3.5 rounded-full bg-gradient-to-r from-yellow-400 via-amber-300 to-emerald-400 border border-yellow-200 text-slate-950 font-black text-sm uppercase tracking-widest shadow-[0_0_35px_rgba(234,179,8,0.6)]">
            <Award className="w-5 h-5 text-emerald-800 animate-spin" />
            <span>Rumo ao Hexa! Brasil na Liderança! 🇧🇷</span>
            <span>⭐</span>
          </div>
        </div>
      )}

      <div className="max-w-4xl mx-auto relative z-10">
        
        {/* Title */}
        <div className="text-center mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 bg-purple-950/40 border border-purple-500/20 text-purple-300 text-[10px] font-mono rounded-full mb-4 uppercase tracking-wider">
            <Activity className="w-3.5 h-3.5 text-purple-400 animate-pulse" />
            VOTE RÁPIDO DO SEU JEITO: ARRASTE OU TOQUE PARA CLASSIFICAR
          </div>
          
          <h2 className="text-3xl md:text-5xl font-sans lg:text-6xl font-black uppercase italic tracking-tight text-white select-none">
            Fase de Grupos
          </h2>

          <p className="mt-2 text-xs md:text-sm text-purple-300 max-w-xl mx-auto leading-relaxed">
            Ordene as seleções do Grupo {activeGroup.letter} arrastando cada time diretamente para a sua posição, ou toque para posicionar instantaneamente de cima a baixo.
          </p>
        </div>



        {/* ========================================== */}
        {/* MAIN WORKSPACE AREA                        */}
        {/* ========================================== */}
        <div className="bg-gradient-to-b from-[#130b2c] to-[#05030f] border border-purple-900/30 rounded-3xl p-6 md:p-8 shadow-2xl">
          
          {!isGroupCompleted ? (
            <div className="grid grid-cols-1 md:grid-cols-12 gap-8 items-start">
              
              {/* Column 1: Available Teams Pool (Left Col on Desktop) */}
              <div className="md:col-span-5 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-xs font-mono uppercase font-black tracking-wider text-purple-400 flex items-center gap-1.5">
                    <Move className="w-3.5 h-3.5" />
                    1. Seleções do Grupo
                  </h3>
                  
                  <button
                    onClick={handleSuggestClassification}
                    className="text-[10px] font-mono uppercase font-bold text-fuchsia-400 hover:text-fuchsia-300 bg-fuchsia-500/10 px-2.5 py-1 rounded-md border border-fuchsia-550/20 active:scale-95 transition-all cursor-pointer"
                  >
                    ⚡ Avançar Rápido
                  </button>
                </div>

                <div className="grid grid-cols-2 gap-3.5" id="available-teams-pool">
                  {activeGroup.teams.map((team) => {
                    const isPlaced = slots.includes(team.code);
                    
                    return (
                      <div
                        key={team.code}
                        draggable={!isPlaced}
                        onDragStart={(e) => handleDragStart(e, team.code, null)}
                        onClick={() => handleTeamTap(team.code)}
                        className={`group relative p-4 rounded-2xl border flex flex-col items-center justify-center text-center transition-all duration-200 select-none ${
                          isPlaced
                            ? "bg-[#09051c] border-purple-950/50 opacity-45 cursor-default"
                            : "bg-[#160f38] hover:bg-[#1f154d] border-purple-800/20 hover:border-fuchsia-500/40 cursor-grab active:cursor-grabbing hover:scale-[1.03] shadow-md hover:shadow-[0_10px_20px_rgba(217,70,239,0.1)]"
                        }`}
                        id={`team-pool-card-${team.code}`}
                      >
                        {/* Shaded checking filter representation */}
                        {isPlaced && (
                          <div className="absolute top-2 right-2 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 p-1 rounded-full text-[9px] font-black z-20">
                            <Check className="w-2.5 h-2.5" />
                          </div>
                        )}

                        <img
                          src={getTeamFlagUrl(team.code)}
                          alt={team.name}
                          className="w-12 h-8.5 object-cover rounded-md shadow-md border border-purple-900 group-hover:border-fuchsia-500/20 transition-all"
                          referrerPolicy="no-referrer"
                        />

                        <span className="text-xs font-black text-white mt-3 uppercase tracking-wide block truncate w-full">
                          {team.name}
                        </span>
                        
                        <span className="text-[9px] font-mono text-purple-400 uppercase mt-0.5 block font-bold">
                          Grupo {activeGroup.letter} • {team.code}
                        </span>
                      </div>
                    );
                  })}
                </div>

                <div className="text-[10px] text-purple-400/80 bg-purple-950/20 border border-purple-900/35 p-3 rounded-2xl flex items-start gap-2.5">
                  <Info className="w-4 h-4 text-fuchsia-400 flex-shrink-0 mt-0.5" />
                  <p className="leading-relaxed">
                    💡 <b>Atalho de Toque:</b> Toque nos escudos acima para preencher automaticamente os espaços de classificação de cima para baixo!
                  </p>
                </div>
              </div>

              {/* Column 2: Target Slots (Right Col on Desktop) */}
              <div className="md:col-span-7 space-y-4">
                <h3 className="text-xs font-mono uppercase font-black tracking-wider text-purple-400">
                  2. Arraste e Defina as Posições:
                </h3>

                <div className="space-y-3.5" id="group-stage-slots-container">
                  {slots.map((placedCode, index) => {
                    const rowTeam = placedCode ? TEAMS[placedCode] : null;
                    const isOver = dragOverIndex === index;

                    const labelIconList = ["🥇", "🥈", "🥉", "❌"];
                    const labelTitleList = [
                      "1º Colocado — Oitavas / Classificado",
                      "2º Colocado — Oitavas / Classificado",
                      "3º Colocado — Repescagem / Repescagem",
                      "4º Colocado — Eliminado / Sem repescagem"
                    ];
                    
                    const emptyStyle = isOver
                      ? "border-fuchsia-500 bg-fuchsia-500/5 shadow-[0_0_15px_rgba(217,70,239,0.15)] scale-[1.01]"
                      : "border-purple-900/30 bg-[#080517] hover:border-purple-800/40";

                    return (
                      <div
                        key={index}
                        onDragOver={(e) => handleDragOver(e, index)}
                        onDragLeave={handleDragLeave}
                        onDrop={(e) => handleDrop(e, index)}
                        className={`relative min-h-[78px] rounded-2xl border transition-all duration-200 flex items-center justify-between p-4 ${
                          rowTeam ? "bg-[#18103d] border-purple-700/50 shadow-md" : emptyStyle
                        }`}
                        id={`group-slot-${index}`}
                      >
                        {rowTeam ? (
                          /* Placed Team layout representation inside slot block */
                          <div
                            draggable
                            onDragStart={(e) => handleDragStart(e, rowTeam.code, index)}
                            className="flex items-center justify-between w-full select-none cursor-grab active:cursor-grabbing"
                          >
                            <div className="flex items-center gap-3.5">
                              {/* Position numeric rank indicator styling */}
                              <span className="text-lg flex-shrink-0">{labelIconList[index]}</span>
                              
                              <img
                                src={getTeamFlagUrl(rowTeam.code)}
                                alt={rowTeam.name}
                                className="w-10 h-7 object-cover rounded shadow border border-purple-900"
                                referrerPolicy="no-referrer"
                              />

                              <div className="text-left">
                                <span className="block text-[8px] font-mono text-purple-400 uppercase tracking-widest font-black leading-none mb-1">
                                  {labelTitleList[index].split("—")[0]}
                                </span>
                                <span className="text-sm font-black text-white uppercase tracking-wide">
                                  {rowTeam.name}
                                </span>
                              </div>
                            </div>

                            <div className="flex items-center gap-2">
                              {/* Selection percentage estimation metrics */}
                              <span className="text-[10px] font-mono text-purple-400 bg-purple-950/75 px-2.5 py-1 rounded border border-purple-900/30">
                                {getGlobalPercentage(rowTeam.code, index)}% voto 1º
                              </span>
                              
                              {/* Simple close/remove click button */}
                              <button
                                onClick={() => handleRemoveFromSlot(index)}
                                className="p-1 px-2 text-rose-500 hover:text-rose-450 hover:bg-rose-500/10 rounded-lg cursor-pointer transition-colors"
                              >
                                <X className="w-4 h-4" />
                              </button>
                            </div>
                          </div>
                        ) : (
                          /* Empty slot layout representation showing label descriptors */
                          <div className="flex items-center gap-3.5 w-full text-left text-xs text-purple-500">
                            <span className="text-lg flex-shrink-0 opacity-50">{labelIconList[index]}</span>
                            <div>
                              <span className="font-mono text-[9px] uppercase font-black tracking-wider block text-purple-450 leading-none mb-1">
                                {labelTitleList[index].split("—")[0].toUpperCase()}
                              </span>
                              <span className="text-purple-500 italic block text-[11px]">
                                {isOver ? "Solte o time para classificar!" : labelTitleList[index].split("—")[1]}
                              </span>
                            </div>
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              </div>

            </div>
          ) : (
            /* Completed Group Placement Recap Card screen */
            <motion.div
              initial={{ opacity: 0, scale: 0.96 }}
              animate={{ opacity: 1, scale: 1 }}
              className="w-full text-center max-w-lg mx-auto py-4"
              id="group-completed-recap"
            >
              <div className="w-14 h-14 bg-emerald-500/15 border border-emerald-500/30 rounded-full flex items-center justify-center mx-auto mb-4 text-emerald-400">
                <CheckCircle2 className="w-8 h-8 text-emerald-400 animate-pulse" />
              </div>
              
              <h3 className="text-2xl font-black text-white uppercase tracking-wide italic">
                Grupo {activeGroup.letter} Classificado!
              </h3>
              <p className="text-xs text-purple-300 mt-1.5 leading-relaxed max-w-xs mx-auto">
                Sua conexão preditiva sintonizou as 4 posições. O pódio do Grupo {activeGroup.letter} está definido.
              </p>

              {/* Ordered final lists preview inside review screen */}
              <div className="mt-6 space-y-2.5">
                {slots.map((teamCode, idx) => {
                  const team = teamCode ? TEAMS[teamCode] : null;
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
                      className={`flex items-center justify-between p-3.5 rounded-2xl border text-left text-xs ${ringStyle[idx]}`}
                    >
                      <div className="flex items-center gap-3">
                        <img
                          src={getTeamFlagUrl(teamCode)}
                          alt={team.name}
                          className="w-6.5 h-4.5 object-cover rounded shadow border border-purple-950"
                          referrerPolicy="no-referrer"
                        />
                        <span className="font-extrabold text-white uppercase">{team.name}</span>
                      </div>
                      <span className="font-mono text-[9px] uppercase font-black tracking-wider">
                        {placementLabel[idx]}
                      </span>
                    </div>
                  );
                })}
              </div>

              {/* Navigation button rows */}
              <div className="mt-8 flex flex-col sm:flex-row gap-3">
                <button
                  onClick={handleResetCurrentGroup}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-[#0c0624] hover:bg-purple-950/50 border border-purple-900/40 text-purple-300 hover:text-white text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all"
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Alterar Classificação</span>
                </button>

                {activeGroupIndex < 11 ? (
                  <button
                    onClick={() => setActiveGroupIndex(prev => prev + 1)}
                    className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-gradient-to-r from-emerald-500 to-teal-500 hover:from-emerald-400 hover:to-teal-400 text-slate-950 text-xs font-black uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-[0_0_15px_rgba(16,185,129,0.3)]"
                  >
                    <span>Ir para Grupo {GROUPS_CONFIG[activeGroupIndex + 1].letter}</span>
                    <ChevronRight className="w-4 h-4 text-slate-950" />
                  </button>
                ) : (
                  <div className="flex-1 bg-gradient-to-tr from-emerald-500/10 to-teal-500/10 text-emerald-400 p-3 rounded-xl border border-emerald-500/20 text-xs font-mono font-black uppercase flex items-center justify-center">
                    🎉 Todos os 12 Grupos Concluídos! Rolar para o Mata-mata!
                  </div>
                )}
              </div>
            </motion.div>
          )}

          {/* Bottom Navigation Control Bar */}
          <div className="flex items-center justify-between mt-8 pt-6 border-t border-purple-900/20 relative z-10">
            <button
              disabled={activeGroupIndex === 0}
              onClick={() => setActiveGroupIndex(prev => Math.max(0, prev - 1))}
              className="inline-flex items-center gap-1.5 px-4 py-2.5 bg-[#05030e] hover:bg-purple-950 border border-purple-950 disabled:opacity-30 disabled:pointer-events-none text-xs font-extrabold uppercase tracking-wide text-purple-300 hover:text-white rounded-xl cursor-pointer transition-all"
              id="btn-group-nav-prev"
            >
              <ChevronLeft className="w-4 h-4" />
              <span>Grupo Anterior</span>
            </button>

            <span className="text-[10px] font-mono text-purple-400 font-extrabold uppercase text-center hidden xs:inline">
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
              <div className="text-[10px] text-emerald-400 font-bold bg-emerald-500/10 px-3.5 py-2 rounded-xl border border-emerald-500/25 flex items-center gap-1">
                <Check className="w-3.5 h-3.5 text-emerald-400" />
                <span>Grupos OK</span>
              </div>
            )}
          </div>

        </div>

      </div>
    </section>
  );
}
