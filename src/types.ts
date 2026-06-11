export interface Team {
  code: string;
  name: string;
  flag: string;
  seed: number; // For tie-breaking and automatic ranking of best 3rds
}

export interface Group {
  letter: string;
  teams: Team[];
}

export interface PredictionState {
  // Key is group letter (A-L), value is array of team codes in order [1st, 2nd, 3rd, 4th]
  groups: { [groupLetter: string]: string[] };
  
  // Key is match ID (e.g. R32_1, R16_2, QF_1, SF_1, FI_1, TP_1), value is winning team code
  bracket: { [matchId: string]: string };
  
  champion: string;
  runnerUp: string;
  thirdPlace: string;
  
  name: string;
  whatsapp: string;
  city: string;
  submitted: boolean;
}

export interface TeamStats {
  champion: number;
  first: number;
  second: number;
  third: number;
}

export interface GlobalStats {
  totalParticipants: number;
  championsCount: { [teamCode: string]: number };
  teamSelections?: { [teamCode: string]: TeamStats };
}

// 48 teams defined exactly as requested
export const TEAMS: { [code: string]: Team } = {
  // Grupo A
  "MEX": { code: "MEX", name: "México", flag: "🇲🇽", seed: 78 },
  "RSA": { code: "RSA", name: "África do Sul", flag: "🇿🇦", seed: 68 },
  "KOR": { code: "KOR", name: "Coreia do Sul", flag: "🇰🇷", seed: 77 },
  "CZE": { code: "CZE", name: "República Tcheca", flag: "🇨🇿", seed: 80 },

  // Grupo B
  "CAN": { code: "CAN", name: "Canadá", flag: "🇨🇦", seed: 75 },
  "BIH": { code: "BIH", name: "Bósnia e Herzegovina", flag: "🇧🇦", seed: 75 },
  "QAT": { code: "QAT", name: "Catar", flag: "🇶🇦", seed: 65 },
  "SUI": { code: "SUI", name: "Suíça", flag: "🇨🇭", seed: 82 },

  // Grupo C
  "BRA": { code: "BRA", name: "Brasil", flag: "🇧🇷", seed: 95 },
  "MAR": { code: "MAR", name: "Marrocos", flag: "🇲🇦", seed: 88 },
  "HAI": { code: "HAI", name: "Haiti", flag: "🇭🇹", seed: 58 },
  "SCO": { code: "SCO", name: "Escócia", flag: "🏴󠁧󠁢󠁳󠁣󠁴󠁿", seed: 73 },

  // Grupo D
  "USA": { code: "USA", name: "Estados Unidos", flag: "🇺🇸", seed: 83 },
  "PAR": { code: "PAR", name: "Paraguai", flag: "🇵🇾", seed: 76 },
  "AUS": { code: "AUS", name: "Austrália", flag: "🇦🇺", seed: 74 },
  "TUR": { code: "TUR", name: "Turquia", flag: "🇹🇷", seed: 82 },

  // Grupo E
  "GER": { code: "GER", name: "Alemanha", flag: "🇩🇪", seed: 89 },
  "CUW": { code: "CUW", name: "Curaçao", flag: "🇨🇼", seed: 59 },
  "CIV": { code: "CIV", name: "Costa do Marfim", flag: "🇨🇮", seed: 79 },
  "ECU": { code: "ECU", name: "Equador", flag: "🇪🇨", seed: 80 },

  // Grupo F
  "NED": { code: "NED", name: "Holanda", flag: "🇳🇱", seed: 90 },
  "JPN": { code: "JPN", name: "Japão", flag: "🇯🇵", seed: 84 },
  "SWE": { code: "SWE", name: "Suécia", flag: "🇸🇪", seed: 81 },
  "TUN": { code: "TUN", name: "Tunísia", flag: "🇹🇳", seed: 70 },

  // Grupo G
  "BEL": { code: "BEL", name: "Bélgica", flag: "🇧🇪", seed: 87 },
  "EGY": { code: "EGY", name: "Egito", flag: "🇪🇬", seed: 75 },
  "IRN": { code: "IRN", name: "Irã", flag: "🇮🇷", seed: 72 },
  "NZL": { code: "NZL", name: "Nova Zelândia", flag: "🇳🇿", seed: 62 },

  // Grupo H
  "ESP": { code: "ESP", name: "Espanha", flag: "🇪🇸", seed: 93 },
  "CPV": { code: "CPV", name: "Cabo Verde", flag: "🇨🇻", seed: 69 },
  "KSA": { code: "KSA", name: "Arábia Saudita", flag: "🇸🇦", seed: 67 },
  "URU": { code: "URU", name: "Uruguai", flag: "🇺🇾", seed: 87 },

  // Grupo I
  "FRA": { code: "FRA", name: "França", flag: "🇫🇷", seed: 94 },
  "SEN": { code: "SEN", name: "Senegal", flag: "🇸🇳", seed: 81 },
  "IRQ": { code: "IRQ", name: "Iraque", flag: "🇮🇶", seed: 68 },
  "NOR": { code: "NOR", name: "Noruega", flag: "🇳🇴", seed: 79 },

  // Grupo J
  "ARG": { code: "ARG", name: "Argentina", flag: "🇦🇷", seed: 93 },
  "ALG": { code: "ALG", name: "Argélia", flag: "🇩🇿", seed: 74 },
  "AUT": { code: "AUT", name: "Áustria", flag: "🇦🇹", seed: 81 },
  "JOR": { code: "JOR", name: "Jordânia", flag: "🇯🇴", seed: 63 },

  // Grupo K
  "POR": { code: "POR", name: "Portugal", flag: "🇵🇹", seed: 91 },
  "COD": { code: "COD", name: "República Democrática do Congo", flag: "🇨🇩", seed: 71 },
  "UZB": { code: "UZB", name: "Uzbequistão", flag: "🇺🇿", seed: 68 },
  "COL": { code: "COL", name: "Colômbia", flag: "🇨🇴", seed: 85 },

  // Grupo L
  "ENG": { code: "ENG", name: "Inglaterra", flag: "🏴󠁧󠁢󠁥󠁮󠁧󠁿", seed: 92 },
  "CRO": { code: "CRO", name: "Croácia", flag: "🇭🇷", seed: 86 },
  "GHA": { code: "GHA", name: "Gana", flag: "🇬🇭", seed: 73 },
  "PAN": { code: "PAN", name: "Panamá", flag: "🇵🇦", seed: 67 }
};

