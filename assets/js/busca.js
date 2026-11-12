(function (raiz) {
  "use strict";
  const norm = t => String(t).toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "");
  const ignorar = ["quero", "preciso", "gostaria", "conseguir", "fazer", "saber", "onde", "como", "para", "minha", "meu", "sobre", "com", "uma", "que", "por", "dos", "das", "de", "da", "do", "em", "no", "na", "um", "os", "as", "ao", "se", "me", "ou", "eu", "ir", "ja", "so", "tem", "ter"];
  const palavras = t => norm(t).split(/[^a-z0-9]+/).filter(Boolean);

  /* Devolve os serviços que combinam com o texto, do mais ao menos relevante. */
  function buscarServicos(lista, texto, cat) {
    const base = lista.filter(s => !cat || s.categoria === cat);
    /* Termos genéricos devem levar à página de orientação, não a dezenas de serviços sem relação direta. */
    const termos = palavras(texto).filter(t => t.length > 1 && !ignorar.includes(t) && !["ajuda", "impacto"].includes(t));
    if (!termos.length) return String(texto || "").trim() ? [] : base;
    const pts = s => {
      const ws = palavras([s.nome, s.categoria, s.publico, s.palavras].join(" "));
      return termos.filter(t => ws.some(w => w.startsWith(t) || (w.length > 4 && t.startsWith(w)))).length;
    };
    return base.filter(s => pts(s) > 0).sort((a, b) => pts(b) - pts(a));
  }

  /* Índice de páginas e assuntos para que a busca também encontre conteúdo fora de Serviços. */
  const atalhosAjuda = [
    { titulo: "Reconhecer sinais de golpe e se proteger", descricao: "Veja pedidos suspeitos, links falsos e formas de confirmar uma mensagem.", url: "Golpes.html#sinais", termos: "golpe golpes fraude fraudador falso roubo banco senha codigo link mensagem whatsapp boleto premio pix proteger segurança seguranca sinais suspeito" },
    { titulo: "Caí em um golpe: o que fazer agora", descricao: "Veja os passos para falar com o banco, guardar provas e registrar a ocorrência.", url: "Golpes.html#fui-vitima", termos: "golpe vítima vitima cai caí perdi dinheiro transferi paguei pix banco contestar devolucao devolução med bloquear conta prova comprovante boletim ocorrencia ocorrência denuncia denunciar" },
    { titulo: "Escolher o próximo passo após um golpe", descricao: "Indique o que aconteceu e veja uma orientação inicial, sem enviar dados pessoais.", url: "Golpes.html#orientador-golpe", termos: "golpe questionario formulário formulario mensagem ligação ligacao cliquei link passei senha dados pix enviei dinheiro vítima vitima orientar" },
    { titulo: "Tipos comuns de golpes", descricao: "Conheça golpes de falso funcionário, link falso, benefício e emprego.", url: "Golpes.html#tipos", termos: "golpe tipos falso funcionário funcionario banco emprego emprestimo empréstimo beneficio benefício premio prêmio link site falso" },
    { titulo: "Canais oficiais para pedir ajuda sobre golpes", descricao: "Consulte as orientações do Banco Central e do Ministério da Justiça.", url: "Golpes.html#fontes", termos: "golpe ajuda banco central ministerio justiça ministério delegacia virtual denuncia boletim pix oficial" },

    { titulo: "Vestibulares e formas de ingresso", descricao: "Pesquise Enem, Sisu, ProUni, Fies e vestibulares por estado, cidade ou instituição.", url: "Vestibulares.html#titulo-oportunidades", termos: "vestibular vestibulares faculdade curso estudar estudo enem sisu prouni fies etec fatec ifsp universidade prova ensino superior inscrição inscricao ingresso" },
    { titulo: "Plano simples para começar a estudar", descricao: "Organize a preparação com edital, prova anterior e revisão dos assuntos difíceis.", url: "Vestibulares.html#titulo-plano", termos: "estudo estudar plano rotina cronograma preparação preparacao vestibular prova edital revisão revisao começar comecar" },
    { titulo: "Materiais gratuitos para estudar", descricao: "Encontre provas anteriores do Enem e da Fatec, livros digitais do MEC e guia de redação.", url: "Vestibulares.html#titulo-preparo", termos: "livros gratuitos grátis gratis material estudar enem prova gabarito fatec mec biblioteca digital redação redacao redação acessível acessivel" },

    { titulo: "Telefones de emergência", descricao: "Encontre os números da Polícia, do SAMU e dos Bombeiros.", url: "ajuda.html#emergencia", termos: "urgente emergencia emergência socorro telefone telefones ligar samu policia polícia bombeiro incendio incêndio violência violencia risco perigo 190 192 193" },
    { titulo: "Apoio emocional e saúde mental", descricao: "Veja como ligar gratuitamente para o CVV ou procurar atendimento pelo SUS.", url: "ajuda.html#titulo-cvv", termos: "telefone telefone 188 cvv psicologo psicóloga psicologia saúde mental ansiedade depressao depressão tristeza apoio emocional suicidio suicídio caps terapia conversar" },
    { titulo: "Outros telefones públicos de ajuda", descricao: "Consulte canais do INSS, SUS, programas sociais, trabalho e direitos humanos.", url: "ajuda.html#telefones", termos: "telefone telefones 100 121 135 136 158 180 inss sus trabalho cadunico bolsa familia direitos humanos disque ligar" },
    { titulo: "Estou sem internet ou não sei por onde começar", descricao: "Veja opções de ajuda presencial e como pedir apoio a alguém de confiança.", url: "ajuda.html#titulo-sem-internet", termos: "sem internet pouca internet rural longe centro não sei comecar começar ajuda pessoa confiança presencial cras prefeitura ubs" },

    { titulo: "Encontrar atendimento perto de você", descricao: "Pesquise unidades de saúde, CRAS e outros locais por cidade ou bairro.", url: "atendimento.html", termos: "atendimento perto proximidade endereço endereco bairro cidade cep mapa posto unidade cras ubs upa hospital farmacia farmácia presencial local" },
    { titulo: "Reclamar de uma compra ou empresa", descricao: "Encontre o serviço de defesa do consumidor e compare canais públicos e privados.", url: "solucao.html?q=consumidor", termos: "procon consumidor consumidor.gov reclame aqui reclamação reclamacao compra cobrança cobranca empresa produto serviço servico" },
    { titulo: "Tenho direito a algum benefício?", descricao: "Responda perguntas simples sobre auxílios, benefícios e direitos.", url: "direitos.html", termos: "direito direitos beneficio benefícios auxílio auxilio bpc loas aposentadoria idoso deficiência deficiencia renda baixa assistência assistencia pensao pensão bolsa família" },
    { titulo: "Como conseguir orientação jurídica gratuita", descricao: "Veja como procurar a Defensoria Pública e o que fazer se não puder atender.", url: "direitos.html#secao-advogado", termos: "advogado advogada gratuito grátis gratis defensoria assistência juridica jurídica justiça justiça processo defensor direito legal" },
    { titulo: "Orientações para situações do dia a dia", descricao: "Siga passos para desemprego, gravidez, documentos perdidos, doença, renda baixa e outras situações.", url: "guias.html", termos: "guia guias passo passos orientação orientacao desemprego demissão demissao gravidez gestante bebê bebe filho documento perdi perdido idoso idosa aposentar adoeci doença doenca baixa renda familia família falecimento luto rural internet" },
    { titulo: "Perdi meus documentos", descricao: "Veja como agir após perda ou roubo de identidade, CPF, carteira de trabalho ou certidão.", url: "guias.html", termos: "documento documentos perdi perda roubo furto identidade rg cpf certidao certidão carteira trabalho segunda via" },
    { titulo: "Fiquei desempregado(a)", descricao: "Veja os primeiros passos sobre seguro-desemprego, carteira digital e busca de trabalho.", url: "guias.html", termos: "desemprego desempregado desempregada demitido demitida demissão demissao seguro desemprego carteira trabalho sine emprego" },
    { titulo: "Minha família tem renda baixa", descricao: "Veja como atualizar o CadÚnico e procurar orientação sobre programas sociais.", url: "guias.html", termos: "renda baixa pobre cadunico cadastro unico cras bolsa família familia energia gás gas tarifa social benefício benefício pé de meia" },
    { titulo: "Conhecer os ODS e o impacto do projeto", descricao: "Veja a relação do projeto com inclusão, redução das desigualdades e cidades sustentáveis.", url: "impacto.html#t-ods2", termos: "impacto projeto ods 10 11 3 sustentabilidade desigualdade cidade dados fonte resultados objetivo onu desenvolvimento sustentável sustentavel" },
    { titulo: "Como o site ajuda na acessibilidade", descricao: "Conheça recursos de leitura, contraste, navegação por teclado e linguagem simples.", url: "impacto.html#t-inclusao", termos: "acessibilidade acessível acessivel deficiência deficiencia idoso idosos leitura voz contraste teclado inclusão inclusao digital linguagem simples" },
    { titulo: "Não sei por onde começar", descricao: "Escolha um assunto e encontre um caminho de ajuda.", url: "ajuda.html#titulo-caminhos", termos: "ajuda começar comecar nao não sei dúvida duvida perdido perdida informação informacao orientação orientacao" },
    { titulo: "Conhecer a equipe", descricao: "Veja quem está por trás do protótipo Facilita Cidadão.", url: "equipe.html", termos: "equipe integrantes grupo autores estudantes desenvolvedores quem fez pessoas rm" },
    { titulo: "Acesso rápido aos principais assuntos", descricao: "Volte à página inicial para escolher uma necessidade comum.", url: "../index.html#t-rapido", termos: "inicio início começo principal home atalhos acesso rápido rapido assunto começar começar" }
  ];

  /* Procura em páginas, seções e assuntos do site, além dos serviços cadastrados. */
  function buscarAjuda(texto) {
    const termos = [...new Set(palavras(texto).filter(t => t.length > 1 && !ignorar.includes(t)))];
    if (!termos.length) return [];
    const pontuacao = item => {
      const titulo = palavras(item.titulo);
      const descricao = palavras(item.descricao);
      const chaves = palavras(item.termos);
      let pontos = 0, encontrados = 0;
      termos.forEach(termo => {
        const peso = (lista, exato, prefixo) => lista.some(chave => chave === termo) ? exato
          : lista.some(chave => chave.startsWith(termo) || (termo.length > 4 && termo.startsWith(chave))) ? prefixo : 0;
        const melhor = Math.max(peso(titulo, 6, 4), peso(descricao, 3, 2), peso(chaves, 2, 1));
        if (melhor) { encontrados++; pontos += melhor; }
      });
      if (encontrados === termos.length) pontos += 2;
      return {pontos, encontrados};
    };
    return atalhosAjuda.map(item => ({ ...item, ...pontuacao(item) }))
      .filter(item => item.pontos > 0 && item.encontrados >= Math.min(2, termos.length))
      .sort((a, b) => b.pontos - a.pontos)
      .slice(0, 5);
  }

  const PAGINAS_SITE = [
    "../index.html", "ajuda.html", "atendimento.html", "direitos.html", "equipe.html",
    "Golpes.html", "guias.html", "impacto.html", "solucao.html", "Vestibulares.html"
  ];
  let indiceSitePromise;

  function textoDoNo(no) {
    if (no.nodeType === 3) return no.nodeValue || "";
    if (no.nodeType !== 1 || no.matches("script,style,noscript,button,input,select,textarea,[hidden],[aria-hidden='true'],.so-leitor,.assistente-flutuante")) return "";
    const bloco = /^(ADDRESS|ARTICLE|BLOCKQUOTE|BR|DD|DIV|DL|DT|FIELDSET|FIGCAPTION|FORM|H[1-6]|LI|OL|P|SECTION|SUMMARY|TABLE|TR|UL)$/.test(no.tagName);
    return (bloco ? " " : "") + Array.from(no.childNodes, textoDoNo).join("") + (bloco ? " " : "");
  }

  function carregarIndiceSite() {
    if (indiceSitePromise) return indiceSitePromise;
    indiceSitePromise = Promise.all(PAGINAS_SITE.map(async pagina => {
      try {
        const resposta = await fetch(pagina, {credentials: "same-origin"});
        if (!resposta.ok) return [];
        const html = await resposta.text();
        const documento = new DOMParser().parseFromString(html, "text/html");
        const principal = documento.querySelector("main");
        if (!principal) return [];
        const tituloPagina = (documento.querySelector("title")?.textContent || pagina).trim();
        const textos = [{
          url: pagina,
          titulo: tituloPagina,
          tituloPagina,
          texto: textoDoNo(principal).replace(/\s+/g, " ").trim()
        }];
        principal.querySelectorAll("h1,h2,h3,h4,h5,h6").forEach(cabecalho => {
          const recipiente = cabecalho.closest("section,article,details") || cabecalho.parentElement;
          if (!recipiente || recipiente === principal) return;
          const fragmento = cabecalho.id || recipiente.id;
          textos.push({
            url: pagina + (fragmento ? "#" + encodeURIComponent(fragmento) : ""),
            titulo: (cabecalho.innerText || cabecalho.textContent || "").trim(),
            tituloPagina,
            texto: textoDoNo(recipiente).replace(/\s+/g, " ").trim()
          });
        });
        return textos.filter(item => item.texto.length > 20);
      } catch (_) {
        return [];
      }
    })).then(grupos => {
      const dinamicos = [];
      (raiz.VESTIBULARES?.LISTA || []).forEach(item => dinamicos.push({
        url: "Vestibulares.html#resultado",
        titulo: item.nome,
        tituloPagina: "Vestibulares e formas de ingresso",
        texto: [item.nome, item.tipo, item.rede, (item.ufs || []).join(" "), (item.cidades || []).map(c => c[0]).join(" "), (item.formas || []).join(" "), item.entrada, item.resumo, item.data].filter(Boolean).join(". ")
      }));
      (raiz.DIREITOS?.itens || []).forEach(item => dinamicos.push({
        url: "direitos.html",
        titulo: item.nome,
        tituloPagina: "Direitos e benefícios",
        texto: [item.nome, item.tema, item.resumo, ...(item.leve || []), ...(item.como || [])].filter(Boolean).join(". ")
      }));
      const unidades = typeof cadastroSuzano !== "undefined" ? cadastroSuzano : [];
      unidades.forEach(item => dinamicos.push({
        url: "atendimento.html",
        titulo: item.nome,
        tituloPagina: "Unidades de atendimento em Suzano",
        texto: [item.nome, item.servico, item.grupo, item.rua, item.bairro, item.descricao, item.orientacao].filter(Boolean).join(". ")
      }));
      const indexLocal = Array.isArray(raiz.FCIndiceSite) ? raiz.FCIndiceSite : [];
      return [...grupos.flat(), ...indexLocal, ...dinamicos];
    });
    return indiceSitePromise;
  }

  function resumoEncontrado(texto, termos) {
    const frases = texto.match(/[^.!?]+[.!?]+|[^.!?]+$/g) || [texto];
    const melhor = frases.map(frase => ({
      frase: frase.trim(),
      pontos: termos.reduce((n, termo) => n + (palavras(frase).some(p => p === termo || p.startsWith(termo)) ? 1 : 0), 0)
    })).sort((a, b) => b.pontos - a.pontos)[0]?.frase || texto;
    return melhor.length > 190 ? melhor.slice(0, 187).trimEnd() + "…" : melhor;
  }

  async function buscarConteudoSite(texto) {
    const termos = [...new Set(palavras(texto).filter(t => t.length > 1 && !ignorar.includes(t)))];
    if (!termos.length) return [];
    const documentos = await carregarIndiceSite();
    const encontrados = [];
    documentos.forEach(documento => {
      const titulo = palavras(documento.titulo);
      const tituloPagina = palavras(documento.tituloPagina);
      const corpo = palavras(documento.texto);
      let pontos = 0, correspondencias = 0;
      termos.forEach(termo => {
        const peso = lista => lista.some(p => p === termo) ? 5
          : lista.some(p => p.startsWith(termo) || (p.length >= 4 && termo.length > 4 && termo.startsWith(p))) ? 2 : 0;
        const maior = Math.max(peso(titulo), peso(tituloPagina) - 2, peso(corpo));
        if (maior > 0) { correspondencias++; pontos += maior; }
      });
      if (correspondencias < Math.min(2, termos.length)) return;
      if (correspondencias === termos.length) pontos += 3;
      encontrados.push({
        titulo: documento.titulo,
        descricao: resumoEncontrado(documento.texto, termos),
        url: documento.url,
        pontos,
        correspondencias
      });
    });

    const porPagina = new Map();
    encontrados.sort((a, b) => b.correspondencias - a.correspondencias || b.pontos - a.pontos || (a.url.includes("#") ? -1 : 1));
    encontrados.forEach(item => {
      const pagina = item.url.split("#")[0];
      if (!porPagina.has(pagina)) porPagina.set(pagina, item);
    });
    return [...porPagina.values()].slice(0, 8);
  }

  raiz.buscarServicos = buscarServicos;
  raiz.buscarAjuda = buscarAjuda;
  raiz.buscarConteudoSite = buscarConteudoSite;
  if (typeof module !== "undefined") module.exports = { buscarServicos, buscarAjuda, buscarConteudoSite };
})(typeof window !== "undefined" ? window : globalThis);
