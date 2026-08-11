export const DATA_CACHE_SECONDS={rostersAndIdentity:21600,currentSeasonStats:7200,completedSeasonHistory:604800,currentSeasonGameLogs:7200,completedSeasonGameLogs:2592000}as const;
export interface DataRefreshMetadata{dataset:string;refreshedAt:string;revalidateSeconds:number;stale:boolean;source:"MLB Stats API"}
const lastValid=new Map<string,unknown>();
export async function refreshWithStaleFallback<T>(key:string,loader:()=>Promise<T>):Promise<{data:T;stale:boolean}>{try{const data=await loader();lastValid.set(key,data);return{data,stale:false}}catch(error){if(lastValid.has(key))return{data:lastValid.get(key)as T,stale:true};throw error}}
