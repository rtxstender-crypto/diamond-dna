import "server-only";

export function logServerError(event:string,error:unknown,details:Record<string,string|number|boolean|undefined>={}){
  const safeError=error instanceof Error?{name:error.name,message:error.message.slice(0,240)}:{name:"UnknownError",message:"Unknown failure"};
  console.error(JSON.stringify({level:"error",event,...details,error:safeError,at:new Date().toISOString()}));
}
