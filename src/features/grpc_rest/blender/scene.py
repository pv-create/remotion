"""
REST vs gRPC — перебивка «две полосы». Тест 3D в стиле motion-системы.

Механика: клиент слева, сервер справа, между ними два этажа.
Верхний — REST: HTTP/1.1, по одному большому ящику (JSON) за раз, следующий
ждёт, пока доедет предыдущий. Нижний — gRPC: HTTP/2, маленькие плотные
ящики (protobuf) идут потоком по одной трубе, несколько в пути сразу.
К концу у сервера: три больших ящика против восемнадцати маленьких, и те
занимают меньше места. Пачка у сервера — и есть счётчик.

Цвета — токены src/shared/motion/theme.ts, ничего своего. Движок Workbench:
плоская заливка, контур, без бликов — как карусели автора, только с объёмом.

Запуск (headless):
  Blender -b -P scene.py -- <папка-вывода> [кадры через запятую]
Без списка кадров рендерит всю анимацию в <папка>/lanes_####.png.
Рядом со скриптом сохраняется lanes.blend — открыть в Blender и покрутить.
"""
import math
import os
import sys

import bpy
from mathutils import Vector

FPS = 30
FRAMES = 180
W, H = 1080, 1920

# ---- ручки для подбора вида (варианты гоняются sed-ом по этим строкам) ----
FLOOR_MAT = 'paper'
LIGHT = 'STUDIO'
STUDIO_LIGHT = 'Default'
WORLD_SPACE = False
CAVITY = False
SHADOW = 0.3
REST_MAT = 'muted'
PIPE = 'rings'

HEX = {
    'paper': '#F1EDE3',
    'ink': '#16130F',
    'accent': '#DFA94C',
    'alarm': '#C4552F',
    'muted': '#9A9287',
    'line': '#CFC7B4',
}


def lin(hexcolor):
    """sRGB hex -> linear RGBA, чтобы на Standard-трансформе цвет вышел точь-в-точь."""
    c = hexcolor.lstrip('#')
    def f(u):
        return u / 12.92 if u <= 0.04045 else ((u + 0.055) / 1.055) ** 2.4
    r, g, b = (int(c[i:i + 2], 16) / 255 for i in (0, 2, 4))
    return (f(r), f(g), f(b), 1.0)


argv = sys.argv[sys.argv.index('--') + 1:] if '--' in sys.argv else []
OUT = argv[0] if argv else os.path.join(os.path.dirname(os.path.abspath(__file__)), 'render')
PREVIEW = [int(x) for x in argv[1].split(',')] if len(argv) > 1 else None
os.makedirs(OUT, exist_ok=True)

# ---------- сцена и движок ----------
bpy.ops.wm.read_factory_settings(use_empty=True)
scene = bpy.context.scene
scene.render.engine = 'BLENDER_WORKBENCH'
scene.render.resolution_x, scene.render.resolution_y = W, H
scene.render.resolution_percentage = 100
scene.render.fps = FPS
scene.frame_start, scene.frame_end = 1, FRAMES
scene.render.image_settings.file_format = 'PNG'
scene.render.image_settings.color_mode = 'RGB'
scene.view_settings.view_transform = 'Standard'
scene.view_settings.look = 'None'
scene.display.render_aa = '16'

sh = scene.display.shading
sh.light = LIGHT
if LIGHT == 'STUDIO':
    sh.studio_light = STUDIO_LIGHT
sh.color_type = 'MATERIAL'
sh.show_object_outline = True
sh.object_outline_color = lin(HEX['ink'])[:3]
sh.show_cavity = CAVITY
sh.cavity_type = 'BOTH'
sh.cavity_ridge_factor = 0.6
sh.cavity_valley_factor = 0.6
sh.show_shadows = SHADOW > 0
sh.shadow_intensity = max(SHADOW, 0.01)
sh.show_specular_highlight = False
sh.use_world_space_lighting = WORLD_SPACE
sh.studiolight_rotate_z = math.radians(-40)
sh.background_type = 'WORLD'

world = bpy.data.worlds.new('paper')
scene.world = world
world.color = lin(HEX['paper'])[:3]

