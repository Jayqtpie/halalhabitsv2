"""
Generate 32x32 pixel art PNG icons for HalalHabits habit categories.
Icons are designed with jewel tones matching the app's visual identity.
"""
import struct
import zlib
import math
import os

def make_png(width, height, pixels):
    """Create PNG bytes from a flat list of (r,g,b) tuples."""
    def chunk(name, data):
        c = name + data
        return struct.pack('>I', len(data)) + c + struct.pack('>I', zlib.crc32(c) & 0xffffffff)

    sig = b'\x89PNG\r\n\x1a\n'
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 2, 0, 0, 0)
    ihdr = chunk(b'IHDR', ihdr_data)

    raw = b''
    for y in range(height):
        raw += b'\x00'
        for x in range(width):
            r, g, b = pixels[y * width + x]
            raw += bytes([r, g, b])

    compressed = zlib.compress(raw, 9)
    idat = chunk(b'IDAT', compressed)
    iend = chunk(b'IEND', b'')
    return sig + ihdr + idat + iend


# ── Color Palette (HalalHabits jewel tones) ──────────────────────────────────
BG = (15, 15, 25)

# Salah: emerald green
SALAH_DARK   = (7, 80, 45)
SALAH_MID    = (13, 124, 61)
SALAH_LIGHT  = (52, 211, 153)
SALAH_ACCENT = (16, 185, 129)

# Quran: sapphire blue + gold
QURAN_DARK   = (30, 64, 175)
QURAN_MID    = (59, 130, 246)
QURAN_LIGHT  = (147, 197, 253)
QURAN_GOLD   = (234, 179, 8)

# Dhikr: violet / amethyst
DHIKR_DARK   = (76, 29, 149)
DHIKR_MID    = (139, 92, 246)
DHIKR_LIGHT  = (196, 181, 253)
DHIKR_ACCENT = (167, 139, 250)

# Fasting: deep blue / golden moon
FAST_DARK    = (30, 41, 59)
FAST_MID     = (100, 116, 139)
FAST_LIGHT   = (226, 232, 240)
FAST_GOLD    = (250, 204, 21)

# Dua: warm amber / skin
DUA_DARK     = (120, 53, 15)
DUA_MID      = (217, 119, 6)
DUA_LIGHT    = (252, 211, 77)
DUA_SKIN     = (251, 191, 36)

# Custom: bright gold star
CUST_DARK    = (113, 63, 18)
CUST_MID     = (245, 158, 11)
CUST_LIGHT   = (254, 240, 138)
CUST_WHITE   = (255, 255, 255)


def make_grid(w=32, h=32, fill=BG):
    return [fill] * (w * h)


def set_px(grid, x, y, color, w=32):
    if 0 <= x < w and 0 <= y < 32:
        grid[y * w + x] = color


def rect(grid, x1, y1, x2, y2, color, w=32):
    for y in range(y1, y2 + 1):
        for x in range(x1, x2 + 1):
            set_px(grid, x, y, color, w)


def hline(grid, y, x1, x2, color, w=32):
    for x in range(x1, x2 + 1):
        set_px(grid, x, y, color, w)


def vline(grid, x, y1, y2, color, w=32):
    for y in range(y1, y2 + 1):
        set_px(grid, x, y, color, w)


# ── SALAH: mihrab / prayer arch ───────────────────────────────────────────────
def make_salah():
    g = make_grid(fill=BG)
    # Rug base
    rect(g, 6, 10, 25, 27, SALAH_DARK)
    # Rug border
    hline(g, 10, 6, 25, SALAH_MID)
    hline(g, 27, 6, 25, SALAH_MID)
    vline(g, 6, 10, 27, SALAH_MID)
    vline(g, 25, 10, 27, SALAH_MID)
    # Mihrab arch
    hline(g, 13, 11, 20, SALAH_LIGHT)
    vline(g, 11, 13, 23, SALAH_LIGHT)
    vline(g, 20, 13, 23, SALAH_LIGHT)
    set_px(g, 12, 12, SALAH_LIGHT)
    set_px(g, 19, 12, SALAH_LIGHT)
    set_px(g, 13, 11, SALAH_LIGHT)
    set_px(g, 18, 11, SALAH_LIGHT)
    hline(g, 10, 14, 17, SALAH_ACCENT)
    # Inner arch
    rect(g, 12, 13, 19, 23, SALAH_MID)
    # Qibla dot
    rect(g, 15, 16, 16, 17, SALAH_LIGHT)
    return g


