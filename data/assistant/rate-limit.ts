const windows=new Map<string,{count:number;reset:number}>();
export const RATE_LIMIT={requests:20,windowMs:60_000} as const;
export function consumeRateLimit(key:string,now=Date.now()):{allowed:boolean;remaining:number;retryAfter:number}{
  const existing=windows.get(key);const entry=!existing||existing.reset<=now?{count:0,reset:now+RATE_LIMIT.windowMs}:existing;
  entry.count+=1;windows.set(key,entry);return{allowed:entry.count<=RATE_LIMIT.requests,remaining:Math.max(0,RATE_LIMIT.requests-entry.count),retryAfter:Math.max(1,Math.ceil((entry.reset-now)/1000))};
}
export function resetRateLimits(){windows.clear()}
