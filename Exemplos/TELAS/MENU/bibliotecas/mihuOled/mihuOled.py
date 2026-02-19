from machine import I2C, Pin
import framebuf

# =========================
# Import SSD1306
# =========================
_SSD1306_I2C = None
for _name in ("ssd1306", "oled.ssd1306", "lib.mihuOled.ssd1306", "lib.ssd1306"):
    try:
        _m = __import__(_name, None, None, ("SSD1306_I2C",))
        _SSD1306_I2C = _m.SSD1306_I2C
        break
    except Exception:
        pass

if _SSD1306_I2C is None:
    raise ImportError("mihuOled: não achei SSD1306_I2C (ssd1306.py).")

# =========================
# Import Writer (opcional)
# =========================
_Writer = None
for _name in ("writer", "oled.writer", "lib.oled.writer", "lib.writer"):
    try:
        _m = __import__(_name, None, None, ("Writer",))
        _Writer = _m.Writer
        break
    except Exception:
        pass

# =========================
# Import Image (opcional)
# =========================
_Image = None
for _name in ("image", "lib.image", "oled.image", "lib.oled.image"):
    try:
        _m = __import__(_name)
        if hasattr(_m, "Image"):
            _Image = _m.Image
            break
    except Exception:
        pass

# =========================
# Defaults MIHU
# =========================
_DEFAULT_SDA    = 39
_DEFAULT_SCL    = 40
_DEFAULT_I2C_ID = 0
_DEFAULT_FREQ   = 400_000
_DEFAULT_W      = 128
_DEFAULT_H      = 64
_DEFAULT_ADDR   = 0x3C

# =========================
# Singleton
# =========================
_i2c = None
_oled = None
_writer = None
_font_name = None

# =========================
# Core init
# =========================
def init(*, i2c=None,
         sda=_DEFAULT_SDA, scl=_DEFAULT_SCL, i2c_id=_DEFAULT_I2C_ID, freq=_DEFAULT_FREQ,
         width=_DEFAULT_W, height=_DEFAULT_H, addr=_DEFAULT_ADDR):
    """Inicializa display SSD1306 e retorna o objeto."""
    global _i2c, _oled, _writer, _font_name

    if i2c is None:
        _i2c = I2C(i2c_id, sda=Pin(sda), scl=Pin(scl), freq=freq)
    else:
        _i2c = i2c

    _oled = _SSD1306_I2C(width, height, _i2c, addr=addr)
    _writer = None
    _font_name = None
    return _oled

def oled():
    if _oled is None:
        init()
    return _oled

def i2c():
    if _i2c is None:
        init()
    return _i2c

# =========================
# FrameBuffer helpers
# =========================
def clear(color=0):
    oled().fill(1 if color else 0)

def show():
    oled().show()

def invert(v=True):
    o = oled()
    try:
        o.invert(1 if v else 0)
    except Exception:
        pass

def text(msg, x, y, color=1):
    oled().text(str(msg), int(x), int(y), 1 if color else 0)

def center(msg, y=0, color=1):
    """Centraliza usando fonte padrão 8x8 do text()."""
    msg = str(msg)
    o = oled()
    x = (o.width - (len(msg) * 8)) // 2
    if x < 0:
        x = 0
    o.text(msg, x, int(y), 1 if color else 0)

def pixel(x, y, c=1): oled().pixel(int(x), int(y), 1 if c else 0)
def line(x0, y0, x1, y1, c=1): oled().line(int(x0), int(y0), int(x1), int(y1), 1 if c else 0)
def rect(x, y, w, h, c=1): oled().rect(int(x), int(y), int(w), int(h), 1 if c else 0)
def fill_rect(x, y, w, h, c=1): oled().fill_rect(int(x), int(y), int(w), int(h), 1 if c else 0)

def make_fb(buf, w, h, fmt=framebuf.MONO_HLSB):
    """Cria FrameBuffer a partir de bytes/bytearray."""
    return framebuf.FrameBuffer(buf, int(w), int(h), fmt)

def blit(fb, x, y, key=-1):
    oled().blit(fb, int(x), int(y), key)

