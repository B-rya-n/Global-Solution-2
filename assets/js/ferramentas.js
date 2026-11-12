/* Ferramentas para levar a orientação: ouvir em voz alta, enviar por WhatsApp e salvar como PDF.
   Nada é enviado a servidor: o texto é montado no navegador a partir dos dados do serviço. */
(function (raiz) {
  "use strict";
  const MARCA = "Facilita Cidadão";
  const semPonto = t => String(t).replace(/[.\s]+$/, "");

  /* Texto para enviar por mensagem. "feitos" diz quais documentos já foram marcados. */
  function textoCompartilhar(s, feitos) {
    const ok = j => !!(feitos && feitos[j]);
    const l = [MARCA + ": " + s.nome];
    if (s.onde) l.push("Onde: " + s.onde);
    l.push("", "Documentos para levar:");
    s.documentos.forEach((d, j) => l.push((ok(j) ? "[x] " : "[ ] ") + d));
    l.push("", "Passo a passo:");
    s.etapas.forEach((e, j) => l.push((j + 1) + ". " + e));
    l.push("", "Confirme as regras no canal oficial: " + s.fonte, "Guia de orientação, não é um site do governo.");
    return l.join("\n");
  }
  const linkWhatsApp = (s, feitos) => "https://wa.me/?text=" + encodeURIComponent(textoCompartilhar(s, feitos));

  /* Texto pensado para ser ouvido: frases curtas e sem endereços de internet. */
  function textoFalado(s) {
    const p = [semPonto(s.nome) + "."];
    if (s.onde) p.push("Onde procurar: " + semPonto(s.onde) + ".");
    p.push("Documentos para levar: " + s.documentos.map(semPonto).join("; ") + ".");
    p.push("Passo a passo.");
    s.etapas.forEach((e, j) => p.push("Passo " + (j + 1) + ": " + semPonto(e) + "."));
    p.push("Confirme as regras no canal oficial.");
    return p.join(" ");
  }

  /* Leitura em voz alta. Só uma leitura por vez: ao começar outra, a anterior para. */
  const temVoz = () => !!(raiz.speechSynthesis && raiz.SpeechSynthesisUtterance);
  let atual = null, fimAtual = null;
  function parar() {
    if (!temVoz()) return;
    const f = fimAtual;
    atual = null; fimAtual = null;
    raiz.speechSynthesis.cancel();
    if (f) f();
  }
  function falar(texto, aoTerminar) {
    if (!temVoz()) return;
    parar();
    const u = new raiz.SpeechSynthesisUtterance(texto);
    u.lang = "pt-BR"; u.rate = 0.9;
    const fim = () => { if (atual === u) { atual = null; fimAtual = null; aoTerminar(); } };
    u.onend = fim; u.onerror = fim;
    atual = u; fimAtual = aoTerminar;
    raiz.speechSynthesis.speak(u);
  }

  /* Prepara uma folha limpa do serviço. O navegador permite imprimir ou escolher "Salvar como PDF". */
  function salvarPdf(s, feitos) {
    const doc = raiz.document;
    const velho = doc.getElementById("area-impressao");
    if (velho) velho.remove();
    const el = (tag, txt) => { const e = doc.createElement(tag); if (txt) e.textContent = txt; return e; };
    const area = el("div");
    area.id = "area-impressao";
    area.appendChild(el("p", MARCA + " · guia de orientação"));
    area.appendChild(el("h1", s.nome));
    area.appendChild(el("p", "Lista de documentos e instruções para este serviço."));
    if (s.onde) {
      const p = el("p");
      p.appendChild(el("strong", "Onde: "));
      p.appendChild(doc.createTextNode(s.onde));
      area.appendChild(p);
    }
    area.appendChild(el("h2", "Documentos para levar"));
    const ul = el("ul");
    s.documentos.forEach((d, j) => ul.appendChild(el("li", ((feitos && feitos[j]) ? "[x] " : "[ ] ") + d)));
    area.appendChild(ul);
    area.appendChild(el("h2", "Passo a passo"));
    const ol = el("ol");
    s.etapas.forEach(e => ol.appendChild(el("li", e)));
    area.appendChild(ol);
    area.appendChild(el("p", "Confirme regras e prazos no canal oficial. Este guia não é um site do governo."));
    doc.body.appendChild(area);
    doc.body.classList.add("imprimindo");
    const limpar = () => { doc.body.classList.remove("imprimindo"); area.remove(); raiz.removeEventListener("afterprint", limpar); };
    raiz.addEventListener("afterprint", limpar);
    raiz.print();
  }

  const imprimir = salvarPdf;
  const FC = { textoCompartilhar, linkWhatsApp, textoFalado, temVoz, falar, parar, salvarPdf, imprimir };
  raiz.FC = FC;
  if (typeof module !== "undefined") module.exports = FC;
})(typeof window !== "undefined" ? window : globalThis);
