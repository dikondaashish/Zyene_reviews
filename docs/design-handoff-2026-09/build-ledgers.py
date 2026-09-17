"""Rebuild handoff route coverage from actual page files and exported catalog inventory."""
import csv
import json
from pathlib import Path

out = Path(__file__).parent
content = json.loads((out / 'content-inventory.json').read_text())
audit = {r['path']: r for r in json.loads((out / 'browser-audit.json').read_text())['rows']}
root = Path('src/app')
marketing = root / '(marketing)'
protected = {'/', '/growth', '/newsletter/unsubscribe'}
fixed_tasks = {'about':'M24a','agencies':'M24b','blog':'M14','case-studies':'M23','compare':'M22','contact':'M25a','data-retention':'M26b','demo':'M25b','enterprise':'M24c','es/industries':'M20','features':'M09','help':'M12','how-it-works':'M10','industries':'M19','integrations':'M21','partners':'M24d','pricing':'M11','privacy':'M26b','resources':'M15','security':'M26a','terms':'M26b','tools':'M16','tools/reputation-score-checker':'M18a','tools/review-link-generator':'M17','tools/review-response-generator':'M18b'}
family_data = {'features':('features/[pillar]','M09','product'), 'industries':('industries/[industry]','M19','story'), 'spanish':('es/industries/[industry]','M20','story'), 'blog':('blog/[slug]','M14b','reading'), 'resources':('resources/[guide]','M15','reading'), 'helpCategories':('help/[slug]','M13a','reading'), 'helpArticles':('help/[slug]/[article]','M13','reading'), 'comparisons':('compare/[competitor]','M22','comparison'), 'caseStudies':('case-studies/[slug]','M23','illustrative workflow')}
implemented = {'/blog', '/compare', '/contact', '/demo', '/features', '/help', '/how-it-works', '/pricing', '/resources', '/security'}
rows=[]
def add(path, source, task, treatment, target='', host='marketing'):
    observed=audit.get(path)
    state='not attempted'
    if observed: state='timeout/incomplete' if observed.get('error') else 'loaded; automated checks only'
    status = 'hero foundation implemented' if path in implemented or path.startswith('/features/') and not target else 'planned'
    if path in {'/help', '/pricing'}: status = 'implemented'
    rows.append(dict(path=path,host=host,source_template=source,packet=task,treatment=treatment,redirect_target=target,browser_observation=state,implementation_status=status))
for file in sorted(marketing.rglob('page.tsx')):
    route='/' + str(file.parent.relative_to(marketing)).replace('.', '')
    if '[' not in route and route not in protected:
        task=fixed_tasks[route[1:]]
        treatment='compact directory'
        if route in ['/contact','/demo']: treatment='conversion'
        elif route in ['/privacy','/terms','/data-retention','/security']: treatment='reading'
        elif route in ['/about','/agencies','/enterprise']: treatment='audience/story'
        elif route=='/pricing': treatment='compact pricing'
        elif route=='/help': treatment='support/search'
        elif route=='/features': treatment='compact directory'
        elif route=='/how-it-works': treatment='product'
        elif route.startswith('/tools/'): treatment='functional tool'
        add(route,str(file),task,treatment)
for family,(template,task,treatment) in family_data.items():
    for item in content[family]:
        feature_task={'review-monitoring':'M03','ai-replies':'M04','review-collection':'M05','analytics':'M06','competitor-tracking':'M07','local-seo':'M08'}.get(item['path'].split('/')[-1]) if family=='features' else None
        add(item['path'],str(marketing/template/'page.tsx'),f'{feature_task}; M09' if feature_task else task,treatment)
for file in sorted((root/'docs').rglob('page.tsx')):
    route='/' + str(file.parent.relative_to(root))
    add(route,str(file),'M27','docs reading')
for old,new in content['featureAliases'].items():
    add('/features/'+old,str(marketing/'features/[pillar]/page.tsx'),'M09','preserve redirect','/features/'+new)
for item in content['helpArticles']:
    add(item['legacyPath'],str(marketing/'help/[slug]/page.tsx'),'M13','preserve redirect',item['path'])
add('/product','next.config.ts','M09','preserve redirect','/features')
add('/customers','src/lib/routing/platform-routes.ts','M23','preserve redirect','/case-studies','marketing production only')
for item in content['caseStudies']:
    add(item['path'].replace('/case-studies/','/customers/'),'src/lib/routing/platform-routes.ts','M23','preserve redirect',item['path'],'marketing production only')
assert len({(r['host'],r['path']) for r in rows})==len(rows)
with (out/'route-ledger.csv').open('w', newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(rows[0]),lineterminator='\n');w.writeheader();w.writerows(sorted(rows,key=lambda r:r['path']))
protected_rows=[]
for file in sorted(root.rglob('page.tsx')):
    parts=[p for p in file.parent.relative_to(root).parts if not p.startswith('(')]
    route='/'+'/'.join(parts)
    if marketing in file.parents and route not in protected:continue
    if root/'docs' in file.parents:continue
    surface='authenticated dashboard' if '(dashboard)' in str(file) else 'auth/onboarding'
    if route=='/':surface='homepage'
    elif route=='/growth':surface='internal operations'
    elif route=='/newsletter/unsubscribe':surface='transactional unsubscribe'
    elif route.startswith('/r/'):surface='public review capture'
    elif route.startswith('/w/'):surface='public widget'
    treatment = 'preserve; excluded from the interior-page rollout' if route == '/' else 'preserve; no redesign in this handoff'
    protected_rows.append(dict(route_template=route,source=str(file),surface=surface,treatment=treatment))
with (out/'protected-routes.csv').open('w', newline='') as f:
    w=csv.DictWriter(f,fieldnames=list(protected_rows[0]),lineterminator='\n');w.writeheader();w.writerows(protected_rows)
summary=dict(marketing_templates=len(list(marketing.rglob('page.tsx'))),all_page_templates=len(list(root.rglob('page.tsx'))),public_design_urls=sum(not r['redirect_target'] for r in rows),alias_urls=sum(bool(r['redirect_target']) for r in rows),protected_templates=len(protected_rows),browser_attempted=len(audit),browser_loaded=sum(not r.get('error') for r in audit.values()),browser_incomplete=sum(bool(r.get('error')) for r in audit.values()))
(out/'coverage-summary.json').write_text(json.dumps(summary,indent=2)+'\n')
print(json.dumps(summary))
