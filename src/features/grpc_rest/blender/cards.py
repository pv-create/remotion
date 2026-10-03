"""
REST vs gRPC — карточки-окна в объёме, по референсу автора (19.09.2026).

Две карточки: светлое окно REST с GET /users/1 и JSON, тёмная плашка gRPC
с proto-контрактом и бейджем Protocol Buffers. Стиль «клей»: толстые
скруглённые плиты, мягкий свет, кремовый фон в сетку. Цвета — токены
src/shared/motion/theme.ts плюс три оттенка под сами карточки.

Шрифты системные: Avenir Next Bold вместо Montserrat (в системе нет),
Menlo под код. Заменить — одна строка в FONT_HEAVY / FONT_MONO.

Запуск:
  Blender -b -P cards.py -- <папка> <rest|grpc> <still|anim> [проценты]
still — кадр 40 в <папка>/<card>_still.png, anim — кадры 1..FRAMES (5-й аргумент, по умолчанию 120)
<папка>/<card>_####.png. Рядом со скриптом сохраняется cards_<card>.blend.
"""
import math
import os
import sys

import bmesh
import bpy
from mathutils import Vector

FPS = 30
FRAMES = 120
W, H = 1080, 1920

HEX = {
    'paper': '#F1EDE3',
    'ink': '#16130F',
    'accent': '#DFA94C',
    'muted': '#9A9287',
    'line': '#CFC7B4',
    # свои — только для карточек
    'card': '#FAF7EF',
    'pill': '#E9E4D9',
    'dark': '#262220',
    'dark2': '#3B3633',
    'cream': '#F4EFE4',
}
FONT_HEAVY = '/System/Library/Fonts/Avenir Next.ttc'   # грузится Bold
FONT_MONO = '/System/Library/Fonts/Menlo.ttc'

# ---- свет: подбирается по пробе пикселя, см. notes ----
KEY_W = 2200
FILL_W = 700
WORLD_STR = 0.35
GRID_MIX = 0.45


def lin(hexcolor):
    c = hexcolor.lstrip('#')
    def f(u):
        return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4
    r, g, b = (int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return (f(r), f(g), f(b), 1.0)


argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'render')
CARD = argv[1] if len(argv) > 1 else 'rest'
MODE = argv[2] if len(argv) > 2 else 'still'
PCT = int(argv[3]) if len(argv) > 3 else 100
# длина анимации кадрами: выезд 8–22 остаётся, доворот растягивается до последнего кадра
FRAMES = int(argv[4]) if len(argv) > 4 else FRAMES
os.makedirs(OUT, exist_ok=True)

# ---------- сцена ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_EEVEE'
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.resolution_percentage = PCT
scene.render.fps = FPS
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.eevee.taa_render_samples = 48
for attr, val in (('use_shadows', True), ('use_raytracing', False)):
    if hasattr(scene.eevee, attr):
        setattr(scene.eevee, attr, val)

world = bpy.data.worlds.new('world')
scene.world = world
world.use_nodes = True
bg = world.node_tree.nodes['Background']
bg.inputs['Color'].default_value = lin(HEX['paper'])
bg.inputs['Strength'].default_value = WORLD_STR


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def load_font(path):
    try:
        return bpy.data.fonts.load(path)
    except Exception:
        return None


F_HEAVY = load_font(FONT_HEAVY)
F_MONO = load_font(FONT_MONO)

M = {}
for key, hexc in HEX.items():
    m = bpy.data.materials.new(key)
    m.use_nodes = True
    bsdf = m.node_tree.nodes['Principled BSDF']
    bsdf.inputs['Base Color'].default_value = lin(hexc)
    bsdf.inputs['Roughness'].default_value = 0.7
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.2
    M[key] = m


def grid_material():
    m = bpy.data.materials.new('paper_grid')
    m.use_nodes = True
    nt = m.node_tree
    n, l = nt.nodes, nt.links
    bsdf = n['Principled BSDF']
    bsdf.inputs['Roughness'].default_value = 0.95
    if 'Specular IOR Level' in bsdf.inputs:
        bsdf.inputs['Specular IOR Level'].default_value = 0.1
    tc = n.new('ShaderNodeTexCoord')
    mp = n.new('ShaderNodeMapping')
    mp.inputs['Scale'].default_value = (170, 170, 170)   # ячейка ~0.35 u на плоскости 60 u
    l.new(tc.outputs['UV'], mp.inputs['Vector'])
    sep = n.new('ShaderNodeSeparateXYZ')
    l.new(mp.outputs['Vector'], sep.inputs['Vector'])

    def line(sock):
        fr = n.new('ShaderNodeMath'); fr.operation = 'FRACT'
        l.new(sock, fr.inputs[0])
        lt = n.new('ShaderNodeMath'); lt.operation = 'LESS_THAN'
        lt.inputs[1].default_value = 0.05
        l.new(fr.outputs[0], lt.inputs[0])
        return lt.outputs[0]

    mx = n.new('ShaderNodeMath'); mx.operation = 'MAXIMUM'
    l.new(line(sep.outputs['X']), mx.inputs[0])
    l.new(line(sep.outputs['Y']), mx.inputs[1])
    mul = n.new('ShaderNodeMath'); mul.operation = 'MULTIPLY'
    mul.inputs[1].default_value = GRID_MIX
    l.new(mx.outputs[0], mul.inputs[0])
    mix = n.new('ShaderNodeMix')
    mix.data_type = 'RGBA'
    a = [s for s in mix.inputs if s.name == 'A' and s.type == 'RGBA'][0]
    b = [s for s in mix.inputs if s.name == 'B' and s.type == 'RGBA'][0]
    a.default_value = lin(HEX['paper'])
    b.default_value = lin(HEX['line'])
    l.new(mul.outputs[0], mix.inputs[0])
    out = [s for s in mix.outputs if s.type == 'RGBA'][0]
    l.new(out, bsdf.inputs['Base Color'])
    return m


