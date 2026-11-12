/* Dados da página Vestibulares (pages/Vestibulares.html).
   Cada item diz o tipo, a rede (pública ou privada), onde fica, como entrar e o site oficial.
   ufs: ["BR"] significa que vale para todos os estados: a página mostra esse item como "Principal".
   cidades: pares [cidade, UF] dos campi. regional: true quando há unidades em várias cidades do estado.
   Datas, taxas e vagas mudam a cada edição: por isso só o Enem tem data aqui. Nos demais, a página manda consultar o site oficial. */
(function (raiz) {
  "use strict";
  const c = (uf, ...nomes) => nomes.map(n => [n, uf]);
  const PROPRIA = "Prova própria da instituição", ENEM = "Nota do Enem";
  const PUB = "Pública", PRIV = "Privada", GOV = "Governo federal";
  const T = { enem: "Enem e Sisu", bolsa: "Bolsa e financiamento", trad: "Vestibular tradicional", med: "Medicina", tec: "Técnico e tecnológico", mil: "Militar e engenharia" };

  const LISTA = [
    /* ---------- Principais: valem para todos os estados ---------- */
    { id: "enem", nome: "Enem (Exame Nacional do Ensino Médio)", tipo: T.enem, rede: GOV, ufs: ["BR"], cidades: [], formas: [ENEM],
      entrada: "Fazer a prova do Enem. A nota é usada pelo Sisu, pelo ProUni, pelo Fies e por muitas faculdades.",
      resumo: "Prova nacional aplicada pelo Inep. Uma única nota abre portas em universidades públicas, bolsas, financiamento e vagas em faculdades particulares.",
      data: "Em 2026, as provas são nos dias 8 e 15 de novembro. A taxa de inscrição foi de R$ 85, com isenção para quem se encaixa nas regras do edital.",
      site: "https://www.gov.br/inep/pt-br/areas-de-atuacao/avaliacao-e-exames-educacionais/enem", rel: ["sisu", "prouni", "fies"] },
    { id: "sisu", nome: "Sisu (Sistema de Seleção Unificada)", tipo: T.enem, rede: GOV, ufs: ["BR"], cidades: [], formas: [ENEM],
      entrada: "Se inscrever no Sisu em cada edição, escolher os cursos e acompanhar a classificação pela nota do Enem.",
      resumo: "Sistema do MEC que usa a nota do Enem para distribuir vagas em universidades e institutos públicos de todo o país, incluindo vagas reservadas (cotas).",
      data: "O MEC publica o calendário de cada edição (1º e 2º semestres). Consulte o site oficial.",
      site: "https://acessounico.mec.gov.br/", rel: ["enem", "ufabc", "unifesp"] },
    { id: "prouni", nome: "ProUni (Programa Universidade para Todos)", tipo: T.bolsa, rede: GOV, ufs: ["BR"], cidades: [], formas: [ENEM],
      entrada: "Fazer o Enem e se inscrever no ProUni em cada edição, escolhendo o curso e a faculdade.",
      resumo: "Bolsas de estudo de 100% ou de 50% em faculdades particulares, para quem tem renda familiar mais baixa. Em geral é preciso ter estudado em escola pública (ou com bolsa integral em escola particular).",
      data: "Renda, nota mínima e prazos mudam a cada edição. Confira no edital.",
      site: "https://acessounico.mec.gov.br/", rel: ["enem", "fies"] },
    { id: "fies", nome: "Fies (Financiamento Estudantil)", tipo: T.bolsa, rede: GOV, ufs: ["BR"], cidades: [], formas: [ENEM],
      entrada: "Ter feito o Enem e se inscrever no Fies em cada edição.",
      resumo: "Financiamento das mensalidades em faculdades particulares. Para famílias de baixa renda inscritas no CadÚnico existe o Fies Social, com financiamento de 100%.",
      data: "As regras de nota, renda e prazos mudam a cada edital. Confira no site oficial.",
      site: "https://acessounico.mec.gov.br/", rel: ["prouni", "enem"] },

    /* ---------- São Paulo: públicas ---------- */
    { id: "fuvest", nome: "Fuvest (USP)", tipo: T.trad, rede: PUB, ufs: ["SP"], cidades: c("SP", "São Paulo", "Ribeirão Preto", "São Carlos", "Piracicaba", "Bauru", "Pirassununga", "Lorena"), formas: [PROPRIA, ENEM],
      entrada: "Vestibular em duas fases. Parte das vagas também é preenchida pelo Sisu, com a nota do Enem.",
      resumo: "Vestibular da Universidade de São Paulo. A primeira fase tem questões objetivas, e a segunda fase tem provas dissertativas para quem passou na primeira.",
      site: "https://www.fuvest.br/", rel: ["unicamp", "unesp", "sisu"] },
    { id: "unicamp", nome: "Unicamp (Comvest)", tipo: T.trad, rede: PUB, ufs: ["SP"], cidades: c("SP", "Campinas", "Limeira"), formas: [PROPRIA],
      entrada: "Vestibular próprio, organizado pela Comvest.",
      resumo: "Vestibular da Universidade Estadual de Campinas. Tem duas fases, com redação e questões discursivas.",
      site: "https://www.comvest.unicamp.br/", rel: ["fuvest", "unesp"] },
    { id: "unesp", nome: "Unesp (Vunesp)", tipo: T.trad, rede: PUB, ufs: ["SP"],
      cidades: c("SP", "Araçatuba", "Araraquara", "Assis", "Bauru", "Botucatu", "Franca", "Guaratinguetá", "Ilha Solteira", "Jaboticabal", "Marília", "Presidente Prudente", "Rio Claro", "São José do Rio Preto", "São José dos Campos", "São Paulo", "São Vicente", "Sorocaba", "Tupã"),
      formas: [PROPRIA],
      entrada: "Vestibular próprio, organizado pela Vunesp.",
      resumo: "Vestibular da Universidade Estadual Paulista, com primeira e segunda fase e redação.",
      site: "https://www.vunesp.com.br/", rel: ["fuvest", "unicamp"] },
    { id: "ufabc", nome: "UFABC (Universidade Federal do ABC)", tipo: T.enem, rede: PUB, ufs: ["SP"], cidades: c("SP", "Santo André", "São Bernardo do Campo"), formas: [ENEM],
      entrada: "Pelo Sisu, com a nota do Enem.",
      resumo: "Universidade federal com campi em Santo André e São Bernardo do Campo.",
      site: "https://www.ufabc.edu.br/", rel: ["sisu", "unifesp"] },
    { id: "unifesp", nome: "Unifesp (Universidade Federal de São Paulo)", tipo: T.enem, rede: PUB, ufs: ["SP"], cidades: c("SP", "São Paulo", "Guarulhos", "Santos", "São José dos Campos", "Osasco", "Diadema"), formas: [ENEM],
      entrada: "Pelo Sisu, com a nota do Enem.",
      resumo: "Universidade federal conhecida pelos cursos de saúde, com campi em várias cidades paulistas.",
      site: "https://www.unifesp.br/", rel: ["sisu", "ufabc"] },

    /* ---------- São Paulo: ensino técnico e tecnológico ---------- */
    { id: "etec", nome: "Vestibulinho Etec (Centro Paula Souza)", tipo: T.tec, rede: PUB, ufs: ["SP"], cidades: [], regional: true, formas: [PROPRIA],
      entrada: "Vestibulinho (processo seletivo) com inscrição pelo site.",
      resumo: "Escolas técnicas estaduais com ensino médio e cursos técnicos gratuitos. Há processo seletivo, em geral, a cada semestre.",
      site: "https://www.vestibulinhoetec.com.br/", rel: ["fatec", "ifsp"] },
    { id: "fatec", nome: "Vestibular Fatec (Centro Paula Souza)", tipo: T.tec, rede: PUB, ufs: ["SP"], cidades: [], regional: true, formas: [PROPRIA],
      entrada: "Vestibular com inscrição pelo site.",
      resumo: "Faculdades de Tecnologia do estado, com cursos superiores de tecnologia gratuitos. O vestibular costuma ser semestral.",
      site: "https://www.vestibularfatec.com.br/", rel: ["etec", "ifsp"] },
    { id: "ifsp", nome: "IFSP (Instituto Federal de São Paulo)", tipo: T.tec, rede: PUB, ufs: ["SP"], cidades: [], regional: true, formas: [PROPRIA, ENEM],
      entrada: "Cursos técnicos: processo seletivo próprio. Cursos superiores: em geral pelo Sisu.",
      resumo: "Cursos técnicos, tecnológicos e superiores gratuitos, com campi em várias cidades do estado.",
      site: "https://www.ifsp.edu.br/", rel: ["etec", "fatec", "sisu"] },
    /* ---------- São Paulo: particulares ---------- */
    { id: "mackenzie", nome: "Mackenzie (Universidade Presbiteriana)", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "São Paulo", "Barueri"), formas: [PROPRIA, ENEM],
      entrada: "Vestibular próprio ou nota do Enem, conforme o edital.",
      resumo: "Universidade particular tradicional, com campus em São Paulo e em Barueri.",
      site: "https://www.mackenzie.br/", rel: ["pucsp", "umc", "prouni"] },
    { id: "pucsp", nome: "PUC-SP", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "São Paulo"), formas: [PROPRIA, ENEM],
      entrada: "Vestibular próprio ou nota do Enem, conforme o edital.",
      resumo: "Pontifícia Universidade Católica de São Paulo, instituição particular (comunitária).",
      site: "https://www.pucsp.br/", rel: ["mackenzie", "fgv", "prouni"] },
    { id: "fgv", nome: "FGV (Fundação Getulio Vargas)", tipo: T.trad, rede: PRIV, ufs: ["SP", "RJ"], cidades: [...c("SP", "São Paulo"), ...c("RJ", "Rio de Janeiro")], formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Instituição particular com cursos como Administração, Economia e Direito.",
      site: "https://www.fgv.br/", rel: ["insper", "pucsp"] },
    { id: "insper", nome: "Insper", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "São Paulo"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Faculdade particular com cursos como Administração, Economia e Engenharia.",
      site: "https://www.insper.edu.br/", rel: ["fgv", "mackenzie"] },
    { id: "umc", nome: "UMC (Universidade de Mogi das Cruzes)", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "Mogi das Cruzes"), formas: [PROPRIA, ENEM],
      entrada: "Vestibular próprio ou nota do Enem, conforme o edital.",
      resumo: "Universidade particular em Mogi das Cruzes, no Alto Tietê.",
      site: "https://www.umc.br/", rel: ["mackenzie", "prouni", "fmabc"] },
    { id: "fei", nome: "Centro Universitário FEI", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "São Bernardo do Campo", "São Paulo"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Instituição particular conhecida pelos cursos de engenharia, com campi em São Bernardo do Campo e em São Paulo.",
      site: "https://www.fei.edu.br/", rel: ["maua", "ita"] },
    { id: "maua", nome: "Instituto Mauá de Tecnologia (IMT)", tipo: T.trad, rede: PRIV, ufs: ["SP"], cidades: c("SP", "São Caetano do Sul"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Instituição particular de engenharia e administração, em São Caetano do Sul.",
      site: "https://www.maua.br/", rel: ["fei", "ita"] },
    { id: "fmabc", nome: "Medicina FMABC", tipo: T.med, rede: PRIV, ufs: ["SP"], cidades: c("SP", "Santo André"), formas: [PROPRIA],
      entrada: "Vestibular de Medicina próprio.",
      resumo: "Vestibular de Medicina da Faculdade de Medicina do ABC, em Santo André.",
      site: "https://www.fmabc.br/", rel: ["umc", "enem"] },

    /* ---------- Militar e engenharia ---------- */
    { id: "ita", nome: "ITA (Instituto Tecnológico de Aeronáutica)", tipo: T.mil, rede: PUB, ufs: ["SP"], cidades: c("SP", "São José dos Campos"), formas: [PROPRIA],
      entrada: "Vestibular próprio, muito concorrido.",
      resumo: "Engenharia gratuita, em São José dos Campos.",
      site: "https://www.ita.br/", rel: ["ime", "fei"] },
    { id: "ime", nome: "IME (Instituto Militar de Engenharia)", tipo: T.mil, rede: PUB, ufs: ["RJ"], cidades: c("RJ", "Rio de Janeiro"), formas: [PROPRIA],
      entrada: "Concurso de admissão próprio.",
      resumo: "Instituição de engenharia do Exército, com ensino gratuito, no Rio de Janeiro.",
      site: "https://www.ime.eb.br/", rel: ["ita", "uerj"] },

    /* ---------- Outros estados ---------- */
    { id: "uerj", nome: "UERJ (Universidade do Estado do Rio de Janeiro)", tipo: T.trad, rede: PUB, ufs: ["RJ"], cidades: c("RJ", "Rio de Janeiro", "Duque de Caxias", "São Gonçalo", "Nova Friburgo", "Resende"), formas: [PROPRIA],
      entrada: "Vestibular próprio, com primeira e segunda fases.",
      resumo: "Universidade estadual do Rio de Janeiro, com reserva de vagas (cotas).",
      site: "https://www.vestibular.uerj.br/", rel: ["ime", "unb"] },
    { id: "unb", nome: "UnB (Universidade de Brasília): Vestibular e PAS", tipo: T.trad, rede: PUB, ufs: ["DF"], cidades: c("DF", "Brasília"), formas: [PROPRIA],
      entrada: "Vestibular ou PAS (Programa de Avaliação Seriada), em que o estudante faz provas ao longo do ensino médio.",
      resumo: "Universidade federal de Brasília. As provas são organizadas pelo Cebraspe.",
      site: "https://www.cebraspe.org.br/", rel: ["uerj", "ufrgs"] },
    { id: "ufrgs", nome: "UFRGS (Universidade Federal do Rio Grande do Sul)", tipo: T.trad, rede: PUB, ufs: ["RS"], cidades: c("RS", "Porto Alegre"), formas: [PROPRIA],
      entrada: "Vestibular próprio, organizado pela Coperse.",
      resumo: "Universidade federal gaúcha, em Porto Alegre.",
      site: "https://www.ufrgs.br/coperse/", rel: ["ufpr", "ufsc"] },
    { id: "ufpr", nome: "UFPR (Universidade Federal do Paraná)", tipo: T.trad, rede: PUB, ufs: ["PR"], cidades: c("PR", "Curitiba", "Matinhos", "Palotina"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Universidade federal paranaense, com campi em Curitiba, no litoral e no oeste do estado.",
      site: "https://www.nc.ufpr.br/", rel: ["ufsc", "uel", "ufrgs"] },
    { id: "ufsc", nome: "UFSC (Universidade Federal de Santa Catarina)", tipo: T.trad, rede: PUB, ufs: ["SC"], cidades: c("SC", "Florianópolis", "Joinville", "Araranguá", "Blumenau"), formas: [PROPRIA],
      entrada: "Vestibular próprio, organizado pela Coperve.",
      resumo: "Universidade federal catarinense, com campi em Florianópolis e em outras cidades.",
      site: "https://www.coperve.ufsc.br/", rel: ["ufpr", "ufrgs"] },
    { id: "uel", nome: "UEL (Universidade Estadual de Londrina)", tipo: T.trad, rede: PUB, ufs: ["PR"], cidades: c("PR", "Londrina"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Universidade estadual do Paraná, em Londrina.",
      site: "https://www.cops.uel.br/", rel: ["ufpr", "ufsc"] },
    { id: "uece", nome: "UECE (Universidade Estadual do Ceará)", tipo: T.trad, rede: PUB, ufs: ["CE"], cidades: c("CE", "Fortaleza"), formas: [PROPRIA],
      entrada: "Vestibular próprio, com isenção de taxa para quem se encaixa nas regras do edital.",
      resumo: "Universidade estadual cearense, com sede em Fortaleza.",
      site: "https://www.uece.br/", rel: ["uea", "enem"] },
    { id: "uea", nome: "UEA (Universidade do Estado do Amazonas)", tipo: T.trad, rede: PUB, ufs: ["AM"], cidades: c("AM", "Manaus"), formas: [PROPRIA],
      entrada: "Vestibular próprio.",
      resumo: "Universidade estadual do Amazonas, com sede em Manaus.",
      site: "https://www.uea.edu.br/", rel: ["uece", "enem"] }
  ];

  const UF_NOMES = { AM: "Amazonas", CE: "Ceará", DF: "Distrito Federal", PR: "Paraná", RJ: "Rio de Janeiro", RS: "Rio Grande do Sul", SC: "Santa Catarina", SP: "São Paulo" };
  const dados = {
    UF_NOMES: UF_NOMES, LISTA: LISTA,
    TIPOS: [T.enem, T.bolsa, T.trad, T.med, T.tec, T.mil],
    REDES: [PUB, PRIV, GOV],
    FORMAS: [PROPRIA, ENEM]
  };
  raiz.VESTIBULARES = dados;
  if (typeof module !== "undefined") module.exports = dados;
})(typeof window !== "undefined" ? window : globalThis);
