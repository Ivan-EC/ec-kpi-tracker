import { db, ensureSeed } from '../../../lib/shared-store';
export const dynamic='force-dynamic';
const headers={
  'Cache-Control':'no-store',
  'Access-Control-Allow-Origin':'https://ivan-ec.github.io',
  'X-Content-Type-Options':'nosniff',
};
// Public read-only feed. No cookies, sign-in state, or write methods are exposed.
export async function GET(){
  try{
    await ensureSeed();
    const {results}=await db().prepare('SELECT key,value,version FROM tracker_values').all<{key:string,value:string,version:number}>();
    return Response.json({canEdit:false,signedIn:false,
      values:Object.fromEntries(results.map(row=>[row.key,row.value])),
      versions:Object.fromEntries(results.map(row=>[row.key,row.version])),
    },{headers});
  }catch(error){
    console.error('Public tracker read failed',error);
    return Response.json({error:'Live data is temporarily unavailable. Please retry.'},{status:503,headers});
  }
}
