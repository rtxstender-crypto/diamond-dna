import type { DataProvenance, PlayerRole } from "../models/player";

export interface GameIdentity { gameId:number; date:string; season:number; opponent:string|null; opponentId:number|null; homeAway:"home"|"away"|null; finalScore:string|null }
export interface HitterGameStats { kind:"batting"; atBats:number|null; plateAppearances:number|null; hits:number|null; singles:number|null; doubles:number|null; triples:number|null; homeRuns:number|null; rbi:number|null; runs:number|null; walks:number|null; strikeouts:number|null; stolenBases:number|null; grandSlams:number|null }
export interface PitcherGameStats { kind:"pitching"; inningsPitched:number|null; hitsAllowed:number|null; runsAllowed:number|null; earnedRuns:number|null; walks:number|null; strikeouts:number|null; homeRunsAllowed:number|null; pitches:number|null; wins:number|null; losses:number|null; saves:number|null; gamesStarted:number|null; completeGames:number|null; shutouts:number|null; officialNoHitter:boolean|null; officialPerfectGame:boolean|null }
export interface PlayerGameLog extends GameIdentity { playerId:number; role:PlayerRole; stats:HitterGameStats|PitcherGameStats; provenance:DataProvenance }
export type MilestoneType="cycle"|"multi-hr"|"hits"|"rbi"|"complete-game"|"shutout"|"strikeouts"|"scoreless-start"|"no-hitter"|"perfect-game";
export interface MilestoneEvent { type:MilestoneType; label:string; value:number|null; game:PlayerGameLog }
export interface CareerHigh { metric:"rbi"|"homeRuns"|"hits"|"stolenBases"|"strikeouts"|"inningsPitched"|"scorelessOuting"; value:number; occurrences:PlayerGameLog[] }
export interface BestGame { game:PlayerGameLog; score:number; formula:string }
export interface GameHistory { playerId:number; role:PlayerRole; games:PlayerGameLog[]; milestones:MilestoneEvent[]; careerHighs:CareerHigh[]; bestGame:BestGame|null; seasons:number[]; refreshedAt:string|null; source:"MLB Stats API"; stale:boolean }
