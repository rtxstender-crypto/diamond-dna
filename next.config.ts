import type {NextConfig} from "next";
const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Content-Security-Policy",value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
];
const supabaseHost=process.env.NEXT_PUBLIC_SUPABASE_URL&&URL.canParse(process.env.NEXT_PUBLIC_SUPABASE_URL)?new URL(process.env.NEXT_PUBLIC_SUPABASE_URL).hostname:null;
const nextConfig:NextConfig={experimental:{cpus:1},images:{remotePatterns:supabaseHost?[{protocol:"https",hostname:supabaseHost,pathname:"/storage/v1/object/public/article-images/**"}]:[]},async headers(){return[{source:"/(.*)",headers:securityHeaders}]}};
export default nextConfig;
