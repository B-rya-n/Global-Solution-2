/* Tela "Tenho direito?" (React, sem JSX e sem build). As regras ficam em assets/js/direitos-dados.js.
   O que a pessoa escreve fica só no navegador: nada é enviado nem guardado. */
(function () {
  "use strict";
  const raiz = document.getElementById("app-direitos");
  if (!raiz) return;
  if (!window.React || !window.ReactDOM || !window.DIREITOS) {
    raiz.textContent = "Não foi possível carregar os arquivos necessários. Confira se a pasta assets está junto ao projeto e recarregue a página.";
    return;
  }
  const { useState, useRef, useEffect, createElement: h, Fragment } = React;
  const D = window.DIREITOS;

  const IDADES = [["0-17", "Menos de 18 anos"], ["18-29", "De 18 a 29 anos"], ["30-54", "De 30 a 54 anos"], ["55-59", "De 55 a 59 anos"], ["60-64", "De 60 a 64 anos"], ["65+", "65 anos ou mais"]];
  /* Situações em grupos. Cada chave vira uma resposta em D.avaliar (assets/js/direitos-dados.js). */
  const GRUPOS_SIT = [
    { titulo: "Saúde e deficiência", itens: [
      ["tea", "Autismo (TEA), com laudo ou diagnóstico"],
      ["defic", "Deficiência (física, visual, auditiva, intelectual ou mental)"],
      ["doenca", "Doença ou condição de saúde que impede de trabalhar"],
      ["tratamento", "Preciso de remédio contínuo, exames, cirurgia ou tratamento especializado"]
    ] },
    { titulo: "Trabalho e renda", itens: [
      ["desemp", "Desempregado(a) depois de ser demitido(a) sem justa causa"],
      ["informal", "Trabalho por conta própria ou sem carteira assinada (autônomo, MEI, bico)"],
      ["domestico", "Trabalho como empregado(a) doméstico(a)"],
      ["rural", "Trabalho na roça, na agricultura familiar ou na pesca artesanal"],
      ["donacasa", "Cuido da própria casa e da família, sem renda própria"],
      ["dividas", "Estou com dívidas em atraso ou com o nome sujo"]
    ] },
    { titulo: "Família e filhos", itens: [
      ["gest", "Gestante ou com filho recém-nascido"],
      ["pai", "Vou ser pai, fui pai há pouco tempo ou adotei uma criança"],
      ["filhos14", "Tenho filho(a) de até 14 anos"],
      ["crianca6", "Há criança de até 6 anos na família"],
      ["pensao", "Preciso pedir ou cobrar pensão alimentícia para filho(a)"],
      ["luto", "Perdi alguém da família que contribuía para o INSS"],
      ["orfao", "Criança ou adolescente que ficou órfã(o) por feminicídio"],
      ["preso", "Alguém da família que contribuía para o INSS está preso"],
      ["violencia", "Sofro violência em casa (física, psicológica, sexual, ameaças ou controle do dinheiro)"]
    ] },
    { titulo: "Estudos", itens: [
      ["estud", "Estudante do ensino médio público ou que vai fazer o Enem"],
      ["faculdade", "Quero entrar ou já estou na faculdade ou em curso técnico"]
    ] },
    { titulo: "Moradia e situação de vida", itens: [
      ["semcasa", "Não tenho casa própria"],
      ["reforma", "Minha casa precisa de reforma, ampliação ou melhorias"],
      ["semescritura", "Moro em imóvel sem escritura ou sem registro"],
      ["desastre", "Perdi casa ou bens por enchente, deslizamento, incêndio ou outro desastre"],
      ["rua", "Estou em situação de rua"],
      ["tradicional", "Sou indígena, quilombola ou de comunidade tradicional"]
    ] },
    { titulo: "Benefícios que já recebo", itens: [
      ["recebebpc", "Já recebo o BPC"],
      ["aposentado", "Já sou aposentado(a) ou pensionista do INSS"]
    ] }
  ];
  const SIMNAO = [["sim", "Sim"], ["nao", "Não"], ["nsei", "Não sei"]];
  const ROTULO = { provavel: "Parece que há direito", possivel: "Vale conferir", improvavel: "Pode não se aplicar agora" };
  const TITULO = { provavel: "Parece que há direito", possivel: "Vale conferir", improvavel: "Pode não se aplicar agora, pela renda" };
  const AVISO = { provavel: "O perfil e a renda informados combinam com as regras.", possivel: "Falta confirmar algum detalhe com o órgão responsável.", improvavel: "Com as respostas dadas, a regra geral não se encaixa. Veja o motivo em cada item." };

  function Radios({ nome, legenda, opcoes, valor, onChange, erro }) {
    return h("fieldset", { className: erro ? "campo-erro" : "", "aria-describedby": erro ? "erro-" + nome : undefined },
      h("legend", null, legenda),
      erro && h("p", { className: "erro", id: "erro-" + nome }, h("span", { className: "so-leitor" }, "Erro: "), erro),
      h("div", { className: "opcoes" }, opcoes.map((o, i) =>
        h("label", { key: o[0], htmlFor: nome + "-" + i },
          h("input", { type: "radio", name: nome, id: nome + "-" + i, value: o[0], checked: valor === o[0], onChange: () => onChange(o[0]) }), o[1]))));
  }

  function Resultado({ r }) {
    const grupo = n => r[n].length > 0 && h("section", { key: n, "aria-labelledby": "g-" + n },
      h("h3", { id: "g-" + n }, TITULO[n] + " (" + r[n].length + ")"),
      h("p", { className: "fonte" }, AVISO[n]),
      h("div", { className: "grade" }, r[n].map(i =>
        h("article", { key: i.id, className: "cartao direito" },
          h("p", null, h("span", { className: "nivel " + n }, ROTULO[n])),
          h("h4", null, i.nome),
          h("p", null, i.resumo),
          h("p", null, h("strong", null, "Por que aparece aqui: ")),
          h("ul", null, i.porque.map((t, k) => h("li", { key: k }, t))),
          h("details", null,
            h("summary", null, "Como pedir", h("span", { className: "so-leitor" }, ": " + i.nome)),
            h("ol", { className: "passos" }, i.como.map((t, k) => h("li", { key: k }, t))),
            h("p", null, h("strong", null, "O que levar:")),
            h("ul", null, i.leve.map((t, k) => h("li", { key: k }, t))),
            h("p", null, h("a", { href: i.fonte, target: "_blank", rel: "noopener" }, "Canal oficial", h("span", { className: "so-leitor" }, " de " + i.nome + " (abre em outra aba)")))),
          i.negado && h("p", null, h("a", { href: "#advogado" }, "Se for negado: como conseguir um advogado gratuito"))))));
    return h(Fragment, null,
      h("p", { className: "ok" }, "Renda por pessoa da casa: " + D.real(r.pc) + " por mês."),
      r.total === 0 && h("div", { className: "cartao" },
        h("p", null, "Com as respostas dadas, não encontramos direitos específicos. Isso não quer dizer que não existam: a renda e a situação da família podem ter regras que este guia não cobre."),
        h("p", null, h("a", { href: "atendimento.html" }, "Ver o CRAS e outras unidades perto de você"), " · ", h("a", { href: "solucao.html" }, "Buscar um serviço"))),
      grupo("provavel"), grupo("possivel"), grupo("improvavel"));
  }

  function App() {
    const [v, setV] = useState({ idade: "", sit: {}, pessoas: "", renda: "", cad: "", inss: "" });
    const [erros, setErros] = useState({});
    const [res, setRes] = useState(null);
    const resumo = useRef(null), saida = useRef(null), titulo = useRef(document.title);
    useEffect(() => { document.title = (Object.keys(erros).length ? "Erro: " : "") + titulo.current; }, [erros]);
    const set = (k, val) => setV(a => Object.assign({}, a, { [k]: val }));
    const alternar = k => setV(a => Object.assign({}, a, { sit: Object.assign({}, a.sit, { [k]: !a.sit[k] }) }));

    const enviar = ev => {
      ev.preventDefault();
      const e = {};
      if (!v.idade) e.idade = "Escolha a faixa de idade da pessoa.";
      const textoPessoas = String(v.pessoas).trim();
      const pessoasValido = /^\d+$/.test(textoPessoas);
      const pessoas = pessoasValido ? Number(textoPessoas) : NaN;
      if (!(Number.isInteger(pessoas) && pessoas >= 1 && pessoas <= 30)) e.pessoas = "Escreva um número inteiro de 1 a 30 para indicar quantas pessoas moram na casa.";
      const renda = D.lerValor(v.renda);
      if (isNaN(renda)) e.renda = "Escreva a soma da renda mensal de todos da casa, em reais. Se não há renda, escreva 0.";
      if (!v.cad) e.cad = "Escolha uma opção sobre o CadÚnico.";
      if (!v.inss) e.inss = "Escolha uma opção sobre carteira assinada ou INSS.";
      setErros(e);
      if (Object.keys(e).length) { setRes(null); setTimeout(() => resumo.current && resumo.current.focus(), 0); return; }
      setRes(D.avaliar(Object.assign({ idade: v.idade, pessoas: pessoas, renda: renda, cad: v.cad, inss: v.inss }, v.sit)));
      setTimeout(() => saida.current && saida.current.focus(), 0);
    };
    const irPara = (ev, id) => { ev.preventDefault(); const el = document.getElementById(id); if (el) el.focus(); };
    const alvo = { idade: "idade-0", pessoas: "pessoas", renda: "renda", cad: "cad-0", inss: "inss-0" };
    const ids = Object.keys(erros);
    const campo = (id, rotulo, dica, props) => h("div", { className: erros[id] ? "campo-erro" : "" },
      h("label", { htmlFor: id }, rotulo),
      h("p", { className: "fonte", id: "dica-" + id }, dica),
      erros[id] && h("p", { className: "erro", id: "erro-" + id }, h("span", { className: "so-leitor" }, "Erro: "), erros[id]),
      h("input", Object.assign({ id: id, type: "text", inputMode: "numeric", autoComplete: "off", value: v[id], onChange: e => set(id, e.target.value), "aria-invalid": !!erros[id], "aria-describedby": (erros[id] ? "erro-" + id + " " : "") + "dica-" + id }, props)));

    return h(Fragment, null,
      h("form", { className: "cartao", noValidate: true, onSubmit: enviar },
        ids.length > 0 && h("div", { className: "resumo-erro", role: "alert", tabIndex: -1, ref: resumo },
          h("h3", null, "Há um problema"),
          h("ul", null, ids.map(id => h("li", { key: id }, h("a", { href: "#" + alvo[id], onClick: ev => irPara(ev, alvo[id]) }, erros[id]))))),
        h(Radios, { nome: "idade", legenda: "Qual é a idade da pessoa que precisa do direito?", opcoes: IDADES, valor: v.idade, onChange: x => set("idade", x), erro: erros.idade }),
        h("fieldset", null,
          h("legend", null, "Marque tudo o que combina com a situação (pode não marcar nenhuma)"),
          GRUPOS_SIT.map(g => h("fieldset", { key: g.titulo, className: "grupo-sit" },
            h("legend", null, g.titulo),
            h("div", { className: "opcoes" }, g.itens.map(s =>
              h("label", { key: s[0], htmlFor: "sit-" + s[0] },
                h("input", { type: "checkbox", id: "sit-" + s[0], checked: !!v.sit[s[0]], onChange: () => alternar(s[0]) }), s[1])))))),
        campo("pessoas", "Quantas pessoas moram na casa, contando a própria pessoa?", "Use um número inteiro. Exemplo: 4"),
        campo("renda", "Quanto a casa recebe por mês, somando todas as pessoas?", "Some salários, benefícios e outras rendas, em reais. Exemplo: 1.800. Se não há renda, escreva 0."),
        h(Radios, { nome: "cad", legenda: "A família está no Cadastro Único (CadÚnico)?", opcoes: SIMNAO, valor: v.cad, onChange: x => set("cad", x), erro: erros.cad }),
        h(Radios, { nome: "inss", legenda: "A pessoa já trabalhou com carteira assinada ou contribui para o INSS?", opcoes: SIMNAO, valor: v.inss, onChange: x => set("inss", x), erro: erros.inss }),
        h("p", { className: "fonte" }, "Suas respostas ficam só neste aparelho. Não pedimos nome, CPF nem laudo. Cada resposta ajuda a conferir até " + D.total + " direitos e auxílios."),
        h("p", null, h("button", { className: "btn", type: "submit" }, "Ver meus direitos"))),
      res && h("section", { "aria-labelledby": "t-res", className: "resultado-direitos" },
        h("h2", { id: "t-res", tabIndex: -1, ref: saida }, res.total === 0 ? "Resultado" : "Resultado: " + res.total + (res.total === 1 ? " possibilidade encontrada" : " possibilidades encontradas")),
        h("p", { className: "aviso" }, "Este resultado é uma orientação inicial. Quem decide é o órgão responsável (INSS, CRAS, prefeitura, escola etc.). Regras e valores mudam: confirme no canal oficial."),
        h(Resultado, { r: res })));
  }

  ReactDOM.createRoot(raiz).render(h(App));
})();