MAT = {}
for key in HEX:
    m = bpy.data.materials.new(key)
    m.diffuse_color = lin(HEX[key])
    m.roughness = 1.0
    m.metallic = 0.0
    MAT[key] = m


def link(obj):
    scene.collection.objects.link(obj)
    return obj


def box(name, loc, dims, mat):
    bpy.ops.mesh.primitive_cube_add(size=1, location=loc)
    o = bpy.context.active_object
    o.name = name
    o.scale = dims
    o.data.materials.append(MAT[mat])
    return o


def ring(name, loc, major, minor, mat):
    bpy.ops.mesh.primitive_torus_add(location=loc, major_radius=major, minor_radius=minor,
                                     major_segments=48, minor_segments=12)
    o = bpy.context.active_object
    o.name = name
    o.rotation_euler = (0, math.radians(90), 0)
    o.data.materials.append(MAT[mat])
    return o


def label(name, text, loc, size, mat, align='LEFT'):
    c = bpy.data.curves.new(name, type='FONT')
    c.body = text
    c.size = size
    c.extrude = 0.02
    c.align_x = align
    o = link(bpy.data.objects.new(name, c))
    o.location = loc
    # стоит вертикально, лицом к камере
    o.rotation_euler = (math.radians(90), 0, AZ)
    o.data.materials.append(MAT[mat])
    return o


def fcurves_of(action):
    """Blender 5: action.fcurves нет, кривые лежат в layers/strips/channelbags."""
    if hasattr(action, 'fcurves'):
        return list(action.fcurves)
    out = []
    for layer in action.layers:
        for strip in layer.strips:
            for cb in strip.channelbags:
                out.extend(cb.fcurves)
    return out


def ease_out(obj):
    """Сухая подача: быстрый старт, мягкий доворот в конце, без пружины."""
    ad = obj.animation_data
    if not ad or not ad.action:
        return
    for fc in fcurves_of(ad.action):
        for kp in fc.keyframe_points:
            kp.interpolation = 'CUBIC'
            kp.easing = 'EASE_OUT'


# ---------- камера ----------
AZ, EL = math.radians(18), math.radians(24)
cam_data = bpy.data.cameras.new('cam')
cam_data.type = 'ORTHO'
cam_data.ortho_scale = 19.5
cam_data.clip_end = 500
cam_data.shift_y = 0.03
cam = link(bpy.data.objects.new('cam', cam_data))
target = link(bpy.data.objects.new('target', None))
target.location = Vector((0.2, 0, 4.3))
cam.location = target.location + Vector((math.sin(AZ) * math.cos(EL),
                                         -math.cos(AZ) * math.cos(EL),
                                         math.sin(EL))) * 80
con = cam.constraints.new('TRACK_TO')
con.target = target
con.track_axis = 'TRACK_NEGATIVE_Z'
con.up_axis = 'UP_Y'
scene.camera = cam

# ---------- статика ----------
Z_REST, Z_GRPC = 6.0, 0.0
X_CLIENT, X_SERVER = -4.0, 4.0
TOWER = (1.3, 2.4, 8.7)

box('client', (X_CLIENT, 0, 3.85), TOWER, 'ink')
box('server', (X_SERVER, 0, 3.85), TOWER, 'ink')
label('lbl_client', 'КЛИЕНТ', (X_CLIENT - 0.65, -1.2, 9.5), 0.42, 'ink')
label('lbl_server', 'СЕРВЕР', (X_SERVER - 0.65, -1.2, 9.5), 0.42, 'ink')
box('floor_rest', (0, 0, Z_REST - 0.15), (6.8, 2.2, 0.3), FLOOR_MAT)
box('floor_grpc', (0, 0, Z_GRPC - 0.15), (6.8, 2.2, 0.3), FLOOR_MAT)
# труба gRPC — кольца, чтобы ящики внутри было видно
if PIPE == 'rings':
    for i, x in enumerate((-2.5, -1.4, -0.3, 0.8)):
        ring(f'pipe_{i}', (x, 0, Z_GRPC + 0.45), 0.55, 0.045, 'muted')
