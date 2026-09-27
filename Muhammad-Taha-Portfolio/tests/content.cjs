const fs=require('fs'),vm=require('vm'),ts=require('typescript'),assert=require('assert');
const source=fs.readFileSync('lib/content.ts','utf8');
const js=ts.transpileModule(source,{compilerOptions:{module:ts.ModuleKind.CommonJS,target:ts.ScriptTarget.ES2022,esModuleInterop:true}}).outputText;
const sandbox={exports:{},require:p=>JSON.parse(fs.readFileSync('lib/'+p.replace('./',''),'utf8')),URL,Map};vm.runInNewContext(js,sandbox);const c=sandbox.exports;
const data=c.defaults();c.validateData(data);const html=c.renderPortfolio(data);assert(!html.includes('%%FIELD_'));assert(!html.includes('%%CONTACT_'));assert(!html.includes('%%GALLERY_'));assert(html.includes('https://wa.me/923709042954?text='));assert(html.includes('href="/manage"'));assert(html.includes('id="theme-toggle"'));assert(html.includes('id="intro-controller"'));assert(html.length<220000);
const f=c.fields.find(f=>f.type==='text');data.values[f.id]='<script>alert(1)</script>';assert(c.renderPortfolio(data).includes('&lt;script&gt;alert(1)&lt;/script&gt;'));const img=c.fields.find(f=>f.type==='image');data.values[img.id]='javascript:alert(1)';assert.throws(()=>c.validateData(data));
fs.writeFileSync('.sites-runtime/rendered-check.html',html);const scripts=[...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)];for(const s of scripts)if(!s[1].includes('application/json'))new vm.Script(s[2]);
console.log('Passed: complete rendering, image paths, escaped editing, contact integration, all scripts and retained interactions.');
