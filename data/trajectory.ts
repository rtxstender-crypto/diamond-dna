/**
 * Career Trajectory demo dataset.
 * All values and similarity scores in this module are mock data. This module is
 * intentionally independent from the live MLB provider so a future historical
 * provider and similarity engine can replace it without changing the UI.
 */
export type TrajectoryRole = "hitter" | "pitcher";
export type ComparisonGroup = "power" | "five-tool" | "speed" | "infield" | "versatile" | "breakout" | "ace" | "power-arm" | "command" | "reliever";

export interface TrajectoryPoint { age: number; war: number }
export interface TrajectoryPlayer {
  id: string;
  name: string;
  team: string;
  position: string;
  age: number;
  role: TrajectoryRole;
  comparisonGroup: ComparisonGroup;
  series: TrajectoryPoint[];
}

export interface HistoricalTrajectory {
  name: string;
  era: string;
  position: string;
  score: number;
  color: string;
  series: TrajectoryPoint[];
}

const curve = (startAge: number, values: number[]): TrajectoryPoint[] => values.map((war, index) => ({ age: startAge + index, war }));

export const trajectoryPlayers: TrajectoryPlayer[] = [
  { id:"bobby-witt-jr",name:"Bobby Witt Jr.",team:"Kansas City Royals",position:"SS",age:26,role:"hitter",comparisonGroup:"five-tool",series:curve(22,[2.3,4.4,9.4,13.2,18.7]) },
  { id:"gunnar-henderson",name:"Gunnar Henderson",team:"Baltimore Orioles",position:"SS",age:25,role:"hitter",comparisonGroup:"infield",series:curve(21,[0.9,6.2,10.8,13.1,15.4]) },
  { id:"corbin-carroll",name:"Corbin Carroll",team:"Arizona Diamondbacks",position:"OF",age:25,role:"hitter",comparisonGroup:"speed",series:curve(21,[1.4,5.8,6.9,9.1,12.1]) },
  { id:"juan-soto",name:"Juan Soto",team:"New York Mets",position:"RF",age:27,role:"hitter",comparisonGroup:"power",series:curve(19,[3.0,8.0,9.9,14.2,19.1,25.5,32.1,38.0,43.2]) },
  { id:"aaron-judge",name:"Aaron Judge",team:"New York Yankees",position:"RF",age:34,role:"hitter",comparisonGroup:"power",series:curve(24,[1.5,8.2,12.7,17.3,20.0,26.4,37.1,42.0,49.8,55.0,60.2]) },
  { id:"shohei-ohtani",name:"Shohei Ohtani",team:"Los Angeles Dodgers",position:"DH",age:32,role:"hitter",comparisonGroup:"power",series:curve(23,[2.6,6.4,8.1,17.0,26.2,32.1,41.3,49.0,57.2,64.0]) },
  { id:"bryce-harper",name:"Bryce Harper",team:"Philadelphia Phillies",position:"1B",age:33,role:"hitter",comparisonGroup:"power",series:curve(19,[5.2,9.1,10.5,15.7,25.9,28.1,32.8,34.4,40.2,45.0,49.8,54.1,58.0,62.0,65.2]) },
  { id:"mookie-betts",name:"Mookie Betts",team:"Los Angeles Dodgers",position:"SS",age:33,role:"hitter",comparisonGroup:"versatile",series:curve(21,[1.8,7.5,13.4,20.2,26.1,36.7,43.0,46.8,52.7,59.1,65.0,70.2,74.0]) },
  { id:"jose-ramirez",name:"José Ramírez",team:"Cleveland Guardians",position:"3B",age:33,role:"hitter",comparisonGroup:"infield",series:curve(21,[0.1,2.2,4.6,10.8,17.3,23.0,26.1,32.2,38.6,44.1,50.0,55.4,60.2]) },
  { id:"fernando-tatis-jr",name:"Fernando Tatis Jr.",team:"San Diego Padres",position:"RF",age:27,role:"hitter",comparisonGroup:"five-tool",series:curve(20,[4.1,7.3,13.7,14.0,19.5,24.2,29.0,33.1]) },
  { id:"ronald-acuna-jr",name:"Ronald Acuña Jr.",team:"Atlanta Braves",position:"RF",age:28,role:"hitter",comparisonGroup:"five-tool",series:curve(20,[4.0,9.4,11.9,15.5,24.6,25.4,30.2,34.8,39.0]) },
  { id:"julio-rodriguez",name:"Julio Rodríguez",team:"Seattle Mariners",position:"CF",age:25,role:"hitter",comparisonGroup:"five-tool",series:curve(21,[5.4,11.1,15.2,20.0,24.1]) },
  { id:"francisco-lindor",name:"Francisco Lindor",team:"New York Mets",position:"SS",age:32,role:"hitter",comparisonGroup:"infield",series:curve(21,[4.6,10.0,15.9,23.6,28.2,29.8,34.0,40.8,46.7,52.0,57.4,62.1]) },
  { id:"vladimir-guerrero-jr",name:"Vladimir Guerrero Jr.",team:"Toronto Blue Jays",position:"1B",age:27,role:"hitter",comparisonGroup:"power",series:curve(20,[0.4,1.9,8.6,11.3,13.2,19.1,24.0,28.2]) },
  { id:"elly-de-la-cruz",name:"Elly De La Cruz",team:"Cincinnati Reds",position:"SS",age:24,role:"hitter",comparisonGroup:"speed",series:curve(21,[1.0,5.4,9.8,14.2]) },
  { id:"jackson-merrill",name:"Jackson Merrill",team:"San Diego Padres",position:"CF",age:23,role:"hitter",comparisonGroup:"breakout",series:curve(21,[5.3,9.0,12.4]) },
  { id:"james-wood",name:"James Wood",team:"Washington Nationals",position:"LF",age:23,role:"hitter",comparisonGroup:"breakout",series:curve(21,[1.7,5.8,9.2]) },
  { id:"junior-caminero",name:"Junior Caminero",team:"Tampa Bay Rays",position:"3B",age:23,role:"hitter",comparisonGroup:"breakout",series:curve(20,[0.2,3.8,8.1,11.7]) },
  { id:"paul-skenes",name:"Paul Skenes",team:"Pittsburgh Pirates",position:"SP",age:24,role:"pitcher",comparisonGroup:"power-arm",series:curve(22,[4.3,9.4,14.0]) },
  { id:"tarik-skubal",name:"Tarik Skubal",team:"Detroit Tigers",position:"SP",age:29,role:"pitcher",comparisonGroup:"ace",series:curve(23,[0.7,2.0,5.2,8.1,14.3,20.1,25.0]) },
  { id:"garrett-crochet",name:"Garrett Crochet",team:"Boston Red Sox",position:"SP",age:27,role:"pitcher",comparisonGroup:"power-arm",series:curve(21,[1.0,1.7,2.1,2.3,6.4,11.0,15.2]) },
  { id:"zack-wheeler",name:"Zack Wheeler",team:"Philadelphia Phillies",position:"SP",age:36,role:"pitcher",comparisonGroup:"ace",series:curve(23,[2.1,4.4,7.0,7.8,9.0,12.5,16.3,21.8,27.2,33.1,38.4,44.0,49.2,53.1]) },
  { id:"gerrit-cole",name:"Gerrit Cole",team:"New York Yankees",position:"SP",age:35,role:"pitcher",comparisonGroup:"power-arm",series:curve(22,[1.4,5.0,7.8,11.2,14.8,20.9,27.3,34.0,39.2,45.1,51.0,57.4,60.0,63.2]) },
  { id:"corbin-burnes",name:"Corbin Burnes",team:"Arizona Diamondbacks",position:"SP",age:31,role:"pitcher",comparisonGroup:"ace",series:curve(23,[0.5,0.0,3.4,8.9,13.7,18.5,23.1,27.8,32.0]) },
  { id:"yoshinobu-yamamoto",name:"Yoshinobu Yamamoto",team:"Los Angeles Dodgers",position:"SP",age:27,role:"pitcher",comparisonGroup:"command",series:curve(25,[2.8,7.1,11.2]) },
  { id:"shota-imanaga",name:"Shota Imanaga",team:"Chicago Cubs",position:"SP",age:32,role:"pitcher",comparisonGroup:"command",series:curve(30,[3.0,6.5,9.2]) },
  { id:"mason-miller",name:"Mason Miller",team:"San Diego Padres",position:"RP",age:27,role:"pitcher",comparisonGroup:"reliever",series:curve(24,[0.7,3.2,5.8,8.1]) },
  { id:"emmanuel-clase",name:"Emmanuel Clase",team:"Cleveland Guardians",position:"RP",age:28,role:"pitcher",comparisonGroup:"reliever",series:curve(22,[0.2,2.0,4.8,8.0,11.4,14.2,16.8]) },
];

