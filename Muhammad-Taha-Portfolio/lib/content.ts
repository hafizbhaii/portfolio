import schema from './editor-schema.json';
import template from './portfolio-template.json';
export type Field = {id:string;type:string;label:string;group:string;default:string;altId?:string;imageId?:string};
export type GalleryImage = {src:string;alt:string;caption:string};
export type DocumentData = {values:Record<string,string>;contact:typeof schema.contact;galleries:Record<string,GalleryImage[]>};
export const fields = schema.fields as Field[];
export const defaults = ():DocumentData => ({values:Object.fromEntries(fields.map(f=>[f.id,f.default])),contact:{...schema.contact},galleries:{'1':[],'2':[],'3':[],'4':[]}});
export const escapeHTML = (s:string) => s.replace(/[&<>"']/g,c=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[c]!));
export const imagePath = (s:string) => /^\/(?:images\/[a-f0-9]{20}\.(?:png|jpeg|jpg|webp|gif)|media\/[a-f0-9-]{36})$/.test(s);
function safeURL(s:string){ if(s==='')return true;try{const u=new URL(s);return ['https:','http:','mailto:','tel:'].includes(u.protocol)&&!/[\u0000-\u001f]/.test(s)}catch{return false} }
export function validateData(input:unknown):DocumentData {
 if(!input||typeof input!=='object')throw new Error('Invalid content.');
 const data=input as DocumentData;const out=defaults();
 if(!data.values||typeof data.values!=='object')throw new Error('Content fields are missing.');
 for(const f of fields){const value=data.values[f.id];if(typeof value!=='string'||value.length>(f.type==='text'?20000:3000))throw new Error(`Check ${f.label}.`);if(f.type==='image'&&!imagePath(value))throw new Error('Upload an image using the image control.');if(f.type==='link'&&!safeURL(value))throw new Error('Use a valid website, email or phone link.');out.values[f.id]=value;}
 const c=data.contact;if(!c||typeof c!=='object')throw new Error('Contact information is missing.');
 if(typeof c.email!=='string'||!/^[-a-zA-Z0-9._+]+@[-a-zA-Z0-9.]+\.[a-zA-Z]{2,}$/.test(c.email)||c.email.length>200)throw new Error('Enter a valid email address.');
 if(typeof c.whatsapp!=='string'||!/^\d{8,15}$/.test(c.whatsapp))throw new Error('Enter the WhatsApp number with country code, digits only.');
 if(typeof c.displayNumber!=='string'||!/^\+?[0-9 ()-]{6,30}$/.test(c.displayNumber))throw new Error('Check the displayed phone number.');
 for(const k of ['instagram','linkedin'] as const){if(typeof c[k]!=='string'||!c[k].startsWith('https://')||!safeURL(c[k])||c[k].length>2000)throw new Error('Social profile links must start with https://.');}
 out.contact={email:c.email,whatsapp:c.whatsapp,displayNumber:c.displayNumber,instagram:c.instagram,linkedin:c.linkedin};
 for(const key of ['1','2','3','4']){const list=data.galleries?.[key]||[];if(!Array.isArray(list)||list.length>30)throw new Error('Use up to 30 extra images per case study.');out.galleries[key]=list.map((g:GalleryImage)=>{if(!g||!imagePath(g.src)||typeof g.alt!=='string'||g.alt.length>1000||typeof g.caption!=='string'||g.caption.length>5000)throw new Error('Check the case-study image details.');return {src:g.src,alt:g.alt,caption:g.caption}});}
 return out;
}
export function renderPortfolio(data:DocumentData){
 const byId=new Map(fields.map(f=>[f.id,f]));
 return template.replace(/%%FIELD_(f\d+)%%|%%CONTACT_(\w+)%%|%%GALLERY_([1-4])%%/g,(_,id,contact,gallery)=>{
  if(id){const f=byId.get(id)!;const value=data.values[id]??f.default;return escapeHTML(value).replace(f.type==='text'?/\n/g:/$^/g,'<br>');}
  if(contact)return escapeHTML(data.contact[contact as keyof typeof data.contact]||'');
  return '<div class="case-extra-images">'+(data.galleries[gallery]||[]).map((g:GalleryImage)=>`<figure><img src="${escapeHTML(g.src)}" alt="${escapeHTML(g.alt)}" loading="lazy"><figcaption>${escapeHTML(g.caption)}</figcaption></figure>`).join('')+'</div>';
 });
}
