import { env } from 'cloudflare:workers';
import seed from './seed.json';
export function db(){if(!env.DB)throw new Error('Shared storage unavailable');return env.DB;}
let seeded:Promise<void>|undefined;
export async function ensureSeed(){
 if(!seeded) seeded=(async()=>{
  const values:Record<string,string>={'kpi-products':JSON.stringify(seed.products),'kpi-standing-instructions':seed.standingInstructions};
  for(const [id,rows] of Object.entries(seed.history))values['kpi-history-'+id]=JSON.stringify(rows);
  for(const [id,rows] of Object.entries(seed.placementHistory))values['kpi-placement-history-'+id]=JSON.stringify(rows);
  await db().batch(Object.entries(values).map(([key,value])=>db().prepare('INSERT OR IGNORE INTO tracker_values (key,value,version) VALUES (?,?,1)').bind(key,value)));
 })().catch(error=>{seeded=undefined;throw error});
 await seeded;
}
export function validValue(key:unknown,value:unknown):key is string {
 if(typeof key!=='string'||typeof value!=='string'||value.length>1000000)return false;
 if(key==='kpi-standing-instructions')return value.length<=20000;
 if(key!=='kpi-products'&&!/^kpi-(placement-)?history-[a-z0-9-]{1,100}$/.test(key))return false;
 try{
  const rows=JSON.parse(value);if(!Array.isArray(rows)||rows.length>10000)return false;
  if(key==='kpi-products')return rows.length<=100 && new Set(rows.map(p=>p.id)).size===rows.length && rows.every(p=>p&&typeof p.id==='string'&&/^[a-z0-9-]{1,100}$/.test(p.id)&&typeof p.name==='string'&&Array.isArray(p.keywords));
  return rows.every(row=>row&&typeof row.date==='string'&&/^\d{4}-\d{2}-\d{2}$/.test(row.date))&&new Set(rows.map(row=>row.date)).size===rows.length;
 }catch{return false;}
}
