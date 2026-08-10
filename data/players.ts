export type PlayerType = "Hitter" | "Pitcher";

export interface HiddenGem {
  id: string;
  name: string;
  team: string;
  teamCode: string;
  position: string;
  type: PlayerType;
  age: number;
  war: number;
  advancedLabel: "OPS+" | "ERA+";
  advancedValue: number;
  gemScore: number;
  trend: string;
  accent: string;
}

export const hiddenGems: HiddenGem[] = [
  { id: "matthew-batten", name: "Matthew Batten", team: "San Diego Padres", teamCode: "SD", position: "UTIL", type: "Hitter", age: 29, war: 2.4, advancedLabel: "OPS+", advancedValue: 119, gemScore: 94, trend: "+18%", accent: "#f2c14e" },
  { id: "ryan-pepiot", name: "Ryan Pepiot", team: "Tampa Bay Rays", teamCode: "TB", position: "SP", type: "Pitcher", age: 28, war: 3.1, advancedLabel: "ERA+", advancedValue: 127, gemScore: 91, trend: "+14%", accent: "#58a6ff" },
  { id: "davis-schneider", name: "Davis Schneider", team: "Toronto Blue Jays", teamCode: "TOR", position: "2B/LF", type: "Hitter", age: 27, war: 2.8, advancedLabel: "OPS+", advancedValue: 123, gemScore: 89, trend: "+12%", accent: "#5aa7e8" },
  { id: "bryan-woo", name: "Bryan Woo", team: "Seattle Mariners", teamCode: "SEA", position: "SP", type: "Pitcher", age: 26, war: 2.7, advancedLabel: "ERA+", advancedValue: 124, gemScore: 87, trend: "+11%", accent: "#47c5a5" },
  { id: "kyle-stowers", name: "Kyle Stowers", team: "Miami Marlins", teamCode: "MIA", position: "OF", type: "Hitter", age: 28, war: 2.2, advancedLabel: "OPS+", advancedValue: 116, gemScore: 84, trend: "+9%", accent: "#18b7d2" },
  { id: "ben-brown", name: "Ben Brown", team: "Chicago Cubs", teamCode: "CHC", position: "SP", type: "Pitcher", age: 26, war: 2.5, advancedLabel: "ERA+", advancedValue: 118, gemScore: 82, trend: "+8%", accent: "#5c8edc" },
];

export interface TrajectoryPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  age: number;
  war: number;
  series: { age: number; war: number }[];
}

export const currentPlayers: TrajectoryPlayer[] = [
  { id: "bobby-witt-jr", name: "Bobby Witt Jr.", team: "Kansas City Royals", position: "SS", age: 26, war: 18.7, series: [{age:22,war:2.3},{age:23,war:4.4},{age:24,war:9.4},{age:25,war:12.8},{age:26,war:18.7}] },
  { id: "corbin-carroll", name: "Corbin Carroll", team: "Arizona Diamondbacks", position: "OF", age: 25, war: 12.1, series: [{age:21,war:1.4},{age:22,war:5.8},{age:23,war:6.9},{age:24,war:9.1},{age:25,war:12.1}] },
  { id: "gunnar-henderson", name: "Gunnar Henderson", team: "Baltimore Orioles", position: "SS", age: 25, war: 15.4, series: [{age:21,war:0.9},{age:22,war:6.2},{age:23,war:10.8},{age:24,war:13.1},{age:25,war:15.4}] },
];

export const historicalMatches = [
  { name: "Carlos Beltrán", era: "1998–2017", position: "CF", score: 94, color: "#c8f75b", series: [{age:22,war:2.8},{age:23,war:4.3},{age:24,war:8.2},{age:25,war:12.4},{age:26,war:17.9}] },
  { name: "David Wright", era: "2004–2018", position: "3B", score: 89, color: "#5ea9ff", series: [{age:22,war:3.7},{age:23,war:8.5},{age:24,war:13.2},{age:25,war:17.1},{age:26,war:19.4}] },
  { name: "Robin Yount", era: "1974–1993", position: "SS", score: 85, color: "#f5a75b", series: [{age:22,war:1.8},{age:23,war:5.1},{age:24,war:9.7},{age:25,war:13.6},{age:26,war:16.8}] },
];
