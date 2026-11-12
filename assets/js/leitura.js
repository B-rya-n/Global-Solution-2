(() => {
  "use strict";

  const botao = document.getElementById("ouvir-pagina");
  const status = document.getElementById("leitura-status");
  const principal = document.querySelector("main");
  if (!botao || !status || !principal) return;

  const sintese = window.speechSynthesis;
  if (!sintese || !window.SpeechSynthesisUtterance) {
    botao.disabled = true;
    status.textContent = "A leitura em voz alta não está disponível neste navegador.";
    return;
  }

  const seletorBlocos = "h1,h2,h3,h4,h5,h6,p,li,blockquote,figcaption,dt,dd,caption,summary,a";
  let blocos = [];
  let indice = 0;
  let sessao = 0;
  let temporizador = null;
  let lendo = false;
  let pausada = false;

  const pararBotao = document.createElement("button");
  pararBotao.type = "button";
  pararBotao.className = "btn sec leitura-parar";
  pararBotao.textContent = "■ Parar leitura";
  pararBotao.hidden = true;
  botao.insertAdjacentElement("afterend", pararBotao);

  function textoDo(elemento) {
    let texto = elemento.innerText || elemento.textContent || "";
    texto = texto
      .replace(/[\u200B-\u200D\uFEFF]/g, "")
      .replace(/[\r\n\t]+/g, " ")
      .replace(/\s+/g, " ")
      .replace(/\s+([,.;:!?])/g, "$1")
      .replace(/[•▪◆→▶]/g, " ")
      .trim();
    if (!texto) return "";
    return /[.!?…:]$/.test(texto) ? texto : texto + ".";
  }

  function dividirTexto(texto, limite = 420) {
    if (texto.length <= limite) return [texto];
    const frases = typeof Intl !== "undefined" && Intl.Segmenter
      ? Array.from(new Intl.Segmenter("pt-BR", {granularity: "sentence"}).segment(texto), parte => parte.segment.trim())
      : texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [texto];
    const partes = [];
    let atual = "";
    frases.forEach(frase => {
      frase = frase.trim();
      if (!frase) return;
      if (atual && (atual.length + frase.length + 1 > limite)) {
        partes.push(atual);
        atual = "";
      }
      if (frase.length > limite) {
        const palavras = frase.split(/\s+/);
        palavras.forEach(palavra => {
          if (atual && atual.length + palavra.length + 1 > limite) {
            partes.push(atual);
            atual = "";
          }
          atual += (atual ? " " : "") + palavra;
        });
      } else {
        atual += (atual ? " " : "") + frase;
      }
    });
    if (atual) partes.push(atual);
    return partes;
  }

  function extrairBlocos() {
    const copia = principal.cloneNode(true);
    copia.querySelectorAll([
      "button", "input", "select", "textarea", "form", "nav", "script", "style", "noscript",
      "[hidden]", "[aria-hidden='true']", "[role='status']", ".so-leitor", ".nao-ler", ".fc-orientador"
    ].join(",")).forEach(el => el.remove());

    copia.querySelectorAll("details:not([open])").forEach(el => {
      const resumo = el.querySelector(":scope > summary");
      if (resumo) el.replaceWith(resumo.cloneNode(true));
      else el.remove();
    });

    const candidatos = Array.from(copia.querySelectorAll(seletorBlocos));
    const blocosTexto = candidatos.filter(el => !el.parentElement.closest(seletorBlocos));
    return blocosTexto.flatMap(el => {
      let texto = textoDo(el);
      if (!texto) return [];
      if (el.tagName === "LI" && el.parentElement?.tagName === "OL") {
        const posicao = Array.from(el.parentElement.children).indexOf(el) + 1;
        texto = "Passo " + posicao + ". " + texto;
      }
      const tipo = /^H[1-6]$/.test(el.tagName) ? "titulo" : el.tagName === "LI" ? "item" : "paragrafo";
      return dividirTexto(texto).map(parte => ({texto: parte, tipo}));
    });
  }

  function escolherVoz(fala) {
    const vozes = sintese.getVoices();
    const voz = vozes.find(v => /^pt-BR$/i.test(v.lang)) || vozes.find(v => /^pt/i.test(v.lang));
    if (voz) fala.voice = voz;
  }

  function atualizarControles() {
    if (!lendo) {
      botao.textContent = "▶ Ouvir esta página";
      botao.setAttribute("aria-label", "Ouvir esta página");
      botao.setAttribute("aria-pressed", "false");
      pararBotao.hidden = true;
      return;
    }
    botao.textContent = pausada ? "▶ Continuar leitura" : "⏸ Pausar leitura";
    botao.setAttribute("aria-label", pausada ? "Continuar leitura" : "Pausar leitura");
    botao.setAttribute("aria-pressed", pausada ? "true" : "false");
    pararBotao.hidden = false;
  }

  function concluir(id, mensagem) {
    if (id !== sessao) return;
    clearTimeout(temporizador);
    temporizador = null;
    lendo = false;
    pausada = false;
    atualizarControles();
    status.textContent = mensagem;
  }

  function lerProximo(id) {
    if (id !== sessao || !lendo || pausada) return;
    if (indice >= blocos.length) {
      concluir(id, "Leitura concluída.");
      return;
    }

    const bloco = blocos[indice++];
    const fala = new SpeechSynthesisUtterance(bloco.texto);
    fala.lang = "pt-BR";
    fala.rate = 0.88;
    fala.pitch = 1;
    fala.volume = 1;
    escolherVoz(fala);
    fala.onend = () => {
      if (id !== sessao) return;
      const pausa = bloco.tipo === "titulo" ? 520 : bloco.tipo === "item" ? 260 : 360;
      temporizador = window.setTimeout(() => {
        temporizador = null;
        lerProximo(id);
      }, pausa);
    };
    fala.onerror = evento => {
      if (id !== sessao || evento.error === "canceled" || evento.error === "interrupted") return;
      concluir(id, "A leitura foi interrompida pelo navegador. Você pode tentar novamente.");
    };
    sintese.speak(fala);
  }

  function iniciar() {
    blocos = extrairBlocos();
    if (!blocos.length) {
      status.textContent = "Não encontrei texto visível para ler nesta página.";
      return;
    }
    window.FC?.parar();
    sessao++;
    const id = sessao;
    sintese.cancel();
    indice = 0;
    lendo = true;
    pausada = false;
    atualizarControles();
    status.textContent = "Leitura iniciada. Você pode pausar ou parar quando quiser.";
    lerProximo(id);
  }

  function parar() {
    sessao++;
    clearTimeout(temporizador);
    temporizador = null;
    sintese.cancel();
    lendo = false;
    pausada = false;
    atualizarControles();
    status.textContent = "Leitura parada.";
  }

  botao.addEventListener("click", () => {
    if (!lendo) {
      iniciar();
    } else if (pausada) {
      pausada = false;
      atualizarControles();
      if (sintese.paused) sintese.resume();
      else if (!sintese.speaking) lerProximo(sessao);
      status.textContent = "Leitura continuada.";
    } else {
      pausada = true;
      clearTimeout(temporizador);
      temporizador = null;
      sintese.pause();
      atualizarControles();
      status.textContent = "Leitura pausada.";
    }
  });
  pararBotao.addEventListener("click", parar);
  atualizarControles();
  window.addEventListener("pagehide", () => {
    sessao++;
    clearTimeout(temporizador);
    sintese.cancel();
  });
})();
