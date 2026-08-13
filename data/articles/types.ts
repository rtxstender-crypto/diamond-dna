export const ARTICLE_CATEGORIES = ["Analysis","Prospects","Trade Ideas","Breakouts","Hidden Gems","Rankings","Commentary"] as const;
export type ArticleCategory = typeof ARTICLE_CATEGORIES[number];
export type ArticleStatus = "draft" | "published";
export type ContributorRole = "ADMIN" | "EDITOR" | "CONTRIBUTOR";
export interface Article {
  id:string; title:string; slug:string; excerpt:string; content:string; coverImageUrl:string|null; imageAlt:string|null;
  author:string; authorId:string; createdAt:string; publishedAt:string|null; updatedAt:string; status:ArticleStatus;
  category:ArticleCategory; tags:string[]; relatedPlayerId:number|null; relatedTeamId:number|null; seoTitle:string|null; seoDescription:string|null;
}
export interface ArticleDraftInput extends Pick<Article,"title"|"excerpt"|"content"|"imageAlt"|"category"|"tags"|"relatedPlayerId"|"relatedTeamId"|"seoTitle"|"seoDescription"> { id?:string; slug?:string; coverImageUrl?:string|null; status:ArticleStatus }
export interface ContributorIdentity { id:string; displayName:string; role:ContributorRole }
export type ContributorAccess =
  | { state:"signed-out"; identity:null; reason:"missing"|"expired" }
  | { state:"unauthorized"; identity:null }
  | { state:"profile-error"; identity:null }
  | { state:"authorized"; identity:ContributorIdentity };
