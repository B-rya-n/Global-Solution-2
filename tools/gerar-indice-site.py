"""Gera o índice de busca local para a busca geral do Facilita Cidadão."""

from html.parser import HTMLParser
from pathlib import Path
import json
import re

ROOT = Path(__file__).resolve().parents[1]
PAGES = [ROOT / "index.html", *sorted((ROOT / "pages").glob("*.html"))]
OUTPUT = ROOT / "assets" / "js" / "indice-site.js"
VOID = {"area", "base", "br", "col", "embed", "hr", "img", "input", "link", "meta", "param", "source", "track", "wbr"}
SKIP = {"button", "input", "select", "textarea", "script", "style", "noscript"}
BLOCKS = {"address", "article", "blockquote", "br", "dd", "div", "dl", "dt", "fieldset", "figcaption", "form", "h1", "h2", "h3", "h4", "h5", "h6", "li", "ol", "p", "section", "summary", "table", "tr", "ul"}


class PageText(HTMLParser):
    def __init__(self):
        super().__init__(convert_charrefs=True)
        self.title = []
        self.text = []
        self.in_title = False
        self.in_main = False
        self.skipped = []

    def handle_starttag(self, tag, attrs):
        attrs = dict(attrs)
        if tag == "title":
            self.in_title = True
        if tag == "main":
            self.in_main = True
        if self.skipped:
            if tag not in VOID:
                self.skipped.append(tag)
            return
        classes = set((attrs.get("class") or "").split())
        hidden = "hidden" in attrs or (attrs.get("aria-hidden") or "").lower() == "true"
        if tag in SKIP or hidden or "so-leitor" in classes or "assistente-flutuante" in classes:
            if tag not in VOID:
                self.skipped.append(tag)
            return
        if self.in_main and tag in BLOCKS:
            self.text.append(" ")

    def handle_endtag(self, tag):
        if self.skipped:
            if tag == self.skipped[-1]:
                self.skipped.pop()
            return
        if tag == "title":
            self.in_title = False
        if tag == "main":
            self.in_main = False
        if self.in_main and tag in BLOCKS:
            self.text.append(" ")

    def handle_data(self, data):
        if self.in_title and not self.skipped:
            self.title.append(data)
        if self.in_main and not self.skipped:
            self.text.append(data)


def main():
    records = []
    for path in PAGES:
        parser = PageText()
        parser.feed(path.read_text(encoding="utf-8"))
        title = re.sub(r"\s+", " ", " ".join(parser.title)).strip()
        text = re.sub(r"\s+", " ", "".join(parser.text)).strip()
        url = "../index.html" if path.name == "index.html" else path.name
        if title and text:
            records.append({"url": url, "titulo": title, "tituloPagina": title, "texto": text})
    OUTPUT.write_text(
        "/* Gerado por tools/gerar-indice-site.py a partir do texto das páginas HTML. */\n"
        "window.FCIndiceSite = " + json.dumps(records, ensure_ascii=False, separators=(",", ":")) + ";\n",
        encoding="utf-8",
    )
    print(f"Indice gerado: {len(records)} paginas: {OUTPUT.relative_to(ROOT)}")


if __name__ == "__main__":
    main()
