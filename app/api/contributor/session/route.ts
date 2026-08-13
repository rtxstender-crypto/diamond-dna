import { NextResponse, type NextRequest } from "next/server";
import { authenticateContributor, type ContributorAuthClient } from "@/data/articles/contributor-session";
import { createSupabaseRouteClient } from "@/data/articles/supabase";

const noStore={"cache-control":"private, no-store"};
export async function POST(request:NextRequest){
 const routeClient=createSupabaseRouteClient(request);
 if(!routeClient)return NextResponse.json({error:"Publishing is not configured.",state:"configuration-error"},{status:503,headers:noStore});
 const value=await request.json().catch(()=>null) as {email?:unknown;password?:unknown}|null;
 if(typeof value?.email!=="string"||typeof value.password!=="string"||!value.email.trim()||!value.password||value.password.length>256)return NextResponse.json({error:"Enter a valid email and password.",state:"invalid-input"},{status:400,headers:noStore});
 const result=await authenticateContributor(routeClient.client as unknown as ContributorAuthClient,value.email.trim().slice(0,320),value.password);
 let response:NextResponse;
 if(result.state==="invalid-credentials")response=NextResponse.json({error:"Email or password is incorrect.",state:result.state},{status:401,headers:noStore});
 else if(result.state==="unauthorized")response=NextResponse.json({error:"This authenticated account does not have a contributor profile.",state:result.state},{status:403,headers:noStore});
 else if(result.state==="profile-error")response=NextResponse.json({error:"Your account was authenticated, but the contributor profile could not be loaded. Please try again.",state:result.state},{status:503,headers:noStore});
 else response=NextResponse.json({identity:result.identity,state:result.state},{headers:noStore});
 return routeClient.applyCookies(response);
}
export async function DELETE(request:NextRequest){const routeClient=createSupabaseRouteClient(request);if(!routeClient)return NextResponse.json({ok:true},{headers:noStore});await routeClient.client.auth.signOut();return routeClient.applyCookies(NextResponse.json({ok:true},{headers:noStore}))}