def slab(name, w, h, r, t, mat, soft=0.03, seg=10, parent=None, loc=(0, 0, 0)):
    """Скруглённая плита. r — число или (tr, tl, bl, br). Толщина вдоль +Z от 0 до t."""
    rs = r if isinstance(r, (tuple, list)) else (r, r, r, r)
    bm = bmesh.new()
    corners = [(w / 2, h / 2, 0.0), (-w / 2, h / 2, math.pi / 2),
               (-w / 2, -h / 2, math.pi), (w / 2, -h / 2, 1.5 * math.pi)]
    verts = []
    for (cx, cy, a0), rr in zip(corners, rs):
        if rr <= 0:
            verts.append(bm.verts.new((cx, cy, 0)))
            continue
        ox, oy = cx - math.copysign(rr, cx), cy - math.copysign(rr, cy)
        for k in range(seg + 1):
            a = a0 + (math.pi / 2) * k / seg
            verts.append(bm.verts.new((ox + rr * math.cos(a), oy + rr * math.sin(a), 0)))
    bm.faces.new(verts)
    me = bpy.data.meshes.new(name)
    bm.to_mesh(me)
    bm.free()
    me.polygons.foreach_set('use_smooth', [True] * len(me.polygons))
    me.materials.append(mat)
    o = link(bpy.data.objects.new(name, me))
    so = o.modifiers.new('solid', 'SOLIDIFY')
    so.thickness = t
    so.offset = 1.0
    so.use_even_offset = True
    if soft > 0:
        b = o.modifiers.new('soft', 'BEVEL')
        b.width = min(soft, t * 0.45)
        b.segments = 4
        b.limit_method = 'ANGLE'
        b.angle_limit = math.radians(40)
        b.harden_normals = True
    if parent is not None:
        o.parent = parent
    o.location = loc
    return o


def text(name, body, loc, size, mat, fnt, parent, spacing=1.3):
    c = bpy.data.curves.new(name, type='FONT')
    c.body = body
    c.size = size
    c.extrude = 0.012
    c.align_x = 'LEFT'
    c.space_line = spacing
    if fnt:
        c.font = fnt
    c.materials.append(mat)
    o = link(bpy.data.objects.new(name, c))
    o.parent = parent
    o.location = loc
    return o


def prim(op, name, mat, parent, loc, **kw):
    op(**kw)
    o = bpy.context.active_object
    o.name = name
    o.data.materials.append(mat)
    o.parent = parent
    o.location = loc
    return o


def cube(name, size, mat, parent, loc):
    o = prim(bpy.ops.mesh.primitive_cube_add, name, mat, parent, loc, size=size)
    b = o.modifiers.new('soft', 'BEVEL')
    b.width = size * 0.18
    b.segments = 4
    b.harden_normals = True
    o.data.polygons.foreach_set('use_smooth', [True] * len(o.data.polygons))
    return o


# ---------- фон, камера, свет ----------
bpy.ops.mesh.primitive_plane_add(size=60, location=(0, 2.6, 0), rotation=(math.radians(90), 0, 0))
wall = bpy.context.active_object
wall.name = 'wall'
wall.data.materials.append(grid_material())

cam_data = bpy.data.cameras.new('cam')
cam_data.lens = 50
cam_data.sensor_fit = 'VERTICAL'
cam_data.sensor_height = 36
cam = link(bpy.data.objects.new('cam', cam_data))
cam.location = (0, -25, 1.2)
target = link(bpy.data.objects.new('target', None))
target.location = (0, 0, -0.2)
con = cam.constraints.new('TRACK_TO')
con.target = target
con.track_axis = 'TRACK_NEGATIVE_Z'
con.up_axis = 'UP_Y'
scene.camera = cam


def area(name, loc, size, energy):
    d = bpy.data.lights.new(name, 'AREA')
    d.shape = 'SQUARE'
    d.size = size
    d.energy = energy
    d.color = (1.0, 0.98, 0.94)
    if hasattr(d, 'use_shadow_jitter'):
        d.use_shadow_jitter = True
    o = link(bpy.data.objects.new(name, d))
    o.location = loc
    c = o.constraints.new('TRACK_TO')
    c.target = target
    c.track_axis = 'TRACK_NEGATIVE_Z'
    c.up_axis = 'UP_Y'
    return o


