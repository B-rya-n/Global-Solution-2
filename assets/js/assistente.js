/* Assistente virtual do Facilita Cidadão (React, sem JSX e sem build).
   Entende o contexto da conversa e responde com base nos serviços de dados.js.
   Em todas as páginas aparece no mesmo botão flutuante. */
(function () {
  "use strict";
  if (!window.React || !window.ReactDOM || typeof servicos === "undefined" || typeof buscarServicos === "undefined") return;
  /* A assistente roda no index.html (raiz) e nas páginas dentro de pages/: ajusta o prefixo dos links. */
  const PAGINAS = /\/pages\/[^/]*$/.test(location.pathname) ? "" : "pages/";
  const { useState, useRef, useEffect, createElement: h, Fragment } = React;
  const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const CATS = servicos.map(s => s.categoria).filter((c, i, a) => a.indexOf(c) === i);
  const CATS_N = CATS.map(norm);
  const URGENTE = /(socorro|infarto|desmai|sangr|suicid|me matar|morrer|agred|violenc|abus|estupr|ameac)/;
  const DOC = /(quais documentos|que documentos|o que (preciso )?levar|levar)/;
  const PASSO = /(passo a passo|como faco|como fazer|primeiro passo|etapas)/;
  const ONDE = /(onde fica|onde vou|onde ir|onde procuro|endereco|perto de mim|mais perto)/;
  const CUSTO = /(quanto custa|preciso pagar|e pago|e gratis|e gratuito|tem taxa|custo)/;
  const GOLPE = /(golpe|fraude|falso|cobraram|cobrando|me pediu senha|pix.*(suspeit|golpe|fraude|roub))/;
  const IDENT = /(quem e voce|voce e (uma |um )?(robo|pessoa|humano|humana)|como voce funciona|o que voce faz)/;
  const TEL = [["192", "SAMU: urgência médica"], ["190", "Polícia Militar"], ["193", "Bombeiros"], ["180", "Atendimento à Mulher"], ["100", "Direitos Humanos"], ["188", "CVV: apoio emocional, gratuito e 24 horas"], ["135", "INSS"], ["136", "Disque Saúde"], ["121", "CadÚnico e Bolsa Família"], ["158", "Seguro-desemprego"], ["(11) 4744-7322", "Procon Suzano: defesa do consumidor (atendimento local)"]];
  const SUG = ["Preciso de atendimento médico", "Perdi meus documentos", "Fiquei desempregado", "Preciso de ajuda financeira", "O que é inclusão digital?"];
  const REF_SUG = ["O que é o ODS 11?", "O que é inclusão digital?", "Preciso de ajuda financeira"];
  /* Perguntas gerais sobre os temas do site: cidades para todos, inclusão digital, zona rural e ODS 11. */
  const REF = [
    { re: /(\bods\b|objetivo de desenvolvimento|cidades e comunidades|\bonu\b|nacoes unidas|agenda 2030)/,
      texto: "O ODS 11, um dos Objetivos de Desenvolvimento Sustentável, propõe tornar as cidades e os assentamentos humanos inclusivos, seguros, resilientes e sustentáveis. Entre as suas 10 metas estão moradia e serviços básicos para todos e transporte acessível, com atenção a idosos e pessoas com deficiência. O Facilita Cidadão ajuda você a chegar a esses serviços, como Minha Casa, Minha Vida, tarifa social de energia e gratuidade no transporte para quem tem 65 anos ou mais." },
    { re: /(cidades? inteligentes?|smart cit|cidade para todos|cidades para todos)/,
      texto: "Uma cidade inteligente de verdade é aquela em que a tecnologia serve às pessoas: ela deve promover inclusão, sustentabilidade e direitos, sem deixar para trás quem ainda está fora do mundo digital. Por isso este site usa linguagem simples, passo a passo e não pede cadastro." },
    { re: /(agricultura|agricola|vilas? digita|zona rural|area rural|moro no campo|roca)/,
      texto: "Quem mora na zona rural nem sempre tem boa internet: existe uma distância digital entre o campo e a cidade, e por isso os serviços precisam de atendimento presencial e por telefone. Enquanto isso, você pode ligar para as centrais (135 INSS, 121 CadÚnico e Bolsa Família, 136 saúde, 158 trabalho), procurar o CRAS ou a prefeitura e pedir ajuda a uma pessoa de confiança. Nunca passe sua senha para ninguém.", sug: ["Telefones úteis", "Preciso de ajuda financeira", "Atendimento de saúde"] },
    { re: /(transformacao digital|inclusao digital|exclusao digital)/,
      texto: "Inclusão digital é garantir que todas as pessoas consigam usar a tecnologia e acessar serviços, inclusive idosos, pessoas com deficiência, mulheres, jovens e quem vive longe dos centros urbanos. A transformação digital só é justa quando é pensada para incluir desde o início, com as pessoas no centro. Por isso o site tem letra ajustável, alto contraste e navegação por teclado, e indica também atendimento presencial e telefones." }
  ];
  const bot = o => Object.assign({ de: "bot" }, o);

  function responder(t, ult) {
    const n = norm(t);
    if (URGENTE.test(n)) return bot({ urgente: true, texto: "Se alguém corre perigo agora, ligue 190 (Polícia) ou 192 (SAMU). Para apoio emocional, ligue 188 (CVV). Para violência contra a mulher, ligue 180.", link: [PAGINAS + "ajuda.html#emergencia", "Ver outros telefones de ajuda"] });
    if (/^(oi|ola|bom dia|boa tarde|boa noite|e ai)\b/.test(n) && n.length < 20) return bot({ texto: "Olá! Do que você precisa hoje?", sug: SUG });
    if (/(obrigad|valeu)/.test(n)) return bot({ texto: "De nada! Se precisar de mais alguma coisa, é só escrever.", sug: SUG });
    if (GOLPE.test(n)) return bot({ texto: "Pare o contato e não envie dinheiro, senhas ou códigos. Se já houve prejuízo, fale com o banco pelo canal oficial e guarde as mensagens e comprovantes.", link: [PAGINAS + "Golpes.html", "Ver próximos passos contra golpes"] });
    if (/(vestib|faculdade|enem|sisu|prouni|fies|fatec|etec|ifsp)/.test(n)) return bot({ texto: "Posso ajudar a encontrar opções de ingresso e materiais de estudo. Confira sempre prazos e vagas no edital oficial.", link: [PAGINAS + "Vestibulares.html", "Buscar vestibulares e materiais"] });
    if (/(telefone|ligar|numero|central|contato)/.test(n)) return bot({ texto: "Estes são os telefones mais úteis:", tel: true });
    if (IDENT.test(n)) return bot({ texto: "Sou a assistente virtual do Facilita Cidadão. Posso ajudar a encontrar serviços e orientações deste site. A conversa fica no seu navegador. Não compartilhe senhas, códigos, CPF ou dados bancários.", sug: SUG });
    for (let i = 0; i < REF.length; i++) if (REF[i].re.test(n)) return bot({ texto: REF[i].texto, sug: REF[i].sug || REF_SUG });
    if (ult) {
      if (DOC.test(n)) return bot({ texto: "Para " + ult.nome + ", leve:", servico: ult, parte: "docs" });
      if (PASSO.test(n)) return bot({ texto: "Passo a passo para " + ult.nome + ":", servico: ult, parte: "passos" });
      if (ONDE.test(n)) return bot({ texto: "Onde procurar " + ult.nome + ":", servico: ult, parte: "onde" });
      if (CUSTO.test(n)) return bot({ texto: "Os serviços desta lista não cobram intermediários, e quem pedir dinheiro para ajudar no pedido merece desconfiança. Alguns documentos podem ter taxa do estado: confira no canal oficial.", servico: ult, parte: "link" });
    }
    const r = buscarServicos(servicos, t);
    if (!r.length) {
      const paginas = typeof buscarAjuda === "function" ? buscarAjuda(t) : [];
      if (paginas.length) return bot({ texto: paginas[0].descricao + " Posso entender sua frase de outra forma; confira se esta página corresponde ao que você precisa.", link: [PAGINAS + paginas[0].url, paginas[0].titulo], sug: paginas.slice(1, 3).map(p => p.titulo) });
      return bot({ texto: "Ainda não encontrei essa informação. Tente uma palavra simples, como “golpe”, “remédio” ou “documento”, ou abra a busca do site.", link: [PAGINAS + "solucao.html", "Pesquisar serviços e orientações"], sug: ["Saúde", "Documentos", "Ajuda"] });
    }
    if (n.split(/\s+/).length === 1 && r.length > 5 && !CATS_N.includes(n)) {
      const temas = r.map(s => s.categoria).filter((c, i, a) => a.indexOf(c) === i).slice(0, 4);
      if (temas.length > 1) return bot({ texto: "Posso ajudar de vários jeitos. Seu caso é sobre qual tema?", sug: temas });
    }
    const s = r[0];
    const observacao = s.nome.startsWith("Reclame Aqui")
      ? " O Reclame Aqui é privado; a empresa pode não responder. Para ajuda pública, veja o Procon ou o Consumidor.gov.br."
      : " Confirme regras e horários no canal indicado antes de ir.";
    return bot({ texto: "Entendi. Na área de " + s.categoria.toLowerCase() + ", o que mais combina é " + s.nome + "." + observacao, servico: s, parte: "tudo", sug: r.slice(1, 4).map(x => x.nome).concat(["Quais documentos preciso levar?"]) });
  }

  function Cartao({ s, parte }) {
    const FC = window.FC;
    const [falando, setFalando] = useState(false);
    const ativo = useRef(false);
    useEffect(() => () => { if (ativo.current && FC) FC.parar(); }, []);
    const ouvir = () => {
      if (falando) { FC.parar(); return; }
      ativo.current = true; setFalando(true);
      FC.falar(FC.textoFalado(s), () => { ativo.current = false; setFalando(false); });
    };
    const sufixo = h("span", { className: "so-leitor" }, ": " + s.nome);
    const mostrar = FC && (parte === "tudo" || parte === "passos" || parte === "docs");
    const ferramentas = mostrar && h("div", { className: "ferramentas", role: "group", "aria-label": "Levar este passo a passo" },
      FC.temVoz() && h("button", { type: "button", className: "btn sec", onClick: ouvir }, falando ? "Parar a leitura" : "Ouvir em voz alta", sufixo),
      h("a", { className: "btn sec", href: FC.linkWhatsApp(s, []), target: "_blank", rel: "noopener" }, "Enviar por WhatsApp", h("span", { className: "so-leitor" }, " (abre em outra aba)"), sufixo),
      h("button", { type: "button", className: "btn sec", title: "Na janela aberta, escolha ‘Salvar como PDF’.", onClick: () => FC.salvarPdf(s, []) }, "Salvar guia como PDF", sufixo));
    const p = parte, docs = h("p", { key: "d" }, h("strong", null, "Leve: "), s.documentos.join("; ") + ".");
    const passos = h("ol", { key: "p", className: "passos" }, s.etapas.map((e, i) => h("li", { key: i }, e)));
    const onde = h("p", { key: "o" }, h("strong", null, "Onde: "), s.onde);
    const buscaLocal = s.nome.startsWith("Psicólogo e saúde mental")
      ? "?area=" + encodeURIComponent("Saúde") + "&servico=" + encodeURIComponent("Atenção psicossocial")
      : s.nome.startsWith("Procon (")
        ? "?area=" + encodeURIComponent("Direitos e justiça") + "&servico=" + encodeURIComponent("Orientação ao consumidor")
        : "";
    const textoLocal = s.nome.startsWith("Psicólogo e saúde mental") ? "Ver CAPS em Suzano" : s.nome.startsWith("Procon (") ? "Ver Procon Suzano" : "Unidade perto de você";
    const links = h("p", { key: "l" }, h("a", { href: s.fonte, target: "_blank", rel: "noopener" }, s.fonteLabel || "Canal oficial (abre em outra aba)"), " · ", h("a", { href: PAGINAS + "atendimento.html" + buscaLocal }, textoLocal));
    const partes = p === "docs" ? [docs] : p === "passos" ? [passos] : p === "onde" ? [onde, links] : p === "link" ? [links] : [onde, docs, passos, links];
    return h("div", { className: "cartao" }, h("h4", null, s.nome), partes, ferramentas);
  }

  function Chat({ foco }) {
    const [msgs, setMsgs] = useState([bot({ texto: "Olá! Sou a assistente virtual do Facilita Cidadão. Conte o que você precisa, com as suas palavras. Depois você pode perguntar, por exemplo, quais documentos levar ou como fazer.", sug: SUG })]);
    const [v, setV] = useState(""), [pensando, setPensando] = useState(false);
    const log = useRef(null), ult = useRef(null), campo = useRef(null);
    useEffect(() => { if (log.current) log.current.scrollTop = log.current.scrollHeight; }, [msgs, pensando]);
    useEffect(() => { if (foco && campo.current) campo.current.focus(); }, [foco]);
    const enviar = t => {
      t = t.trim(); if (!t || pensando) return;
      setMsgs(m => m.concat([{ de: "eu", texto: t }])); setV(""); setPensando(true);
      setTimeout(() => { const r = responder(t, ult.current); if (r.servico) ult.current = r.servico; setMsgs(m => m.concat([r])); setPensando(false); }, 500);
    };
    return h("div", { className: "chat" },
      h("p", { className: "aviso aviso-assistente" }, "Sou uma assistente automática que busca por palavras neste site e posso não entender toda frase. A conversa fica no seu navegador. Não informe senhas, códigos, CPF ou dados bancários; confirme orientações no canal oficial."),
      h("div", { className: "chat-log", ref: log, role: "log", "aria-live": "polite", "aria-label": "Conversa com a assistente virtual" },
        msgs.map((m, i) => h("div", { key: i, className: "msg " + m.de },
          h("p", { className: "bolha" + (m.de === "eu" ? " eu" : "") + (m.urgente ? " urgente" : "") }, m.texto),
          m.servico && h(Cartao, { s: m.servico, parte: m.parte }),
          m.tel && h("ul", { className: "cartao tel-lista" }, TEL.map(x => h("li", { key: x[0] }, h("a", { href: "tel:" + x[0].replace(/\D/g, "") }, h("strong", null, x[0])), " · " + x[1]))),
          m.link && h("p", null, h("a", { href: m.link[0] }, m.link[1])),
          m.sug && i === msgs.length - 1 && !pensando && h("div", { className: "chips" }, m.sug.map(x => h("button", { key: x, type: "button", className: "chip", onClick: () => enviar(x) }, x))))),
        pensando && h("p", { className: "bolha digitando", role: "status" }, "Digitando…")),
      h("form", { className: "chat-form", noValidate: true, onSubmit: ev => { ev.preventDefault(); enviar(v); } },
        h("label", { htmlFor: "chat-msg", className: "so-leitor" }, "Escreva a sua pergunta"),
        h("input", { id: "chat-msg", type: "text", ref: campo, value: v, placeholder: "Ex.: preciso de um remédio", autoComplete: "off", onChange: e => setV(e.target.value) }),
        h("button", { className: "btn", type: "submit" }, "Enviar")));
  }

  /* Botão flutuante com painel, usado em todas as páginas. */
  function Flutuante() {
    const [aberto, setAberto] = useState(false);
    const botao = useRef(null);
    useEffect(() => {
      if (!aberto) return;
      const f = e => { if (e.key === "Escape") { setAberto(false); if (botao.current) botao.current.focus(); } };
      document.addEventListener("keydown", f);
      return () => document.removeEventListener("keydown", f);
    }, [aberto]);
    return h(Fragment, null,
      h("div", { id: "painel-assistente", className: "painel-chat", role: "dialog", "aria-label": "Assistente virtual", hidden: !aberto },
        h("div", { className: "painel-topo" },
          h("strong", null, "Assistente virtual"),
          h("button", { type: "button", className: "btn sec", onClick: () => { setAberto(false); if (botao.current) botao.current.focus(); } }, "Fechar")),
        h(Chat, { foco: aberto })),
      h("button", { ref: botao, type: "button", className: "fab", "aria-expanded": aberto, "aria-controls": "painel-assistente", onClick: () => setAberto(a => !a) }, aberto ? "Fechar assistente" : "Assistente virtual"));
  }

  const no = document.createElement("div");
  no.id = "assistente-flutuante";
  document.body.appendChild(no);
  ReactDOM.createRoot(no).render(h(Flutuante));
})();
