// Endereços locais cadastrados com referência oficial por município. A rota usa o endereço completo.
const cadastroSuzano = (() => {
  const saude = "https://suzano.sp.gov.br/saude/unidades-basicas-de-saude/lista-de-enderecos/";
  const ubs = "https://suzano.sp.gov.br/wp-content/uploads/2025/05/Carta-de-Servicos-RAPSVDS.docx.pdf";
  const cras = "https://suzano.sp.gov.br/assistencia-e-desenvolvimento-social/cras-centro-de-referencia-da-assistencia-social/";
  const grupos = {
    "Pronto atendimento": ["Saúde", "Atendimento de urgência.", "Se tiver, leve documento de identificação e cartão SUS. Em uma emergência, acione o SAMU pelo 192."],
    "Atenção básica": ["Saúde", "Atendimento na rede básica de saúde.", "Leve documento de identificação, cartão SUS e comprovante de endereço, se disponíveis. Confirme a unidade de referência do seu bairro."],
    "Atenção psicossocial": ["Saúde", "Atendimento público de saúde mental pelo SUS, com equipes de diferentes profissionais.", "Em Suzano, a UBS pode acolher e orientar; os CAPS também recebem novos casos, conforme a necessidade e a região. Ligue antes para confirmar qual unidade procurar e o horário."],
    "Orientação social": ["Assistência social", "Acolhimento e orientação sobre serviços e benefícios sociais.", "Consulte o CRAS sobre o território atendido e a documentação para o seu pedido."],
    "Orientação ao consumidor": ["Direitos e justiça", "Órgão público que orienta consumidores e recebe reclamações.", "Procon Suzano: (11) 4744-7322 ou (11) 4744-7461. Atendimento de segunda a sexta, das 8h às 17h. Para abrir reclamação, a emissão de senhas ocorre de segunda a quinta, das 8h às 16h. Confirme os requisitos e o horário antes de ir."],
    "Assistência judiciária": ["Direitos e justiça", "Informações sobre a triagem para assistência judiciária.", "Ligue para (11) 4748-7473 e confirme local, horário e documentos da triagem antes de ir à sede."],
    "Conciliação": ["Direitos e justiça", "Conciliação pré-processual em assuntos cíveis e de família.", "Antes de ir, confirme os documentos pelo (11) 4747-6961 ou pelo e-mail cejusc.suzano@tjsp.jus.br."]
  };
  const dados = [
    ["UPA André de Abreu", "Pronto atendimento", "Rua Guarani, 200", "Jardim Revista", saude],
    ["Pronto Atendimento de Palmeiras", "Pronto atendimento", "Rua Mussi George Antônio, 319", "Jardim Amazonas", saude],
    ["UBS Colorado", "Atenção básica", "Rua Assembleia de Deus, 479", "Jardim Colorado", ubs],
    ["UBS CS II", "Atenção básica", "Avenida Paulo Portela, 205", "Jardim Paulista", ubs],
    ["UBS Monte Cristo", "Atenção básica", "Avenida Cachoeira, 33", "Jardim Monte Cristo", ubs],
    ["UBS Dona Benta", "Atenção básica", "Rua Geraldo Valadares, 31", "Jardim Dona Benta", ubs],
    ["CRAS Boa Vista", "Orientação social", "Avenida Katsutoshi Naito, 957", "Bairro SESC", cras],
    ["CRAS Casa Branca", "Orientação social", "Rua Maria Clara Tavares, 125", "Parque Residencial Casa Branca", cras],
    ["CAPS I Alumiar", "Atenção psicossocial", "Rua Otávio Miguel da Silva, 187", "Jardim Imperador", "https://suzano.sp.gov.br/saude/unidades-basicas-de-saude/lista-de-enderecos/", ["(11) 4748-8100", "(11) 4741-2004"]],
    ["CAPS II Devir", "Atenção psicossocial", "Rua Barão do Rio Branco, 315", "Vila Costa", "https://suzano.sp.gov.br/saude/unidades-basicas-de-saude/lista-de-enderecos/", ["(11) 4741-2718"]],
    ["CAPS AD Vita · álcool e outras drogas · 24 horas", "Atenção psicossocial", "Rua Dr. Deodato Wertheimer, 33", "Vila Costa", "https://suzano.sp.gov.br/servicos-essenciais-seguem-em-ponto-facultativo-em-alusao-ao-dia-do-servidor-e-no-feriado-de-finados/", ["(11) 4745-0563"]],
    ["CAPS Infantojuvenil Entrelaços", "Atenção psicossocial", "Rua Anita Falconi, 170", "Vila São Francisco", "https://suzano.sp.gov.br/saude/unidades-basicas-de-saude/lista-de-enderecos/", ["(11) 4744-6120"]],
    ["Procon Suzano", "Orientação ao consumidor", "Rua Baruel, 126", "Centro", "https://suzano.sp.gov.br/orgaos-publicos/procon/sobre-o-servico/", ["(11) 4744-7322", "(11) 4744-7461"]],
    ["OAB Suzano · sede da 55ª Subseção", "Assistência judiciária", "Rua Baruel, 592", "Vila Adelina", "https://www.oabsp.org.br/subsecao/suzano"],
    ["CEJUSC Suzano", "Conciliação", "Rua Baruel, 126", "Centro", "https://www.tjsp.jus.br/Download/Conciliacao/Nucleo/Enderecos_Cejusc.pdf"]
  ];
  const mogiSaude = "https://site.mogidascruzes.sp.gov.br/unidades-e-equipamentos/saude";
  const mogiSocial = "https://www.mogidascruzes.sp.gov.br/pagina/secretaria-de-assistencia-social/unidades";
  const poaSaude = "https://poa.sp.gov.br/cidade/saude/";
  const adicionais = [
    ["UBS Alto do Ipiranga", "Atenção básica", "Rua Capitão Joaquim de Melo Freire, 700", "Alto do Ipiranga", "Mogi das Cruzes", mogiSaude],
    ["UBS Botujuru", "Atenção básica", "Rua Frei Bonifácio Harink, 313", "Vila São Paulo", "Mogi das Cruzes", mogiSaude],
    ["UBS Braz Cubas", "Atenção básica", "Rua Padre Álvaro Quinhones Zuniga, 340", "Braz Cubas", "Mogi das Cruzes", mogiSaude],
    ["UBS Jardim Camila", "Atenção básica", "Avenida Presidente Getúlio Vargas, 999", "Jardim Camila", "Mogi das Cruzes", mogiSaude],
    ["UBS Jundiapeba", "Atenção básica", "Rua Vereador Nito Sona, 1745", "Jundiapeba", "Mogi das Cruzes", mogiSaude],
    ["CRAS Centro", "Orientação social", "Rua Professor Flaviano de Melo, 525", "Centro", "Mogi das Cruzes", mogiSocial],
    ["CRAS César de Souza", "Orientação social", "Rua Antônio Máximo, 344", "Vila Suissa", "Mogi das Cruzes", mogiSocial],
    ["CRAS Jundiapeba I", "Orientação social", "Rua Dolores de Aquino, 2083", "Jundiapeba", "Mogi das Cruzes", mogiSocial],
    ["Hospital Municipal Dr. Guido Guida", "Pronto atendimento", "Rua Barão de Juparanã, 43", "Jardim Medina", "Poá", poaSaude],
    ["UBS Vila Jaú", "Atenção básica", "Rua Inácia Alves da Silva, 444", "Vila Jaú", "Poá", poaSaude],
    ["UBS Vila Pereta", "Atenção básica", "Rua Lindolfo Raimundo Ribeiro, 270", "Vila Pereta", "Poá", poaSaude],
    ["UBS Santa Helena", "Atenção básica", "Rua Mem de Sá, 560", "Jardim Santa Helena", "Poá", poaSaude],
    ["UBS Calmon Viana (Tito Fuga)", "Atenção básica", "Rua Maria Helena, 159", "Calmon Viana", "Poá", poaSaude],
    ["UBS Jardim América (Wellington Lopes)", "Atenção básica", "Rua Esmeralda, 88", "Jardim América", "Poá", poaSaude]
  ];
  const suzano = dados.map(([nome, servico, rua, bairro, fonte, telefones]) => {
    const [grupo, descricao, orientacao] = grupos[servico];
    return {nome, servico, grupo, rua, bairro, cidade: "Suzano", uf: "SP", fonte, telefones: telefones || [], descricao, orientacao};
  });
  const outras = adicionais.map(([nome, servico, rua, bairro, cidade, fonte]) => {
    const [grupo, descricao, orientacao] = grupos[servico];
    return {nome, servico, grupo, rua, bairro, cidade, uf: "SP", fonte, telefones: [], descricao, orientacao};
  });
  return [...suzano, ...outras];
})();