const ISO_MAP: { [code: string]: string } = {
  MEX: "mx",
  RSA: "za",
  KOR: "kr",
  CZE: "cz",
  CAN: "ca",
  BIH: "ba",
  QAT: "qa",
  SUI: "ch",
  BRA: "br",
  MAR: "ma",
  HAI: "ht",
  SCO: "gb-sct",
  USA: "us",
  PAR: "py",
  AUS: "au",
  TUR: "tr",
  GER: "de",
  CUW: "cw",
  CIV: "ci",
  ECU: "ec",
  NED: "nl",
  JPN: "jp",
  SWE: "se",
  TUN: "tn",
  BEL: "be",
  EGY: "eg",
  IRN: "ir",
  NZL: "nz",
  ESP: "es",
  CPV: "cv",
  KSA: "sa",
  URU: "uy",
  FRA: "fr",
  SEN: "sn",
  IRQ: "iq",
  NOR: "no",
  ARG: "ar",
  ALG: "dz",
  AUT: "at",
  JOR: "jo",
  POR: "pt",
  COD: "cd",
  UZB: "uz",
  COL: "co",
  ENG: "gb-eng",
  CRO: "hr",
  PAN: "pa",
  GHA: "gh"
};

export function getTeamFlagUrl(code: string): string {
  const codeLower = ISO_MAP[code] || "un";
  return `https://flagcdn.com/${codeLower}.svg`;
}


