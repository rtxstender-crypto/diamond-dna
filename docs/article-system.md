# Article system

## Architecture

Supabase is the single production integration: Auth identifies contributors, Postgres stores articles/profiles, and Storage serves optimized source images. Apply `supabase/schema.sql`, configure the two public API settings documented in `.env.example`, create users through Supabase Auth, then explicitly add profiles with `ADMIN`, `EDITOR`, or `CONTRIBUTOR` roles.

Row-level security is authoritative. Contributors can read and edit their own drafts but cannot publish. Editors/admins can edit and publish. Public queries require `status = published`; draft URLs return 404. API handlers independently retrieve the authenticated user and database role and never accept a browser-supplied role.

Article text is stored as sanitized plain text and rendered as paragraphs, eliminating executable markup. Images accept JPEG, PNG, WebP, and AVIF up to 5 MB, receive UUID paths beneath the authenticated user ID, and are revalidated by Storage bucket policy. Alt text is supported. Public pages provide canonical, Open Graph, and Twitter metadata.

Without Supabase settings, publishing reports an explicit setup state and public article queries return an empty collection. No credentials are fabricated and no local filesystem is treated as production storage.
