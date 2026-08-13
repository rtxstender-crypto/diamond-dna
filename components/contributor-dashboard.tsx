"use client";

import Image from "next/image";
import Link from "next/link";
import { useMemo, useRef, useState } from "react";
import { Check, Eye, FilePlus2, ImagePlus, LogOut, Search, Trash2, X } from "lucide-react";
import { ARTICLE_CATEGORIES, type Article, type ArticleDraftInput, type ContributorAccess } from "@/data/articles/types";
import { slugify, validateImage } from "@/data/articles/validation";

type Props={access:ContributorAccess;articles:Article[];configured:boolean};
type Filter="all"|"draft"|"published";
const emptyDraft:ArticleDraftInput={title:"",slug:"",excerpt:"",content:"",coverImageUrl:null,imageAlt:null,category:"Analysis",tags:[],relatedPlayerId:null,relatedTeamId:null,seoTitle:null,seoDescription:null,status:"draft"};
const toDraft=(article:Article):ArticleDraftInput=>({id:article.id,title:article.title,slug:article.slug,excerpt:article.excerpt,content:article.content,coverImageUrl:article.coverImageUrl,imageAlt:article.imageAlt,category:article.category,tags:article.tags,relatedPlayerId:article.relatedPlayerId,relatedTeamId:article.relatedTeamId,seoTitle:article.seoTitle,seoDescription:article.seoDescription,status:article.status});