export const GROUPS_CONFIG: Group[] = [
  { letter: "A", teams: [TEAMS.MEX, TEAMS.RSA, TEAMS.KOR, TEAMS.CZE] },
  { letter: "B", teams: [TEAMS.CAN, TEAMS.BIH, TEAMS.QAT, TEAMS.SUI] },
  { letter: "C", teams: [TEAMS.BRA, TEAMS.MAR, TEAMS.HAI, TEAMS.SCO] },
  { letter: "D", teams: [TEAMS.USA, TEAMS.PAR, TEAMS.AUS, TEAMS.TUR] },
  { letter: "E", teams: [TEAMS.GER, TEAMS.CUW, TEAMS.CIV, TEAMS.ECU] },
  { letter: "F", teams: [TEAMS.NED, TEAMS.JPN, TEAMS.SWE, TEAMS.TUN] },
  { letter: "G", teams: [TEAMS.BEL, TEAMS.EGY, TEAMS.IRN, TEAMS.NZL] },
  { letter: "H", teams: [TEAMS.ESP, TEAMS.CPV, TEAMS.KSA, TEAMS.URU] },
  { letter: "I", teams: [TEAMS.FRA, TEAMS.SEN, TEAMS.IRQ, TEAMS.NOR] },
  { letter: "J", teams: [TEAMS.ARG, TEAMS.ALG, TEAMS.AUT, TEAMS.JOR] },
  { letter: "K", teams: [TEAMS.POR, TEAMS.COD, TEAMS.UZB, TEAMS.COL] },
  { letter: "L", teams: [TEAMS.ENG, TEAMS.CRO, TEAMS.GHA, TEAMS.PAN] }
];

export interface BracketMatch {
  id: string;
  label: string;
  nextMatchId?: string; // Where the winner goes (null for final/third-place matches)
  isThirdPlaceMatch?: boolean;
  isFinalMatch?: boolean;
}

// Fixed Bracket Configuration from Round of 32 down to Final and Third Place
export const BRACKET_MAP: { [id: string]: BracketMatch } = {
  // Round of 32 (16 matches)
  "R32_1": { id: "R32_1", label: "M1", nextMatchId: "R16_1" },
  "R32_2": { id: "R32_2", label: "M2", nextMatchId: "R16_1" },
  "R32_3": { id: "R32_3", label: "M3", nextMatchId: "R16_2" },
  "R32_4": { id: "R32_4", label: "M4", nextMatchId: "R16_2" },
  "R32_5": { id: "R32_5", label: "M5", nextMatchId: "R16_3" },
  "R32_6": { id: "R32_6", label: "M6", nextMatchId: "R16_3" },
  "R32_7": { id: "R32_7", label: "M7", nextMatchId: "R16_4" },
  "R32_8": { id: "R32_8", label: "M8", nextMatchId: "R16_4" },
  "R32_9": { id: "R32_9", label: "M9", nextMatchId: "R16_5" },
  "R32_10": { id: "R32_10", label: "M10", nextMatchId: "R16_5" },
  "R32_11": { id: "R32_11", label: "M11", nextMatchId: "R16_6" },
  "R32_12": { id: "R32_12", label: "M12", nextMatchId: "R16_6" },
  "R32_13": { id: "R32_13", label: "M13", nextMatchId: "R16_7" },
  "R32_14": { id: "R32_14", label: "M14", nextMatchId: "R16_7" },
  "R32_15": { id: "R32_15", label: "M15", nextMatchId: "R16_8" },
  "R32_16": { id: "R32_16", label: "M16", nextMatchId: "R16_8" },

  // Round of 16 (8 matches)
  "R16_1": { id: "R16_1", label: "M17", nextMatchId: "QF_1" },
  "R16_2": { id: "R16_2", label: "M18", nextMatchId: "QF_1" },
  "R16_3": { id: "R16_3", label: "M19", nextMatchId: "QF_2" },
  "R16_4": { id: "R16_4", label: "M20", nextMatchId: "QF_2" },
  "R16_5": { id: "R16_5", label: "M21", nextMatchId: "QF_3" },
  "R16_6": { id: "R16_6", label: "M22", nextMatchId: "QF_3" },
  "R16_7": { id: "R16_7", label: "M23", nextMatchId: "QF_4" },
  "R16_8": { id: "R16_8", label: "M24", nextMatchId: "QF_4" },

  // Quarterfinals (4 matches)
  "QF_1": { id: "QF_1", label: "M25", nextMatchId: "SF_1" },
  "QF_2": { id: "QF_2", label: "M26", nextMatchId: "SF_1" },
  "QF_3": { id: "QF_3", label: "M27", nextMatchId: "SF_2" },
  "QF_4": { id: "QF_4", label: "M28", nextMatchId: "SF_2" },

  // Semifinals (2 matches)
  "SF_1": { id: "SF_1", label: "M29", nextMatchId: "FI_1" },
  "SF_2": { id: "SF_2", label: "M30", nextMatchId: "FI_1" },

  // Finals
  "FI_1": { id: "FI_1", label: "Final", isFinalMatch: true },
  "TP_1": { id: "TP_1", label: "3º Lugar", isThirdPlaceMatch: true }
};
