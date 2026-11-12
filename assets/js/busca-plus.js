/* Busca ampliada: sinônimos e tolerância a erros simples, sem API externa. */
(function (raiz) {
  'use strict';
  const normalizar = t => String(t || '').toLowerCase().normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '').replace(/[^a-z0-9\s]/g, ' ');
  const palavras = t => normalizar(t).split(/\s+/).filter(Boolean);
  const ignorar = new Set('quero preciso gostaria conseguir fazer saber onde como para minha meu sobre com uma que por dos das de da do em no na um os as ao se me ou eu ir ja so tem ter buscar ajuda impacto preciso estou procurando perdi perdido perdida perder meus minhas atendimento atendimentos orientacao orientacoes informacao informacoes'.split(' '));
  const familias = [
    ['advogado', 'advogada', 'advogados', 'juridico', 'juridica', 'defensoria', 'defensor', 'assistencia juridica'],
    ['identidade', 'rg'],
    ['emprego', 'trabalho', 'desempregado', 'desempregada', 'demissao', 'demitido', 'vaga'],
    ['remedio', 'remedios', 'medicamento', 'medicamentos', 'farmacia'],
    ['medico', 'medica', 'consulta', 'posto', 'ubs', 'saude'],
    ['assistencia', 'cras', 'cadunico', 'cadastro unico', 'bolsa familia', 'beneficio', 'renda'],
    ['psicologo', 'psicologa', 'psicologico', 'psicologica', 'psiquiatra', 'terapia', 'caps'],
    ['reclamacao', 'reclamar', 'procon', 'consumidor', 'cobranca'],
    ['aposentadoria', 'aposentar', 'inss', 'previdencia'],
    ['escola', 'matricula', 'ensino', 'estudar', 'educacao']
  ];
  const dicionario = new Map();
  familias.forEach((familia, indice) => familia.forEach(frase => {
    palavras(frase).forEach(token => {
      const conjunto = dicionario.get(token) || new Set();
      conjunto.add(indice);
      dicionario.set(token, conjunto);
    });
  }));
  function distancia(a, b) {
    if (Math.abs(a.length - b.length) > 2) return 3;
    let anterior = Array.from({length: b.length + 1}, (_, i) => i);
    for (let i = 1; i <= a.length; i++) {
      const atual = [i];
      for (let j = 1; j <= b.length; j++) {
        atual[j] = Math.min(anterior[j] + 1, atual[j - 1] + 1,
          anterior[j - 1] + (a[i - 1] === b[j - 1] ? 0 : 1));
      }
      anterior = atual;
    }
    return anterior[b.length];
  }
  function pesoToken(termo, lista) {
    let maior = 0;
    for (const palavra of lista) {
      if (termo === palavra) return 4;
      if (termo.length >= 3 && palavra.startsWith(termo)) maior = Math.max(maior, 3);
      else if (termo.length >= 4 && termo.startsWith(palavra) && palavra.length >= 4) maior = Math.max(maior, 2);
      else if (termo.length >= 4 && palavra.length >= 4 &&
        distancia(termo, palavra) <= (termo.length >= 7 ? 2 : 1)) maior = Math.max(maior, 1);
    }
    return maior;
  }
  function buscarServicos(lista, texto, cat) {
    const filtrados = lista.filter(s => !cat || s.categoria === cat);
    const termos = palavras(texto).filter(t => t.length > 1 && !ignorar.has(t));
    if (!termos.length) return String(texto || '').trim() ? [] : filtrados;
    return filtrados.map(servico => {
      const nome = palavras(servico.nome), termosServico = palavras(servico.palavras), extras = palavras([
        servico.palavras, servico.categoria, servico.publico, servico.onde].join(' '));
      let nota = 0, acertos = 0;
      for (const termo of termos) {
        let peso = pesoToken(termo, nome) * 3 || pesoToken(termo, extras);
        if (!peso && dicionario.has(termo)) {
          const familiasTermo = dicionario.get(termo);
          if ([...nome, ...termosServico].some(chave => {
            const fam = dicionario.get(chave);
            return fam && [...familiasTermo].some(x => fam.has(x));
          })) peso = 2;
        }
        if (peso) { nota += peso; acertos++; }
      }
      return {servico, nota: nota + (acertos === termos.length ? 8 : 0), acertos};
    }).filter(x => x.acertos > 0)
      .sort((a, b) => b.nota - a.nota)
      .map(x => x.servico);
  }
  raiz.buscarServicos = buscarServicos;
  raiz.FCBuscaPlus = {buscarServicos, distancia, normalizar};
  if (typeof module !== 'undefined') module.exports = {buscarServicos, distancia, normalizar};
})(typeof window !== 'undefined' ? window : globalThis);
