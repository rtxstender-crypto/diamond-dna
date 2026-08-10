import type {NextConfig} from "next";
const securityHeaders=[
  {key:"X-Content-Type-Options",value:"nosniff"},
  {key:"X-Frame-Options",value:"DENY"},
  {key:"Referrer-Policy",value:"strict-origin-when-cross-origin"},
  {key:"Permissions-Policy",value:"camera=(), microphone=(), geolocation=()"},
  {key:"Content-Security-Policy",value:"frame-ancestors 'none'; object-src 'none'; base-uri 'self'; form-action 'self'"},
];
const nextConfig:NextConfig={experimental:{cpus:1},async headers(){return[{source:"/(.*)",headers:securityHeaders}]}};
export default nextConfig;
