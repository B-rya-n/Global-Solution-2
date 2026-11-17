(function () {
  "use strict";
  /* Tipos úteis para iniciar buscas sem cadastro local verificado. */
  const UNIDADES = [
    { nome: "UPA 24 horas", grupo: "Saúde", busca: "UPA 24 horas", tel: "192 (SAMU), se for grave", quando: "Febre alta, dor forte, corte profundo, fratura ou mal-estar que não pode esperar consulta marcada.", leve: ["Documento com foto", "Cartão SUS, se tiver"] },
    { nome: "Pronto-socorro / hospital", grupo: "Saúde", busca: "pronto socorro hospital", tel: "192 (SAMU)", quando: "Casos graves: falta de ar, dor no peito, acidente, desmaio ou sangramento forte.", leve: ["Documento com foto", "Exames e receitas anteriores"] },
    { nome: "UBS (posto de saúde)", grupo: "Saúde", busca: "UBS unidade básica de saúde", tel: "136 (Disque Saúde)", quando: "Consulta de rotina, vacina, pré-natal, curativo, encaminhamento a especialista e remédios do SUS.", leve: ["Documento com foto", "Caderneta de vacinação", "Comprovante de endereço"] },
    { nome: "CAPS (saúde mental)", grupo: "Saúde", busca: "CAPS centro de atenção psicossocial", tel: "", quando: "Ansiedade, depressão, crises emocionais ou uso problemático de álcool e outras drogas.", leve: ["Documento com foto, se possível"] },
    { nome: "Farmácia Popular", grupo: "Saúde", busca: "Farmácia Popular do Brasil", tel: "136 (Disque Saúde)", quando: "Retirar medicamentos de programa, como os de pressão e diabetes, com receita válida.", leve: ["Documento com foto", "CPF", "Receita médica"] },
    { nome: "CRAS", grupo: "Assistência social", busca: "CRAS centro de referência de assistência social", tel: "121 (MDS)", quando: "Fazer ou atualizar o CadÚnico, pedir orientação sobre Bolsa Família, BPC e outros benefícios.", leve: ["CPF ou documento do responsável", "Documentos de quem mora na casa", "Comprovante de endereço"] },
    { nome: "CREAS", grupo: "Assistência social", busca: "CREAS centro de referência especializado de assistência social", tel: "100 (Direitos Humanos)", quando: "Violência, abandono, maus-tratos ou outra violação de direitos.", leve: ["Documento com foto, se possível"] },
    { nome: "Agência do INSS", grupo: "Previdência", busca: "agência INSS", tel: "135 (INSS)", quando: "Quando não for possível resolver pelo Meu INSS: perícia, documentos originais ou dúvida sobre o pedido.", leve: ["Documento com foto e CPF", "Protocolo do pedido", "Laudos médicos, se houver"] },
    { nome: "Órgão de identificação (RG)", grupo: "Documentos", busca: "instituto de identificação RG carteira de identidade", tel: "", quando: "Primeira via, renovação ou segunda via da carteira de identidade. Em muitos estados é preciso agendar.", leve: ["Certidão de nascimento ou casamento", "CPF", "Comprovante de residência"] },
    { nome: "Cartório de registro civil", grupo: "Documentos", busca: "cartório de registro civil", tel: "", quando: "Certidão de nascimento, casamento ou óbito. A primeira certidão de nascimento é gratuita.", leve: ["Declaração de Nascido Vivo (para bebês)", "Documentos dos pais ou do solicitante"] },
    { nome: "Agência do Trabalhador (Sine)", grupo: "Trabalho", busca: "Sine agência do trabalhador", tel: "158 (Trabalho)", quando: "Vagas, cursos, intermediação de emprego e orientação sobre seguro-desemprego.", leve: ["Documento com foto e CPF", "Carteira de Trabalho"] },
    { nome: "Defensoria Pública", grupo: "Direitos e justiça", busca: "Defensoria Pública", tel: "", quando: "Orientação jurídica gratuita para quem não pode pagar advogado.", leve: ["Documento com foto e CPF", "Comprovante de renda e de residência", "Papéis do caso"] },
    { nome: "Delegacia (Polícia Civil)", grupo: "Direitos e justiça", busca: "delegacia de polícia", tel: "190 (perigo imediato) · 180 (mulher)", quando: "Registrar boletim de ocorrência por furto, roubo, perda de documentos ou violência.", leve: ["Documento com foto", "Dados e provas do ocorrido"] }
  ];
  const GRUPOS = ["Saúde", "Assistência social", "Previdência", "Documentos", "Trabalho", "Direitos e justiça"];
  const $ = id => document.getElementById(id);
  const form = $("form-atend"), sel = $("grupo"), cid = $("cidade"), st = $("status-loc"), out = $("resultado"), err = $("erro-grupo"), btnLoc = $("usar-loc");
  if (!form) return;
  let pos = null;
  GRUPOS.forEach(g => { const o = document.createElement("option"); o.value = g; o.textContent = g; sel.appendChild(o); });

  const el = (tag, cls, txt) => { const e = document.createElement(tag); if (cls) e.className = cls; if (txt) e.textContent = txt; return e; };
  const linkMapa = q => pos
    ? "https://www.google.com/maps/search/" + encodeURIComponent(q) + "/@" + pos.lat + "," + pos.lng + ",14z"
    : "https://www.google.com/maps/search/" + encodeURIComponent(q + " em " + cid.value.trim());

  btnLoc.addEventListener("click", () => {
    if (!navigator.geolocation) { st.textContent = "Seu navegador não permite localização. Digite a sua cidade."; return; }
    st.textContent = "Buscando a sua localização…";
    navigator.geolocation.getCurrentPosition(
      p => { pos = { lat: p.coords.latitude.toFixed(4), lng: p.coords.longitude.toFixed(4) }; st.textContent = "Localização obtida. Ela só é usada para abrir o mapa e não é guardada."; },
      () => { pos = null; st.textContent = "Não foi possível obter a localização. Digite a sua cidade."; },
      { timeout: 10000 });
  });

  const servico = $("servico-local"), bairro = $("bairro-local");
  const norm = texto => texto.trim().toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const todasUnidades = [...unidadesBrasil, ...cadastroSuzano];
  // Índices em memória evitam varrer milhares de registros a cada tecla.
  const cidadesIndexadas = new Map();
  const unidadesPorCidadeEGrupo = new Map();
  for (const unidade of todasUnidades) {
    const chaveCidade = norm(unidade.cidade);
    if (!cidadesIndexadas.has(chaveCidade)) cidadesIndexadas.set(chaveCidade, unidade.cidade);
    const chaveGrupo = chaveCidade + "|" + unidade.grupo;
    if (!unidadesPorCidadeEGrupo.has(chaveGrupo)) unidadesPorCidadeEGrupo.set(chaveGrupo, []);
    unidadesPorCidadeEGrupo.get(chaveGrupo).push(unidade);
  }
  const cidadeOficial = () => {
    const cidade = norm(cid.value).replace(/\s*[,/–-]\s*(ac|al|ap|am|ba|ce|df|es|go|ma|mt|ms|mg|pa|pb|pr|pe|pi|rj|rn|rs|ro|rr|sc|sp|se|to)$/, "").replace(/\s+/g, " ").trim();
    return cidadesIndexadas.get(cidade) || "";
  };
  const doGrupo = () => unidadesPorCidadeEGrupo.get(norm(cidadeOficial()) + "|" + sel.value) || [];
  function opcoes(campo, valores, todos) {
    const anterior = campo.value;
    const unicos = [...new Set(valores)].sort();
    if (campo.tagName === "INPUT") { campo.list.replaceChildren(...unicos.map(v => new Option(v, v))); if (anterior && !unicos.some(v => norm(v) === norm(anterior))) campo.value = ""; return; }
    campo.replaceChildren(new Option(todos, ""), ...unicos.map(v => new Option(v, v)));
    if (unicos.includes(anterior)) campo.value = anterior;
  }
  function atualizar() {
    const locais = doGrupo();
    $("filtros-locais").hidden = !cidadeOficial() || !locais.length;
    opcoes(servico, locais.map(u => u.servico), "Todos os serviços da área");
    opcoes(bairro, locais.filter(u => !servico.value || u.servico === servico.value).map(u => u.bairro), "Todos os bairros cadastrados");
    out.textContent = "Selecione “Mostrar unidades” para consultar.";
  }
  sel.addEventListener("change", atualizar);
  servico.addEventListener("change", atualizar);
  bairro.addEventListener("change", atualizar);
  let timerCidade;
  cid.addEventListener("input", () => {
    window.clearTimeout(timerCidade);
    timerCidade = window.setTimeout(atualizar, 120);
  });
  cid.addEventListener("change", atualizar);
  document.querySelectorAll("[data-cidade]").forEach(botao => {
    botao.addEventListener("click", () => {
      cid.value = botao.dataset.cidade;
      atualizar();
      cid.focus();
      botao.closest("details")?.removeAttribute("open");
    });
  });
  const inicial = new URLSearchParams(location.search);
  if (GRUPOS.includes(inicial.get("area"))) sel.value = inicial.get("area");
  atualizar();
  if (doGrupo().some(u => u.servico === inicial.get("servico"))) {
    servico.value = inicial.get("servico"); atualizar();
  }
  function mostrarLocais() {
    const filtroBairro = norm(bairro.value);
    const lista = doGrupo().filter(u => (!servico.value || u.servico === servico.value) && (!filtroBairro || norm(u.bairro).includes(filtroBairro)));
    const municipio = cidadeOficial();
    const resumo = el("p", "ok");
    resumo.setAttribute("role", "status"); resumo.setAttribute("aria-live", "polite");
    const tamanhoLote = 20; let exibidas = 0;
    const atualizarResumo = () => { resumo.textContent = lista.length + (lista.length === 1 ? " unidade encontrada em " : " unidades encontradas em ") + municipio + ". Exibindo " + exibidas + " de " + lista.length + "."; };
    resumo.tabIndex = -1; out.append(resumo); resumo.focus();
    if (!lista.length) { resumo.textContent = "Nenhuma unidade corresponde a esse serviço ou bairro em " + municipio + ". Remova o filtro de bairro ou consulte o órgão responsável."; return; }
    const grade = el("div", "grade");
    const mais = el("button", "btn sec", ""); mais.type = "button";
    function mostrarProximoLote() {
      lista.slice(exibidas, exibidas + tamanhoLote).forEach(u => {
      const endereco = u.rua + " – " + u.bairro + ", " + u.cidade + " - " + u.uf;
      const card = el("article", "cartao unid");
      card.append(el("span", "tag", u.servico), el("h3", "", u.nome), el("p", "", u.descricao), el("p", "", endereco), el("p", "", u.orientacao));
      if (u.cnes) card.append(el("p", "", "Código CNES: " + u.cnes));
      if (u.telefones && u.telefones.length) {
        const contatos = el("p", ""); contatos.appendChild(el("strong", "", u.cidade === "Suzano" ? "Canal telefônico relacionado (não é contato direto da unidade): " : "Telefone cadastrado: "));
        u.telefones.forEach((telefone, i) => {
          if (i) contatos.appendChild(document.createTextNode(" · "));
          const ligar = el("a", "", telefone); ligar.href = "tel:" + telefone.replace(/\D/g, ""); contatos.appendChild(ligar);
        });
        card.appendChild(contatos);
      } else if (u.telefone) {
        const contatos = el("p", ""); contatos.appendChild(el("strong", "", "Telefone cadastrado no CNES: "));
        const telefone = u.telefone;
        if (/^[+\d\s()./-]{8,}$/.test(telefone)) {
          const ligar = el("a", "", telefone); ligar.href = "tel:" + telefone.replace(/\D/g, ""); contatos.appendChild(ligar);
        } else contatos.appendChild(document.createTextNode(telefone));
        card.appendChild(contatos);
      }
      const fonte = el("a", "", "Consultar fonte oficial"); fonte.href = u.fonte; fonte.target = "_blank"; fonte.rel = "noopener";
      const rota = el("a", "btn amarelo", "Abrir rota"); const url = new URL("https://www.google.com/maps/dir/");
      url.searchParams.set("api", "1"); url.searchParams.set("destination", endereco);
      if (pos) url.searchParams.set("origin", pos.lat + "," + pos.lng);
      rota.href = url.href; rota.target = "_blank"; rota.rel = "noopener";
      const linha = el("p"); linha.append(fonte); card.append(linha, rota); grade.append(card);
    });
      exibidas = Math.min(exibidas + tamanhoLote, lista.length); atualizarResumo();
      if (exibidas < lista.length) mais.textContent = "Mostrar mais unidades (" + (lista.length - exibidas) + ")";
      else { mais.remove(); resumo.focus(); }
    }
    if (lista.length > tamanhoLote) { out.append(grade, mais); mais.addEventListener("click", mostrarProximoLote); }
    else out.appendChild(grade);
    mostrarProximoLote();
  }

  form.addEventListener("submit", ev => {
    ev.preventDefault();
    err.textContent = ""; sel.removeAttribute("aria-invalid"); cid.removeAttribute("aria-invalid"); out.textContent = "";
    if (!sel.value) { err.textContent = "Escolha o tipo de atendimento que você procura."; sel.setAttribute("aria-invalid", "true"); sel.focus(); return; }
    if (!pos && cid.value.trim().length < 2) { err.textContent = "Digite o nome da sua cidade ou use o botão de localização."; cid.setAttribute("aria-invalid", "true"); cid.focus(); return; }
    if (cidadeOficial() && doGrupo().length) { mostrarLocais(); return; }
    out.append(el("p", "aviso", "O site ainda não tem endereços verificados para esta cidade. Os resultados do mapa são externos e não confirmam disponibilidade, funcionamento ou vínculo com o serviço público."));
    const lista = UNIDADES.filter(u => u.grupo === sel.value);
    const topo = el("p", "ok", lista.length + " tipos de unidade para pesquisar " + (pos ? "perto da localização informada" : "em " + cid.value.trim()) + ". Use “Ver no mapa” e confirme os dados com o órgão responsável.");
    topo.setAttribute("role", "status");
    out.appendChild(topo);
    if (sel.value === "Saúde") {
      const fonte = el("p", "aviso", "Para consultar o cadastro nacional de unidades de saúde, use os filtros “Município” e “Atende SUS: Sim” no CNES. Confirme se a unidade oferece o serviço que você procura.");
      const link = el("a", "", "Abrir consulta oficial do CNES"); link.href = "https://cnes.datasus.gov.br/pages/estabelecimentos/consulta.jsp"; link.target = "_blank"; link.rel = "noopener";
      fonte.append(document.createTextNode(" "), link); out.appendChild(fonte);
    }
    const grade = el("div", "grade");
    lista.forEach(u => {
      const c = el("article", "cartao unid");
      c.appendChild(el("h3", "", u.nome));
      c.appendChild(el("span", "tag", u.grupo));
      const q = el("p"); q.appendChild(el("strong", "", "Quando procurar: ")); q.appendChild(document.createTextNode(u.quando)); c.appendChild(q);
      c.appendChild(el("h4", "", "O que pode ajudar a levar"));
      c.appendChild(el("p", "", "Esta lista é uma referência. Documentos e critérios variam; confirme com o órgão responsável."));
      const ul = el("ul"); u.leve.forEach(l => ul.appendChild(el("li", "", l))); c.appendChild(ul);
      if (u.tel) { const t = el("p", "tel"); t.appendChild(el("strong", "", "Canal telefônico relacionado (não é contato direto da unidade): ")); t.appendChild(document.createTextNode(u.tel)); c.appendChild(t); }
      const a = el("a", "btn amarelo", "Ver no mapa");
      a.href = linkMapa(u.busca); a.target = "_blank"; a.rel = "noopener";
      c.appendChild(a);
      grade.appendChild(c);
    });
    out.appendChild(grade);
    topo.setAttribute("tabindex", "-1"); topo.focus();
  });
})();
