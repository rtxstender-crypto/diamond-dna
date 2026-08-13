import type { ArticleStatus, ContributorAccess, ContributorIdentity, ContributorRole } from "./types";

const roles=new Set<ContributorRole>(["ADMIN","EDITOR","CONTRIBUTOR"]);
export function resolveContributorAccess(user:{id:string}|null,profile:{display_name:unknown;role:unknown}|null,options:{sessionError?:boolean;profileError?:boolean}={}):ContributorAccess{if(!user)return{state:"signed-out",identity:null,reason:options.sessionError?"expired":"missing"};if(options.profileError)return{state:"profile-error",identity:null};if(!profile||typeof profile.display_name!=="string"||!profile.display_name.trim()||!roles.has(profile.role as ContributorRole))return{state:"unauthorized",identity:null};return{state:"authorized",identity:{id:user.id,displayName:profile.display_name.trim(),role:profile.role as ContributorRole}}}
export function canPublish(role:ContributorRole){return role==="ADMIN"||role==="EDITOR"}
export function canEdit(identity:ContributorIdentity,article:{authorId:string}){return canPublish(identity.role)||identity.id===article.authorId}
export function canDelete(identity:ContributorIdentity,article:{authorId:string;status:ArticleStatus}){return canPublish(identity.role)||(identity.id===article.authorId&&article.status==="draft")}
export function isPublicArticle(article:{status:ArticleStatus;publishedAt:string|null}){return article.status==="published"&&Boolean(article.publishedAt)}
