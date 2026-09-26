#!/usr/bin/env python3
import json
import struct
import sys
from pathlib import Path

MODEL = Path('assets/characters/ps_baer/model/PS_BAER_MASTER.glb')
CONFIG = Path('assets/characters/ps_baer/config/ps_baer.json')


def fail(msg):
    print(f'ERROR: {msg}')
    sys.exit(1)


if not MODEL.exists():
    fail(f'{MODEL} is missing')

raw = MODEL.read_bytes()
if len(raw) < 20:
    fail('GLB is too small')

magic, version, length = struct.unpack_from('<4sII', raw, 0)
if magic != b'glTF':
    fail('Invalid GLB magic header')
if version != 2:
    fail(f'Expected glTF 2.0, got version {version}')
if length != len(raw):
    fail(f'GLB header length {length} does not match file size {len(raw)}')

chunk_len, chunk_type = struct.unpack_from('<II', raw, 12)
if chunk_type != 0x4E4F534A:
    fail('First GLB chunk is not JSON')

payload = raw[20:20 + chunk_len].rstrip(b'\x00 ').decode('utf-8')
gltf = json.loads(payload)
config = json.loads(CONFIG.read_text(encoding='utf-8'))

node_names = {n.get('name') for n in gltf.get('nodes', []) if n.get('name')}
anim_names = {a.get('name') for a in gltf.get('animations', []) if a.get('name')}
target_names = set()
for mesh in gltf.get('meshes', []):
    target_names.update(mesh.get('extras', {}).get('targetNames', []) or [])

print(f'GLB OK: {len(raw)/1024/1024:.2f} MB')
print(f'Nodes: {len(node_names)} | Animations: {len(anim_names)} | Morph targets: {len(target_names)}')

missing_nodes = [n for n in config.get('requiredNodes', []) if n not in node_names]
if missing_nodes:
    print('WARNING: Missing preferred rig nodes:', ', '.join(missing_nodes))

wanted_anims = []
for value in config.get('animations', {}).values():
    wanted_anims.extend(value if isinstance(value, list) else [value])
missing_anims = [a for a in wanted_anims if a not in anim_names]
if missing_anims:
    print('WARNING: Missing preferred animation clips:', ', '.join(missing_anims))

wanted_morphs = config.get('face', {}).get('visemes', []) + config.get('face', {}).get('expressions', []) + ['blink_L', 'blink_R']
missing_morphs = [m for m in wanted_morphs if m not in target_names]
if missing_morphs:
    print('WARNING: Missing preferred facial morphs:', ', '.join(missing_morphs))

print('PS BÄR master asset validation completed.')
