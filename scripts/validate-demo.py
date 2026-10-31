"""Decode and inspect the final MP4 without assuming FFprobe is installed."""

import json
from pathlib import Path

import cv2
import numpy as np

root = Path('artifacts/submission')
video = root / 'the-last-light-demo.mp4'
cap = cv2.VideoCapture(str(video))
if not cap.isOpened():
    raise RuntimeError(f'Cannot open {video}')
fps = cap.get(cv2.CAP_PROP_FPS)
frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
duration = frames / fps if fps else 0
if not (120 <= duration <= 185 and width >= 1280 and height >= 720):
    raise RuntimeError(f'Invalid duration or dimensions: {duration=} {width=} {height=}')

sample_dir = root / 'qa-frames'
sample_dir.mkdir(exist_ok=True)
samples = []
cards = []
for seconds in np.arange(0, duration, 10):
    cap.set(cv2.CAP_PROP_POS_MSEC, float(seconds * 1000))
    ok, frame = cap.read()
    if not ok:
        raise RuntimeError(f'Cannot decode at {seconds:.1f}s')
    mean = float(frame.mean())
    if mean < 7:
        raise RuntimeError(f'Nearly black frame at {seconds:.1f}s')
    name = f'{int(seconds):03d}s.png'
    cv2.imwrite(str(sample_dir / name), frame)
    thumb = cv2.resize(frame, (320, 180))
    cv2.putText(thumb, f'{seconds:.0f}s', (8, 24), cv2.FONT_HERSHEY_SIMPLEX, 0.65, (255, 255, 255), 2)
    cards.append(thumb)
    samples.append({'atSeconds': round(float(seconds), 1), 'meanPixel': round(mean, 1), 'file': name})

cap.set(cv2.CAP_PROP_POS_FRAMES, max(0, frames - 10))
ok, finale = cap.read()
if not ok:
    raise RuntimeError('Cannot decode final frames')
cv2.imwrite(str(sample_dir / 'finale.png'), finale)
cap.release()

while len(cards) % 4:
    cards.append(np.zeros((180, 320, 3), dtype=np.uint8))
rows = [cv2.hconcat(cards[i:i + 4]) for i in range(0, len(cards), 4)]
cv2.imwrite(str(root / 'video-contact-sheet.png'), cv2.vconcat(rows))

validation = {
    'file': str(video), 'sizeBytes': video.stat().st_size,
    'durationSeconds': round(duration, 2), 'width': width, 'height': height,
    'fps': round(fps, 2), 'decodableSampleCount': len(samples) + 1,
    'samples': samples,
    'finaleFrame': str(sample_dir / 'finale.png'),
    'contactSheet': str(root / 'video-contact-sheet.png'),
    'audio': 'No audio track was added; narration is supplied as a timed script.',
    'probe': 'FFprobe was unavailable; OpenCV with FFmpeg support decoded sampled and final frames.',
}
(root / 'video-validation.json').write_text(json.dumps(validation, indent=2), encoding='utf-8')
print(json.dumps({key: validation[key] for key in ['file', 'sizeBytes', 'durationSeconds', 'width', 'height', 'fps', 'decodableSampleCount']}, indent=2))
