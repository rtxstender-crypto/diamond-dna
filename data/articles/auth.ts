import "server-only";
import type { ContributorAccess, ContributorIdentity } from "./types";
import { canDelete,canEdit,canPublish,resolveContributorAccess } from "./access-policy";
import { createSupabaseServerClient } from "./supabase";

export async function getContributorAccess():Promise<ContributorAccess>{const client=await createSupabaseServerClient();if(!client)return{state:"signed-out",identity:null,reason:"missing"};const {data:{user},error:sessionError}=await client.auth.getUser();if(!user)return resolveContributorAccess(null,null,{sessionError:Boolean(sessionError)});const {data,error}=await client.from("contributor_profiles").select("display_name,role").eq("id",user.id).maybeSingle();if(error){console.warn("contributor_profile_lookup_failed",{code:error.code||"unknown"});return resolveContributorAccess(user,null,{profileError:true})}return resolveContributorAccess(user,data)}
export async function getContributor():Promise<ContributorIdentity|null>{const access=await getContributorAccess();return access.state==="authorized"?access.identity:null}
export {canDelete,canEdit,canPublish};