else:
    tube_mat = bpy.data.materials.new('tube')
    tube_mat.diffuse_color = lin(HEX['muted'])[:3] + (0.22,)
    tube_mat.roughness = 1.0
    bpy.ops.mesh.primitive_cylinder_add(radius=0.55, depth=5.2, vertices=48,
                                        location=(-0.9, 0, Z_GRPC + 0.45),
                                        rotation=(0, math.radians(90), 0))
    tube = bpy.context.active_object
    tube.name = 'pipe'
    tube.data.materials.append(tube_mat)

label('lbl_rest', 'REST', (-2.9, -1.2, Z_REST + 1.9), 0.9, 'ink')
label('sub_rest', 'HTTP/1.1  ·  JSON', (-2.9, -1.2, Z_REST + 1.45), 0.34, 'muted')
label('lbl_grpc', 'gRPC', (-2.9, -1.2, Z_GRPC + 1.9), 0.9, 'ink')
label('sub_grpc', 'HTTP/2  ·  protobuf', (-2.9, -1.2, Z_GRPC + 1.45), 0.34, 'muted')

# ---------- REST: по одному большому ----------
REST_SIZE = 1.0
REST_START = 15
REST_GAP = 54        # следующий выходит через 0.27 c после прибытия предыдущего
REST_TRAVEL = 40
X_REST_LAND = 2.7
for i in range(3):
    f0 = REST_START + i * REST_GAP
    z = Z_REST + REST_SIZE / 2
    o = box(f'rest_{i}', (X_CLIENT - 0.1, 0, z), (REST_SIZE,) * 3, REST_MAT)
    if i > 0:
        # следующий запрос выезжает наполовину и ждёт, пока доедет предыдущий:
        # так видно, что HTTP/1.1 держит по одному на соединение
        o.keyframe_insert('location', frame=f0 - REST_GAP + 10)
        o.location = (X_CLIENT + 0.85, 0, z)
        o.keyframe_insert('location', frame=f0 - REST_GAP + 22)
    o.keyframe_insert('location', frame=f0)
    o.location = (X_REST_LAND, 0, z)
    o.keyframe_insert('location', frame=f0 + REST_TRAVEL)
    o.keyframe_insert('location', frame=f0 + REST_TRAVEL + 3)
    o.location = (X_REST_LAND, 0, z + i * REST_SIZE)
    o.keyframe_insert('location', frame=f0 + REST_TRAVEL + 9)
    ease_out(o)

# ---------- gRPC: поток маленьких ----------
G_SIZE = 0.42
G_STEP = 0.5
G_START = 15
G_EVERY = 7          # новый каждые 0.23 c, в пути по несколько сразу
G_TRAVEL = 26
X_G_LAND = 2.35
for j in range(18):
    f0 = G_START + j * G_EVERY
    z0 = Z_GRPC + G_SIZE / 2
    o = box(f'grpc_{j}', (X_CLIENT - 0.1, 0, z0), (G_SIZE,) * 3, 'accent')
    o.keyframe_insert('location', frame=f0)
    o.location = (X_G_LAND, 0, z0)
    o.keyframe_insert('location', frame=f0 + G_TRAVEL)
    o.keyframe_insert('location', frame=f0 + G_TRAVEL + 2)
    layer, rem = divmod(j, 6)
    row, col = divmod(rem, 2)
    o.location = (X_G_LAND + col * G_STEP, (row - 1) * G_STEP, z0 + layer * G_STEP)
    o.keyframe_insert('location', frame=f0 + G_TRAVEL + 7)
    ease_out(o)

# ---------- вывод ----------
blend = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'lanes.blend')
bpy.ops.wm.save_as_mainfile(filepath=blend)

if PREVIEW:
    for f in PREVIEW:
        scene.frame_set(f)
        scene.render.filepath = os.path.join(OUT, f'f{f:03d}.png')
        bpy.ops.render.render(write_still=True)
else:
    scene.render.filepath = os.path.join(OUT, 'lanes_')
    bpy.ops.render.render(animation=True)
