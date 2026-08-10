const windows=new Map<string,{count:number;reset:number}>();
export const RATE_LIMIT={requests:20,windowMs:60_000} as const;
export const MAX_RATE_LIMIT_KEYS=10_000;
export interface RateLimitConfig{requests:number;windowMs:number}
export function consumeRateLimit(key:string,now=Date.now(),config:RateLimitConfig=RATE_LIMIT):{allowed:boolean;remaining:number;retryAfter:number}{
  if(windows.size>=MAX_RATE_LIMIT_KEYS&&!windows.has(key)){for(const[candidate,entry]of windows){if(entry.reset<=now)windows.delete(candidate)}if(windows.size>=MAX_RATE_LIMIT_KEYS)windows.delete(windows.keys().next().value!)}
  const existing=windows.get(key);const entry=!existing||existing.reset<=now?{count:0,reset:now+config.windowMs}:existing;
  entry.count+=1;windows.set(key,entry);return{allowed:entry.count<=config.requests,remaining:Math.max(0,config.requests-entry.count),retryAfter:Math.max(1,Math.ceil((entry.reset-now)/1000))};
}
export function resetRateLimits(){windows.clear()}
