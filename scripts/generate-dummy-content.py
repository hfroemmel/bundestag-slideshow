"""Erzeugt Dummy-Inhalte (5 Bilder + 1 Testvideo, Hochformat 1080x1920).
Benötigt: pip install pillow imageio-ffmpeg"""
import subprocess, os
from PIL import Image, ImageDraw, ImageFont
import imageio_ffmpeg

OUT = os.path.join(os.path.dirname(__file__), "..", "public", "slides")
W, H = 1080, 1920
os.makedirs(OUT, exist_ok=True)

def font(size):
    for p in ("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", "DejaVuSans-Bold.ttf", "Arial Bold.ttf"):
        try:
            return ImageFont.truetype(p, size)
        except OSError:
            pass
    return ImageFont.load_default(size)

def centered(d, text, y, f, fill="white"):
    w = d.textlength(text, font=f)
    d.text(((W - w) / 2, y), text, font=f, fill=fill)

colors = [(200, 40, 40), (40, 120, 200), (40, 160, 90), (220, 150, 30), (130, 60, 180)]
for i, c in enumerate(colors, 1):
    img = Image.new("RGB", (W, H), c)
    d = ImageDraw.Draw(img)
    d.rectangle([20, 20, W - 21, H - 21], outline="white", width=8)
    d.line([0, 0, W, H], fill="white", width=4)
    d.line([0, H, W, 0], fill="white", width=4)
    centered(d, f"Slide {i}", H // 2 - 160, font(200))
    centered(d, f"{W}x{H}", H // 2 + 100, font(80))
    img.save(os.path.join(OUT, f"slide-{i:02d}.jpg"), quality=88)

DUR, FPS = 20, 15
ff = subprocess.Popen(
    [imageio_ffmpeg.get_ffmpeg_exe(), "-y", "-loglevel", "error", "-f", "rawvideo", "-pix_fmt", "rgb24",
     "-s", f"{W}x{H}", "-r", str(FPS), "-i", "-", "-c:v", "libx264", "-pix_fmt", "yuv420p",
     "-preset", "fast", "-crf", "26", "-movflags", "+faststart", os.path.join(OUT, "video-01.mp4")],
    stdin=subprocess.PIPE)
for n in range(DUR * FPS):
    t = n / FPS
    img = Image.new("RGB", (W, H), (20, 20, 40))
    d = ImageDraw.Draw(img)
    centered(d, "TESTVIDEO", 420, font(140))
    centered(d, f"{int(t // 60)}:{int(t % 60):02d} / 0:{DUR:02d}", 800, font(160))
    d.rectangle([90, 1100, W - 90, 1160], outline="white", width=4)
    d.rectangle([90, 1100, 90 + (W - 180) * t / DUR, 1160], fill=(80, 200, 120))
    x = 90 + (W - 240) * (0.5 + 0.5 * __import__("math").sin(t * 2))
    d.ellipse([x, 1300, x + 60, 1360], fill=(255, 200, 0))
    ff.stdin.write(img.tobytes())
ff.stdin.close(); ff.wait()
