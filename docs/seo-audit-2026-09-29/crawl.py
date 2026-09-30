import urllib.request,urllib.error,urllib.parse,xml.etree.ElementTree as ET,json,csv,time,collections,concurrent.futures
from html.parser import HTMLParser
from pathlib import Path
out=Path('docs/seo-audit-2026-09-29'); origin='https://www.zyenereviews.com'
class Page(HTMLParser):
 def __init__(self):
  super().__init__(); self.title='';self.h1=[];self.headings=[];self.meta={};self.canonical='';self.links=[];self.ids=set();self.images=[];self.schemas=[];self.current=None;self.buf='';self.schema=False
 def handle_starttag(self,t,a):
  a=dict(a)
  if 'id' in a:self.ids.add(a['id'])
  if t=='meta':self.meta[a.get('name',a.get('property',''))]=a.get('content','')
  if t=='link' and a.get('rel')=='canonical':self.canonical=a.get('href','')
  if t=='a' and a.get('href'):self.links.append(a['href'])
  if t=='img':self.images.append(a)
  if t in ['title','h1','h2','h3','h4','h5','h6']:self.current=t;self.buf=''
  if t=='script' and a.get('type')=='application/ld+json':self.schema=True;self.sbuf=''
 def handle_data(self,d):
  if self.current:self.buf+=d
  if self.schema:self.sbuf+=d
 def handle_endtag(self,t):
  if t==self.current:
   if t=='title':self.title=self.buf.strip()
   else:
    self.headings.append((int(t[1]),self.buf.strip()))
    if t=='h1':self.h1.append(self.buf.strip())
   self.current=None
  if t=='script' and self.schema:
   try:self.schemas.append(json.loads(self.sbuf))
   except:self.schemas.append({'parse_error':True})
   self.schema=False

def fetch(url):
 try:
  req=urllib.request.Request(url,headers={'User-Agent':'ZyeneSEOAudit/1.0 (site-owner audit)'})
  with urllib.request.urlopen(req,timeout=25) as r:
   raw=r.read().decode('utf-8','replace'); p=Page(); p.feed(raw)
   return {'url':url,'final_url':r.url,'status':r.status,'title':p.title,'description':p.meta.get('description',''),'canonical':p.canonical,'robots':p.meta.get('robots',''),'x_robots':r.headers.get('X-Robots-Tag',''),'h1':p.h1,'headings':p.headings,'missing_alt':sum('alt' not in x for x in p.images),'og_image':p.meta.get('og:image',''),'twitter_card':p.meta.get('twitter:card',''),'links':p.links,'ids':sorted(p.ids),'schemas':p.schemas}
 except Exception as e:return {'url':url,'status':getattr(e,'code',0),'error':str(e)}
urls=[x.text for x in ET.parse(out/'sitemap.xml').findall('.//{*}loc')]
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: rows=list(pool.map(fetch,urls))
(out/'crawl-pages.json').write_text(json.dumps(rows,indent=2))
fields=['url','status','final_url','title','description','canonical','robots','x_robots','h1','missing_alt','og_image','twitter_card']
with (out/'crawl-pages.csv').open('w') as f:
 w=csv.DictWriter(f,fieldnames=fields,extrasaction='ignore');w.writeheader();w.writerows(rows)
known={r['url'].rstrip('/'):r for r in rows}; targets=set(); fragments=[]
for r in rows:
 for link in r.get('links',[]):
  u=urllib.parse.urlsplit(urllib.parse.urljoin(r['url'],link))
  if u.netloc!='www.zyenereviews.com':continue
  clean=urllib.parse.urlunsplit((u.scheme,u.netloc,u.path,'',''))
  if u.fragment:fragments.append((r['url'],clean,u.fragment))
  if clean.rstrip('/') not in known and not u.path.startswith(('/api/','/auth/')):targets.add(clean)
with concurrent.futures.ThreadPoolExecutor(max_workers=3) as pool: other=list(pool.map(fetch,sorted(targets)))
(out/'crawl-linked-targets.json').write_text(json.dumps(other,indent=2))
known.update({r['url'].rstrip('/'):r for r in other})
broken_fragments=[(src,url,frag) for src,url,frag in fragments if frag not in known.get(url.rstrip('/'),{}).get('ids',[]) and known.get(url.rstrip('/'),{}).get('status')==200]
issues={
 'sitemap_count':len(urls),'status_counts':dict(collections.Counter(r['status'] for r in rows)),
 'bad_pages':[r for r in rows if r['status']!=200],
 'missing_metadata':[r['url'] for r in rows if not all(r.get(k) for k in ['title','description','canonical','og_image','twitter_card'])],
 'h1_issues':[r['url'] for r in rows if len(r.get('h1',[]))!=1],
 'noindex':[r['url'] for r in rows if 'noindex' in r.get('robots','')+r.get('x_robots','')],
 'missing_alt':[r['url'] for r in rows if r.get('missing_alt')],
 'duplicate_titles':[k for k,v in collections.Counter(r.get('title') for r in rows).items() if v>1],
 'duplicate_descriptions':[k for k,v in collections.Counter(r.get('description') for r in rows).items() if v>1],
 'long_descriptions':[(r['url'],len(r.get('description',''))) for r in rows if len(r.get('description',''))>160],
 'linked_target_count':len(other),'broken_links':[{'url':r['url'],'status':r['status']} for r in other if r['status']>=400 or r['status']==0],
 'broken_fragments':broken_fragments}
(out/'crawl-summary.json').write_text(json.dumps(issues,indent=2)); print(json.dumps(issues,indent=2))
