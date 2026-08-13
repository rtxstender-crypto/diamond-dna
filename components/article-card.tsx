import Image from "next/image";
import Link from "next/link";
import type { Article } from "@/data/articles/types";

export function ArticleCard({article}:{article:Article}){return <article className="article-card">{article.coverImageUrl&&<Link href={`/analysis/${article.slug}`} className="article-card-image"><Image src={article.coverImageUrl} alt={article.imageAlt||""} fill sizes="(max-width: 700px) 100vw, 33vw" /></Link>}<div><small>{article.category}</small><h2><Link href={`/analysis/${article.slug}`}>{article.title}</Link></h2><p>{article.excerpt}</p><footer><span>{article.author}</span><time dateTime={article.publishedAt||article.createdAt}>{new Intl.DateTimeFormat("en-US",{dateStyle:"medium"}).format(new Date(article.publishedAt||article.createdAt))}</time></footer></div></article>}
