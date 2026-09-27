import {existsSync,readFileSync,writeFileSync} from 'node:fs';
import {randomBytes,pbkdf2Sync} from 'node:crypto';
import {spawnSync} from 'node:child_process';
import {createInterface} from 'node:readline/promises';
import {Writable} from 'node:stream';
import './sites-env.mjs';
function run(args){const r=spawnSync(process.execPath,args,{stdio:'inherit'});if(r.error)throw r.error;if(r.status!==0)process.exit(r.status||1)}
async function secret(prompt){process.stdout.write(prompt);const quiet=new Writable({write(_chunk,_encoding,done){done()}});const rl=createInterface({input:process.stdin,output:quiet,terminal:true});rl.on('SIGINT',()=>{rl.close();process.exit(130)});try{return await rl.question('')}finally{rl.close();process.stdout.write('\n')}}
if(!existsSync('node_modules/wrangler/bin/wrangler.js'))throw new Error('Install dependencies first: pnpm install --frozen-lockfile');
const reset=process.argv.includes('--reset-password');
let configured=existsSync('.dev.vars')&&/^EDITOR_PASSWORD_HASH=[a-f0-9]{32}:[a-f0-9]{64}$/m.test(readFileSync('.dev.vars','utf8'));
if(!configured||reset){
 if(!process.stdin.isTTY)throw new Error('Run setup:local in an interactive terminal to choose your password.');
 const password=await secret('Choose your admin password (at least 8 characters): ');
 if(password.length<8||password.length>200)throw new Error('Choose a password between 8 and 200 characters.');
 const confirm=await secret('Confirm your admin password: ');
 if(password!==confirm)throw new Error('Passwords did not match. Run setup again.');
 const salt=randomBytes(16).toString('hex');
 const verifier=salt+':'+pbkdf2Sync(password,Buffer.from(salt,'hex'),100000,32,'sha256').toString('hex');
 const previous=existsSync('.dev.vars')?readFileSync('.dev.vars','utf8').replace(/^EDITOR_PASSWORD_HASH=.*\r?\n?/gm,''):'';
 writeFileSync('.dev.vars',previous+'\nEDITOR_PASSWORD_HASH='+verifier+'\n',{mode:0o600});
 console.log('Your local password has been configured.');
}
if(!existsSync('dist/server/index.js'))run(['scripts/run-framework.mjs','build']);
run(['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','migrations','apply','DB','--local','--config','wrangler.local.json','--persist-to','.wrangler/state']);
if(reset)run(['--import','./scripts/sites-env.mjs','./node_modules/wrangler/bin/wrangler.js','d1','execute','DB','--local','--config','wrangler.local.json','--persist-to','.wrangler/state','--command','DELETE FROM editor_sessions']);
console.log('\nReady. Run: pnpm start\nOpen: http://localhost:8787\nUse the small footer lock to unlock the editor.');