const historicalGroups: Record<ComparisonGroup, HistoricalTrajectory[]> = {
  power: [
    {name:"Albert Pujols",era:"2001–2022",position:"1B",score:94,color:"#c8f75b",series:curve(21,[7.2,12.8,18.7,25.9,33.4,41.9,49.2])},
    {name:"David Ortiz",era:"1997–2016",position:"DH",score:89,color:"#5ea9ff",series:curve(22,[0.2,0.8,2.1,5.4,10.8,16.7,22.3])},
    {name:"Gary Sheffield",era:"1988–2009",position:"RF",score:85,color:"#f5a75b",series:curve(20,[0.6,2.0,3.1,8.7,12.5,17.3,21.0])},
  ],
  "five-tool": [
    {name:"Carlos Beltrán",era:"1998–2017",position:"CF",score:94,color:"#c8f75b",series:curve(21,[0.8,3.6,7.9,12.1,17.0,23.4])},
    {name:"Ken Griffey Jr.",era:"1989–2010",position:"CF",score:90,color:"#5ea9ff",series:curve(19,[2.9,8.1,13.8,19.6,26.5,32.7])},
    {name:"Andre Dawson",era:"1976–1996",position:"CF",score:86,color:"#f5a75b",series:curve(21,[0.8,4.2,9.1,14.5,19.0,24.8])},
  ],
  speed: [
    {name:"Rickey Henderson",era:"1979–2003",position:"LF",score:93,color:"#c8f75b",series:curve(20,[3.4,7.8,14.6,20.9,27.1,33.8])},
    {name:"Kenny Lofton",era:"1991–2007",position:"CF",score:89,color:"#5ea9ff",series:curve(24,[0.9,6.7,13.2,19.5,24.8,30.0])},
    {name:"Tim Raines",era:"1979–2002",position:"LF",score:84,color:"#f5a75b",series:curve(21,[3.6,9.1,14.5,20.7,26.4,31.8])},
  ],
  infield: [
    {name:"David Wright",era:"2004–2018",position:"3B",score:94,color:"#c8f75b",series:curve(21,[2.1,7.0,12.8,18.3,24.7,29.9])},
    {name:"Robin Yount",era:"1974–1993",position:"SS",score:89,color:"#5ea9ff",series:curve(18,[0.8,1.7,3.0,5.5,8.8,13.0,18.1,23.0])},
    {name:"Derek Jeter",era:"1995–2014",position:"SS",score:85,color:"#f5a75b",series:curve(21,[0.2,3.3,8.1,13.0,17.8,22.1])},
  ],
  versatile: [
    {name:"Craig Biggio",era:"1988–2007",position:"2B",score:93,color:"#c8f75b",series:curve(22,[1.0,3.4,7.2,12.8,18.5,24.0])},
    {name:"Paul Molitor",era:"1978–1998",position:"3B",score:89,color:"#5ea9ff",series:curve(21,[3.7,6.1,10.9,15.0,19.5,24.2])},
    {name:"Ben Zobrist",era:"2006–2019",position:"UTIL",score:85,color:"#f5a75b",series:curve(25,[0.2,1.2,2.5,10.8,15.0,19.7])},
  ],
  breakout: [
    {name:"Andruw Jones",era:"1996–2012",position:"CF",score:92,color:"#c8f75b",series:curve(19,[0.7,3.4,7.5,13.0,19.2])},
    {name:"Scott Rolen",era:"1996–2012",position:"3B",score:88,color:"#5ea9ff",series:curve(21,[1.0,5.5,10.2,14.7,20.1])},
    {name:"Evan Longoria",era:"2008–2023",position:"3B",score:84,color:"#f5a75b",series:curve(22,[5.5,12.0,19.2,23.8,28.3])},
  ],
  ace: [
    {name:"Max Scherzer",era:"2008–2024",position:"SP",score:94,color:"#c8f75b",series:curve(23,[0.8,3.1,6.0,9.6,14.1,19.5])},
    {name:"Justin Verlander",era:"2005–2024",position:"SP",score:89,color:"#5ea9ff",series:curve(22,[0.5,4.8,8.3,13.1,17.4,24.2])},
    {name:"Roy Halladay",era:"1998–2013",position:"SP",score:85,color:"#f5a75b",series:curve(21,[0.2,0.6,0.1,3.7,8.9,14.0])},
  ],
  "power-arm": [
    {name:"Randy Johnson",era:"1988–2009",position:"SP",score:93,color:"#c8f75b",series:curve(24,[0.5,2.8,5.2,9.8,15.4,22.0])},
    {name:"Nolan Ryan",era:"1966–1993",position:"SP",score:89,color:"#5ea9ff",series:curve(19,[0.1,1.2,3.9,6.8,10.2,13.9,18.4])},
    {name:"Dwight Gooden",era:"1984–2000",position:"SP",score:86,color:"#f5a75b",series:curve(19,[5.5,12.8,18.0,21.8,25.4,29.0])},
  ],
  command: [
    {name:"Greg Maddux",era:"1986–2008",position:"SP",score:94,color:"#c8f75b",series:curve(20,[0.3,1.5,5.1,8.8,13.7,19.8])},
    {name:"Mike Mussina",era:"1991–2008",position:"SP",score:90,color:"#5ea9ff",series:curve(22,[2.4,6.0,11.7,16.4,21.0,25.6])},
    {name:"Zack Greinke",era:"2004–2023",position:"SP",score:85,color:"#f5a75b",series:curve(20,[1.3,2.2,4.9,8.8,11.0,20.5])},
  ],
  reliever: [
    {name:"Mariano Rivera",era:"1995–2013",position:"RP",score:95,color:"#c8f75b",series:curve(25,[0.3,5.0,8.1,11.4,14.2,17.1])},
    {name:"Billy Wagner",era:"1995–2010",position:"RP",score:89,color:"#5ea9ff",series:curve(23,[0.2,2.1,4.8,7.9,10.3,13.1])},
    {name:"Trevor Hoffman",era:"1993–2010",position:"RP",score:85,color:"#f5a75b",series:curve(25,[1.0,3.8,7.0,9.6,12.1,14.8])},
  ],
};

export function getMockHistoricalMatches(player: TrajectoryPlayer): HistoricalTrajectory[] {
  return historicalGroups[player.comparisonGroup];
}

const hitterGroups = new Set<ComparisonGroup>(["power", "five-tool", "speed", "infield", "versatile", "breakout"]);

export function getHistoricalTrajectoryPool(role: TrajectoryRole): HistoricalTrajectory[] {
  const seen = new Set<string>();
  return Object.entries(historicalGroups).flatMap(([group, players]) => {
    const groupRole: TrajectoryRole = hitterGroups.has(group as ComparisonGroup) ? "hitter" : "pitcher";
    if (groupRole !== role) return [];
    return players.filter(player => {
      if (seen.has(player.name)) return false;
      seen.add(player.name);
      return true;
    });
  });
}
