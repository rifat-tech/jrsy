import puppeteer from 'puppeteer-core'
const CHROME='/opt/google/chrome/chrome', base='http://localhost:4500'
const browser=await puppeteer.launch({executablePath:CHROME,headless:'new',args:['--no-sandbox']})
const page=await browser.newPage()
await page.goto(base+'/login',{waitUntil:'networkidle2'})
await page.type('input[type=email]','admin@jrsy.com')
await page.type('input[type=password]','demo1234')
await page.$$eval('button', bs=>{const b=bs.find(x=>/log in/i.test(x.textContent));b&&b.click()})
await new Promise(r=>setTimeout(r,1500))
console.log('after login URL:', page.url())
const admin=['/admin','/admin/products','/admin/categories','/admin/orders','/admin/customers','/admin/reviews','/admin/coupons','/admin/banners','/admin/inventory','/admin/settings']
let fail=0
for(const r of admin){
  const errs=[]; const h=e=>errs.push(e.message); page.on('pageerror',h)
  await page.goto(base+r,{waitUntil:'networkidle2',timeout:15000})
  await new Promise(r=>setTimeout(r,500))
  page.off('pageerror',h)
  const txt=await page.evaluate(()=>document.body.innerText||'')
  if(errs.length){console.log(`✗ ${r}`);errs.forEach(e=>console.log('   JS: '+e));fail++}
  else console.log(`✓ ${r}  (${txt.length} chars)`)
}
await browser.close()
console.log(fail?`\n${fail} FAILED`:'\nALL ADMIN ROUTES OK')
process.exit(fail?1:0)