export function ContributorDashboard({access,articles,configured}:Props){
 const[message,setMessage]=useState("");
 const[success,setSuccess]=useState("");
 const[busy,setBusy]=useState(false);
 const[uploading,setUploading]=useState(false);
 const[query,setQuery]=useState("");
 const[filter,setFilter]=useState<Filter>("all");
 const[draft,setDraft]=useState<ArticleDraftInput>(emptyDraft);
 const[preview,setPreview]=useState(false);
 const fileRef=useRef<HTMLInputElement>(null);
 const identity=access.state==="authorized"?access.identity:null;
 const publish=identity?.role==="ADMIN"||identity?.role==="EDITOR";
 const counts=useMemo(()=>({drafts:articles.filter(a=>a.status==="draft").length,published:articles.filter(a=>a.status==="published").length,total:articles.length}),[articles]);
 const visible=useMemo(()=>articles.filter(a=>(filter==="all"||a.status===filter)&&`${a.title} ${a.category} ${a.tags.join(" ")}`.toLowerCase().includes(query.toLowerCase())),[articles,filter,query]);
 const update=<K extends keyof ArticleDraftInput>(key:K,value:ArticleDraftInput[K])=>setDraft(current=>({...current,[key]:value}));
 const reset=()=>{setDraft(emptyDraft);setMessage("");setSuccess("");if(fileRef.current)fileRef.current.value=""};

 async function login(form:FormData){setBusy(true);setMessage("");const response=await fetch("/api/contributor/session",{method:"POST",headers:{"content-type":"application/json"},body:JSON.stringify({email:form.get("email"),password:form.get("password")})});const data=await response.json();if(response.ok)location.reload();else{setMessage(data.error);if(data.state==="unauthorized")location.reload()}setBusy(false)}
 async function signOut(){setBusy(true);await fetch("/api/contributor/session",{method:"DELETE"});location.reload()}
 async function upload(file:File|null){if(!file)return;setMessage("");try{validateImage(file)}catch(error){setMessage(error instanceof Error?error.message:"Invalid image.");return}setUploading(true);const form=new FormData();form.set("image",file);const response=await fetch("/api/contributor/images",{method:"POST",body:form}),data=await response.json();if(response.ok){update("coverImageUrl",data.url);setSuccess("Cover image uploaded.")}else setMessage(data.error);setUploading(false)}
 function payload(status:"draft"|"published"){return{...draft,slug:draft.slug||slugify(draft.title),status,tags:draft.tags.map(tag=>tag.trim()).filter(Boolean)}}
 async function save(status:"draft"|"published"){setBusy(true);setMessage("");setSuccess("");const editing=Boolean(draft.id),response=await fetch(editing?`/api/contributor/articles/${draft.id}`:"/api/contributor/articles",{method:editing?"PUT":"POST",headers:{"content-type":"application/json"},body:JSON.stringify(payload(status))}),data=await response.json();if(response.ok){setSuccess(status==="published"?"Article published successfully.":editing?"Draft updated.":"Draft saved.");setDraft(current=>({...current,id:data.id,slug:data.slug,status}));setTimeout(()=>location.reload(),700)}else setMessage(data.error);setBusy(false)}
 async function removeArticle(article:Article){if(!confirm(`Delete “${article.title}”? This cannot be undone.`))return;setBusy(true);setMessage("");const response=await fetch(`/api/contributor/articles/${article.id}`,{method:"DELETE"}),data=await response.json();if(response.ok){setSuccess("Article deleted.");if(draft.id===article.id)reset();location.reload()}else setMessage(data.error);setBusy(false)}

 if(!configured)return <div className="contributor-card contributor-notice"><h2>Publishing setup required</h2><p>Configure the public Supabase project settings before contributor sign-in and publishing are enabled.</p></div>;
 if(access.state==="signed-out")return <form action={login} className="contributor-card contributor-login"><small>AUTHORIZED CONTRIBUTORS</small><h2>Sign in to publish</h2><p>{access.reason==="expired"?"Your session expired. Sign in again to continue.":"Use your approved DiamondDNA contributor account."}</p><label>Email<input name="email" type="email" required autoComplete="email"/></label><label>Password<input name="password" type="password" required autoComplete="current-password"/></label><button className="button primary" disabled={busy}>{busy?"Signing in…":"Sign in"}</button>{message&&<p role="alert" className="form-error">{message}</p>}</form>;
 if(access.state==="unauthorized")return <div className="contributor-card contributor-notice"><small>ACCESS DENIED</small><h2>Contributor approval required</h2><p>You are signed in, but this account does not have a contributor profile. Ask an administrator to approve the account.</p><button className="button secondary" onClick={signOut} disabled={busy}><LogOut/> Sign out</button></div>;
 if(access.state==="profile-error")return <div className="contributor-card contributor-notice"><small>PROFILE UNAVAILABLE</small><h2>We could not verify contributor access</h2><p>Your session is valid, but DiamondDNA could not load your contributor profile. Try refreshing; if this continues, contact an administrator.</p><div className="editor-actions"><button className="button primary" onClick={()=>location.reload()}>Try again</button><button className="button secondary" onClick={signOut} disabled={busy}><LogOut/> Sign out</button></div></div>;

 return <>
  <section className="contributor-toolbar">
   <div><small>{identity!.role}</small><strong>{identity!.displayName}</strong></div>
   <button onClick={signOut} disabled={busy}><LogOut/> Sign out</button>
  </section>
  <section className="contributor-counts" aria-label="Article counts"><div><span>Drafts</span><strong>{counts.drafts}</strong></div><div><span>Published</span><strong>{counts.published}</strong></div><div><span>Total</span><strong>{counts.total}</strong></div></section>
  <div className="contributor-layout">
   <aside className="contributor-card contributor-library">
    <header><div><small>EDITORIAL LIBRARY</small><h2>Articles</h2></div><button className="new-article" onClick={reset}><FilePlus2/> New Article</button></header>
    <label className="contributor-search"><Search/><input aria-label="Search articles" placeholder="Search articles" value={query} onChange={e=>setQuery(e.target.value)}/></label>
    <div className="status-filter" role="group" aria-label="Filter articles">{(["all","draft","published"] as Filter[]).map(value=><button key={value} className={filter===value?"active":""} onClick={()=>setFilter(value)}>{value}</button>)}</div>
    <div className="article-list">{visible.length?visible.map(article=><article className={draft.id===article.id?"selected":""} key={article.id}><button className="article-list-main" onClick={()=>{setDraft(toDraft(article));setMessage("");setSuccess("")}}><span className={`status-dot ${article.status}`}/><span><strong>{article.title}</strong><small>{article.category} · Updated {new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(new Date(article.updatedAt))}</small></span></button><div>{article.status==="published"&&<Link href={`/analysis/${article.slug}`} target="_blank">View</Link>}<button aria-label={`Delete ${article.title}`} onClick={()=>removeArticle(article)}><Trash2/></button></div></article>):<p className="library-empty">No matching articles.</p>}</div>
   </aside>
   <section className="contributor-card article-editor">
    <header><div><small>{draft.id?"EDIT ARTICLE":"NEW ARTICLE"}</small><h2>{draft.id?draft.title||"Untitled":"Create analysis"}</h2></div>{draft.id&&<span className={`editor-status ${draft.status}`}>{draft.status}</span>}</header>
    <div className="editor-row"><label>Title<input value={draft.title} maxLength={140} required onChange={e=>{update("title",e.target.value);if(!draft.id)update("slug",slugify(e.target.value))}}/></label><label>Slug<input value={draft.slug||""} maxLength={90} onChange={e=>update("slug",slugify(e.target.value))}/></label></div>
    <label>Excerpt <span>{draft.excerpt.length}/320</span><textarea value={draft.excerpt} maxLength={320} required rows={4} onChange={e=>update("excerpt",e.target.value)}/></label>
    <div className="editor-row"><label>Category<select value={draft.category} onChange={e=>update("category",e.target.value as ArticleDraftInput["category"])}>{ARTICLE_CATEGORIES.map(c=><option key={c}>{c}</option>)}</select></label><label>Tags<input value={draft.tags.join(", ")} placeholder="prospects, pitching" onChange={e=>update("tags",e.target.value.split(",").slice(0,10))}/></label></div>
    <label>Article body <span>{draft.content.length}/40,000</span><textarea className="body-editor" value={draft.content} maxLength={40000} required rows={18} onChange={e=>update("content",e.target.value)}/></label>
    <div className="cover-editor"><div>{draft.coverImageUrl?<Image src={draft.coverImageUrl} alt={draft.imageAlt||"Cover preview"} fill sizes="(max-width: 850px) 100vw, 55vw"/>:<ImagePlus/>}</div><section><h3>Cover image</h3><p>JPEG, PNG, WebP, or AVIF. Maximum 5 MB.</p><input ref={fileRef} type="file" accept="image/jpeg,image/png,image/webp,image/avif" onChange={e=>upload(e.target.files?.[0]??null)}/><div><button className="button secondary" onClick={()=>fileRef.current?.click()} disabled={uploading}>{uploading?"Uploading…":draft.coverImageUrl?"Replace image":"Upload image"}</button>{draft.coverImageUrl&&<button className="remove-image" onClick={()=>{update("coverImageUrl",null);if(fileRef.current)fileRef.current.value=""}}>Remove</button>}</div></section></div>
    <label>Image alt text<input value={draft.imageAlt||""} maxLength={200} placeholder="Describe the image for screen readers" onChange={e=>update("imageAlt",e.target.value||null)}/></label>
    <div className="editor-row"><label>Related player ID <small>Optional</small><input type="number" min="1" value={draft.relatedPlayerId||""} onChange={e=>update("relatedPlayerId",e.target.value?Number(e.target.value):null)}/></label><label>Related team ID <small>Optional</small><input type="number" min="1" value={draft.relatedTeamId||""} onChange={e=>update("relatedTeamId",e.target.value?Number(e.target.value):null)}/></label></div>
    <div className="seo-panel"><small>SEARCH & SOCIAL</small><label>SEO title <span>{draft.seoTitle?.length||0}/70</span><input value={draft.seoTitle||""} maxLength={70} onChange={e=>update("seoTitle",e.target.value||null)}/></label><label>SEO description <span>{draft.seoDescription?.length||0}/170</span><textarea value={draft.seoDescription||""} maxLength={170} rows={3} onChange={e=>update("seoDescription",e.target.value||null)}/></label></div>
    {message&&<p role="alert" className="form-error">{message}</p>}{success&&<p role="status" className="form-success"><Check/> {success}{draft.status==="published"&&draft.slug&&<> <Link href={`/analysis/${draft.slug}`}>View public article</Link></>}</p>}
    <footer className="editor-actions"><button className="button secondary" onClick={()=>setPreview(true)} disabled={!draft.title&&!draft.content}><Eye/> Preview</button><span/><button className="button secondary" onClick={()=>save("draft")} disabled={busy}>{busy?"Saving…":"Save draft"}</button>{publish&&<button className="button primary" onClick={()=>save("published")} disabled={busy}>{busy?"Publishing…":"Publish"}</button>}</footer>
   </section>
  </div>
  {preview&&<div className="article-preview-overlay" role="dialog" aria-modal="true" aria-label="Article preview"><button className="preview-close" onClick={()=>setPreview(false)}><X/> Close preview</button><article className="editorial-article page-width"><header><small>{draft.category}</small><h1>{draft.title||"Untitled article"}</h1><p>{draft.excerpt||"Article excerpt will appear here."}</p><div>By <strong>{identity!.displayName}</strong> · <time>{new Intl.DateTimeFormat("en-US",{dateStyle:"long"}).format(new Date())}</time></div></header>{draft.coverImageUrl&&<figure><Image src={draft.coverImageUrl} alt={draft.imageAlt||""} fill sizes="(max-width: 900px) 100vw, 1100px"/></figure>}<div className="article-body">{(draft.content||"Article body preview.").split(/\n{2,}/).map((paragraph,index)=><p key={index}>{paragraph}</p>)}</div></article></div>}
 </>;
}
