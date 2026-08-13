export interface TradeTeam { id:number; name:string; abbreviation:string }
export const MLB_TEAMS:TradeTeam[]=[
  [110,"Baltimore Orioles","BAL"],[111,"Boston Red Sox","BOS"],[147,"New York Yankees","NYY"],[139,"Tampa Bay Rays","TB"],[141,"Toronto Blue Jays","TOR"],
  [145,"Chicago White Sox","CWS"],[114,"Cleveland Guardians","CLE"],[116,"Detroit Tigers","DET"],[118,"Kansas City Royals","KC"],[142,"Minnesota Twins","MIN"],
  [117,"Houston Astros","HOU"],[108,"Los Angeles Angels","LAA"],[133,"Athletics","ATH"],[136,"Seattle Mariners","SEA"],[140,"Texas Rangers","TEX"],
  [144,"Atlanta Braves","ATL"],[146,"Miami Marlins","MIA"],[121,"New York Mets","NYM"],[143,"Philadelphia Phillies","PHI"],[120,"Washington Nationals","WSH"],
  [112,"Chicago Cubs","CHC"],[113,"Cincinnati Reds","CIN"],[158,"Milwaukee Brewers","MIL"],[134,"Pittsburgh Pirates","PIT"],[138,"St. Louis Cardinals","STL"],
  [109,"Arizona Diamondbacks","AZ"],[115,"Colorado Rockies","COL"],[119,"Los Angeles Dodgers","LAD"],[135,"San Diego Padres","SD"],[137,"San Francisco Giants","SF"],
].map(([id,name,abbreviation])=>({id:id as number,name:name as string,abbreviation:abbreviation as string}));
