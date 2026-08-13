import "server-only";
import type { ContributorIdentity, ContributorRole } from "./types";
import { createSupabaseServerClient } from "./supabase";

const roles=new Set<ContributorRole>(["ADMIN","EDITOR","CONTRIBUTOR"]);
export async function getContributor():Promise<ContributorIdentity|null>{const client=await createSupabaseServerClient();if(!client)return null;const {data:{user}}=await client.auth.getUser();if(!user?.email)return null;const {data}=await client.from("contributor_profiles").select("display_name,role").eq("id",user.id).maybeSingle();if(!data||!roles.has(data.role as ContributorRole))return null;return{id:user.id,email:user.email,displayName:data.display_name||user.email,role:data.role as ContributorRole}}
export function canPublish(role:ContributorRole){return role==="ADMIN"||role==="EDITOR"}
export function canEdit(identity:ContributorIdentity,article:{authorId:string}){return identity.role==="ADMIN"||identity.role==="EDITOR"||identity.id===article.authorId}
