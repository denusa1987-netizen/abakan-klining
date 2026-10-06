# -*- coding: utf-8 -*-
"""index.html -> tilda_block.html: содержимое для блока T123 Тильды.
Всё внутри <div id="ak">, каждый CSS-селектор получает префикс #ak,
шрифты через @import (на опубликованной Тильде работают)."""
import re, pathlib

src = pathlib.Path(__file__).with_name("index.html").read_text(encoding="utf-8")
css = re.search(r"<style>(.*?)</style>", src, re.S).group(1)
body = re.search(r"<body>(.*?)</body>", src, re.S).group(1)
fonts = re.search(r'href="(https://fonts\.googleapis\.com/css2[^"]+)"', src).group(1)

ROOT = "#ak"

def scope_selector(sel):
    sel = sel.strip()
    if not sel:
        return sel
    if sel in (":root", "html", "body"):
        return ROOT
    if sel == "*":
        return ROOT + " *"
    if sel.startswith(":focus-visible") or sel.startswith("::") or sel.startswith(":"):
        return ROOT + " " + sel
    sel = re.sub(r"^(html|body)\s+", "", sel)
    return ROOT + " " + sel

def scope_block(text):
    """Пробегает по правилам верхнего уровня текста text."""
    out, i, n = [], 0, len(text)
    while i < n:
        j = text.find("{", i)
        if j < 0:
            out.append(text[i:]); break
        head = text[i:j]
        # найти парную закрывающую скобку
        depth, k = 1, j + 1
        while k < n and depth:
            if text[k] == "{": depth += 1
            elif text[k] == "}": depth -= 1
            k += 1
        inner = text[j + 1:k - 1]
        h = head.strip()
        if h.startswith("@media") or h.startswith("@supports"):
            out.append(f"{head}{{{scope_block(inner)}}}")
        elif h.startswith("@"):  # keyframes, property, font-face — как есть
            out.append(f"{head}{{{inner}}}")
        else:
            sels = ",".join(scope_selector(s) for s in h.split(","))
            out.append(f"{sels}{{{inner}}}")
        i = k
    return "".join(out)

# убрать комментарии, чтобы не мешали парсеру
css_nc = re.sub(r"/\*.*?\*/", "", css, flags=re.S)
scoped = scope_block(css_nc)
# body-правила, которые были на <body>: перенесём явно
scoped = scoped.replace(f"{ROOT}{{\n  font-family", f"{ROOT}{{display:block;\n  font-family", 1)

block = f"""<!-- Абакан Клининг: лендинг + калькулятор. Правка цен — блок DISCOUNTS/GROUPS внизу. -->
<style>
@import url('{fonts}');
{scoped}
</style>
<div id="ak">
{body}
</div>
"""
block = block.replace("img/", "https://denusa1987-netizen.github.io/abakan-klining/img/")
pathlib.Path(__file__).with_name("tilda_block.html").write_text(block, encoding="utf-8")
print("ok", len(block), "bytes")
