import type { ContributorIdentity, ContributorRole } from "./types";
import { resolveContributorAccess } from "./access-policy";

type QueryError={code?:string;message?:string};
type ProfileResult={data:{display_name:unknown;role:unknown}|null;error:QueryError|null};
export type ContributorAuthClient={
 auth:{signInWithPassword(input:{email:string;password:string}):Promise<{data:{user:{id:string}|null};error:unknown|null}>};
 from(table:"contributor_profiles"):{select(columns:string):{eq(column:"id",value:string):{maybeSingle():PromiseLike<ProfileResult>}}};
};
export type ContributorLoginResult=
 | {state:"authorized";identity:ContributorIdentity}
 | {state:"invalid-credentials"}
 | {state:"unauthorized"}
 | {state:"profile-error";code:string};

export async function authenticateContributor(client:ContributorAuthClient,email:string,password:string):Promise<ContributorLoginResult>{
 const{data,error}=await client.auth.signInWithPassword({email,password});
 if(error||!data.user)return{state:"invalid-credentials"};
 const profile=await client.from("contributor_profiles").select("display_name,role").eq("id",data.user.id).maybeSingle();
 if(profile.error){const code=profile.error.code||"unknown";console.warn("contributor_profile_lookup_failed",{code});return{state:"profile-error",code}}
 const access=resolveContributorAccess(data.user,profile.data);
 if(access.state!=="authorized")return{state:"unauthorized"};
 return{state:"authorized",identity:{...access.identity,role:access.identity.role as ContributorRole}};
}
