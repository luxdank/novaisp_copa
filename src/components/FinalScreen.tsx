import React, { useState } from "react";
import { Team, TEAMS, getTeamFlagUrl } from "../types";
import { Trophy, Share2, Clipboard, MessageCircle, Send, Check, AlertCircle, Wifi } from "lucide-react";

interface FinalScreenProps {
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  onSubmit: (name: string, whatsapp: string, city: string) => Promise<boolean>;
  isSubmitting: boolean;
  hasSubmitted: boolean;
}

export default function FinalScreen({
  champion,
  runnerUp,
  thirdPlace,
  onSubmit,
  isSubmitting,
  hasSubmitted,
}: FinalScreenProps) {
  const [name, setName] = useState("");
  const [whatsapp, setWhatsapp] = useState("");
  const [city, setCity] = useState("");
  const [copied, setCopied] = useState(false);
  const [validatorError, setValidatorError] = useState("");

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

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setValidatorError("");

    if (!name.trim()) {
      setValidatorError("Por favor, digite seu nome completo.");
      return;
    }
    if (!city.trim()) {
      setValidatorError("Por favor, informe sua cidade.");
      return;
    }

    if (!champion || !runnerUp || !thirdPlace) {
      setValidatorError("Chaveamento incompleto. Verifique se escolheu Campeão, Vice e 3º colocado!");
      return;
    }

    await onSubmit(name, whatsapp, city);
  };

  return (
    <section className="bg-[#070412] py-16 px-4 md:px-8 border-t border-purple-900/10 overflow-hidden relative">
      {/* Immersive radial glows */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[700px] h-[700px] bg-purple-600/5 rounded-full blur-[140px] pointer-events-none animate-pulse" />
      <div className="absolute bottom-10 left-10 w-48 h-48 bg-fuchsia-500/5 rounded-full blur-[120px] pointer-events-none" />

      <div className="max-w-4xl mx-auto relative z-10">
        <div className="text-center mb-10">
          <span className="text-xs font-mono text-fuchsia-400 bg-fuchsia-500/10 px-4 py-1.5 rounded-full border border-fuchsia-500/20 uppercase tracking-widest font-black">
            LARGURA DE BANDA COMPLETA: PALPITE CONCLUÍDO
          </span>
          <h2 className="text-4xl md:text-6xl font-sans lg:text-7xl font-extrabold uppercase text-white mt-4 italic tracking-tight select-none drop-shadow-2xl">
            🏆 SUA COPA ESTÁ PRONTA
          </h2>
          <p className="mt-4 text-purple-300 text-sm md:text-base max-w-lg mx-auto font-light leading-relaxed">
            Aqui está o resumo épico das suas escolhas para o pódio supremo do maior torneio esportivo do planeta!
          </p>
        </div>

        {/* Podium Bracket Summary Grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-10">
          {/* Champion Card (Central Highlight) */}
          <div className="md:col-start-2 md:row-start-1 bg-gradient-to-b from-purple-950/40 via-purple-950/20 to-purple-950/60 rounded-3xl border-2 border-fuchsia-500 p-6 flex flex-col items-center justify-between text-center shadow-[0_0_35px_rgba(217,70,239,0.25)] transform md:scale-105 transition-all">
            <span className="text-xs font-mono font-black text-fuchsia-400 uppercase tracking-wider mb-2">
              🥇 CAMPEÃO SUPREMO
            </span>
            <div className="w-20 h-20 bg-fuchsia-500/10 border border-fuchsia-500/20 rounded-full flex items-center justify-center text-5xl shadow-inner my-3 animate-pulse">
              🏆
            </div>
            {champObj ? (
              <div className="mt-3 flex flex-col items-center">
                <img
                  src={getTeamFlagUrl(champObj.code)}
                  alt={champObj.name}
                  className="w-20 h-14 object-cover rounded-xl shadow-lg border-2 border-fuchsia-550 mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-2xl font-bold tracking-wide text-white">{champObj.name}</h3>
              </div>
            ) : (
              <span className="text-purple-400 text-sm italic mt-3">Final indefinida</span>
            )}
          </div>

          {/* Runner Up Card */}
          <div className="bg-purple-950/10 backdrop-blur-md rounded-3xl border border-purple-900/30 p-6 flex flex-col items-center text-center justify-between shadow-2xl">
            <span className="text-xs font-mono font-black text-purple-300 uppercase tracking-wider mb-2">
              🥈 VICE-CAMPEÃO
            </span>
            <div className="w-16 h-16 bg-purple-950/20 border border-purple-900/40 rounded-full flex items-center justify-center text-4xl my-3">
              🥈
            </div>
            {rUpObj ? (
              <div className="mt-3 flex flex-col items-center">
                <img
                  src={getTeamFlagUrl(rUpObj.code)}
                  alt={rUpObj.name}
                  className="w-16 h-11 object-cover rounded-lg shadow-md border border-purple-950 mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-xl font-bold tracking-wide text-purple-100">{rUpObj.name}</h3>
              </div>
            ) : (
              <span className="text-purple-500 text-sm italic mt-3">Indefinido</span>
            )}
          </div>

          {/* Third Place Card */}
          <div className="bg-purple-950/10 backdrop-blur-md rounded-3xl border border-purple-900/30 p-6 flex flex-col items-center text-center justify-between shadow-2xl">
            <span className="text-xs font-mono font-black text-amber-500 uppercase tracking-wider mb-2">
              🥉 TERCEIRO COLOCADO
            </span>
            <div className="w-16 h-16 bg-amber-550/10 border border-amber-900/20 rounded-full flex items-center justify-center text-4xl my-3">
              🥉
            </div>
            {thirdObj ? (
              <div className="mt-3 flex flex-col items-center">
                <img
                  src={getTeamFlagUrl(thirdObj.code)}
                  alt={thirdObj.name}
                  className="w-16 h-11 object-cover rounded-lg shadow-md border border-purple-950 mb-3"
                  referrerPolicy="no-referrer"
                />
                <h3 className="text-xl font-bold tracking-wide text-purple-100">{thirdObj.name}</h3>
              </div>
            ) : (
              <span className="text-purple-500 text-sm italic mt-3">Indefinido</span>
            )}
          </div>
        </div>

        {/* Dynamic Accuracy Gauge */}
        {champObj && rUpObj && (
          <div className="max-w-md mx-auto bg-purple-950/20 border border-purple-900/40 p-6 rounded-2xl text-center mb-10 shadow-xl">
            <h4 className="text-xs font-mono font-bold text-purple-400 uppercase tracking-widest">
              Probabilidade Estimada de Acerto
            </h4>
            <div className="mt-4 flex items-center justify-center gap-4">
              <div className="relative w-20 h-20 flex items-center justify-center">
                <svg className="w-full h-full transform -rotate-90">
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#1d1230"
                    strokeWidth="6"
                    fill="transparent"
                  />
                  <circle
                    cx="40"
                    cy="40"
                    r="34"
                    stroke="#d946ef"
                    strokeWidth="6"
                    fill="transparent"
                    strokeDasharray={213}
                    strokeDashoffset={213 - (213 * prob) / 100}
                    className="transition-all duration-1000 ease-out"
                  />
                </svg>
                <span className="absolute text-lg font-mono font-black text-white">{prob}%</span>
              </div>
              <div className="text-left">
                <h5 className="text-sm font-bold text-purple-200">
                  {prob >= 80 ? "Palpite Expert 🤓" : "Palpite Ousado 🎯"}
                </h5>
                <p className="text-xs text-purple-400 mt-1">
                  Índice calculado com base nos pesos históricos das seleções escolhidas de alta performance.
                </p>
              </div>
            </div>
          </div>
        )}

        {/* Share Section Preview Card */}
        <div className="bg-purple-950/10 backdrop-blur-xl border border-purple-900/30 p-8 rounded-3xl mb-10 shadow-2xl flex flex-col items-center justify-center text-center">
          <h3 className="text-lg font-bold text-white uppercase tracking-wide flex items-center gap-2 mb-4">
            <Share2 className="w-5 h-5 text-fuchsia-400 animate-pulse" />
            Compartilhe Seu Palpite
          </h3>
          <p className="text-xs text-purple-300 max-w-sm mb-6 leading-relaxed">
            Mostre aos seus amigos seu pódio exclusivo para a Copa de 2026 com velocidade banda larga.
          </p>

          <div className="flex flex-wrap items-center justify-center gap-4 w-full">
            <button
              onClick={handleWhatsAppShare}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-5 py-4 bg-gradient-to-r from-purple-600 to-fuchsia-605 hover:from-purple-500 hover:to-fuchsia-500 text-white font-bold rounded-2xl cursor-pointer transition-all text-sm uppercase tracking-wide shadow-md"
            >
              <MessageCircle className="w-4 h-4 fill-white text-purple-600" />
              WhatsApp
            </button>

            <button
              onClick={handleCopyLink}
              className="flex-1 min-w-[150px] inline-flex items-center justify-center gap-2 px-5 py-4 bg-purple-950/40 hover:bg-purple-900/40 text-purple-200 hover:text-white font-bold rounded-2xl cursor-pointer transition-all text-sm uppercase tracking-wide border border-purple-900"
            >
              {copied ? (
                <>
                  <Check className="w-4 h-4 text-fuchsia-400" />
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
        </div>

        {/* Submission / Contact Form */}
        <div className="bg-purple-950/5 backdrop-blur-md rounded-3xl border border-purple-900/30 p-6 md:p-10 shadow-2xl">
          <div className="flex items-center gap-3 mb-6">
            <div className="p-2 bg-purple-500/10 rounded-xl border border-purple-500/20 text-purple-400">
              <Send className="w-6 h-6 text-fuchsia-400 animate-pulse" />
            </div>
            <div>
              <h3 className="text-xl font-bold text-white uppercase tracking-tight">
                Registrar Palpite no Ranking Geral
              </h3>
              <p className="text-xs text-purple-400 font-mono">ENVIE AGORA EM VELOCIDADE DA TORCIDA</p>
            </div>
          </div>

          {hasSubmitted ? (
            <div className="bg-fuchsia-950/20 border border-fuchsia-500/20 p-8 rounded-2xl text-center">
              <Trophy className="w-14 h-14 text-amber-400 mx-auto animate-bounce mb-3" />
              <h4 className="text-xl font-black text-fuchsia-400 uppercase tracking-widest">
                Palpite Cadastrado com Sucesso!
              </h4>
              <p className="text-sm text-purple-200 mt-2 font-medium">
                Sua previsão está listada na grade oficial do ranking.
              </p>
              <p className="text-xs text-purple-400 mt-5 italic select-none">
                ⚽ “A transmissão está sintonizada. Agora é só esperar a bola rolar!”
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-6">
              {validatorError && (
                <div className="flex items-center gap-2 p-4 rounded-xl bg-rose-500/10 border border-rose-500/20 text-rose-400 text-xs font-semibold">
                  <AlertCircle className="w-4 h-4" />
                  {validatorError}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-5">
                <div className="flex flex-col gap-2">
                  <label htmlFor="user-name" className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    Nome Completo *
                  </label>
                  <input
                    id="user-name"
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ex: João Silva Costa"
                    className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/60 hover:border-purple-500/40 focus:border-fuchsia-500 focus:outline-none text-sm text-white placeholder-purple-800 font-medium transition-all"
                    maxLength={150}
                  />
                </div>

                <div className="flex flex-col gap-2">
                  <label htmlFor="user-city" className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                    Sua Cidade *
                  </label>
                  <input
                    id="user-city"
                    type="text"
                    required
                    value={city}
                    onChange={(e) => setCity(e.target.value)}
                    placeholder="Ex: Rio de Janeiro - RJ"
                    className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/60 hover:border-purple-500/40 focus:border-fuchsia-500 focus:outline-none text-sm text-white placeholder-purple-800 font-medium transition-all"
                    maxLength={100}
                  />
                </div>
              </div>

              <div className="flex flex-col gap-2">
                <label htmlFor="user-whatsapp" className="text-xs font-mono font-bold text-purple-300 uppercase tracking-wider">
                  WhatsApp (Opcional)
                </label>
                <input
                  id="user-whatsapp"
                  type="tel"
                  value={whatsapp}
                  onChange={(e) => setWhatsapp(e.target.value)}
                  placeholder="Ex: (21) 99999-9999"
                  className="p-3.5 rounded-xl bg-purple-950/20 border border-purple-900/60 hover:border-purple-500/40 focus:border-fuchsia-500 focus:outline-none text-sm text-white placeholder-purple-800 font-medium transition-all"
                  maxLength={25}
                />
              </div>

              <button
                type="submit"
                disabled={isSubmitting}
                className="w-full inline-flex items-center justify-center gap-3 px-8 py-5 bg-gradient-to-r from-purple-600 via-violet-600 to-fuchsia-500 hover:from-purple-500 hover:via-violet-500 hover:to-fuchsia-400 text-white font-black text-base uppercase tracking-wider rounded-2xl cursor-pointer disabled:opacity-50 transition-all duration-300 hover:scale-[1.01] shadow-[0_0_25px_rgba(168,85,247,0.3)] hover:shadow-[0_0_35px_rgba(217,70,239,0.5)] border border-fuchsia-400/20"
              >
                {isSubmitting ? (
                  <>
                    <svg
                      className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                      xmlns="http://www.w3.org/2000/svg"
                      fill="none"
                      viewBox="0 0 24 24"
                    >
                      <circle
                        className="opacity-25"
                        cx="12"
                        cy="12"
                        r="10"
                        stroke="currentColor"
                        strokeWidth="4"
                      />
                      <path
                        className="opacity-75"
                        fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                      />
                    </svg>
                    Enviando Palpite...
                  </>
                ) : (
                  <>
                    <Send className="w-5 h-5 fill-white stroke-none" />
                    Enviar Palpite Oficial
                  </>
                )}
              </button>
            </form>
          )}
        </div>
      </div>
    </section>
  );
}
