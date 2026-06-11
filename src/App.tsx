import React, { useState, useEffect } from "react";
import { collection, doc, getDoc, getDocs, setDoc, addDoc, query, orderBy, limit } from "firebase/firestore";
import { db, handleFirestoreError, OperationType } from "./firebase";
import { Team, GROUPS_CONFIG, TEAMS, PredictionState, GlobalStats } from "./types";
import CompactHero from "./components/CompactHero";
import GroupStage from "./components/GroupStage";
import ThirdsStage from "./components/ThirdsStage";
import BracketStage from "./components/BracketStage";
import FinalScreen from "./components/FinalScreen";
import AdminPanel from "./components/AdminPanel";
import NovaIspLogo from "./components/NovaIspLogo";
import { Trophy, LayoutGrid, Star, Cpu } from "lucide-react";

// Generate initial groups state
const defaultGroupsState: { [groupLetter: string]: string[] } = {};
GROUPS_CONFIG.forEach((g) => {
  defaultGroupsState[g.letter] = g.teams.map((t) => t.code);
});

export default function App() {
  const [activeSection, setActiveSection] = useState<"Hero" | "Group" | "Thirds" | "Bracket" | "Final">("Hero");
  
  // App state
  const [groups, setGroups] = useState<{ [group: string]: string[] }>(() => {
    try {
      const saved = localStorage.getItem("copa2026_groups");
      if (saved) {
        const parsed = JSON.parse(saved);
        let isValid = true;
        Object.keys(defaultGroupsState).forEach((letter) => {
          const list = parsed[letter];
          if (!Array.isArray(list) || list.length !== 4) {
            isValid = false;
          } else {
            list.forEach((code) => {
              if (!TEAMS[code]) isValid = false;
            });
          }
        });
        if (isValid) return parsed;
      }
    } catch (e) {}
    return defaultGroupsState;
  });

  const [selectedThirds, setSelectedThirds] = useState<string[]>(() => {
    try {
      const saved = localStorage.getItem("copa2026_selected_thirds");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (Array.isArray(parsed) && parsed.length === 8) {
          return parsed;
        }
      }
    } catch (e) {}

    const defaultThirdsList: string[] = [];
    Object.entries(groups).forEach(([letter, teamCodes]) => {
      const thirdCode = teamCodes[2];
      if (thirdCode) defaultThirdsList.push(thirdCode);
    });
    
    return defaultThirdsList
      .map(code => TEAMS[code])
      .filter(Boolean)
      .sort((a, b) => b.seed - a.seed)
      .slice(0, 8)
      .map(t => t.code);
  });
  
  const [bracket, setBracket] = useState<{ [match: string]: string }>(() => {
    try {
      const saved = localStorage.getItem("copa2026_bracket");
      if (saved) {
        const parsed = JSON.parse(saved);
        const cleaned: { [match: string]: string } = {};
        Object.entries(parsed).forEach(([mId, code]) => {
          if (TEAMS[code as string]) {
            cleaned[mId] = code as string;
          }
        });
        return cleaned;
      }
    } catch (e) {}
    return {};
  });

  const [champion, setChampion] = useState(() => {
    const code = localStorage.getItem("copa2026_champion") || "";
    return TEAMS[code] ? code : "";
  });
  const [runnerUp, setRunnerUp] = useState(() => {
    const code = localStorage.getItem("copa2026_runnerUp") || "";
    return TEAMS[code] ? code : "";
  });
  const [thirdPlace, setThirdPlace] = useState(() => {
    const code = localStorage.getItem("copa2026_thirdPlace") || "";
    return TEAMS[code] ? code : "";
  });
  
  const [userName, setUserName] = useState(() => localStorage.getItem("copa2026_name") || "");
  const [userCity, setUserCity] = useState(() => localStorage.getItem("copa2026_city") || "");
  const [userWhatsapp, setUserWhatsapp] = useState(() => localStorage.getItem("copa2026_whatsapp") || "");
  const [hasSubmitted, setHasSubmitted] = useState(() => localStorage.getItem("copa2026_submitted") === "true");

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [globalStats, setGlobalStats] = useState<GlobalStats>({
    totalParticipants: 0,
    championsCount: {},
  });
  const [allSubmissions, setAllSubmissions] = useState<any[]>([]);
  const [lockAllSubmissions, setLockAllSubmissions] = useState(false);
  const [showAdminFooter, setShowAdminFooter] = useState(false);

  // Persistence triggers
  useEffect(() => {
    localStorage.setItem("copa2026_groups", JSON.stringify(groups));
  }, [groups]);

  useEffect(() => {
    localStorage.setItem("copa2026_bracket", JSON.stringify(bracket));
  }, [bracket]);

  useEffect(() => {
    localStorage.setItem("copa2026_selected_thirds", JSON.stringify(selectedThirds));
  }, [selectedThirds]);

  // Clean and sync third placed candidates if groups sequence updates
  useEffect(() => {
    const thirdsCandidates = Object.entries(groups).map(([letter, teamCodes]) => {
      const code = teamCodes[2];
      return { code, team: TEAMS[code] };
    }).filter(t => t.team !== undefined);

    const candidateCodes = thirdsCandidates.map(t => t.code);
    let updated = selectedThirds.filter(code => candidateCodes.includes(code));
    
    if (updated.length < 8) {
      const remainingCandidates = thirdsCandidates
        .filter(t => !updated.includes(t.code))
        .sort((a, b) => b.team.seed - a.team.seed);
        
      const needed = 8 - updated.length;
      const extra = remainingCandidates.slice(0, needed).map(t => t.code);
      updated = [...updated, ...extra];
    }
    
    if (updated.length > 8) {
      updated = updated.slice(0, 8);
    }
    
    if (JSON.stringify(updated) !== JSON.stringify(selectedThirds)) {
      setSelectedThirds(updated);
    }
  }, [groups]);

  const handleToggleThird = (teamCode: string) => {
    if (selectedThirds.includes(teamCode)) {
      setSelectedThirds((prev) => prev.filter((c) => c !== teamCode));
    } else {
      if (selectedThirds.length < 8) {
        setSelectedThirds((prev) => [...prev, teamCode]);
      }
    }
  };

  // Fetch Stats and Admin Logs from Firestore
  const loadDatabaseData = async () => {
    try {
      const statsRef = doc(db, "stats", "global");
      const statsSnap = await getDoc(statsRef);
      if (statsSnap.exists()) {
        const data = statsSnap.data() as GlobalStats;
        setGlobalStats(data);
        if (data.hasOwnProperty("lockSubmissions")) {
          setLockAllSubmissions((data as any).lockSubmissions);
        }
      }

      const predRef = collection(db, "predictions");
      const q = query(predRef, orderBy("createdAt", "desc"), limit(250));
      const querySnap = await getDocs(q);
      const predictionList: any[] = [];
      querySnap.forEach((docSnap) => {
        predictionList.push({ id: docSnap.id, ...docSnap.data() });
      });
      setAllSubmissions(predictionList);
    } catch (e) {
      console.warn("Could not synchronize with Firestore directly. Running locally.", e);
    }
  };

  useEffect(() => {
    loadDatabaseData();
  }, []);

  const handleGroupOrderChange = (groupLetter: string, sortedTeamCodes: string[]) => {
    setGroups((prev) => ({ ...prev, [groupLetter]: sortedTeamCodes }));
    if (activeSection === "Hero") {
      setActiveSection("Group");
    }
  };

  const handleBracketChange = (matchId: string, winningCode: string) => {
    setBracket((prev) => ({ ...prev, [matchId]: winningCode }));
  };

  const handleFinalWinnersChange = (champ: string, runner: string, third: string) => {
    setChampion(champ);
    localStorage.setItem("copa2026_champion", champ);
    
    setRunnerUp(runner);
    localStorage.setItem("copa2026_runnerUp", runner);
    
    setThirdPlace(third);
    localStorage.setItem("copa2026_thirdPlace", third);

    if (champ && activeSection === "Bracket") {
      setActiveSection("Final");
    }
  };

  const handleSubmission = async (name: string, whatsapp: string, city: string): Promise<boolean> => {
    if (lockAllSubmissions) {
      alert("As submissões de palpites estão encerradas no momento.");
      return false;
    }

    setIsSubmitting(true);
    const creationTime = new Date().toISOString();

    const payload = {
      name,
      whatsapp,
      city,
      champion,
      runnerUp,
      thirdPlace,
      groups,
      bracket,
      createdAt: creationTime,
    };

    try {
      const predRef = collection(db, "predictions");
      await addDoc(predRef, payload);

      const currentParticipants = globalStats.totalParticipants + 1;
      const currentChamps = { ...globalStats.championsCount };
      currentChamps[champion] = (currentChamps[champion] || 0) + 1;

      const currentTeamSelections: { [code: string]: any } = globalStats.teamSelections || {};
      if (!currentTeamSelections[champion]) {
        currentTeamSelections[champion] = { first: 0, second: 0, third: 0, champion: 0 };
      }
      currentTeamSelections[champion].champion = (currentTeamSelections[champion].champion || 0) + 1;
      currentTeamSelections[champion].first = (currentTeamSelections[champion].first || 0) + 1;

      if (!currentTeamSelections[runnerUp]) {
        currentTeamSelections[runnerUp] = { first: 0, second: 0, third: 0, champion: 0 };
      }
      currentTeamSelections[runnerUp].second = (currentTeamSelections[runnerUp].second || 0) + 1;

      if (!currentTeamSelections[thirdPlace]) {
        currentTeamSelections[thirdPlace] = { first: 0, second: 0, third: 0, champion: 0 };
      }
      currentTeamSelections[thirdPlace].third = (currentTeamSelections[thirdPlace].third || 0) + 1;

      const updatedStats = {
        totalParticipants: currentParticipants,
        championsCount: currentChamps,
        teamSelections: currentTeamSelections,
        lockSubmissions: lockAllSubmissions,
      };

      await setDoc(doc(db, "stats", "global"), updatedStats);

      setUserName(name);
      localStorage.setItem("copa2026_name", name);
      setUserCity(city);
      localStorage.setItem("copa2026_city", city);
      setUserWhatsapp(whatsapp);
      localStorage.setItem("copa2026_whatsapp", whatsapp);
      
      setHasSubmitted(true);
      localStorage.setItem("copa2026_submitted", "true");

      await loadDatabaseData();
      return true;
    } catch (error) {
      handleFirestoreError(error, OperationType.CREATE, "predictions");
      return false;
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleToggleLock = async (locked: boolean) => {
    try {
      const statsRef = doc(db, "stats", "global");
      await setDoc(statsRef, { ...globalStats, lockSubmissions: locked }, { merge: true });
      setLockAllSubmissions(locked);
      await loadDatabaseData();
    } catch (e) {
      console.error("Could not write lock state.", e);
    }
  };

  return (
    <div className={`bg-[#070412] flex flex-col font-sans select-none antialiased ${
      activeSection === "Hero" ? "h-screen max-h-screen overflow-hidden" : "min-h-screen overflow-x-hidden"
    }`}>
      {/* Immersive Top Bar Navigation Header with Nova ISP Logo */}
      <header className="sticky top-0 z-40 w-full bg-[#070412]/80 backdrop-blur-xl border-b border-purple-950/40 px-4 py-3.5 flex items-center justify-between">
        <div className="flex items-center gap-3">
          <NovaIspLogo size="md" />
          <div className="hidden xs:block h-6 w-[1px] bg-purple-900/40 mx-2" />
          <div className="hidden xs:block">
            <h1 className="text-[10px] md:text-xs font-black text-white tracking-widest uppercase">
              DESAFIO DA NOVA ISP
            </h1>
            <p className="text-[8px] font-mono text-fuchsia-450 uppercase tracking-widest mt-0.5">
              ⚡ COPA DO MUNDO 2026 • 100% DIGITAL
            </p>
          </div>
        </div>

        {/* Anchor links with active animations */}
        <nav className="hidden sm:flex items-center gap-2">
          {[
            { id: "Hero", text: "Início", icon: <Cpu className="w-3.5 h-3.5" /> },
            { id: "Group", text: "Fase de Grupos", icon: <LayoutGrid className="w-3.5 h-3.5" /> },
            { id: "Thirds", text: "Melhores 3ºs", icon: <Star className="w-3.5 h-3.5" /> },
            { id: "Bracket", text: "Mata-Mata", icon: <Trophy className="w-3.5 h-3.5" /> },
            { id: "Final", text: "Palpite Final", icon: <Star className="w-3.5 h-3.5" /> },
          ].map((item) => (
            <button
              key={item.id}
              onClick={() => setActiveSection(item.id as any)}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold uppercase tracking-wide cursor-pointer transition-all ${
                activeSection === item.id
                  ? "bg-purple-950/50 border border-purple-900 text-fuchsia-400 shadow-[0_0_12px_rgba(168,85,247,0.2)]"
                  : "text-purple-300 hover:text-white"
              }`}
            >
              {item.icon}
              {item.text}
            </button>
          ))}
        </nav>
      </header>

      {/* Main visual router based on sections */}
      <main className="flex-grow">
        {activeSection === "Hero" && (
          <CompactHero
            onStart={() => setActiveSection("Group")}
            participantCount={globalStats.totalParticipants}
          />
        )}

        {/* Real-time Group stage playground */}
        {activeSection === "Group" && (
          <div className="animate-fade-in">
            <div className="bg-[#070412] pt-8 px-4 flex justify-between items-center max-w-7xl mx-auto">
              <button
                onClick={() => setActiveSection("Hero")}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-white uppercase font-bold tracking-wider py-2 cursor-pointer transition-colors"
              >
                ← Voltar
              </button>
              <button
                onClick={() => setActiveSection("Thirds")}
                className="bg-[#0c0822] hover:bg-purple-900/30 text-fuchsia-400 border border-purple-800 hover:border-fuchsia-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.15)] transition-all"
              >
                Avançar (Melhores 3ºs) →
              </button>
            </div>
            
            <GroupStage
              groupsState={groups}
              onGroupOrderChange={handleGroupOrderChange}
              globalStats={globalStats}
            />
          </div>
        )}

        {/* Dedicated Thirds selection Stage (Os 8 melhores terceiros colocados) */}
        {activeSection === "Thirds" && (
          <div className="animate-fade-in">
            <ThirdsStage
              groupsState={groups}
              selectedThirds={selectedThirds}
              onToggleThird={handleToggleThird}
              onNavigateBack={() => setActiveSection("Group")}
              onNavigateForward={() => setActiveSection("Bracket")}
            />
          </div>
        )}

        {/* Decisive single-elimination brackets */}
        {activeSection === "Bracket" && (
          <div className="animate-fade-in">
            <div className="bg-[#070412] pt-8 px-4 flex justify-between items-center max-w-7xl mx-auto">
              <button
                onClick={() => setActiveSection("Thirds")}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-white uppercase font-bold tracking-wider py-2 cursor-pointer transition-colors"
              >
                ← Terceiros Colocados
              </button>
              <button
                onClick={() => setActiveSection("Final")}
                className="bg-[#0c0822] hover:bg-purple-900/30 text-fuchsia-400 border border-purple-800 hover:border-fuchsia-500 px-5 py-2.5 rounded-xl text-xs font-black uppercase tracking-wider cursor-pointer shadow-[0_0_15px_rgba(217,70,239,0.15)] transition-all"
              >
                Visualizar Resumo →
              </button>
            </div>
            
            <BracketStage
              groupsState={groups}
              bracketState={bracket}
              onBracketChange={handleBracketChange}
              onFinalWinnersChange={handleFinalWinnersChange}
              champion={champion}
              runnerUp={runnerUp}
              thirdPlace={thirdPlace}
              selectedThirds={selectedThirds}
            />
          </div>
        )}

        {/* Summary Podiums and submission contact */}
        {activeSection === "Final" && (
          <div className="animate-fade-in">
            <div className="bg-[#070412] pt-8 px-4 flex justify-start max-w-4xl mx-auto">
              <button
                onClick={() => setActiveSection("Bracket")}
                className="inline-flex items-center gap-1 text-xs text-purple-400 hover:text-white uppercase font-bold tracking-wider py-2 cursor-pointer transition-colors"
              >
                ← Alterar Chaves
              </button>
            </div>
            
            <FinalScreen
              champion={champion}
              runnerUp={runnerUp}
              thirdPlace={thirdPlace}
              onSubmit={handleSubmission}
              isSubmitting={isSubmitting}
              hasSubmitted={hasSubmitted}
            />
          </div>
        )}

        {/* Secret Admin panel toggle rendering area */}
        {showAdminFooter && (
          <div className="border-t-2 border-dashed border-purple-800">
            <AdminPanel
              totalParticipants={globalStats.totalParticipants}
              predictions={allSubmissions}
              championsCount={globalStats.championsCount}
              lockSubmissions={lockAllSubmissions}
              onToggleLock={handleToggleLock}
            />
          </div>
        )}
      </main>

      {/* Decorative footer with secret click entry */}
      {activeSection !== "Hero" && (
        <footer className="bg-[#05030e] border-t border-purple-950/40 py-12 px-4 text-center text-xs text-purple-400 font-light relative animate-fade-in text-nowrap select-none">
          <p className="tracking-widest uppercase text-[11px] font-bold text-white mb-2">Desafio da Nova ISP 2026</p>
          <p className="tracking-wide text-purple-400/80">
            © {new Date().getFullYear()} DESAFIO DA NOVA ISP - COPA DO MUNDO. Todos os direitos reservados.
          </p>
          <p className="mt-1 text-purple-500 font-mono text-[10px]">
            Sintonizado via conexão Nova ISP de alta velocidade.
          </p>
          
          {/* Secret entry click zone */}
          <button
            onClick={() => setShowAdminFooter(!showAdminFooter)}
            className="mt-6 text-[9px] tracking-widest uppercase text-purple-600 hover:text-fuchsia-400 cursor-pointer block mx-auto py-1 font-mono transition-colors"
          >
            {showAdminFooter ? "Fechar Painel de Gestão" : "Acesso de Gestão (Admin de Palpites)"}
          </button>
        </footer>
      )}
    </div>
  );
}
