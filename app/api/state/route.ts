import { env } from 'cloudflare:workers';
import { getChatGPTUser } from '../../chatgpt-auth';
import { db,ensureSeed,validValue } from '../../../lib/shared-store';
export const dynamic='force-dynamic';
function json(value:unknown,status=200){return Response.json(value,{status,headers:{'Cache-Control':'no-store','X-Content-Type-Options':'nosniff'}});}
async function identity(){
 const user=await getChatGPTUser();
 const owner=env.TRACKER_OWNER_EMAIL?.trim().toLowerCase();
 return {signedIn:!!user,canEdit:!!user&&!!owner&&user.email.toLowerCase()===owner};
}
export async function GET(){
 try{
  const access=await identity();await ensureSeed();
  const {results}=await db().prepare('SELECT key,value,version FROM tracker_values').all<{key:string,value:string,version:number}>();
  return json({...access,values:Object.fromEntries(results.map(r=>[r.key,r.value])),versions:Object.fromEntries(results.map(r=>[r.key,r.version]))});
 }catch(error){console.error('Tracker read failed',error);return json({error:'Shared data is temporarily unavailable. Please try again.'},503);}
}
export async function PUT(request:Request){
 try{
  const access=await identity();if(!access.canEdit)return json({error:'Only the tracker owner can edit.'},403);
  if(request.headers.get('Origin')!==new URL(request.url).origin)return json({error:'Invalid request origin.'},403);
  if(!request.headers.get('Content-Type')?.startsWith('application/json'))return json({error:'JSON required.'},415);
  if(Number(request.headers.get('Content-Length')||0)>1100000)return json({error:'Update too large.'},413);
  const body=await request.text();if(body.length>1100000)return json({error:'Update too large.'},413);
  let payload;try{payload=JSON.parse(body)}catch{return json({error:'Invalid JSON.'},400)}
  const {key,value,version}=payload;
  if(!validValue(key,value)||!Number.isSafeInteger(version)||version<0)return json({error:'Invalid tracker data.'},400);
  await ensureSeed();
  const statement=version===0
   ?db().prepare('INSERT OR IGNORE INTO tracker_values (key,value,version) VALUES (?,?,1)').bind(key,value)
   :db().prepare('UPDATE tracker_values SET value=?,version=version+1 WHERE key=? AND version=?').bind(value,key,version);
  const result=await statement.run();
  if(result.meta.changes!==1)return json({error:'This data changed in another tab. Download your backup, then reload before editing again.'},409);
  return json({version:version+1});
 }catch(error){console.error('Tracker write failed',error);return json({error:'Could not save. Keep this page open and try again.'},503);}
}
