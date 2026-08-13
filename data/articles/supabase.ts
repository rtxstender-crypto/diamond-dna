import "server-only";
import { createServerClient } from "@supabase/ssr";
import { cookies } from "next/headers";
import type { NextRequest } from "next/server";
import { createRouteCookieBridge } from "./route-cookies";

export function isPublishingConfigured(){return Boolean(process.env.NEXT_PUBLIC_SUPABASE_URL&&process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY)}
export async function createSupabaseServerClient(){if(!isPublishingConfigured())return null;const store=await cookies();return createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:()=>store.getAll(),setAll(values){try{values.forEach(({name,value,options})=>store.set(name,value,options))}catch{/* RSC cannot write refreshed cookies; proxy.ts handles refreshes. */}}}})}
export function createSupabaseRouteClient(request:NextRequest){if(!isPublishingConfigured())return null;const cookieBridge=createRouteCookieBridge(request.cookies.getAll());const client=createServerClient(process.env.NEXT_PUBLIC_SUPABASE_URL!,process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,{cookies:{getAll:cookieBridge.getAll,setAll:cookieBridge.setAll}});return{client,applyCookies:cookieBridge.apply}}
