"""Turn the real Playwright capture into a concise MP4 with simple title cards."""

import json
import os
from pathlib import Path

root = Path('artifacts/submission')
# OpenCV's FFmpeg build uses Cisco OpenH264 for browser-compatible MP4 encoding.
encoder = Path('scripts/.vendor/openh264-2.5.0-win64.dll')
if not encoder.exists():
    raise RuntimeError(f'Missing H.264 encoder: {encoder}')
os.environ['PATH'] = str(encoder.parent.resolve()) + os.pathsep + os.environ.get('PATH', '')
import cv2

raw = root / 'raw-gameplay.webm'
timings = json.loads((root / 'raw-scene-timings.json').read_text(encoding='utf-8'))
cap = cv2.VideoCapture(str(raw))
if not cap.isOpened():
    raise RuntimeError(f'Cannot decode {raw}')
fps = cap.get(cv2.CAP_PROP_FPS)
count = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
if fps < 5 or count < 100 or width < 640 or height < 360:
    raise RuntimeError(f'Invalid raw capture: {fps=} {count=} {width=} {height=}')

raw_seconds = count / fps
elapsed_seconds = timings['elapsedMs'] / 1000
scale = raw_seconds / elapsed_seconds
scenes = timings['scenes']
if not scenes:
    raise RuntimeError('No scene markers')

first = scenes[0]['atMs'] / 1000 * scale
hold_total = sum(scene['holdMs'] / 1000 * scale for scene in scenes)
action_total = max(0, raw_seconds - first - hold_total)
hold_scale = min(1.0, max(0.35, (165 - action_total) / max(hold_total, 1)))
intervals = []
scene_starts = []
output_time = 0.0
for index, scene in enumerate(scenes):
    start = scene['atMs'] / 1000 * scale
    hold = scene['holdMs'] / 1000 * scale
    next_start = scenes[index + 1]['atMs'] / 1000 * scale if index + 1 < len(scenes) else raw_seconds
    kept_hold = min(hold, max(1.5, hold * hold_scale))
    scene_starts.append({'name': scene['name'], 'atSeconds': round(output_time, 2)})
    intervals.append((start, min(start + kept_hold, raw_seconds)))
    output_time += kept_hold
    action_start = min(start + hold, next_start)
    if next_start > action_start:
        intervals.append((action_start, next_start))
        output_time += next_start - action_start

speed = max(1.0, output_time / 178.0)
segments = []
kept_before = 0.0
for start, end in intervals:
    segments.append((start, end, kept_before))
    kept_before += end - start
out_path = root / 'the-last-light-demo.mp4'
writer = cv2.VideoWriter(str(out_path), cv2.VideoWriter_fourcc(*'avc1'), 30.0, (1280, 720))
if not writer.isOpened():
    raise RuntimeError('H.264 MP4 encoder unavailable')

opening = cv2.imread(str(root / 'opening-overlay.png'), cv2.IMREAD_UNCHANGED)
closing = cv2.imread(str(root / 'closing-overlay.png'), cv2.IMREAD_UNCHANGED)
if opening is None or closing is None or opening.shape[2] != 4 or closing.shape[2] != 4:
    raise RuntimeError('Missing RGBA title overlays')

def composite(frame, overlay):
    alpha = overlay[:, :, 3:4].astype('float32') / 255
    color = overlay[:, :, :3].astype('float32')
    frame[:] = (frame.astype('float32') * (1 - alpha) + color * alpha).astype('uint8')

def banner(frame, title, subtitle=None, closing=False):
    h, w = frame.shape[:2]
    y0 = int(h * (0.69 if closing else 0.72))
    layer = frame.copy()
    cv2.rectangle(layer, (0, y0), (w, h), (12, 23, 32), -1)
    cv2.addWeighted(layer, 0.78, frame, 0.22, 0, frame)
    cv2.putText(frame, title, (58, y0 + 55), cv2.FONT_HERSHEY_SIMPLEX,
                1.22 if not closing else 1.06, (243, 246, 246), 2, cv2.LINE_AA)
    if subtitle:
        cv2.putText(frame, subtitle, (60, y0 + 94), cv2.FONT_HERSHEY_SIMPLEX,
                    0.53, (183, 200, 213), 1, cv2.LINE_AA)

interval = 0
written = 0
source_index = 0
output_markers = []
next_scene = 0
while True:
    ok, frame = cap.read()
    if not ok:
        break
    t = source_index / fps
    source_index += 1
    while interval < len(intervals) and t >= intervals[interval][1]:
        interval += 1
    if interval >= len(intervals):
        break
    if t < intervals[interval][0]:
        continue
    frame = cv2.resize(frame, (1280, 720), interpolation=cv2.INTER_AREA)
    segment_start, _, kept_before = segments[interval]
    target_frames = int(((kept_before + t - segment_start) / speed) * 30) + 1
    while written < target_frames:
        output_frame = frame.copy()
        out_seconds = written / 30
        while next_scene < len(scene_starts) and out_seconds >= scene_starts[next_scene]['atSeconds'] / speed:
            output_markers.append({'name': scene_starts[next_scene]['name'], 'atSeconds': round(out_seconds, 2)})
            next_scene += 1
        if out_seconds < 4.5:
            composite(output_frame, opening)
        elif output_markers and out_seconds - output_markers[-1]['atSeconds'] < 2.2:
            name = output_markers[-1]['name']
            if name.startswith('Chapter '):
                banner(output_frame, name)
        if out_seconds >= output_time / speed - 5.0:
            composite(output_frame, closing)
        writer.write(output_frame)
        written += 1

cap.release()
writer.release()
duration = written / 30
if duration < 105 or duration > 190:
    raise RuntimeError(f'Edited video duration outside intended range: {duration:.1f}s')

(root / 'edited-scene-timings.json').write_text(json.dumps({
    'rawDurationSeconds': raw_seconds, 'editedDurationSeconds': duration,
    'resolution': [1280, 720], 'fps': 30, 'speedFactor': speed,
    'scenes': output_markers,
}, indent=2), encoding='utf-8')
print(json.dumps({'path': str(out_path), 'durationSeconds': duration, 'resolution': [1280, 720], 'fps': 30, 'sizeBytes': out_path.stat().st_size}, indent=2))
