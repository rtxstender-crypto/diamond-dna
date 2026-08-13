import type { CookieOptions } from "@supabase/ssr";

type CookieValue={name:string;value:string;options:CookieOptions};
type ResponseLike={cookies:{set(name:string,value:string,options?:CookieOptions):unknown};headers:{set(name:string,value:string):unknown}};

export function createRouteCookieBridge(initial:ReadonlyArray<{name:string;value:string}>){
 const jar=new Map(initial.map(cookie=>[cookie.name,cookie.value]));
 const pending=new Map<string,CookieValue>();
 const responseHeaders=new Map<string,string>();
 return{
  getAll:()=>Array.from(jar,([name,value])=>({name,value})),
  setAll(values:CookieValue[],headers:Record<string,string>={}){values.forEach(cookie=>{jar.set(cookie.name,cookie.value);pending.set(cookie.name,cookie)});Object.entries(headers).forEach(([name,value])=>responseHeaders.set(name,value))},
  apply<T extends ResponseLike>(response:T):T{pending.forEach(({name,value,options})=>response.cookies.set(name,value,options));responseHeaders.forEach((value,name)=>response.headers.set(name,value));return response},
 };
}
