import re,os,json,sys
base='/Users/adityasmac/forgelab'
p=os.path.join(base,'services/maintenance-support-services.html')
s=open(p,encoding='utf-8').read()
fail=[]
for m in re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S):
    try:
        d=json.loads(m); print('JSON-LD OK, nodes:',[n.get('@type') for n in d.get('@graph',[])])
    except Exception as e: fail.append('JSON-LD: %s'%e)
void={'area','base','br','col','embed','hr','img','input','link','meta','param','source','track','wbr'}
for t in sorted(set(re.findall(r'</?([a-zA-Z][\w-]*)',s))):
    if t in void: continue
    o=len(re.findall(r'<%s(?=[\s/>])'%t,s)); c=len(re.findall(r'</%s>'%t,s))
    if o!=c: fail.append('UNBALANCED <%s> open=%d close=%d'%(t,o,c))
h1=re.findall(r'<h1[^>]*>(.*?)</h1>',s)
print('h1:',h1)
if len(h1)!=1: fail.append('h1 count=%d'%len(h1))
print('img without alt:',[m for m in re.findall(r'<img[^>]*>',s) if 'alt=' not in m])
print('a without href:',re.findall(r'<a(?![^>]*\shref)[^>]*>',s))
for a in ['aria-labelledby','aria-describedby','aria-controls']:
    for i in re.findall(a+r'="([^"]+)"',s):
        if ('id="%s"'%i) not in s: fail.append('%s -> missing id %s'%(a,i))
for i in re.findall(r'url\(#([\w-]+)\)',s):
    if ('id="%s"'%i) not in s: fail.append('url(#%s) missing'%i)
for i in re.findall(r'href="#([\w-]+)"',s):
    if ('id="%s"'%i) not in s: fail.append('href="#%s" missing'%i)
for link in sorted(set(re.findall(r'(?:href|src)="((?!http|mailto|tel|data:|#)[^"]+)"',s))):
    t=link.split('?')[0].split('#')[0]
    if t and not os.path.exists(os.path.normpath(os.path.join(os.path.dirname(p),t))): fail.append('BROKEN LINK %s'%link)
print('sections with aria-labelledby:',len(re.findall(r'<section[^>]*aria-labelledby',s)),'of',len(re.findall(r'<section',s)))
print('landmarks main/nav/footer:',len(re.findall(r'<main',s)),len(re.findall(r'<nav',s)),len(re.findall(r'<footer',s)))
ld=json.loads(re.findall(r'<script type="application/ld\+json">(.*?)</script>',s,re.S)[0])['@graph']
faq=[(q['name'],q['acceptedAnswer']['text']) for q in next(n for n in ld if n['@type']=='FAQPage')['mainEntity']]
vis=re.findall(r'<summary>(.*?)</summary><p>(.*?)</p></details>',s,re.S)
print('FAQ json=%d visible=%d'%(len(faq),len(vis)))
if faq!=vis: fail.append('FAQ parity mismatch')
c=open(os.path.join(base,'services.css'),encoding='utf-8').read()
used={k for cl in re.findall(r'class="([^"]+)"',s) for k in cl.split()}
missing=sorted(k for k in used if k.startswith('maintenance-') and '.'+k not in c)
print('maintenance classes missing CSS:',missing)
if missing: fail.append('missing CSS: %s'%missing)
unused=sorted(d for d in set(re.findall(r'\.(maintenance-[\w-]+)',c)) if d not in used)
print('unused maintenance CSS:',unused)
if unused: fail.append('unused CSS: %s'%unused)
units=0
for cl in re.findall(r'class="(maintenance-service-card[^"]*)"',s):
    units += 4 if 'maintenance-service-card-wide' in cl else (2 if 'maintenance-service-card-featured' in cl else 1)
print('service grid column units:',units,'remainder mod 4 =',units%4)
if units%4: fail.append('grid hole: %d units'%units)
print()
print('FAILURES:',len(fail))
for f in fail: print(' -',f)
