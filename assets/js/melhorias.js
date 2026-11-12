/* Complementos da busca do Facilita Cidadão. Usa os dados oficiais já cadastrados. */
(function (raiz) {
  'use strict';
  const R = raiz.React;
  if (!R) return;
  const {createElement: h, useState} = R;
  const cadastro = typeof cadastroSuzano !== 'undefined' ? cadastroSuzano : [];
  const normalizar = texto => String(texto || '').toLowerCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  const grupos = [
    {padrao: /defensoria|advogado/i, tipos: ['Assistência judiciária'], aviso: 'A unidade cadastrada é da OAB, não uma unidade da Defensoria Pública. Confirme como funciona a triagem e se atende ao seu caso.'},
    {padrao: /procon/i, tipos: ['Orientação ao consumidor']},
    {padrao: /cadastro unico|cadunico|bolsa familia|beneficio de prestacao|gas do povo/i, tipos: ['Orientação social'], aviso: 'O CRAS orienta sobre cadastro e benefícios. Não garante a concessão do benefício.'},
    {padrao: /psicologo|saude mental/i, tipos: ['Atenção psicossocial', 'Atenção básica']},
    {padrao: /atendimento pelo sus|cartao nacional de saude|vacinacao/i, tipos: ['Atenção básica', 'Pronto atendimento']},
    {padrao: /urgencia: samu/i, tipos: [], aviso: 'Em emergência médica, ligue 192. Não dependa de pesquisa de unidades.'}
  ];
  function unidadesDoServico(servico) {
    const nome = normalizar(servico.nome);
    const tipo = grupos.find(g => g.padrao.test(nome));
    return tipo ? {unidades: cadastro.filter(u => tipo.tipos.includes(u.servico)), aviso: tipo.aviso || ''} : {unidades: [], aviso: ''};
  }
  function infoAgendamento(servico) {
    const nome = normalizar(servico.nome);
    if (nome.includes('defensoria')) return 'Primeiro passo: verifique a triagem e os canais de agendamento da Defensoria Pública do seu estado. A OAB da lista é outro tipo de atendimento.';
    if (nome.includes('procon')) return 'Primeiro passo: guarde protocolos e comprovantes; confirme horário, senha e necessidade de agendamento no Procon.';
    if (nome.includes('cadastro unico') || nome.includes('bolsa familia')) return 'Primeiro passo: consulte o CRAS que atende seu território e confirme como realizar ou atualizar o CadÚnico.';
    if (nome.includes('sus') || nome.includes('vacinacao') || nome.includes('psicologo')) return 'Primeiro passo: confirme a UBS de referência e se é necessário agendar. Urgências exigem outro fluxo de atendimento.';
    if (nome.includes('rg') || nome.includes('identidade')) return 'Primeiro passo: consulte o órgão de identificação do seu estado e veja se precisa agendar.';
    if (nome.includes('inss') || nome.includes('aposentadoria') || nome.includes('bpc')) return 'Primeiro passo: veja o serviço no Meu INSS ou ligue 135; algumas etapas exigem agendamento.';
    return 'Agendamento: verifique no canal oficial se há atendimento online ou necessidade de marcar horário antes de ir.';
  }
  // Registro editável de conferência manual. Nunca preencha uma data sem checar a fonte.
  // Exemplo de preenchimento pelos responsáveis pelo conteúdo:
  // servicos: { 'Nome exato': {data: 'AAAA-MM-DD', status: 'confirmado'} }
  // unidades: { 'Nome exato da unidade': {data: 'AAAA-MM-DD', status: 'confirmado'} }
  // Enquanto não existir registro, a interface informa que a validação está pendente.
  const conferencias = {servicos: {}, unidades: {}};
  function dataLegivel(valor) {
    const m = /^(\d{4})-(\d{2})-(\d{2})$/.exec(valor || '');
    if (!m) return 'não registrada';
    const dt = new Date(valor + 'T12:00:00Z');
    return !Number.isNaN(dt.valueOf()) && dt.toISOString().slice(0, 10) === valor
      ? m[3] + '/' + m[2] + '/' + m[1] : 'não registrada';
  }
  function situacaoConferencia(registro) {
    return registro && registro.status === 'confirmado' && dataLegivel(registro.data) !== 'não registrada'
      ? 'Conferido em ' + dataLegivel(registro.data)
      : 'Conferência pendente · última verificação não registrada';
  }
  function dadosAgendamento(s) {
    const nome = normalizar(s.nome);
    if (/consumidor\.gov|fala\.br/.test(nome))
      return {agenda: 'O registro é feito na plataforma; não é necessário agendar uma visita para iniciar.', online: 'Sim, pela plataforma indicada.'};
    if (/aposentadoria|inss|bpc|beneficio de prestacao/.test(nome))
      return {agenda: 'Depende do serviço; confirme no Meu INSS ou pelo 135.', online: 'Sim, há serviços disponíveis no Meu INSS.'};
    if (/enem|prouni/.test(nome))
      return {agenda: 'Há períodos próprios de inscrição; consulte as datas oficiais.', online: 'Sim, a inscrição é feita pela plataforma oficial.'};
    if (/cadastro unico|bolsa familia/.test(nome))
      return {agenda: 'Consulte a unidade de referência e confirme se precisa agendar.', online: 'A disponibilidade do procedimento online não foi conferida.'};
    return {agenda: 'Não confirmado; confira no órgão responsável antes de se deslocar.',
      online: 'Disponibilidade não verificada.'};
  }
  function PainelAgendamento({s}) {
    const dados = dadosAgendamento(s);
    return h('div', {className:'fc-agendamento'},
      h('h4', null, 'Atendimento e agendamento'),
      h('p', null, h('strong', null, 'É preciso agendar? '), dados.agenda),
      h('p', null, h('strong', null, 'Atendimento online: '), dados.online),
      h('p', null, h('strong', null, 'Primeiro passo: '), infoAgendamento(s)),
      s.fonte && h('p', null, h('strong', null, 'Canal informado: '),
        h('a', {href:s.fonte, target:'_blank', rel:'noopener noreferrer'}, 'Consultar endereço eletrônico indicado no cadastro')),
      h('small', {className:'fc-muted'}, 'Orientações gerais. Confirme requisitos e disponibilidade diretamente no canal indicado.'));
  }
  function PainelVerificacao({s}) {
    const registro = conferencias.servicos[s.nome] || null;
    const confirmado = !!(registro && registro.status === 'confirmado' && dataLegivel(registro.data) !== 'não registrada');
    return h('p', {className: 'fc-verificacao', 'aria-label':'Confiabilidade das informações'},
      h('strong', null, 'Informações do serviço: '),
      confirmado ? 'conferidas na fonte em ' + dataLegivel(registro.data)
        : 'oriundas do cadastro do projeto; última verificação não registrada.',
      h('span', {className: 'fc-status', title:'Estado da conferência da fonte'},
        confirmado ? 'Fonte conferida' : 'Verificação pendente'));
  }
  const ENDPOINT = 'https://nominatim.openstreetmap.org/search';
  const coordenadas = new Map();
  let proximaConsulta = Promise.resolve();
  // Consultas geocodificam ENDEREÇOS PÚBLICOS, nunca enviam a localização pessoal.
  function geocodificar(u) {
    const endereco = [u.rua, u.bairro, 'Suzano', 'SP', 'Brasil'].join(', ');
    if (coordenadas.has(endereco)) return Promise.resolve(coordenadas.get(endereco));
    const consulta = async () => {
      await new Promise(resolve => setTimeout(resolve, 1100)); // uso moderado da API pública
      try {
        const url = new URL(ENDPOINT);
        url.searchParams.set('q', endereco);
        url.searchParams.set('format', 'json');
        url.searchParams.set('limit', '1');
        const resp = await fetch(url.toString(), {headers: {'Accept': 'application/json'}});
        if (!resp.ok) throw new Error('Geocodificação indisponível');
        const dados = await resp.json();
        const p = dados[0] ? {lat: Number(dados[0].lat), lon: Number(dados[0].lon)} : null;
        coordenadas.set(endereco, p);
        return p;
      } catch (_) { return null; }
    };
    proximaConsulta = proximaConsulta.then(consulta, consulta);
    return proximaConsulta;
  }
  function distanciaKm(a, b) {
    const r = Math.PI / 180, dLat = (b.lat - a.lat) * r, dLon = (b.lon - a.lon) * r;
    const sin = Math.sin(dLat/2)**2 + Math.cos(a.lat*r)*Math.cos(b.lat*r)*Math.sin(dLon/2)**2;
    return 6371 * 2 * Math.atan2(Math.sqrt(sin), Math.sqrt(1 - sin));
  }
  function urlRota(u, origem) {
    const url = new URL('https://www.google.com/maps/dir/');
    url.searchParams.set('api', '1');
    url.searchParams.set('destination', [u.rua, u.bairro, 'Suzano - SP'].join(', '));
    if (origem) url.searchParams.set('origin', origem.lat + ',' + origem.lon);
    return url.toString();
  }
  function CartaoUnidade({u, pos, km}) {
    const contatos = Array.isArray(u.telefones) ? u.telefones : [];
    const endereco = [u.rua, u.bairro, 'Suzano - SP'].join(' – ');
    return h('article', {className: 'fc-unidade', key: u.nome},
      h('div', {className: 'fc-unidade-cabecalho'}, h('strong', null, u.nome),
        km != null && h('span', {className: 'fc-distancia'}, '≈ ' + km.toFixed(1).replace('.', ',') + ' km em linha reta')),
      h('p', {className: 'fc-unidade-tipo'}, u.servico),
      h('p', null, h('strong', null, 'Endereço: '), endereco),
      u.orientacao && h('p', {className: 'fc-dica'}, h('strong', null, 'Antes de ir: '), u.orientacao),
      h('p', {className: 'fc-verificacao'}, 'Unidade: ' + situacaoConferencia(conferencias.unidades[u.nome])) ,
      contatos.length > 0 && h('p', null, h('strong', null, 'Contato: '), contatos.map((numero,i) =>
        h(R.Fragment, {key: numero}, i > 0 ? ' · ' : '', h('a', {href: 'tel:' + numero.replace(/\D/g, '')}, numero)))),
      !contatos.length && h('p', {className: 'fc-muted'}, 'Telefone da unidade não cadastrado. Confirme no canal oficial.'),
      h('div', {className: 'fc-unidade-acoes'},
        h('a', {href: urlRota(u, pos), target: '_blank', rel: 'noopener noreferrer', className: 'btn amarelo'}, 'Como chegar'),
        h('a', {href: u.fonte, target: '_blank', rel: 'noopener noreferrer'}, 'Consultar fonte oficial')));
  }
  function UnidadesVinculadas({s}) {
    const {unidades, aviso} = unidadesDoServico(s);
    const [pos, setPos] = useState(null), [distancias, setDistancias] = useState(null);
    const [status, setStatus] = useState('');
    const [mostrarTodas, setMostrarTodas] = useState(false);
    const listar = unidades.slice().sort((a,b) => distancias
      ? (distancias[a.nome] ?? Infinity) - (distancias[b.nome] ?? Infinity) : 0);
    const vistas = mostrarTodas ? listar : listar.slice(0, 3);
    function solicitarLocalizacao() {
      if (!navigator.geolocation) {setStatus('Este navegador não oferece localização. Use “Como chegar”.'); return;}
      setStatus('Solicitando permissão de localização…');
      navigator.geolocation.getCurrentPosition(async local => {
        const origem = {lat: local.coords.latitude, lon: local.coords.longitude};
        setPos(origem);
        setStatus('Localização autorizada. Calculando distâncias aproximadas das unidades…');
        const resultado = {};
        // O local do usuário fica apenas na memória da página; só os endereços públicos são geocodificados.
        for (const u of unidades) {
          const ponto = await geocodificar(u);
          if (ponto) resultado[u.nome] = distanciaKm(origem, ponto);
        }
        setDistancias(resultado);
        setStatus(Object.keys(resultado).length
          ? 'Unidades com endereço localizado ordenadas por distância em linha reta. As demais aparecem no final.'
          : 'Não foi possível calcular distâncias. A lista original foi mantida; consulte o mapa.');
      }, () => setStatus('Localização não autorizada ou indisponível. Você pode consultar os endereços normalmente.'),
      {enableHighAccuracy: false, timeout: 9000, maximumAge: 60000});
    }
    return h('details', {className: 'fc-locais'},
      h('summary', null, unidades.length
        ? 'Ver unidades e endereços em Suzano (' + unidades.length + ')'
        : 'Ver orientações adicionais do serviço'),
      h('div', {className: 'fc-locais-conteudo', 'aria-label': 'Orientações e unidades relacionadas ao serviço'},
        h(PainelAgendamento, {s}),
        h(PainelVerificacao, {s}),
        aviso && h('p', {className: 'fc-alerta'}, aviso),
        unidades.length > 0 && h(R.Fragment, null,
          h('div', {className: 'fc-locais-topo'},
            h('h4', null, 'Onde buscar atendimento em Suzano'),
            h('button', {type: 'button', className: 'btn sec', onClick: solicitarLocalizacao}, 'Ordenar por proximidade')),
          h('p', {className: 'fc-muted', role: 'status', 'aria-live': 'polite'}, status || 'Unidades cadastradas no projeto. Confirme endereço, horário e atendimento antes de sair.'),
          h('div', {className: 'fc-lista-unidades'}, vistas.map(u => h(CartaoUnidade, {key: u.nome, u, pos, km: distancias?.[u.nome]}))),
          unidades.length > 3 && h('button', {type: 'button', className: 'btn sec fc-ver-mais', onClick: () => setMostrarTodas(!mostrarTodas)},
            mostrarTodas ? 'Mostrar menos unidades' : 'Ver todas as ' + unidades.length + ' unidades')),
        h('p', {className: 'fc-fonte-nota'}, 'Informações do cadastro existente. O site não verifica disponibilidade ou horário em tempo real.')));
  }
  const perguntas = [
    {titulo: 'Saúde e bem-estar', opcoes: [['Consulta, vacinação ou posto de saúde', 'atendimento pelo sus'], ['Preciso de remédios', 'farmacia popular'], ['Quero apoio psicológico', 'psicologo']]},
    {titulo: 'Trabalho e renda', opcoes: [['Fui demitido', 'seguro desemprego'], ['Preciso de benefício social', 'cadastro unico'], ['Quero me aposentar', 'aposentadoria']]},
    {titulo: 'Documentos', opcoes: [['Perdi minha identidade', 'identidade'], ['Preciso de CPF', 'cpf'], ['Certidão ou nascimento', 'certidao']]},
    {titulo: 'Direitos e justiça', opcoes: [['Preciso de advogado gratuito', 'defensoria'], ['Problema com compra ou empresa', 'procon'], ['Quero denunciar violência', 'denunciar violencia']]},
    {titulo: 'Educação', opcoes: [['Matrícula escolar', 'matricula'], ['Quero fazer o Enem', 'enem'], ['Bolsa para faculdade', 'prouni']]}
  ];
  function Orientador({onEscolher}) {
    const [escolha, setEscolha] = useState(-1);
    return h('section', {className: 'fc-orientador', 'aria-labelledby': 'fc-orientador-titulo'},
      h('h2', {id: 'fc-orientador-titulo'}, 'Não sabe por onde começar?'),
      h('p', null, 'Escolha um assunto e depois descreva sua situação com um toque. Não é necessário informar dados pessoais.'),
      h('div', {className: 'fc-escolhas', role: 'group', 'aria-label': 'Assuntos'}, perguntas.map((p, i) =>
        h('button', {type: 'button', key: p.titulo, className: 'btn ' + (i === escolha ? '' : 'sec'),
          'aria-pressed': escolha === i, onClick: () => setEscolha(i)}, p.titulo))),
      escolha >= 0 && h('div', {className: 'fc-orientador-segundo'},
        h('h3', null, 'O que você precisa resolver?'),
        h('div', {className: 'fc-escolhas'}, perguntas[escolha].opcoes.map(([rotulo, termo]) =>
          h('button', {type: 'button', key: termo, className: 'btn sec', onClick: () => onEscolher(termo)}, rotulo)))));
  }
  const STORAGE_KEY = 'facilita-checklist-v2';
  function lerChecklist() {
    try { const json = JSON.parse(localStorage.getItem(STORAGE_KEY) || '{}');
      return json && typeof json === 'object' && !Array.isArray(json) ? json : {}; }
    catch (_) { return {}; }
  }
  function salvarChecklist(dados) {
    try {localStorage.setItem(STORAGE_KEY, JSON.stringify(dados));} catch (_) { /* ambiente sem armazenamento */ }
  }
  raiz.FCPlus = {UnidadesVinculadas, Orientador, lerChecklist, salvarChecklist, unidadesDoServico, infoAgendamento, distanciaKm, conferencias, dadosAgendamento};
})(window);
