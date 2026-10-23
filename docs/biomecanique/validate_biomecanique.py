#!/usr/bin/env python3
"""CME-3D biomechanical catalogue consistency checks, no external deps."""
from pathlib import Path
import json,re,sys,collections
root=Path(__file__).resolve().parent
def read(name):return json.loads((root/name).read_text(encoding='utf8'))
data=read('mouvements.json');combos=read('enchainements.json');refs=read('sources.json');visual=read('references_visuelles.json');cov=read('COUVERTURE.json')
motions=data['movements'];sequences=combos['combinations'];sources=refs['sources']
valid_disciplines={'boxe','kickboxing','muaythai','mma','bjj','judo'}
def assert_unique(items,key,label):
 vals=[x[key] for x in items]
 assert len(vals)==len(set(vals)),f'Duplicate {label}'
assert_unique(motions,'id','movement id')
assert_unique(sequences,'id','sequence id')
assert_unique(sources,'id','source id')
assert_unique(visual['reference_portals'],'id','visual source id')
assert_unique(visual['atlas'],'movement_id','visual movement id')
byid={x['id']:x for x in motions};refids={x['id'] for x in sources};visids={x['id'] for x in visual['reference_portals']}
assert len(motions)==data['motion_count']
assert len(sequences)==43
assert len(byid)==len(visual['atlas'])
engine=[x for x in motions if x['motion_engine_id']]
assert len(engine)==86
assert len([x for x in motions if x['source_of_inventory']=='ijf_taxonomy'])==100
for motion in motions:
 assert re.fullmatch('[a-z0-9]+(?:-[a-z0-9]+)*',motion['id']),motion['id']
 assert motion['disciplines'] and set(motion['disciplines']) <= valid_disciplines
 assert len(motion['kinematic_phases'])>=8,motion['id']
 assert all(z['source_id'] in refids for z in motion['evidence']),motion['id']
 assert motion['biomechanical_constraints']['measured_joint_ranges_degrees'] is None
 assert motion['quality']['biomechanics_validation']=='not_validated'
 assert motion['execution_context'] in ('solo_possible','solo_drill_or_partner_dependent','partner_required')
for combo in sequences:
 assert combo['sequence']
 assert combo['provenance']=='proposition_experimentale'
 for step in combo['sequence']:
  target=byid[step['movement_id']]
  assert set(combo['disciplines']) <= set(target['disciplines']),combo['id']+' '+target['id']
  assert step['overlap_seconds'] is None
for row in visual['atlas']:
 assert row['movement_id'] in byid
 assert row['status']=='research_query_prepared' and not row['per_movement_photo_verified']
 assert len(row['search_terms'])>=3
 assert all(p['id'] in visids for p in row['reference_portals'])
for s in sources:
 assert s['metadata_verification'] in ['verified_cross_reference','pending_independent_check']
 assert s['url'].startswith('https://')
 assert s['verified_on'] is None or s['metadata_verification']=='verified_cross_reference'
for row in cov['coverage']:
 d=row['discipline'];relevant=[x for x in motions if d in x['disciplines']]
 assert row['techniques_catalogue']==len(relevant)
 assert row['implemented_in_lab']==sum(x['motion_engine_id'] is not None for x in relevant)
 assert row['new_candidates']==sum(x['motion_engine_id'] is None for x in relevant)
 assert row['combos_proposed']==sum(d in c['disciplines'] for c in sequences)
assert {x['discipline'] for x in cov['coverage']}==valid_disciplines
print(f"OK: {len(motions)} fiches, {len(engine)} gestes moteur, {len(sequences)} combos, {len(sources)} sources, {len(visual['atlas'])} entrées visuelles, 6 disciplines")
