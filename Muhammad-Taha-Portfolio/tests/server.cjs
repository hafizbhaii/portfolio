const fs=require('fs'),assert=require('assert'),crypto=require('crypto'),{createRequire}=require('module');
const req=createRequire(require.resolve('wrangler/package.json'));const {Miniflare}=req('miniflare');
(async()=>{
 const salt=crypto.randomBytes(16).toString('hex');const hash=salt+':'+crypto.pbkdf2Sync('preview-test-only',Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
 const path=require('path');const serverRoot=path.resolve('dist/server');const modules=[{type:'ESModule',path:path.join(serverRoot,'index.js')},...fs.readdirSync(serverRoot,{recursive:true}).filter(p=>p!=='index.js'&&/\.m?js$/.test(p)).map(p=>({type:'ESModule',path:path.join(serverRoot,p)}))];
 const mf=new Miniflare({modules,modulesRoot:serverRoot,compatibilityDate:'2026-05-15',compatibilityFlags:['nodejs_compat'],d1Databases:['DB'],r2Buckets:['BUCKET'],bindings:{EDITOR_PASSWORD_HASH:hash}});
 try{
 const db=await mf.getD1Database('DB');const sql=fs.readFileSync('drizzle/0000_high_switch.sql','utf8');for(const part of sql.split('--> statement-breakpoint'))await db.exec(part.trim().replace(/\n/g,' '));
 const base=process.env.TEST_ORIGIN||'https://portfolio.test';const send=(path,options={})=>mf.dispatchFetch(base+path,options);const multipart=async(path,headers,body)=>{const r=new Request(base+path,{method:'POST',headers,body});return send(path,{method:'POST',headers:Object.fromEntries(r.headers),body:Buffer.from(await r.arrayBuffer())})};
 let res=await send('/');assert.equal(res.status,200);let original=await res.text();assert(original.includes('href="/manage"'));
 assert.equal((await send('/api/editor')).status,401);
 assert.equal((await send('/api/editor',{method:'PUT',headers:{origin:base,'content-type':'application/json'},body:'{}'})).status,401);
 assert.equal((await send('/api/editor/login',{method:'POST',headers:{origin:'https://other.test','content-type':'application/json'},body:'{}'})).status,403);
 assert.equal((await send('/api/editor/login',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({password:'wrong'})})).status,401);
 res=await send('/api/editor/login',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({password:'preview-test-only'})});assert.equal(res.status,200,await res.clone().text());const cookie=res.headers.get('set-cookie');assert.equal(cookie.includes('Secure'),base.startsWith('https:'));assert(cookie.startsWith(base.startsWith('https:')?'__Host-portfolio_editor=':'portfolio_editor_local='));assert(cookie.includes('HttpOnly'));assert(cookie.includes('SameSite=Strict'));const headers={origin:base,cookie:cookie.split(';')[0],'content-type':'application/json'};
 const state=await(await send('/api/editor',{headers})).json();assert.equal(state.fields.filter(f=>f.type==='image').length,21);
 const field=state.fields.find(f=>f.type==='text'&&f.group==='Introduction');state.data.values[field.id]='Edited live headline';
 res=await send('/api/editor',{method:'PUT',headers,body:JSON.stringify({version:state.version,data:state.data})});assert.equal(res.status,200,await res.clone().text());assert((await(await send('/')).text()).includes('Edited live headline'));
 assert.equal((await send('/api/editor',{method:'PUT',headers,body:JSON.stringify({version:0,data:state.data})})).status,409);
 const image=fs.readdirSync('public/images').find(x=>x.endsWith('.webp'));const form=new FormData();form.set('image',new File([fs.readFileSync('public/images/'+image)],'art.webp',{type:'image/webp'}));
 res=await multipart('/api/editor/upload',{origin:base,cookie:headers.cookie},form);assert.equal(res.status,200,await res.clone().text());const uploaded=await res.json();res=await send(uploaded.src);assert.equal(res.status,200);assert.equal(res.headers.get('content-type'),'image/webp');assert.equal((await res.arrayBuffer()).byteLength,fs.statSync('public/images/'+image).size);
 const invalid=new FormData();invalid.set('image',new File(['<svg onload="alert(1)"></svg>'],'bad.png',{type:'image/png'}));assert.equal((await multipart('/api/editor/upload',{origin:base,cookie:headers.cookie},invalid)).status,415);
 await send('/api/editor/logout',{method:'POST',headers});assert.equal((await send('/api/editor',{headers})).status,401);
 for(let i=0;i<10;i++)res=await send('/api/editor/login',{method:'POST',headers:{origin:base,'content-type':'application/json'},body:JSON.stringify({password:'wrong'})});assert.equal(res.status,429);
 console.log('Passed: authentication, cookie protections, CSRF rejection, unauthorized-write rejection, publication visibility, version conflicts, real R2 upload/read, invalid image rejection, logout and rate limiting.');
 }finally{await mf.dispose()}
})().catch(e=>{console.error(e);process.exitCode=1});
