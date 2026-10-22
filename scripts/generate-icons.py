import os
import math
from PIL import Image, ImageDraw, ImageFilter

def create_dozzo_icon(target_size, is_maskable=False, is_apple=False):
    # Render at 4x target size for perfect supersampling / antialiasing
    render_size = target_size * 4
    scale = render_size / 512.0
    
    img = Image.new('RGBA', (render_size, render_size), (0, 0, 0, 0))
    draw = ImageDraw.Draw(img)
    
    bg_color = (8, 9, 14, 255)
    
    if is_apple:
        # Apple touch icon: Apple applies its own squircle mask, so it should be full-bleed or square with rounded preview
        draw.rectangle([0, 0, render_size, render_size], fill=bg_color)
    elif is_maskable:
        # Android maskable requires full background coverage
        draw.rectangle([0, 0, render_size, render_size], fill=bg_color)
    else:
        # Standard app icon with smooth rounded corners
        radius = int(120 * scale)
        draw.rounded_rectangle([0, 0, render_size, render_size], radius=radius, fill=bg_color)
    
    # Outer subtle gold luxury bevel border
    if not is_apple and not is_maskable:
        rim_pad = int(14 * scale)
        rim_w = max(2, int(4 * scale))
        draw.rounded_rectangle(
            [rim_pad, rim_pad, render_size - rim_pad, render_size - rim_pad],
            radius=int(108 * scale),
            outline=(240, 185, 11, 70),
            width=rim_w
        )
    
    # Subtle inner radial gold glow
    glow = Image.new('RGBA', (render_size, render_size), (0, 0, 0, 0))
    gdraw = ImageDraw.Draw(glow)
    center = render_size // 2
    glow_r = int(190 * scale)
    for r in range(glow_r, 0, -10):
        alpha = int(40 * (1 - r / glow_r))
        gdraw.ellipse([center - r, center - r, center + r, center + r], fill=(240, 185, 11, alpha))
    img = Image.alpha_composite(img, glow)
    draw = ImageDraw.Draw(img)
    
    # Modern Geometric Luxury 'D' Emblem
    fit_scale = 0.78 if is_maskable else (0.86 if is_apple else 0.92)
    c_x = render_size * 0.48
    c_y = render_size * 0.50
    w = 250 * scale * fit_scale
    h = 280 * scale * fit_scale
    
    left = c_x - w * 0.44
    top = c_y - h * 0.5
    right = c_x + w * 0.56
    bottom = c_y + h * 0.5
    
    d_stroke = int(36 * scale * fit_scale)
    
    # Draw vertical stem in bright gold
    stem_x = left + d_stroke // 2
    draw.line([stem_x, top + d_stroke//2, stem_x, bottom - d_stroke//2], fill=(255, 222, 89, 255), width=d_stroke)
    
    # Top horizontal bar
    draw.line([stem_x, top + d_stroke//2, c_x + 12 * scale * fit_scale, top + d_stroke//2], fill=(255, 215, 0, 255), width=d_stroke)
    
    # Bottom horizontal bar
    draw.line([stem_x, bottom - d_stroke//2, c_x + 12 * scale * fit_scale, bottom - d_stroke//2], fill=(224, 140, 0, 255), width=d_stroke)
    
    # Semicircular D curve
    arc_box = [c_x - (w * 0.44), top, right, bottom]
    draw.arc(arc_box, start=-90, end=90, fill=(240, 185, 11, 255), width=d_stroke)
    
    # Inner gold core sphere (illuminated nucleus)
    orb_r = int(28 * scale * fit_scale)
    orb_x = int(c_x + 18 * scale * fit_scale)
    orb_y = int(c_y)
    draw.ellipse([orb_x - orb_r, orb_y - orb_r, orb_x + orb_r, orb_y + orb_r], fill=(255, 238, 120, 255))
    
    # Dynamic orbital swoop ring (like Saturn / futuristic orbital crest)
    ring_w = max(2, int(8 * scale * fit_scale))
    ring_box = [c_x - w * 0.70, c_y - h * 0.36, c_x + w * 0.80, c_y + h * 0.36]
    draw.arc(ring_box, start=135, end=345, fill=(255, 255, 255, 210), width=ring_w)
    
    # Downscale with high-quality Lanczos resampling
    final_img = img.resize((target_size, target_size), Image.Resampling.LANCZOS)
    return final_img

def main():
    public_dir = os.path.join(os.path.dirname(__file__), '..', 'public')
    os.makedirs(public_dir, exist_ok=True)
    
    # 1. Apple Touch Icon (180x180) for iOS Safari Add to Home Screen
    apple_icon = create_dozzo_icon(180, is_apple=True)
    apple_icon.save(os.path.join(public_dir, 'apple-touch-icon.png'), 'PNG')
    print('Generated apple-touch-icon.png (180x180)')
    
    # 2. Android Chrome 192x192
    icon_192 = create_dozzo_icon(192)
    icon_192.save(os.path.join(public_dir, 'icon-192.png'), 'PNG')
    print('Generated icon-192.png (192x192)')
    
    # 3. Android Chrome 512x512
    icon_512 = create_dozzo_icon(512)
    icon_512.save(os.path.join(public_dir, 'icon-512.png'), 'PNG')
    print('Generated icon-512.png (512x512)')
    
    # 4. Android Maskable 512x512
    icon_maskable = create_dozzo_icon(512, is_maskable=True)
    icon_maskable.save(os.path.join(public_dir, 'icon-maskable-512.png'), 'PNG')
    print('Generated icon-maskable-512.png (512x512)')
    
    # 5. Browser Favicon 32x32
    icon_32 = create_dozzo_icon(32)
    icon_32.save(os.path.join(public_dir, 'icon-32.png'), 'PNG')
    print('Generated icon-32.png (32x32)')

if __name__ == '__main__':
    main()