area('key', (-7, -11, 10), 7, KEY_W)
area('fill', (8, -13, 1), 9, FILL_W)

# ---------- карточка ----------
CW, CH, CT = 7.0, 7.6, 0.45
card = link(bpy.data.objects.new('card', None))
card.empty_display_size = 0.5
card.rotation_euler = (math.radians(90), 0, 0)   # стоит, лицом к камере
ZF = CT + 0.002          # передняя грань
ZT = CT + 0.014          # текст на передней грани

if CARD == 'rest':
    slab('body', CW, CH, 0.45, CT, M['ink'], parent=card)
    ph = 6.42
    slab('panel', CW - 0.14, ph, (0, 0, 0.40, 0.40), 0.05, M['card'], soft=0.02,
         parent=card, loc=(0, -CH / 2 + 0.07 + ph / 2, ZF))
    for k, col in enumerate(('accent', 'accent', 'muted')):
        prim(bpy.ops.mesh.primitive_cylinder_add, f'dot{k}', M[col], card,
             (-CW / 2 + 0.55 + k * 0.48, CH / 2 - 0.56, ZF), radius=0.15, depth=0.05, vertices=32)
    text('title', 'REST', (-3.0, 1.75, ZT + 0.05), 0.95, M['ink'], F_HEAVY, card)
    slab('pill', 6.3, 0.85, 0.42, 0.04, M['pill'], soft=0.015, parent=card, loc=(0, 1.05, ZF + 0.05))
    text('get', 'GET', (-2.85, 0.85, ZT + 0.1), 0.5, M['accent'], F_HEAVY, card)
    text('path', '/users/1', (-1.55, 0.85, ZT + 0.1), 0.5, M['ink'], F_MONO, card)
    text('h1', 'HTTP/1.1', (-3.0, 0.15, ZT + 0.05), 0.28, M['muted'], F_MONO, card)
    text('h2', 'Content-Type: application/json', (-3.0, -0.25, ZT + 0.05), 0.28, M['muted'], F_MONO, card)
    text('json', '{\n  "id": 1,\n  "name": "John",\n  "email": "john@example.com"\n}',
         (-3.0, -0.95, ZT + 0.05), 0.33, M['ink'], F_MONO, card)
else:
    slab('body', CW, CH, 0.45, CT, M['dark'], parent=card)
    slab('pill', 2.9, 1.1, 0.4, 0.05, M['dark2'], soft=0.02, parent=card, loc=(-1.75, 2.65, ZF))
    text('title', 'gRPC', (-2.95, 2.38, ZT + 0.05), 0.72, M['cream'], F_HEAVY, card)
    for k, (x, y) in enumerate(((2.55, 3.05), (2.2, 2.5), (2.9, 2.5))):
        cube(f'icon{k}', 0.3, M['cream' if k else 'accent'], card, (x, y, ZF + 0.15))
    text('proto', 'service UserService {\n  rpc GetUser (UserRequest)\n    returns (UserResponse);\n}',
         (-3.0, 1.35, ZT), 0.34, M['cream'], F_MONO, card)
    slab('badge', 6.2, 1.5, 0.4, 0.05, M['dark2'], soft=0.02, parent=card, loc=(0, -2.4, ZF))
    cube('icon_b', 0.34, M['accent'], card, (-2.4, -2.4, ZF + 0.22))
    text('badge_t', 'Protocol Buffers\n(binary)', (-1.6, -2.15, ZT + 0.05), 0.3, M['cream'], F_MONO, card)


def fcurves_of(action):
    if hasattr(action, 'fcurves'):
        return list(action.fcurves)
    out = []
    for layer in action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


# ---------- движение: выезд снизу с довoротом, медленный разворот ----------
card.scale = (0.001,) * 3
card.location = (0, 0, -0.9)
card.rotation_euler.z = math.radians(-24)
card.keyframe_insert('scale', frame=8)
card.keyframe_insert('location', frame=8)
card.keyframe_insert('rotation_euler', frame=8)
card.scale = (1, 1, 1)
card.location = (0, 0, 0)
card.keyframe_insert('scale', frame=22)
card.keyframe_insert('location', frame=22)
card.rotation_euler.z = math.radians(12)
card.keyframe_insert('rotation_euler', frame=FRAMES)
for fc in fcurves_of(card.animation_data.action):
    for kp in fc.keyframe_points:
        kp.interpolation = 'CUBIC'
        kp.easing = 'EASE_OUT'

# ---------- вывод ----------
here = os.path.dirname(os.path.abspath(__file__))
bpy.ops.wm.save_as_mainfile(filepath=os.path.join(here, f'cards_{CARD}.blend'))

if MODE == 'still':
    scene.frame_set(40)
    scene.render.filepath = os.path.join(OUT, f'{CARD}_still.png')
    bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = os.path.join(OUT, f'{CARD}_')
    bpy.ops.render.render(animation=True)
