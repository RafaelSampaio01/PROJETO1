# storage_report.py
import os
import gc

def fmt_bytes(n):
    if n < 1024:
        return "%d B" % n
    if n < 1024*1024:
        return "%.1f KB" % (n/1024)
    return "%.2f MB" % (n/(1024*1024))

def fs_stats(path="/"):
    # retorna (total, used, free) em bytes
    st = os.statvfs(path)
    bsize = st[0]      # f_bsize
    frsize = st[1]     # f_frsize (nem sempre usado)
    blocks = st[2]     # f_blocks
    bfree  = st[3]     # f_bfree
    bavail = st[4]     # f_bavail

    total = blocks * bsize
    free  = bavail * bsize
    used  = total - free
    return total, used, free

def dir_size(path):
    total = 0
    files = 0
    dirs = 0
    try:
        for name in os.listdir(path):
            p = path + ("/" if not path.endswith("/") else "") + name
            try:
                st = os.stat(p)
            except OSError:
                continue

            mode = st[0]
            size = st[6]

            is_dir = (mode & 0x4000) != 0  # MicroPython dir bit
            if is_dir:
                dirs += 1
                sub_total, sub_files, sub_dirs = dir_size(p)
                total += sub_total
                files += sub_files
                dirs += sub_dirs
            else:
                files += 1
                total += size
    except OSError:
        return 0, 0, 0

    return total, files, dirs

def list_top_files(path, top_n=20):
    items = []
    def walk(p):
        try:
            for name in os.listdir(p):
                full = p + ("/" if not p.endswith("/") else "") + name
                st = os.stat(full)
                mode = st[0]
                size = st[6]
                is_dir = (mode & 0x4000) != 0
                if is_dir:
                    walk(full)
                else:
                    items.append((size, full))
        except OSError:
            pass

    walk(path)
    items.sort(reverse=True, key=lambda x: x[0])
    return items[:top_n]

def ram_stats():
    gc.collect()
    free = gc.mem_free()
    alloc = gc.mem_alloc()
    total = free + alloc
    return total, alloc, free

# ==============================
# RELATÓRIO
# ==============================
print("\n==============================")
print("📦 FLASH / FILESYSTEM")
print("==============================")
total, used, free = fs_stats("/")
print("Total :", fmt_bytes(total))
print("Usado :", fmt_bytes(used))
print("Livre :", fmt_bytes(free))

print("\n==============================")
print("🧠 RAM (heap) - execução")
print("==============================")
rtotal, ralloc, rfree = ram_stats()
print("Total :", fmt_bytes(rtotal))
print("Usado :", fmt_bytes(ralloc))
print("Livre :", fmt_bytes(rfree))

# Pastas que você citou
targets = ["/lib", "/system"]

print("\n==============================")
print("📁 TAMANHO POR PASTA")
print("==============================")
for p in targets:
    try:
        os.stat(p)
    except OSError:
        print(p, "-> (não existe)")
        continue

    sz, nfiles, ndirs = dir_size(p)
    print("%s -> %s | arquivos: %d | pastas: %d" % (p, fmt_bytes(sz), nfiles, ndirs))

# Detalhar módulos dentro de /lib (tamanho por subpasta)
if True:
    p = "/lib"
    try:
        os.stat(p)
        print("\n------------------------------")
        print("📚 /lib por subpasta/arquivo")
        print("------------------------------")
        entries = []
        for name in os.listdir(p):
            full = p + "/" + name
            st = os.stat(full)
            mode = st[0]
            is_dir = (mode & 0x4000) != 0
            if is_dir:
                sz, nf, nd = dir_size(full)
                entries.append((sz, full + "/"))
            else:
                entries.append((st[6], full))
        entries.sort(key=lambda x: x[0], reverse=True)
        for sz, name in entries:
            print("%-35s %10s" % (name, fmt_bytes(sz)))
    except OSError:
        pass

# Top maiores arquivos (ajuda achar “vilões”)
print("\n==============================")
print("📌 TOP 20 maiores arquivos (/lib e /system)")
print("==============================")
for p in targets:
    try:
        os.stat(p)
    except OSError:
        continue
    print("\n>>", p)
    top = list_top_files(p, top_n=20)
    for sz, fn in top:
        print("%10s  %s" % (fmt_bytes(sz), fn))

def pct(part, total):
    return (part * 100.0) / total if total else 0.0

def fs_percent(path="/"):
    st = os.statvfs(path)
    bsize  = st[0]
    blocks = st[2]
    bavail = st[4]

    total = blocks * bsize
    free  = bavail * bsize
    used  = total - free

    print("\nFLASH: usado %.2f%% | livre %.2f%%" % (pct(used, total), pct(free, total)))

def ram_percent():
    gc.collect()
    free = gc.mem_free()
    used = gc.mem_alloc()
    total = free + used
    print("RAM:   usado %.2f%% | livre %.2f%%" % (pct(used, total), pct(free, total)))

fs_percent("/")
ram_percent()

print("\n✅ Relatório concluído.")
