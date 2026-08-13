import type { TradeAssetInput,TradeEvaluation,TradeValueResult } from "@/data/trade-value/types";
export type PackageStyle="balanced"|"prospect-heavy"|"mlb-ready"|"cheapest";
export interface TradeRequestIntent{acquiringTeamId:number|null;targetName:string|null;excludedNames:string[];packageSize:number|null;style:PackageStyle;offerCount:number}
export interface GeneratedTradePackage{label:string;style:PackageStyle;teamA:{teamId:number;team:string;assets:TradeAssetInput[]};teamB:{teamId:number;team:string;assets:TradeAssetInput[]};valuesA:TradeValueResult[];valuesB:TradeValueResult[];evaluation:TradeEvaluation;provisional:boolean}
