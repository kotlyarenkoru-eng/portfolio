import {mkdir,readFile,writeFile,cp,rm,stat} from 'node:fs/promises';
import {resolve,dirname,join} from 'node:path';
const root=resolve(import.meta.dirname,'..');
const html=await readFile(join(root,'index.html'),'utf8');
if((html.match(/<html(?:\s|>)/g)||[]).length!==1||(html.match(/<head>/g)||[]).length!==1)throw new Error('Expected one HTML document');
for(const removed of ['class="project-picker"','class="intro-projects"','class="case-contents"','class="expand-story"','<details class="case-chapter"'])if(html.includes(removed))throw new Error('Removed interface remains: '+removed);
const config=JSON.parse(html.match(/const PORTFOLIO_ASSETS = (\{[\s\S]*?\});/)[1]);
const assets=new Set(Object.values(config).filter(Boolean));
for(const match of html.matchAll(/(?:src|href)="([^"#]+)"/g)){
 const path=match[1];if(!/^(https?:|mailto:|tel:|data:)/.test(path))assets.add(path);
}
for(const path of assets){if(/^(https?:|data:)/.test(path))continue;const file=resolve(root,path);if(!file.startsWith(root+'/'))throw new Error('Path outside project: '+path);await stat(file);}
const out=join(root,'dist');await rm(out,{recursive:true,force:true});await mkdir(out,{recursive:true});
for(const path of ['index.html','cvv.html','responsive.css','enhancements.js','CNAME','assets'])await cp(join(root,path),join(out,path),{recursive:true});
for(const path of assets){if(/^(https?:|data:)/.test(path)||path.startsWith('assets/'))continue;await mkdir(dirname(join(out,path)),{recursive:true});await cp(join(root,path),join(out,path));}
await writeFile(join(out,'.nojekyll'),'');
console.log(`Built static portfolio: ${assets.size} validated local references. Output: dist/`);
