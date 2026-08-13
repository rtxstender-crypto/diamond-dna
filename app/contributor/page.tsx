import type { Metadata } from "next";
import { ContributorDashboard } from "@/components/contributor-dashboard";
import { getContributorAccess } from "@/data/articles/auth";
import { listContributorArticles } from "@/data/articles/repository";
import { isPublishingConfigured } from "@/data/articles/supabase";
export const metadata:Metadata={title:"Contributor",robots:{index:false,follow:false}};
export const dynamic="force-dynamic";
export default async function ContributorPage(){const access=await getContributorAccess(),articles=access.state==="authorized"?await listContributorArticles(access.identity.id,access.identity.role!=="CONTRIBUTOR"):[];return <div className="subpage page-width contributor-page"><header className="page-header"><div><span className="eyebrow"><span/>Private workspace</span><h1>Contributor</h1><p>Draft, preview, and publish DiamondDNA analysis.</p></div></header><ContributorDashboard access={access} articles={articles} configured={isPublishingConfigured()}/></div>}
