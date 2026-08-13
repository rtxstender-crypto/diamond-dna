import {describe,expect,it} from "vitest";
import {authenticateContributor,type ContributorAuthClient} from "./contributor-session";
import {createRouteCookieBridge} from "./route-cookies";

function clientFor(options:{role?:"ADMIN"|"EDITOR"|"CONTRIBUTOR";profile?:boolean;credentialError?:boolean;profileError?:boolean}={}):ContributorAuthClient{
 let authenticated=false;
 return{
  auth:{async signInWithPassword(){
   if(options.credentialError)return{data:{user:null},error:new Error("invalid")};
   authenticated=true;
   return{data:{user:{id:"user-uuid"}},error:null};
  }},
  from(table){
   expect(table).toBe("contributor_profiles");
   expect(authenticated).toBe(true);
   return{select(columns){
    expect(columns).toBe("display_name,role");
    return{eq(column,value){
     expect(column).toBe("id");
     expect(value).toBe("user-uuid");
     return{async maybeSingle(){
      if(options.profileError)return{data:null,error:{code:"42501"}};
      if(options.profile===false)return{data:null,error:null};
      return{data:{display_name:"DiamondDNA Staff",role:options.role||"ADMIN"},error:null};
     }};
    }};
   }};
  },
 };
}

describe("contributor login session",()=>{
 it("resolves a valid authenticated ADMIN profile",async()=>expect(await authenticateContributor(clientFor({role:"ADMIN"}),"staff@example.com","password")).toMatchObject({state:"authorized",identity:{role:"ADMIN"}}));
 it("resolves a valid authenticated CONTRIBUTOR profile",async()=>expect(await authenticateContributor(clientFor({role:"CONTRIBUTOR"}),"writer@example.com","password")).toMatchObject({state:"authorized",identity:{role:"CONTRIBUTOR"}}));
 it("rejects an authenticated user without a contributor row",async()=>expect(await authenticateContributor(clientFor({profile:false}),"user@example.com","password")).toEqual({state:"unauthorized"}));
 it("rejects invalid credentials before profile lookup",async()=>expect(await authenticateContributor(clientFor({credentialError:true}),"bad@example.com","wrong")).toEqual({state:"invalid-credentials"}));
 it("uses the authenticated client and exact auth UUID for profile lookup",async()=>expect((await authenticateContributor(clientFor(),"staff@example.com","password")).state).toBe("authorized"));
 it("does not report an RLS/database failure as an unapproved profile",async()=>expect(await authenticateContributor(clientFor({profileError:true}),"staff@example.com","password")).toEqual({state:"profile-error",code:"42501"}));
 it("persists Supabase cookie writes and response cache headers",()=>{const bridge=createRouteCookieBridge([]);bridge.setAll([{name:"sb-session",value:"opaque-session",options:{httpOnly:true,path:"/"}}],{"cache-control":"private, no-store"});const cookies=new Map<string,string>(),headers=new Map<string,string>();bridge.apply({cookies:{set(name,value){cookies.set(name,value)}},headers:{set(name,value){headers.set(name,value)}}});expect(cookies.get("sb-session")).toBe("opaque-session");expect(headers.get("cache-control")).toBe("private, no-store")});
});