# =========================
# Writer (fontes grandes)
# =========================
def _load_font(name):
    for mod in (name, "oled."+name, "lib.oled."+name, "lib."+name):
        try:
            return __import__(mod)
        except Exception:
            pass
    raise ImportError("mihuOled: não achei a fonte '{}'".format(name))

def set_font(name="font6"):
    global _writer, _font_name
    if _Writer is None:
        raise ImportError("mihuOled: writer.py não encontrado (sem write()).")
    font = _load_font(name)
    _writer = _Writer(oled(), font)
    _font_name = name
    return True

def font():
    return _font_name

def write(msg, x=None, y=None, *, clear_first=False, font_name=None):
    """
    Escreve usando Writer (se existir), senão cai no text().
    """
    global _writer

    if clear_first:
        clear(0)

    if _Writer is None:
        if x is None: x = 0
        if y is None: y = 0
        text(msg, x, y)
        return

    if font_name is not None:
        set_font(font_name)
    if _writer is None:
        set_font("font6")

    if x is not None and y is not None:
        try:
            _writer.set_textpos(oled(), int(y), int(x))
        except Exception:
            pass

    _writer.printstring(str(msg))

# =========================
# Imagens / Ícones
# =========================
def draw_icon(icon, x=0, y=0, w=None, h=None, fmt=framebuf.MONO_HLSB):
    """
    Desenha:
      - callable: tenta icon(oled,x,y) ou icon(x,y)
      - Image (image.py): tem .buffer .width .height
      - FrameBuffer
      - bytes PBM P4 ("P4") ou BMP 1-bit ("BM"): decode automático via Image().load_bytes()
      - bytes cru: precisa w/h
    """
    o = oled()
    xx = int(x); yy = int(y)

    # 1) callable (ícone como função)
    if callable(icon):
        for args in ((o, xx, yy), (xx, yy), (o,), ()):
            try:
                icon(*args)
                return True
            except TypeError:
                pass
        raise TypeError("Ícone callable, mas assinatura não suportada.")

    # 2) objeto Image: .buffer/.width/.height
    if hasattr(icon, "buffer") and hasattr(icon, "width") and hasattr(icon, "height"):
        fb = make_fb(icon.buffer, icon.width, icon.height, fmt)
        o.blit(fb, xx, yy, -1)
        return True

    # 3) FrameBuffer
    if isinstance(icon, framebuf.FrameBuffer):
        o.blit(icon, xx, yy, -1)
        return True

    # 4) bytes / bytearray / memoryview
    if isinstance(icon, (bytes, bytearray, memoryview)):
        b = bytes(icon)

        # PBM/BMP com cabeçalho: decodifica automático usando image.py
        if _Image is not None and len(b) >= 2 and (b[0:2] in (b"P4", b"BM")):
            img = _Image().load_bytes(b)
            fb = make_fb(img.buffer, img.width, img.height, fmt)
            o.blit(fb, xx, yy, -1)
            return True

        # bitmap cru (sem cabeçalho)
        if w is None or h is None:
            raise TypeError("bytes sem cabeçalho PBM/BMP precisa w/h: draw_icon(buf,x,y,w,h)")
        fb = make_fb(b, w, h, fmt)
        o.blit(fb, xx, yy, -1)
        return True

    raise TypeError("Ícone em formato não suportado: {}".format(type(icon)))

# Alias compatível com seu código antigo
image = draw_icon


from time import sleep_ms

def _call_draw(draw_fn, xoff):
    """
    Aceita callbacks em 3 formatos:
      - draw_fn(xoff)
      - draw_fn(oled, xoff)
      - draw_fn()  (ignora offset)
    """
    try:
        draw_fn(xoff)
        return
    except TypeError:
        pass

    try:
        draw_fn(oled(), xoff)
        return
    except TypeError:
        pass

    draw_fn()