# ── QURAN: open book ──────────────────────────────────────────────────────────
def make_quran():
    g = make_grid(fill=BG)
    # Left page
    rect(g, 4, 8, 14, 24, QURAN_MID)
    rect(g, 5, 9, 13, 23, QURAN_LIGHT)
    # Right page
    rect(g, 17, 8, 27, 24, QURAN_MID)
    rect(g, 18, 9, 26, 23, QURAN_LIGHT)
    # Spine
    rect(g, 14, 7, 17, 25, QURAN_DARK)
    set_px(g, 15, 7, QURAN_GOLD)
    set_px(g, 16, 7, QURAN_GOLD)
    # Star on right page (5-pixel cross star)
    set_px(g, 22, 13, QURAN_GOLD)
    set_px(g, 21, 14, QURAN_GOLD)
    set_px(g, 22, 14, QURAN_GOLD)
    set_px(g, 23, 14, QURAN_GOLD)
    set_px(g, 22, 15, QURAN_GOLD)
    # Lines on left page
    for row in [13, 15, 17, 19]:
        hline(g, row, 6, 12, QURAN_MID)
    # Lines on right page
    for row in [13, 15, 17, 19]:
        hline(g, row, 18, 25, QURAN_DARK)
    return g


# ── DHIKR: tasbih beads in a loop ─────────────────────────────────────────────
def make_dhikr():
    g = make_grid(fill=BG)
    cx, cy, r = 15, 14, 9
    bead_positions = []
    n_beads = 11
    for i in range(n_beads):
        angle = (i / n_beads) * 2 * math.pi - math.pi / 2
        bx = int(round(cx + r * math.cos(angle)))
        by = int(round(cy + r * math.sin(angle)))
        bead_positions.append((bx, by))

    # Connecting dots
    for i in range(len(bead_positions)):
        x1, y1 = bead_positions[i]
        x2, y2 = bead_positions[(i + 1) % n_beads]
        mx, my = (x1 + x2) // 2, (y1 + y2) // 2
        set_px(g, mx, my, DHIKR_DARK)

    # Beads
    for bx, by in bead_positions:
        rect(g, bx - 1, by - 1, bx + 1, by + 1, DHIKR_MID)
        set_px(g, bx, by, DHIKR_LIGHT)

    # Imam bead (larger)
    tx, ty = bead_positions[0]
    rect(g, tx - 2, ty - 2, tx + 2, ty + 2, DHIKR_ACCENT)
    set_px(g, tx, ty, DHIKR_LIGHT)

    # Tassel
    vline(g, 15, 23, 29, DHIKR_DARK)
    set_px(g, 14, 28, DHIKR_MID)
    set_px(g, 15, 29, DHIKR_MID)
    set_px(g, 16, 28, DHIKR_MID)
    return g


# ── FASTING: crescent moon + stars ───────────────────────────────────────────
def make_fasting():
    g = make_grid(fill=BG)
    # Crescent: outer circle minus inner circle
    for y in range(32):
        for x in range(32):
            dx1, dy1 = x - 14, y - 15
            dx2, dy2 = x - 19, y - 12
            in_outer = dx1 * dx1 + dy1 * dy1 <= 81   # r=9
            in_inner = dx2 * dx2 + dy2 * dy2 <= 49   # r=7
            if in_outer and not in_inner:
                g[y * 32 + x] = FAST_GOLD
    # Highlights
    set_px(g, 8, 12, FAST_LIGHT)
    set_px(g, 9, 10, FAST_LIGHT)
    set_px(g, 7, 15, FAST_LIGHT)
    # Stars
    set_px(g, 23, 8, FAST_LIGHT)
    set_px(g, 24, 9, FAST_GOLD)
    set_px(g, 23, 10, FAST_LIGHT)
    set_px(g, 22, 9, FAST_LIGHT)
    set_px(g, 25, 20, FAST_LIGHT)
    set_px(g, 26, 21, FAST_MID)
    set_px(g, 25, 22, FAST_LIGHT)
    set_px(g, 24, 21, FAST_LIGHT)
    return g


