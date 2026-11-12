/* Facilita Cidadão: busca, checklist e assistente feitos com React (sem JSX e sem build). */
(function () {
  "use strict";
  const raiz = document.getElementById("app-servicos");
  if (!raiz) return;
  if (!window.React || !window.ReactDOM) {
    raiz.textContent = "Não foi possível carregar os arquivos necessários. Confira se a pasta assets está junto ao projeto e recarregue a página.";
    return;
  }
  const { useState, useRef, useEffect, createElement: h, Fragment } = React;
  const CATS = ["Saúde", "Assistência social", "Moradia e energia", "Documentos pessoais", "Trabalho", "Previdência", "Educação", "Direitos e justiça"];
  const ICONE = { "Saúde": "saude", "Assistência social": "dinheiro", "Documentos pessoais": "documentos", "Trabalho": "trabalho", "Previdência": "previdencia", "Moradia e energia": "casa", "Educação": "educacao", "Direitos e justiça": "justica" };
  const RESUMO_CAT = { "Saúde": "SUS, consultas e remédios", "Assistência social": "CadÚnico e benefícios", "Moradia e energia": "Casa, luz e gás", "Documentos pessoais": "CPF, identidade e certidões", "Trabalho": "Emprego e seguro-desemprego", "Previdência": "INSS e aposentadoria", "Educação": "Escola e faculdade", "Direitos e justiça": "Defensoria e proteção" };
  const SUGESTOES = ["Golpe", "Vestibular", "Telefone 188", "Ajuda financeira"];

  function ResultadosAjuda({ itens }) {
    if (!itens || !itens.length) return null;
    return h("section", { className: "resultado-ajuda", "aria-labelledby": "t-ajuda-encontrada" },
      h("h2", { id: "t-ajuda-encontrada" }, "Páginas e orientações encontradas"),
      h("div", { className: "grade" }, itens.map(item =>
        h("a", { className: "cartao atalho-ajuda", key: item.titulo, href: item.url },
          h("strong", null, item.titulo), h("span", null, item.descricao), h("span", { className: "atalho-ajuda-link" }, item.paginaDireta ? "Abrir página →" : "Abrir orientação →")))));
  }

  function paginaExata(texto) {
    const consulta = String(texto || "").toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]+/g, " ").trim();
    const paginas = [
      { nomes: ["ajuda", "pagina ajuda", "pagina de ajuda"], titulo: "Abrir a página Ajuda", descricao: "Encontre telefones úteis, canais de atendimento e orientações para saber por onde começar.", url: "ajuda.html" },
      { nomes: ["impacto", "pagina impacto", "ods", "ods do projeto"], titulo: "Abrir a página Impacto", descricao: "Conheça o impacto social do projeto e sua relação com os Objetivos de Desenvolvimento Sustentável.", url: "impacto.html" },
      { nomes: ["inicio", "pagina inicial", "home"], titulo: "Abrir a página inicial", descricao: "Volte aos atalhos e à busca principal do Facilita Cidadão.", url: "../index.html" },
      { nomes: ["servico", "servicos", "pagina servicos", "pagina de servicos"], titulo: "Abrir a página Serviços", descricao: "Pesquise serviços públicos e veja orientações para cada necessidade.", url: "solucao.html" },
      { nomes: ["golpe", "golpes", "fraude", "fraudes"], titulo: "Abrir a página Golpes", descricao: "Veja como reconhecer um golpe, se proteger e denunciar.", url: "Golpes.html" },
      { nomes: ["vestibular", "vestibulares", "enem"], titulo: "Abrir a página Vestibulares", descricao: "Encontre opções de ingresso e materiais para estudar.", url: "Vestibulares.html" },
      { nomes: ["direito", "direitos", "beneficio", "beneficios"], titulo: "Abrir a página Direitos", descricao: "Consulte orientações sobre direitos e benefícios.", url: "direitos.html" },
      { nomes: ["guia", "guias", "orientacoes", "orientacao"], titulo: "Abrir a página Guias", descricao: "Consulte orientações organizadas em passos simples.", url: "guias.html" },
      { nomes: ["atendimento", "unidades", "postos", "servicos perto"], titulo: "Abrir a página Atendimento", descricao: "Pesquise locais de atendimento por cidade ou serviço.", url: "atendimento.html" },
      { nomes: ["equipe", "quem fez o projeto"], titulo: "Abrir a página Equipe", descricao: "Conheça as pessoas responsáveis pelo projeto.", url: "equipe.html" }
    ];
    const pagina = paginas.find(item => item.nomes.includes(consulta));
    return pagina ? { ...pagina, paginaDireta: true, pontos: 100 } : null;
  }

  function combinarResultadosSite(indice, atalhos, texto) {
    const porPagina = new Map();
    [...indice, ...atalhos].forEach(item => {
      const pagina = item.url.split(/[?#]/)[0];
      const atual = porPagina.get(pagina);
      const prioridade = resultado => (resultado.url.includes("#") ? 100 : resultado.url.includes("?") ? 80 : 0) + (resultado.pontos || 0);
      if (!atual || prioridade(item) > prioridade(atual)) porPagina.set(pagina, item);
    });
    const resultados = [...porPagina.values()];
    const direta = paginaExata(texto);
    if (direta) {
      const mesmaPagina = direta.url.replace(/^\.\.\//, "").toLowerCase();
      return [direta, ...resultados.filter(item => item.url.split(/[?#]/)[0].replace(/^\.\.\//, "").toLowerCase() !== mesmaPagina)].slice(0, 8);
    }
    return resultados.slice(0, 8);
  }

  function Servico({ s, pre, marcados, alternar, aberto }) {
    const i = servicos.indexOf(s), total = s.documentos.length;
    const FC = window.FC;
    const feitos = s.documentos.map((_, j) => !!marcados[i + "-" + j]);
    const [falando, setFalando] = useState(false);
    const ativo = useRef(false);
    useEffect(() => () => { if (ativo.current && FC) FC.parar(); }, []);
    const ouvir = () => {
      if (falando) { FC.parar(); return; }
      ativo.current = true; setFalando(true);
      FC.falar(FC.textoFalado(s), () => { ativo.current = false; setFalando(false); });
    };
    const sufixo = h("span", { className: "so-leitor" }, ": " + s.nome);
    const ferramentas = FC && h("div", { className: "ferramentas", role: "group", "aria-label": "Levar este passo a passo" },
      FC.temVoz() && h("button", { type: "button", className: "btn sec", onClick: ouvir }, falando ? "Parar a leitura" : "Ouvir em voz alta", sufixo),
      h("a", { className: "btn sec", href: FC.linkWhatsApp(s, feitos), target: "_blank", rel: "noopener" }, "Enviar por WhatsApp", h("span", { className: "so-leitor" }, " (abre em outra aba)"), sufixo),
      h("button", { type: "button", className: "btn sec", title: "Na janela aberta, escolha ‘Salvar como PDF’.", onClick: () => FC.salvarPdf(s, feitos) }, "Salvar guia como PDF", sufixo));
    const n = s.documentos.filter((_, j) => marcados[i + "-" + j]).length;
    return h("article", { className: "servico" },
      h("div", { className: "servico-topo" },
        h("img", { src: "../assets/img/" + ICONE[s.categoria] + ".svg", alt: "", width: 44, height: 44 }),
        h("div", null, h("h3", null, s.nome), h("span", { className: "tag" }, s.categoria))),
      h("p", null, h("strong", null, "Para quem: "), s.publico),
      (["Atendimento pelo SUS", "Cadastro Único (CadÚnico)", "Bolsa Família", "Defensoria Pública"].includes(s.nome) || s.nome.startsWith("Procon (")) && h("p", null,
        h("a", { href: "atendimento.html?area=" + encodeURIComponent(s.categoria) + (s.nome.startsWith("Procon (") ? "&servico=" + encodeURIComponent("Orientação ao consumidor") : s.nome === "Defensoria Pública" ? "&servico=" + encodeURIComponent("Assistência judiciária") : "") }, s.nome.startsWith("Procon (") ? "Ver endereço do Procon em Suzano" : "Consultar unidades de " + s.categoria.toLowerCase() + " em Suzano")),
      s.nome.startsWith("Psicólogo e saúde mental") && h("p", null,
        h("a", { href: "atendimento.html?area=Sa%C3%BAde&servico=Aten%C3%A7%C3%A3o%20psicossocial" }, "Ver CAPS em Suzano"), " · ",
        h("a", { href: "https://suzano.sp.gov.br/saude/unidades-basicas-de-saude/lista-de-enderecos/", target: "_blank", rel: "noopener" }, "Ver endereços de UBS no site da Prefeitura")),
      s.onde && h("p", null, h("strong", null, "Onde: "), s.onde),
      h(window.FCPlus.UnidadesVinculadas, { s }),
      h("div", { className: "prog-linha" },
        h("progress", { max: total, value: n, "aria-label": "Documentos separados: " + s.nome }),
        h("span", { className: "prog" }, n + " de " + total + " documentos" + (n === total ? " · tudo pronto!" : ""))),
      h("details", { open: aberto },
        h("summary", null, "Ver documentos e passo a passo"),
        h("h4", null, "Documentos: marque o que você já separou"),
        h("ul", { className: "docs" }, s.documentos.map((d, j) => {
          const id = pre + "-" + i + "-" + j;
          return h("li", { key: j }, h("label", { htmlFor: id },
            h("input", { type: "checkbox", id, checked: !!marcados[i + "-" + j], onChange: () => alternar(i + "-" + j) }), d));
        })),
        h("h4", null, "Passo a passo"),
        h("ol", { className: "passos" }, s.etapas.map((e, j) => h("li", { key: j }, e))),
        h("p", null, h("a", { href: s.fonte, target: "_blank", rel: "noopener" }, s.fonteLabel || "Canal oficial (abre em outra aba)")),
        ferramentas));
  }

  function App() {
    const [q, setQ] = useState(new URLSearchParams(location.search).get("q") || "");
    const [cat, setCat] = useState("");
    const [feedbackBusca, setFeedbackBusca] = useState("");
    const [focarResultados, setFocarResultados] = useState(false);
    const [listaServicosAberta, setListaServicosAberta] = useState(true);
    const [conteudoSite, setConteudoSite] = useState([]);
    const [buscandoSite, setBuscandoSite] = useState(false);
    const [consultaIndexada, setConsultaIndexada] = useState("");
    const [marcados, setMarcados] = useState(() => window.FCPlus.lerChecklist());
    const resultados = useRef(null);
    const alternar = k => setMarcados(m => { const proximo = { ...m, [k]: !m[k] }; window.FCPlus.salvarChecklist(proximo); return proximo; });
    const pesquisando = !!q.trim() || !!cat;
    const r = pesquisando ? buscarServicos(servicos, q, cat === "__todos" ? "" : cat) : [];
    const aj = typeof buscarAjuda === "function" ? buscarAjuda(q) : [];
    const conteudoDaConsulta = consultaIndexada === q ? conteudoSite : [];
    const buscandoEstaConsulta = !!q.trim() && (consultaIndexada !== q || buscandoSite);
    const paginasEncontradas = combinarResultadosSite(conteudoDaConsulta, buscandoEstaConsulta ? [] : aj, q);
    const tituloResultados = q.trim() ? "Resultados para: “" + q.trim() + "”" : cat === "__todos" ? "Todos os serviços" : "Serviços da área: " + cat;
    const selecionarTermo = termo => { setQ(termo); setCat(""); setFeedbackBusca(""); setListaServicosAberta(true); setFocarResultados(true); };
    const selecionarCategoria = categoria => { const proxima = cat === categoria ? "" : categoria; setQ(""); setCat(proxima); setFeedbackBusca(""); setListaServicosAberta(true); if (proxima) setFocarResultados(true); };
    useEffect(() => {
      let atual = true;
      if (!q.trim() || typeof buscarConteudoSite !== "function") {
        setConsultaIndexada(q);
        setConteudoSite([]);
        setBuscandoSite(false);
        return () => { atual = false; };
      }
      setConsultaIndexada(q);
      setConteudoSite([]);
      setBuscandoSite(true);
      buscarConteudoSite(q).then(itens => {
        if (!atual) return;
        setConteudoSite(itens);
        setBuscandoSite(false);
      }).catch(() => {
        if (!atual) return;
        setConteudoSite([]);
        setBuscandoSite(false);
      });
      return () => { atual = false; };
    }, [q]);
    useEffect(() => {
      if (new URLSearchParams(location.search).get("q")?.trim()) {
        requestAnimationFrame(() => { if (resultados.current) resultados.current.focus(); });
      }
    }, []);
    useEffect(() => {
      if (focarResultados && pesquisando && resultados.current) {
        resultados.current.focus();
        setFocarResultados(false);
      }
    }, [focarResultados, pesquisando]);
    const confirmarBusca = event => {
      event.preventDefault();
      if (!q.trim() && !cat) {
        setFeedbackBusca("Digite o que você precisa resolver para ver os resultados.");
        document.getElementById("busca")?.focus();
        return;
      }
      setFeedbackBusca("");
      if (resultados.current) resultados.current.focus();
    };
    return h(Fragment, null,
      h("section", { "aria-labelledby": "t-busca" },
        h("h2", { id: "t-busca" }, "Buscar em todo o site"),
        h("form", { className: "cartao busca-servicos-form", role: "search", onSubmit: confirmarBusca },
          h("label", { htmlFor: "busca" }, "O que você quer encontrar?"),
          h("input", { type: "search", id: "busca", value: q, placeholder: "Ex.: golpe, vestibular, direito ou telefone 188", "aria-describedby": feedbackBusca ? "dica-busca feedback-busca" : "dica-busca", "aria-invalid": feedbackBusca ? "true" : undefined, onChange: e => { setQ(e.target.value); setFeedbackBusca(""); setListaServicosAberta(true); } }),
          h("p", { id: "dica-busca", className: "dica-busca" }, "A busca procura serviços e conteúdo de todas as páginas do site. Pressione Enter para ir aos resultados."),
          h("div", { className: "sugestoes-iniciais", role: "group", "aria-label": "Exemplos de busca" },
            h("span", null, "Exemplos:"), SUGESTOES.map(w => h("button", { key: w, type: "button", className: "chip", onClick: () => selecionarTermo(w) }, w))),
          feedbackBusca && h("p", { id: "feedback-busca", className: "feedback-busca", role: "status" }, feedbackBusca),
          h("div", { className: "acoes-busca" },
            h("button", { className: "btn", type: "submit" }, "Ver resultados"),
            (q || cat) && h("button", { type: "button", className: "btn sec limpar-busca", onClick: () => { setQ(""); setCat(""); setFeedbackBusca(""); } }, "Limpar busca"))),
        pesquisando && h("div", { className: "busca-resultados", ref: resultados, tabIndex: -1, "aria-labelledby": "titulo-resultados" },
          h("h2", { id: "titulo-resultados" }, tituloResultados),
          h("p", { className: "resultado-contagem", role: "status", "aria-live": "polite" }, r.length
            ? r.length + (r.length === 1 ? " serviço encontrado." : " serviços encontrados.") + (buscandoEstaConsulta ? " Também estou procurando em todas as páginas do site." : paginasEncontradas.length ? " Também encontrei conteúdo em " + paginasEncontradas.length + (paginasEncontradas.length === 1 ? " página do site." : " páginas do site.") : "")
            : buscandoEstaConsulta ? "Procurando esta palavra em todas as páginas do site…"
              : paginasEncontradas.length ? "Não encontrei um serviço com esse nome. Encontrei " + paginasEncontradas.length + (paginasEncontradas.length === 1 ? " página com conteúdo relacionado." : " páginas com conteúdo relacionado.")
                : "Não encontrei resultados. Tente outra palavra ou uma expressão mais simples."),
          h(ResultadosAjuda, { itens: paginasEncontradas }),
          r.length
            ? h("div", { className: "resultados-servicos", "aria-labelledby": "subtitulo-servicos" },
                h("div", { className: "resultados-cabecalho" },
                  h("h3", { id: "subtitulo-servicos" }, "Serviços encontrados"),
                  h("div", { className: "resultado-acoes" },
                    cat && cat !== "__todos" && h("button", { type: "button", className: "btn sec", onClick: () => { setCat(""); setListaServicosAberta(true); } }, "Escolher outra área"),
                    h("button", { type: "button", className: "btn sec", "aria-expanded": listaServicosAberta, "aria-controls": "lista-servicos", onClick: () => setListaServicosAberta(aberta => !aberta) }, listaServicosAberta ? "Fechar todos os serviços" : "Mostrar todos os serviços (" + r.length + ")"))),
                h("div", { id: "lista-servicos", hidden: !listaServicosAberta },
                  h("div", { className: "grade lista-servicos" }, r.map(s => h(Servico, { key: servicos.indexOf(s), s, pre: "l", marcados, alternar }))))
              )
            : aj.length ? null : h("div", { className: "busca-sem-resultado cartao" },
                h("p", null, "Você pode tentar uma destas palavras:"),
                h("div", { className: "chips" }, SUGESTOES.map(w => h("button", { key: w, type: "button", className: "chip", onClick: () => selecionarTermo(w) }, w)))),
          ),
        h(window.FCPlus.Orientador, { onEscolher: selecionarTermo }),
        h("section", { className: "escolher-area", "aria-labelledby": "t-areas" },
          h("h2", { id: "t-areas" }, "Ou escolha uma área"),
          h("p", null, "Toque em um assunto para ver os serviços relacionados."),
          h("div", { className: "categorias-grade" }, CATS.map(c => {
            const quantidade = servicos.filter(s => s.categoria === c).length;
            return h("button", { key: c, type: "button", className: "categoria-servico", "aria-pressed": cat === c, onClick: () => selecionarCategoria(c) },
            h("img", { src: "../assets/img/" + ICONE[c] + ".svg", alt: "", width: 40, height: 40 }),
            h("span", null, h("strong", null, c), h("small", null, RESUMO_CAT[c]), h("small", { className: "categoria-quantidade" }, quantidade + (quantidade === 1 ? " serviço" : " serviços")), cat === c && h("small", { className: "categoria-selecionada" }, "Área selecionada")));
          })),
          h("button", { className: "btn sec ver-todos", type: "button", "aria-pressed": cat === "__todos", onClick: () => selecionarCategoria("__todos") }, cat === "__todos" ? "Todos os serviços selecionados" : "Ver todos os serviços"))));
  }

  ReactDOM.createRoot(raiz).render(h(App));
})();
