import express from 'express'
// prefer global fetch when available (Node 18+), fall back to node-fetch
let fetchImpl = global.fetch
try{
  if(!fetchImpl) fetchImpl = (await import('node-fetch')).default
}catch(e){ /* node-fetch may not be installed; rely on global */ }
import { URL } from 'url'

const app = express()
app.use(express.json())

function sleep(ms){ return new Promise(r=>setTimeout(r, ms)) }

function isEmail(tok){ return /@/.test(tok) }
function cleanTokens(q){ return q.split(/[\s,]+/).map(s=>s.trim()).filter(Boolean) }

app.post('/api/scan', async (req,res)=>{
  const query = (req.body && req.body.query) || ''
  const toks = Array.from(new Set(cleanTokens(query)))
  const emails = toks.filter(isEmail)
  const usernames = toks.filter(t=>!isEmail(t))

  const findings = []
  let platforms = 0
  let riskIndicators = 0

  // deterministic profile checks
  const profileSites = [
    {name:'github', url: u=>`https://github.com/${u}`},
    {name:'reddit', url: u=>`https://www.reddit.com/user/${u}`},
    {name:'x', url: u=>`https://x.com/${u}`},
    {name:'medium', url: u=>`https://medium.com/@${u}`},
    {name:'keybase', url: u=>`https://keybase.io/${u}`},
  ]

  // limit and delay
  const perEntityLimit = 3

  // deterministic profile checks (HEAD preferred, fallback to GET)
  for(const u of usernames.slice(0,10)){
    let foundCount=0
    for(const site of profileSites){
      try{
        const url = site.url(u)
        // HEAD first
        let r
        try{
          r = await fetchImpl(url, { method:'HEAD', redirect:'follow', timeout:10000 })
        }catch(e){
          // HEAD might be blocked; try GET
          try{ r = await fetchImpl(url, { method:'GET', redirect:'follow', timeout:10000 }) }catch(e2){ r=null }
        }
        await sleep(120)
        if(r){
          const status = r.status || (r.statusCode) || 0
          if(status===429 || status===403){
            // treat as unknown, do not mark as found
          } else if(status>=200 && status<400){
            foundCount++
            findings.push({ entity:u, type:'profile', source:site.name, title:`${u} on ${site.name}`, url, confidence: 1.0 })
          }
        }
      }catch(e){/*ignore*/}
      if(foundCount>=perEntityLimit) break
    }
    if(foundCount>0) platforms += foundCount
  }

  // DuckDuckGo simple search (HTML) for emails and usernames
  const ddgSearch = async (q)=>{
    try{
      const url = `https://html.duckduckgo.com/html/?q=${encodeURIComponent(q)}`
      const r = await fetch(url, { method:'GET' })
      const txt = await r.text()
      await sleep(220)
      // crude extraction of first link
      const m = txt.match(/<a[^>]+?href="(https?:[^"']+)"[^>]*>([^<]+)</i)
      if(m){ return {url:m[1], title: m[2].replace(/<[^>]+>/g,''), snippet: ''} }
    }catch(e){}
    return null
  }

  for(const e of emails.slice(0,5)){
    const q = `${e}`
    const r = await ddgSearch(q)
    if(r){
      findings.push({ entity:e, type:'search', source:'duckduckgo', title:r.title, url:r.url, confidence:0.6 })
      riskIndicators++
    }
  }

  for(const u of usernames.slice(0,5)){
    const q = `${u} site:github.com OR site:reddit.com OR site:x.com`
    const r = await ddgSearch(q)
    if(r){
      findings.push({ entity:u, type:'search', source:'duckduckgo', title:r.title, url:r.url, confidence:0.5 })
    }
  }

  const totalFindings = findings.length
  const confidence = platforms>=3 || riskIndicators>=3 ? 'HIGH' : (platforms>0 || riskIndicators>0 ? 'MODERATE' : 'LOW')

  const out = {
    entities:{ emails, usernames },
    summary:{ totalFindings, platforms, confidence, riskIndicators },
    findings,
    notes:[]
  }

  res.json(out)
})

const port = process.env.PORT || 3001
app.listen(port, ()=> console.log('scan api listening', port))
