/* Filtros da página Vestibulares: tipo, instituição, forma de ingresso, estado, cidade e busca por texto.
   O que vale para todos os estados (ufs: ["BR"]) aparece como "Principal" e continua na lista em qualquer estado ou cidade.
   Quando há filtro ativo, o bloco "Relacionados" mostra opções ligadas aos resultados. Nada é enviado a servidor. */
(function () {
  "use strict";
  const D = window.VESTIBULARES;
  const $ = id => document.getElementById(id);
  const form = $("form-vest");
  if (!D || !form) return;

  const campos = { q: $("f-busca"), tipo: $("f-tipo"), rede: $("f-rede"), forma: $("f-forma"), uf: $("f-estado"), cidade: $("f-cidade") };
  const out = $("resultado"), rel = $("relacionados"), status = $("status-filtro");
  const norm = t => String(t).trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
  const nacional = v => v.ufs.includes("BR");
  const nomeUf = uf => D.UF_NOMES[uf] || uf;
  const porNome = (a, b) => a.localeCompare(b, "pt-BR");
  const simples = lista => lista.map(x => [x, x]);

  function opcoes(sel, pares, todos) {
    const anterior = sel.value;
    sel.replaceChildren(new Option(todos, ""));
    pares.forEach(p => sel.add(new Option(p[0], p[1])));
    if (pares.some(p => p[1] === anterior)) sel.value = anterior;
  }
  function listarEstados() {
    const ufs = [...new Set(D.LISTA.flatMap(v => v.ufs).filter(u => u !== "BR"))].sort((a, b) => porNome(nomeUf(a), nomeUf(b)));
    return [["Principal (vale para todos os estados)", "BR"]].concat(ufs.map(u => [nomeUf(u), u]));
  }
  function listarCidades(uf) {
    const mapa = new Map();
    D.LISTA.forEach(v => v.cidades.forEach(([nome, u]) => {
      if (!uf || u === uf) mapa.set(nome + "|" + u, [uf ? nome : nome + " (" + u + ")", nome + "|" + u]);
    }));
    return [...mapa.values()].sort((a, b) => porNome(a[0], b[0]));
  }
  function ajustarCidades() {
    const uf = campos.uf.value;
    opcoes(campos.cidade, listarCidades(uf === "BR" ? "" : uf), "Todas as cidades");
    campos.cidade.disabled = uf === "BR";
    if (uf === "BR") campos.cidade.value = "";
  }

  const valores = () => ({
    q: norm(campos.q.value), tipo: campos.tipo.value, rede: campos.rede.value,
    forma: campos.forma.value, uf: campos.uf.value, cidade: campos.cidade.value
  });

  function passa(v, f) {
    if (f.tipo && v.tipo !== f.tipo) return false;
    if (f.rede && v.rede !== f.rede) return false;
    if (f.forma && !v.formas.includes(f.forma)) return false;
    if (f.uf === "BR" && !nacional(v)) return false;
    if (f.uf && f.uf !== "BR" && !nacional(v) && !v.ufs.includes(f.uf)) return false;
    if (f.cidade && !nacional(v)) {
      const [nome, u] = f.cidade.split("|");
      const naCidade = v.cidades.some(c => c[0] === nome && c[1] === u);
      if (!naCidade) return false;
    }
    if (f.q) {
      const texto = norm([v.nome, v.resumo, v.entrada, v.tipo, v.rede, v.ufs.map(nomeUf).join(" "), v.cidades.map(c => c[0]).join(" ")].join(" "));
      if (!f.q.split(/\s+/).every(p => texto.includes(p))) return false;
    }
    return true;
  }
  const ordem = (a, b) => (Number(nacional(b)) - Number(nacional(a))) || porNome(a.nome, b.nome);

  function relacionados(achados) {
    const ids = new Set(achados.map(v => v.id)), cont = new Map();
    achados.forEach(v => (v.rel || []).forEach(id => { if (!ids.has(id)) cont.set(id, (cont.get(id) || 0) + 1); }));
    return [...cont.entries()].sort((a, b) => b[1] - a[1])
      .map(par => D.LISTA.find(v => v.id === par[0])).filter(Boolean).slice(0, 4);
  }

  function onde(v) {
    if (nacional(v)) return "Principal: vale para todos os estados.";
    if (v.regional) return "Várias cidades de " + v.ufs.map(nomeUf).join(", ") + ". Confirme se há unidade na sua cidade.";
    const porUf = {};
    v.cidades.forEach(([nome, u]) => { (porUf[u] = porUf[u] || []).push(nome); });
    return Object.keys(porUf).map(u => porUf[u].join(", ") + " (" + u + ")").join("; ");
  }
  const custo = v => v.rede === "Pública" ? "Curso sem mensalidade." : v.rede === "Privada" ? "Curso com mensalidade. Veja também ProUni e Fies." : "";
  function linha(rotulo, texto) {
    const p = el("p"); p.append(el("strong", "", rotulo), document.createTextNode(texto)); return p;
  }
  function cartao(v) {
    const card = el("article", "cartao unid");
    const tags = el("p", "tags");
    tags.append(el("span", "tag", v.tipo), el("span", "tag", v.rede));
    if (nacional(v)) tags.append(el("span", "tag principal", "Principal"));
    else v.ufs.forEach(u => tags.append(el("span", "tag", u)));
    card.append(tags, el("h3", "", v.nome), el("p", "", v.resumo), linha("Onde: ", onde(v)), linha("Como entrar: ", v.entrada));
    if (v.data) card.append(linha("Datas e taxa: ", v.data));
    if (custo(v)) card.append(linha("Custo: ", custo(v)));
    const site = el("a", "btn amarelo", "Site oficial");
    site.href = v.site; site.target = "_blank"; site.rel = "noopener";
    site.setAttribute("aria-label", "Site oficial: " + v.nome + " (abre em outra aba)");
    card.append(site);
    return card;
  }
  function grade(lista) {
    const g = el("div", "grade");
    lista.forEach(v => g.append(cartao(v)));
    return g;
  }

  function mostrar() {
    const f = valores();
    const achados = D.LISTA.filter(v => passa(v, f)).sort(ordem);
    out.replaceChildren();
    rel.replaceChildren();
    status.textContent = achados.length === 1 ? "1 opção encontrada." : achados.length + " opções encontradas.";
    if (achados.length) out.append(grade(achados));
    else out.append(el("p", "aviso", "Nenhum vestibular encontrado com esses filtros. Tire um filtro ou toque em Limpar filtros."));
    const ativo = Object.keys(f).some(k => f[k]);
    const outros = !achados.length ? D.LISTA.filter(nacional) : ativo ? relacionados(achados) : [];
    if (outros.length) {
      rel.append(el("h2", "", achados.length ? "Relacionados" : "Opções principais"), grade(outros));
    }
    const escopoAtual = f.uf === "BR" ? "BR" : f.uf === "SP" ? "SP" : "";
    document.querySelectorAll("[data-escopo]").forEach(b => b.setAttribute("aria-pressed", String(b.dataset.escopo === escopoAtual)));
  }

  opcoes(campos.tipo, simples(D.TIPOS), "Todos os tipos");
  opcoes(campos.rede, simples(D.REDES), "Todas");
  opcoes(campos.forma, simples(D.FORMAS), "Todas as formas");
  opcoes(campos.uf, listarEstados(), "Todos os estados");
  ajustarCidades();

  document.querySelectorAll("[data-escopo]").forEach(botao => botao.addEventListener("click", () => {
    const escopo = botao.dataset.escopo;
    campos.uf.value = escopo === "BR" ? "BR" : escopo === "SP" ? "SP" : "";
    ajustarCidades();
    mostrar();
  }));

  campos.uf.addEventListener("change", () => { ajustarCidades(); mostrar(); });
  [campos.tipo, campos.rede, campos.forma, campos.cidade].forEach(c => c.addEventListener("change", mostrar));
  campos.q.addEventListener("input", mostrar);
  form.addEventListener("submit", ev => { ev.preventDefault(); mostrar(); });
  $("limpar").addEventListener("click", () => { form.reset(); ajustarCidades(); mostrar(); campos.q.focus(); });
  mostrar();
})();
