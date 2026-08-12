import puppeteer from 'puppeteer-core'
const CHROME='/opt/google/chrome/chrome'
const base='http://localhost:4500'
const routes=['/','/shop','/shop?q=cricket','/football','/cricket','/custom','/product/good-vibes-home-kit','/cart','/login','/register','/admin','/account','/nonexistent-xyz']
const browser=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox']})
let fail=0
for(const r of routes){
  const page=await browser.newPage()
  const errors=[]
  page.on('pageerror',e=>errors.push('JS: '+e.message))
  page.on('console',m=>{if(m.type()==='error')errors.push('console: '+m.text())})
  try{
    await page.goto(base+r,{waitUntil:'networkidle2',timeout:15000})
    await new Promise(r=>setTimeout(r,600))
    const bodyLen=(await page.evaluate(()=>document.body.innerText||'')).length
    const hardErr=errors.filter(e=>e.startsWith('JS:')||/is not defined|Cannot read|Unexpected Application Error/.test(e))
    if(hardErr.length){console.log(`✗ ${r}`);hardErr.forEach(e=>console.log('   '+e));fail++}
    else console.log(`✓ ${r}  (${bodyLen} chars)`)
  }catch(e){console.log(`✗ ${r} — ${e.message}`);fail++}
  await page.close()
}
await browser.close()
console.log(fail? `\n${fail} route(s) FAILED`:'\nALL ROUTES OK')
process.exit(fail?1:0)
