# ============================================================
# MIHU – STORAGE & MEMORY REPORT
# Aluno + Desenvolvimento (arquivo único)
# ============================================================

import os
import gc

# módulos de baixo nível só usados no modo DEV
try:
    import esp
except ImportError:
    esp = None


# ============================================================
# UTILITÁRIOS
# ============================================================

def _fmt_bytes(n):
    if n < 1024:
        return "%d B" % n
    if n < 1024 * 1024:
        return "%.1f KB" % (n / 1024)
    return "%.2f MB" % (n / (1024 * 1024))


def _pct(part, total):
    return (part * 100.0) / total if total else 0.0


def _fs_stats(path="/"):
    """
    Retorna (total, used, free) do filesystem
    """
    st = os.statvfs(path)
    bsize  = st[0]   # tamanho do bloco
    blocks = st[2]   # blocos totais
    bavail = st[4]   # blocos disponíveis ao usuário

    total = blocks * bsize
    free  = bavail * bsize
    used  = total - free
    return total, used, free


def _ram_stats():
    gc.collect()
    free  = gc.mem_free()
    used  = gc.mem_alloc()
    total = free + used
    return total, used, free


# ============================================================
# 🧑‍🎓 RELATÓRIO DO ALUNO
# ============================================================

def student_report():
    print("\n==============================")
    print("🧑‍🎓 ESPAÇO DO ALUNO")
    print("==============================")

    # Filesystem
    total, used, free = _fs_stats("/")

    print("📦 Arquivos:")
    print(" Total :", _fmt_bytes(total))
    print(" Usado :", _fmt_bytes(used), "(%.1f%%)" % _pct(used, total))
    print(" Livre :", _fmt_bytes(free),  "(%.1f%%)" % _pct(free, total))

    # RAM
    rtotal, rused, rfree = _ram_stats()

    print("\n🧠 Memória (RAM):")
    print(" Total :", _fmt_bytes(rtotal))
    print(" Usado :", _fmt_bytes(rused), "(%.1f%%)" % _pct(rused, rtotal))
    print(" Livre :", _fmt_bytes(rfree), "(%.1f%%)" % _pct(rfree, rtotal))

    print("\n✅ Pronto para programar!\n")


# ============================================================
# 🧑‍🔧 RELATÓRIO DE DESENVOLVIMENTO
# ============================================================

def dev_report():
    print("\n==============================")
    print("🧑‍🔧 RELATÓRIO DE DESENVOLVIMENTO")
    print("==============================")

    if esp:
        flash_total = esp.flash_size()
        flash_user  = esp.flash_user_start()

        print("🔴 Flash física total :", _fmt_bytes(flash_total))
        print("🔴 Área reservada ao sistema :", _fmt_bytes(flash_user))
        print("🔴 Área teórica disponível :", 
              _fmt_bytes(flash_total - flash_user),
              "(%.1f%%)" % _pct(flash_total - flash_user, flash_total))
    else:
        print("⚠️ Módulo esp não disponível")

    # Filesystem real
    total, used, free = _fs_stats("/")

    print("\n📦 Filesystem montado (/):")
    print(" Total :", _fmt_bytes(total))
    print(" Usado :", _fmt_bytes(used))
    print(" Livre :", _fmt_bytes(free))

    # RAM
    rtotal, rused, rfree = _ram_stats()

    print("\n🧠 Heap:")
    print(" Usado :", _fmt_bytes(rused))
    print(" Livre :", _fmt_bytes(rfree))

    print("\n⚠️ Uso técnico – não exibir ao aluno\n")


# ============================================================
# FUNÇÃO ÚNICA (API MIHU)
# ============================================================

def mihu_storage(mode="student"):
    """
    mode:
      - "student" → visão do aluno
      - "dev"     → visão de desenvolvimento
    """
    if mode == "student":
        student_report()
    elif mode == "dev":
        dev_report()
    else:
        raise ValueError("Modo inválido: use 'student' ou 'dev'")


# ============================================================
# EXECUÇÃO DIRETA (opcional)
# ============================================================

if __name__ == "__main__":
    # padrão seguro: aluno
    mihu_storage("student")
    mihu_storage("dev")
