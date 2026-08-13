import type { Metadata } from "next";
import { ArticleCard } from "@/components/article-card";
import { listPublishedArticles } from "@/data/articles/repository";
export const metadata:Metadata={title:"Analysis",description:"DiamondDNA baseball analysis, prospect coverage, rankings, trade ideas, and commentary."};
export default async function AnalysisPage(){const articles=await listPublishedArticles();return <div className="subpage page-width analysis-archive"><header className="page-header"><div><span className="eyebrow"><span/>DiamondDNA editorial</span><h1>Analysis</h1><p>Baseball ideas grounded in verified data and thoughtful context.</p></div></header>{articles.length?<div className="article-grid">{articles.map(article=><ArticleCard key={article.id} article={article}/>)}</div>:<div className="empty-state">No published analysis yet. Drafts remain private.</div>}</div>}
