import {describe,expect,it} from "vitest";
import {canDelete,canEdit,canPublish,isPublicArticle,resolveContributorAccess} from "./access-policy";
import {parseArticleInput,validateImage} from "./validation";

const base={title:"Deadline value",slug:"deadline-value",excerpt:"A verified look at deadline value.",content:"First paragraph.\n\nSecond paragraph.",category:"Analysis",tags:["trades"],status:"draft"};
const admin={id:"admin-id",displayName:"DiamondDNA Staff",role:"ADMIN" as const};
const contributor={id:"writer-id",displayName:"Writer",role:"CONTRIBUTOR" as const};

describe("contributor access gate",()=>{
 it("shows the login gate when signed out",()=>expect(resolveContributorAccess(null,null).state).toBe("signed-out"));
 it("allows an authorized admin without exposing an email",()=>expect(resolveContributorAccess({id:"admin-id"},{display_name:"DiamondDNA Staff",role:"ADMIN"})).toEqual({state:"authorized",identity:admin}));
 it("blocks an authenticated user without a contributor profile",()=>expect(resolveContributorAccess({id:"unknown"},null).state).toBe("unauthorized"));
});

describe("article workflow",()=>{
 it("creates a sanitized draft payload",()=>expect(parseArticleInput({...base,content:"Safe<script>bad()</script> copy"})).toMatchObject({status:"draft",content:"Safe copy"}));
 it("accepts a draft edit with the existing id",()=>expect(parseArticleInput({...base,id:"article-id",title:"Revised"})).toMatchObject({id:"article-id",title:"Revised"}));
 it("accepts publishing with required fields",()=>expect(parseArticleInput({...base,status:"published"}).status).toBe("published"));
 it("excludes drafts from public retrieval",()=>expect(isPublicArticle({status:"draft",publishedAt:null})).toBe(false));
 it("allows published articles with a publication date",()=>expect(isPublicArticle({status:"published",publishedAt:"2026-08-13T00:00:00.000Z"})).toBe(true));
});

describe("upload and role enforcement",()=>{
 it("validates supported images and rejects oversized files",()=>{expect(validateImage(new File(["image"],"cover.webp",{type:"image/webp"})).type).toBe("image/webp");expect(()=>validateImage(new File([new Uint8Array(5*1024*1024+1)],"large.png",{type:"image/png"}))).toThrow("5 MB")});
 it("allows admins to publish and edit any article",()=>{expect(canPublish(admin.role)).toBe(true);expect(canEdit(admin,{authorId:"someone-else"})).toBe(true)});
 it("prevents contributors from publishing or deleting published work",()=>{expect(canPublish(contributor.role)).toBe(false);expect(canDelete(contributor,{authorId:contributor.id,status:"published"})).toBe(false)});
 it("allows a contributor to edit and delete their own draft",()=>{expect(canEdit(contributor,{authorId:contributor.id})).toBe(true);expect(canDelete(contributor,{authorId:contributor.id,status:"draft"})).toBe(true)});
});