# ── DUA: raised open hands ───────────────────────────────────────────────────
def make_dua():
    g = make_grid(fill=BG)
    # Left palm
    rect(g, 5, 18, 12, 25, DUA_MID)
    # Left fingers
    vline(g, 5, 12, 18, DUA_LIGHT)
    vline(g, 7, 11, 18, DUA_LIGHT)
    vline(g, 9, 12, 18, DUA_LIGHT)
    vline(g, 11, 13, 18, DUA_LIGHT)
    # Right palm
    rect(g, 19, 18, 26, 25, DUA_MID)
    # Right fingers
    vline(g, 20, 12, 18, DUA_LIGHT)
    vline(g, 22, 11, 18, DUA_LIGHT)
    vline(g, 24, 12, 18, DUA_LIGHT)
    vline(g, 26, 13, 18, DUA_LIGHT)
    # Light glow between hands
    set_px(g, 15, 13, DUA_SKIN)
    set_px(g, 16, 13, DUA_SKIN)
    set_px(g, 15, 14, DUA_LIGHT)
    set_px(g, 16, 14, DUA_LIGHT)
    set_px(g, 15, 15, DUA_SKIN)
    set_px(g, 16, 15, DUA_SKIN)
    return g


# ── CUSTOM: 4-pointed star / sparkle ─────────────────────────────────────────
def make_custom():
    g = make_grid(fill=BG)
    cx, cy = 15, 15
    # Vertical arm
    vline(g, cx, cy - 8, cy + 8, CUST_MID)
    vline(g, cx + 1, cy - 8, cy + 8, CUST_MID)
    # Horizontal arm
    hline(g, cy, cx - 8, cx + 8, CUST_MID)
    hline(g, cy + 1, cx - 8, cx + 8, CUST_MID)
    # Diagonal accents
    for i in range(-4, 5):
        if abs(i) >= 2:
            set_px(g, cx + i, cy + i, CUST_DARK)
            set_px(g, cx + i, cy - i, CUST_DARK)
    # Bright center
    rect(g, cx - 2, cy - 2, cx + 3, cy + 3, CUST_LIGHT)
    rect(g, cx - 1, cy - 1, cx + 2, cy + 2, CUST_WHITE)
    # Sparkle tips
    set_px(g, cx, cy - 9, CUST_LIGHT)
    set_px(g, cx + 1, cy - 9, CUST_LIGHT)
    set_px(g, cx, cy + 10, CUST_LIGHT)
    set_px(g, cx + 1, cy + 10, CUST_LIGHT)
    set_px(g, cx - 9, cy, CUST_LIGHT)
    set_px(g, cx - 9, cy + 1, CUST_LIGHT)
    set_px(g, cx + 10, cy, CUST_LIGHT)
    set_px(g, cx + 10, cy + 1, CUST_LIGHT)
    return g


if __name__ == '__main__':
    icons_dir = os.path.join(
        os.path.dirname(os.path.dirname(os.path.abspath(__file__))),
        'assets', 'icons'
    )
    os.makedirs(icons_dir, exist_ok=True)

    icons = {
        'habit-salah':   make_salah(),
        'habit-quran':   make_quran(),
        'habit-dhikr':   make_dhikr(),
        'habit-fasting': make_fasting(),
        'habit-dua':     make_dua(),
        'habit-custom':  make_custom(),
    }

    for name, pixels in icons.items():
        png_data = make_png(32, 32, pixels)
        path = os.path.join(icons_dir, f'{name}.png')
        with open(path, 'wb') as f:
            f.write(png_data)
        print(f'Created: {name}.png  ({len(png_data)} bytes)')