def shift_left(draw_old, draw_new, *, steps=16, delay_ms=12):
    """
    Desliza para esquerda:
      - draw_old: função que desenha tela atual
      - draw_new: função que desenha próxima tela
    Cada draw_* recebe xoff (offset em X).
    """
    w = oled().width
    for i in range(steps + 1):
        dx = (w * i) // steps
        clear(0)

        # tela antiga sai para a esquerda (x negativo)
        _call_draw(draw_old, -dx)

        # tela nova entra pela direita
        _call_draw(draw_new, w - dx)

        show()
        sleep_ms(delay_ms)


def shift_right(draw_old, draw_new, *, steps=16, delay_ms=12):
    """Desliza para direita (opcional, mas útil)."""
    w = oled().width
    for i in range(steps + 1):
        dx = (w * i) // steps
        clear(0)

        _call_draw(draw_old, dx)
        _call_draw(draw_new, -w + dx)

        show()
        sleep_ms(delay_ms)


    
def shift_left_item(icon_old, label_old, icon_new, label_new, *,
                    icon_x=20, icon_y=8, text_y=44,
                    text_x_center=True,
                    steps=18, delay_ms=10):
    def a(xoff=0):
        draw_icon(icon_old, icon_x + xoff, icon_y)
        if text_x_center:
            # centraliza 6px por char (fonte 8x8: normalmente 8px, mas seu layout usava 4)
            # vou manter seu padrão de 4 para ficar igual ao seu menu atual:
            tx = 64 - (len(label_old) * 4) // 2
        else:
            tx = 0
        text(label_old, tx + xoff, text_y)

    def b(xoff=0):
        draw_icon(icon_new, icon_x + xoff, icon_y)
        if text_x_center:
            tx = 64 - (len(label_new) * 4) // 2
        else:
            tx = 0
        text(label_new, tx + xoff, text_y)

    shift_left(a, b, steps=steps, delay_ms=delay_ms)

def shift_right_item(icon_old, label_old, icon_new, label_new, *,
                     icon_x=20, icon_y=8, text_y=44,
                     steps=18, delay_ms=10):
    def a(xoff=0):
        draw_icon(icon_old, icon_x + xoff, icon_y)
        tx = 64 - (len(label_old) * 4) // 2
        text(label_old, tx + xoff, text_y)

    def b(xoff=0):
        draw_icon(icon_new, icon_x + xoff, icon_y)
        tx = 64 - (len(label_new) * 4) // 2
        text(label_new, tx + xoff, text_y)

    shift_right(a, b, steps=steps, delay_ms=delay_ms)

from time import sleep_ms


def text_scale(msg, x, y, scale=2, color=1):
    """
    Desenha texto usando oled.text(), mas escalando (fonte "grande" por pixel-doubling).
    scale=2 ou 3 fica bom.
    """
    msg = str(msg)
    scale = int(scale)
    if scale < 1:
        scale = 1

    # buffer 1-bit com o texto 8x8
    w = len(msg) * 8
    h = 8
    if w <= 0:
        return

    # stride em bytes (largura em bytes por linha)
    stride = (w + 7) // 8
    buf = bytearray(stride * h)
    fb = framebuf.FrameBuffer(buf, w, h, framebuf.MONO_HLSB)

    fb.fill(0)
    fb.text(msg, 0, 0, 1)

    # “blit escalado” (desenha só pixels ligados)
    o = oled()
    xx = int(x)
    yy = int(y)
    c = 1 if color else 0

    for py in range(h):
        for px in range(w):
            if fb.pixel(px, py):
                o.fill_rect(xx + px * scale, yy + py * scale, scale, scale, c)

'''
def scroll_text_scale(msg, y=0, *, scale=2, speed=2, delay_ms=25, gap=16):
    """
    Scroll horizontal com "fonte grande" (escala do text()).
    - speed: pixels por frame
    - gap: espaço vazio ao fim antes de repetir
    """
    msg = str(msg)
    scale = int(scale)
    if scale < 1:
        scale = 1

    # largura aproximada do texto escalado (8px por char)
    text_w = len(msg) * 8 * scale
    x = oled().width

    while True:
        clear(0)
        text_scale(msg, x, y, scale=scale, color=1)
        show()

        x -= int(speed)
        if x < -(text_w + gap):
            x = oled().width

        sleep_ms(int(delay_ms))

'''

_scroll_x = None

