import React, { useState } from "react";
import { Team, TEAMS, getTeamFlagUrl } from "../types";
import { Lock, Unlock, Download, Users, BarChart3, Database, ShieldAlert, KeyRound } from "lucide-react";

interface AdminPanelProps {
  totalParticipants: number;
  predictions: any[];
  championsCount: { [code: string]: number };
  lockSubmissions: boolean;
  onToggleLock: (locked: boolean) => Promise<void>;
}

export default function AdminPanel({
  totalParticipants,
  predictions,
  championsCount,
  lockSubmissions,
  onToggleLock,
}: AdminPanelProps) {
  const [password, setPassword] = useState("");
  const [isAuthorized, setIsAuthorized] = useState(false);
  const [errorWord, setErrorWord] = useState("");

  const handleAuthorize = (e: React.FormEvent) => {
    e.preventDefault();
    setErrorWord("");
    if (password === "admin2026" || password === "copa2026") {
      setIsAuthorized(true);
    } else {
      setErrorWord("Senha incorreta. Tente 'admin2026' ou 'copa2026'.");
    }
  };

  const getMostChosenChampions = () => {
    const list = Object.entries(championsCount).map(([code, count]) => ({
      team: TEAMS[code] || { code, name: code, flag: "⚽", seed: 50 },
      count,
    }));
    return list.sort((a, b) => b.count - a.count);
  };

  const chartData = getMostChosenChampions();

  const handleExportCSV = () => {
    if (predictions.length === 0) {
      alert("Nenhum palpite registrado para exportar.");
      return;
    }

    let csvContent = "\uFEFF"; // UTF-8 BOM
    csvContent += "Nome,Cidade,WhatsApp,Campeao,Vice,Terceiro,Data Submissao\n";

    predictions.forEach((p) => {
      const champName = TEAMS[p.champion]?.name || p.champion || "";
      const runnerUpName = TEAMS[p.runnerUp]?.name || p.runnerUp || "";
      const thirdPlaceName = TEAMS[p.thirdPlace]?.name || p.thirdPlace || "";
      const dateStr = p.createdAt ? new Date(p.createdAt).toLocaleString("pt-BR") : "";

      const escapedName = `"${(p.name || "").replace(/"/g, '""')}"`;
      const escapedCity = `"${(p.city || "").replace(/"/g, '""')}"`;
      const escapedWhatsapp = `"${(p.whatsapp || "").replace(/"/g, '""')}"`;

      csvContent += `${escapedName},${escapedCity},${escapedWhatsapp},"${champName}","${runnerUpName}","${thirdPlaceName}","${dateStr}"\n`;
    });

    const blob = new Blob([csvContent], { type: "text/csv;charset=utf-8;" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.setAttribute("download", `palpites_desafio_chaves_copa2026.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  if (!isAuthorized) {
    return (
      <section className="bg-[#070412] py-16 px-4 md:px-8 border-t border-purple-900/10 flex justify-center">
        <div className="w-full max-w-sm bg-purple-950/10 border border-purple-900/40 p-8 rounded-3xl shadow-2xl text-center">
          <KeyRound className="w-12 h-12 text-fuchsia-400 mx-auto mb-4 animate-bounce" />
          <h3 className="text-xl font-bold text-white uppercase tracking-wider mb-2">
            Autenticação Segura
          </h3>
          <p className="text-xs text-purple-400 mb-6 font-mono">
            PORTAL MONITOR DO ADMINISTRADOR
          </p>

          <form onSubmit={handleAuthorize} className="space-y-4">
            {errorWord && (
              <p className="text-rose-400 text-xs font-semibold bg-rose-500/10 p-2.5 rounded-xl border border-rose-500/25">
                {errorWord}
              </p>
            )}
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              placeholder="Digite a Senha Administrador"
              className="w-full p-3.5 rounded-xl bg-purple-950/30 border border-purple-900/60 focus:border-fuchsia-500 focus:outline-none text-sm text-white placeholder-purple-800 text-center font-bold font-mono transition-all"
            />
            <button
              type="submit"
              className="w-full py-4 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 text-white font-black text-xs uppercase tracking-wider rounded-2xl cursor-pointer hover:scale-[1.02] transition-all border border-fuchsia-400/10 shadow-lg"
            >
              Acessar Painel
            </button>
          </form>
        </div>
      </section>
    );
  }

  return (
    <section className="bg-[#070412] py-16 px-4 md:px-8 border-t border-purple-900/10">
      <div className="max-w-6xl mx-auto">
        <div className="flex flex-col md:flex-row items-start md:items-center justify-between border-b border-purple-900/40 pb-6 mb-8 gap-5">
          <div>
            <span className="text-xs font-mono font-bold text-rose-400 bg-rose-400/10 px-3 py-1 rounded-full border border-rose-500/20 uppercase tracking-widest">
              LIGAÇÃO CRÍTICA SECURE
            </span>
            <h2 className="text-3xl font-sans font-black uppercase text-white mt-3 italic tracking-tight">
              Console Admin de Banda Larga
            </h2>
          </div>

          <div className="flex flex-wrap gap-3">
            <button
              onClick={handleExportCSV}
              className="inline-flex items-center gap-2 px-5 py-3.5 bg-gradient-to-r from-purple-600 to-fuchsia-500 text-white font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all shadow-md"
            >
              <Download className="w-4 h-4" />
              Exportar CSV ({predictions.length})
            </button>

            <button
              onClick={() => onToggleLock(!lockSubmissions)}
              className={`inline-flex items-center gap-2 px-5 py-3.5 font-bold text-xs uppercase tracking-wider rounded-xl cursor-pointer transition-all border ${
                lockSubmissions
                  ? "bg-rose-950/40 text-rose-400 border-rose-900/60 hover:bg-rose-900/50"
                  : "bg-purple-950/40 text-purple-200 border-purple-900 hover:bg-purple-900/60"
              }`}
            >
              {lockSubmissions ? (
                <>
                  <Lock className="w-4 h-4" />
                  Fechados (Desbloquear)
                </>
              ) : (
                <>
                  <Unlock className="w-4 h-4" />
                  Aberto (Encerrar Palpites)
                </>
              )}
            </button>
          </div>
        </div>

        {/* Global Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          <div className="bg-purple-950/10 backdrop-blur-md border border-purple-900/30 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-indigo-500/10 flex items-center justify-center text-indigo-400 border border-indigo-500/15">
              <Users className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <div className="text-xs text-purple-400 font-mono">Conexões Sincronizadas</div>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                {totalParticipants}
              </div>
            </div>
          </div>

          <div className="bg-purple-950/10 backdrop-blur-md border border-purple-900/30 p-5 rounded-2xl flex items-center gap-4">
            <div className="w-12 h-12 rounded-xl bg-purple-500/10 flex items-center justify-center text-purple-400 border border-purple-500/15">
              <BarChart3 className="w-6 h-6 text-fuchsia-400" />
            </div>
            <div>
              <div className="text-xs text-purple-400 font-mono">Variantes de Campeões</div>
              <div className="text-2xl font-mono font-bold text-white mt-1">
                {Object.keys(championsCount).length}
              </div>
            </div>
          </div>

          <div className="bg-purple-950/10 backdrop-blur-md border border-purple-900/30 p-5 rounded-2xl flex items-center gap-4">
            <div className={`w-12 h-12 rounded-xl flex items-center justify-center border ${
              lockSubmissions 
                ? "bg-rose-500/10 text-rose-400 border-rose-500/15" 
                : "bg-fuchsia-500/10 text-fuchsia-400 border-fuchsia-500/15"
            }`}>
              {lockSubmissions ? <Lock className="w-5 h-5" /> : <Unlock className="w-5 h-5 animate-pulse" />}
            </div>
            <div>
              <div className="text-xs text-purple-400 font-mono">Estado da Porta</div>
              <div className={`text-base font-bold font-mono mt-1 ${lockSubmissions ? "text-rose-400" : "text-fuchsia-400"}`}>
                {lockSubmissions ? "LOCKED (LOCK)" : "RECEIVING DATA STREAM"}
              </div>
            </div>
          </div>
        </div>

        {/* Breakdown layout column */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-10">
          {/* Top selected teams list */}
          <div className="bg-purple-950/5 border border-purple-900/30 p-6 rounded-2xl">
            <legend className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
              <BarChart3 className="w-4 h-4 text-fuchsia-400" />
              Seleções Mais Escolhidas Como Campeão
            </legend>
            
            <div className="space-y-4">
              {chartData.length === 0 ? (
                <div className="text-center py-6 text-xs text-purple-400 italic font-mono">
                  Nenhum palpite enviado ainda para gerar gráfico.
                </div>
              ) : (
                chartData.slice(0, 7).map((item, idx) => {
                  const maxCount = chartData[0]?.count || 1;
                  const ratio = Math.round((item.count / maxCount) * 100);

                  return (
                    <div key={idx} className="space-y-1.5">
                      <div className="flex items-center justify-between text-xs font-semibold">
                        <div className="flex items-center gap-2">
                          <img
                            src={getTeamFlagUrl(item.team.code)}
                            alt={item.team.name || ""}
                            className="w-5.5 h-4 object-cover rounded shadow-sm border border-purple-950"
                            referrerPolicy="no-referrer"
                          />
                          <span className="text-purple-100">{item.team.name}</span>
                        </div>
                        <span className="font-mono text-fuchsia-400">
                          {item.count} {item.count === 1 ? "voto" : "votos"}
                        </span>
                      </div>
                      <div className="w-full h-2 bg-[#090518] rounded-full overflow-hidden border border-purple-900/30">
                        <div
                          className="h-full bg-gradient-to-r from-purple-500 to-fuchsia-500 rounded-full"
                          style={{ width: `${ratio}%` }}
                        />
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </div>

          {/* Submissions list viewer */}
          <div className="bg-purple-950/5 border border-purple-900/30 p-6 rounded-2xl flex flex-col justify-between">
            <div>
              <legend className="text-sm font-bold text-white uppercase tracking-wider mb-4 flex items-center gap-2">
                <Database className="w-4 h-4 text-indigo-400" />
                Logs Recentes de Conexão (Inscrições)
              </legend>

              <div className="space-y-3 max-h-[280px] overflow-y-auto pr-1">
                {predictions.length === 0 ? (
                  <div className="text-center py-10 text-xs text-purple-400 italic font-mono">
                    Nenhum cadastro de palpite encontrado no banco de dados.
                  </div>
                ) : (
                  predictions.slice(0, 10).map((p, idx) => (
                    <div
                      key={p.id || idx}
                      className="p-3 bg-[#0a061b] hover:bg-purple-950/30 rounded-xl border border-purple-900/20 flex items-center justify-between transition-colors"
                    >
                      <div className="text-left">
                        <h5 className="text-xs font-bold text-white">{p.name}</h5>
                        <p className="text-[10px] text-purple-400 mt-1 uppercase font-mono tracking-wide">
                          📍 {p.city}{p.whatsapp ? ` • 📞 ${p.whatsapp}` : ""}
                        </p>
                      </div>
                      
                      <div className="text-right flex items-center gap-1.5 bg-[#050310] px-2.5 py-1 rounded-lg border border-purple-900/40">
                        {TEAMS[p.champion] && (
                          <img
                            src={getTeamFlagUrl(p.champion)}
                            alt={TEAMS[p.champion]?.name || ""}
                            className="w-5.5 h-4 object-cover rounded shadow-sm border border-purple-950"
                            referrerPolicy="no-referrer"
                          />
                        )}
                        <span className="text-xs font-mono font-bold text-fuchsia-400 uppercase">
                          {p.champion}
                        </span>
                      </div>
                    </div>
                  ))
                )}
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