def scroll_text_scale_tick(
    msg,
    y=0,
    *,
    scale=2,
    speed=2,
    gap=16
):
    global _scroll_x

    msg = str(msg)
    scale = max(1, int(scale))

    # largura aproximada do texto escalado
    text_w = len(msg) * 8 * scale

    # inicializa posição
    if _scroll_x is None:
        _scroll_x = oled().width

    # desenha 1 frame
    text_scale(msg, _scroll_x, y, scale=scale, color=1)

    # avança
    _scroll_x -= int(speed)

    if _scroll_x < -(text_w + gap):
        _scroll_x = oled().width



def reset_scroll():
    global _scroll_x
    _scroll_x = None


import framebuf

def draw_image(oled, img, x, y):
    """
    Desenha uma imagem PBM/BMP (1-bit) no OLED.
    img: objeto Image já carregado
    """
    fb = framebuf.FrameBuffer(
        img.buffer,
        img.width,
        img.height,
        framebuf.MONO_HLSB
    )
    oled.blit(fb, x, y)

def hline(x, y, w, color=1):
    """
    Desenha uma linha horizontal
    """
    for i in range(w):
        pixel(x + i, y, color)

# =========================================================
# PBM (P4) ICON DRAW
# Uso:
#   from lib.mihuOled import mihuOled as oled
#   from lib.mihuOled.icons.eyes import Eyes_Angry
#   oled.init()
#   oled.clear()
#   oled.draw_pbm(Eyes_Angry, 0, 0)
#   oled.show()
# =========================================================

def _pbm_parse_p4(pbm_bytes):
    """
    Parse PBM P4: header ASCII + dados binários (1 bit/pixel, MSB primeiro).
    Retorna: (w, h, data, row_bytes)
    """
    i = 0
    n = len(pbm_bytes)

    def read_line():
        nonlocal i
        j = pbm_bytes.find(b"\n", i)
        if j < 0:
            j = n
        line = pbm_bytes[i:j].strip()
        i = j + 1
        return line

    magic = read_line()
    if magic != b"P4":
        raise ValueError("Nao eh PBM P4 (magic=%r)" % magic)

    line = read_line()
    # ignora comentários e linhas vazias
    while line.startswith(b"#") or len(line) == 0:
        line = read_line()

    parts = line.split()
    if len(parts) < 2:
        line2 = read_line()
        parts = (line + b" " + line2).split()

    w = int(parts[0])
    h = int(parts[1])

    row_bytes = (w + 7) // 8
    data_len = row_bytes * h

    data = pbm_bytes[i:i + data_len]
    if len(data) < data_len:
        raise ValueError("Dados insuficientes: %d < %d" % (len(data), data_len))

    return w, h, data, row_bytes


def draw_pbm(pbm_bytes, x0=0, y0=0, color=1, invert=False, clear_bg=False):
    """
    Desenha um ícone PBM P4 (bytes) no display usando a função pixel() do mihuOled.

    pbm_bytes: bytes começando com b'P4\\nW H\\n...'
    x0, y0: posição no display
    color: 1 liga, 0 apaga (para os pixels '1' do PBM)
    invert: inverte bits do PBM
    clear_bg: se True, apaga o fundo (pixels 0 do PBM) na área do ícone

    Retorna (w, h)
    """
    # 1) garantia: precisa existir pixel(x,y,val) neste módulo
    if "pixel" not in globals():
        raise RuntimeError("mihuOled precisa ter a funcao pixel(x,y,val) para draw_pbm funcionar.")

    w, h, data, row_bytes = _pbm_parse_p4(pbm_bytes)

    idx = 0
    for y in range(h):
        row = data[idx:idx + row_bytes]
        idx += row_bytes

        for xb, byte in enumerate(row):
            # MSB é o pixel mais à esquerda
            for bit in range(8):
                x = xb * 8 + bit
                if x >= w:
                    break

                on = (byte & (0x80 >> bit)) != 0
                if invert:
                    on = not on

                if on:
                    pixel(x0 + x, y0 + y, color)
                elif clear_bg:
                    pixel(x0 + x, y0 + y, 0)

    return w, h

