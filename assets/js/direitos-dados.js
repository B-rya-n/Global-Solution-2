/* Regras da página "Tenho direito?" (pages/direitos.html).
   Cada item de ITENS diz quando um direito pode se aplicar, com base nas respostas da pessoa.
   É orientação inicial: quem decide é o órgão responsável (INSS, CRAS, prefeitura etc.).
   ATENÇÃO: os valores abaixo são de 2026. Atualize REF todo mês de janeiro e confira as regras nos canais oficiais.
   Fontes principais: lista de programas federais do CadÚnico (gov.br/MDS, fev/2026), Portaria Interministerial MPS/MF 13/2026,
   Portaria MCID 333/2026 (Minha Casa, Minha Vida) e Lei 15.270/2025 (Imposto de Renda).
   Atualização de nov/2026: Bolsa Família (Lei 14.601/2023), Tarifa Social e Desconto Social de energia (Lei 15.235/2025, Aneel),
   Lei 15.371/2026 (licença e salário-paternidade), Lei 15.077/2024 (BPC), Lei 14.674/2023 (auxílio-aluguel na Lei Maria da Penha),
   Novo Desenrola Brasil 2026 (adesões até 31/08/2026), Decreto 12.889/2026 (Garantia-Safra), tabela do seguro-desemprego 2026 (MTE),
   Pé-de-Meia 2026 (MEC), Reforma Casa Brasil (Caixa) e Gás do Povo (MME/MDS). */
(function (raiz) {
  "use strict";
  const REF = {
    ano: 2026, salarioMinimo: 1621, bolsaFamilia: 218,
    salarioFamiliaLimite: 1980.38, salarioFamiliaCota: 67.54,
    abonoLimite: 2766, irIsento: 5000, irIdoso: 1903.98,
    mcmv: [3200, 5000, 9600, 13000],
    bolsaPiso: 691, bolsaPrimeiraInfancia: 150, bolsaVariavel: 50,
    seguroTeto: 2518.65, garantiaSafra: 1200, reformaCasaLimite: 13000
  };
  const SM = REF.salarioMinimo, QUARTO = SM / 4, METADE = SM / 2;
  const real = v => v.toLocaleString("pt-BR", { style: "currency", currency: "BRL" });
  const ORDEM = { provavel: 0, possivel: 1, improvavel: 2 };
  const CAD_PASSO = "Faça ou atualize o CadÚnico no CRAS da sua cidade: ele é a porta de entrada para vários programas.";
  const GOVBR = "https://www.gov.br/pt-br/servicos";
  const pcTxt = p => "A renda por pessoa da casa (" + real(p.pc) + ")";
  const nivelCad = p => (p.cad === "sim" ? "provavel" : "possivel");
  const nivelInss = p => (p.inss === "sim" ? "provavel" : "possivel");

  const ITENS = [
    /* ---------- Dinheiro: assistência social ---------- */
    {
      id: "bpc", tema: "Dinheiro", nome: "BPC: benefício de um salário mínimo por mês",
      resumo: "Pago pelo INSS a pessoas com deficiência ou a idosos de 65 anos ou mais com renda muito baixa, sem precisar ter contribuído. Vale um salário mínimo por mês (" + real(SM) + " em " + REF.ano + ").",
      precisaCad: true, negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF da pessoa e de quem mora na casa", "Número do CadÚnico", "Laudos e exames médicos recentes (no caso de deficiência ou doença)", "Comprovante de residência"],
      como: ["Peça laudos médicos recentes que descrevam a condição e as limitações do dia a dia.", "Faça o pedido pelo Meu INSS ou ligue 135.", "Mantenha o CadÚnico atualizado (a cada 2 anos) e faça a biometria quando o INSS pedir: são exigências para pedir e manter o BPC.", "Vá à avaliação social e à perícia médica no dia marcado, levando laudos e exames.", "Guarde o número do protocolo. Se o pedido for negado, guarde a carta de negativa e procure a Defensoria Pública (veja a seção sobre advogado gratuito)."],
      avaliar(p) {
        if (p.recebebpc) return null;
        let perfil, forte = true;
        if (p.pcd) perfil = p.tea ? "O autismo é reconhecido por lei como deficiência, e pessoas com deficiência de longa duração (2 anos ou mais) podem pedir o BPC." : "Pessoas com deficiência de longa duração (2 anos ou mais) podem pedir o BPC.";
        else if (p.idoso65) perfil = "Idosos com 65 anos ou mais podem pedir o BPC.";
        else if (p.doenca) { perfil = "Se a doença causar um impedimento de longo prazo (2 anos ou mais), a pessoa pode ser avaliada como pessoa com deficiência."; forte = false; }
        else return null;
        const pc = real(p.pc);
        if (p.pc <= QUARTO) return { nivel: forte ? "provavel" : "possivel", porque: [perfil, "A renda por pessoa da casa (" + pc + ") está dentro do limite de " + real(QUARTO) + ", que é um quarto do salário mínimo."] };
        if (p.pc <= METADE) return { nivel: "possivel", porque: [perfil, "A renda por pessoa (" + pc + ") passa de " + real(QUARTO) + " (um quarto do salário mínimo), mas fica abaixo de meio salário mínimo. O INSS pode olhar outros fatores, como gastos com saúde e terapias, então vale pedir."] };
        return { nivel: "improvavel", porque: [perfil, "A renda por pessoa (" + pc + ") passa de meio salário mínimo, e pela regra do INSS o pedido tende a ser negado. O critério de renda não é absoluto na Justiça: se os gastos com tratamento pesam no orçamento da família, vale conversar com a Defensoria Pública."] };
      }
    },
    {
      id: "auxinclusao", tema: "Dinheiro", nome: "Auxílio-Inclusão: meio salário mínimo para quem recebe BPC e começa a trabalhar",
      resumo: "Quem recebe o BPC como pessoa com deficiência e entra no mercado de trabalho pode receber meio salário mínimo (" + real(SM / 2) + " em " + REF.ano + ") junto com o salário. O BPC fica suspenso enquanto o auxílio é pago.",
      fonte: GOVBR + "/solicitar-auxilio-inclusao-a-pessoa-com-deficiencia",
      leve: ["Documento com foto e CPF", "CadÚnico atualizado", "Comprovante do trabalho (carteira assinada ou outra prova de atividade)"],
      como: ["Avise o INSS que começou a trabalhar, pelo Meu INSS ou pelo 135.", "Peça o Auxílio-Inclusão pelo serviço do gov.br.", "O salário do trabalho precisa ser de até 2 salários mínimos. Se o emprego acabar, o BPC pode voltar."],
      avaliar(p) {
        if (!p.pcd || p.menor || !p.recebebpc) return null;
        return { nivel: "possivel", porque: ["Vale para pessoa com deficiência que recebe ou recebeu o BPC e passa a trabalhar, com remuneração de até 2 salários mínimos. Confirme se esse é o seu caso."] };
      }
    },
    {
      id: "bolsa", tema: "Dinheiro", nome: "Bolsa Família",
      resumo: "Ajuda mensal para famílias de baixa renda inscritas no CadÚnico. O valor mínimo por família foi atualizado para " + real(REF.bolsaPiso) + " a partir de outubro de " + REF.ano + "; o valor final depende da composição familiar e das regras vigentes. Mudanças de renda podem afetar o benefício, mas há uma Regra de Proteção em alguns casos. Confira sua situação nos canais oficiais do MDS.",
      precisaCad: true, fonte: "https://www.gov.br/mds/pt-br/noticias/bolsa-familia-tera-valor-minimo-de-r-691-a-partir-de-outubro",
      leve: ["CPF do responsável familiar e documento com foto", "Documentos das pessoas da casa", "Comprovante de endereço"],
      como: ["Mantenha os dados da família sempre atualizados no CRAS.", "Acompanhe a situação no aplicativo oficial do programa ou no CRAS."],
      avaliar(p) {
        if (p.pc > REF.bolsaFamilia) return null;
        return { nivel: nivelCad(p), porque: [pcTxt(p) + " está dentro do limite de " + real(REF.bolsaFamilia) + " por pessoa do programa.", p.cad === "sim" ? "A família já está no CadÚnico. Confira se os dados estão atualizados." : "Para entrar no programa, a família precisa estar no CadÚnico."] };
      }
    },
    {
      id: "eventual", tema: "Dinheiro", nome: "Benefício eventual (CRAS): ajuda em situações de emergência",
      resumo: "Ajuda temporária da assistência social do município em situações como nascimento, morte na família, falta de alimento ou perda de moradia. As regras e os valores mudam de cidade para cidade.",
      fonte: "https://www.gov.br/mds",
      leve: ["Documento com foto e CPF", "Comprovante de residência", "Documento que mostre a situação (certidão de óbito, boletim de ocorrência etc.)"],
      como: ["Procure o CRAS da sua cidade e explique a situação.", "Pergunte quais benefícios eventuais o município oferece e o que é preciso levar.", "Peça também a inclusão no CadÚnico, se a família ainda não estiver."],
      avaliar(p) {
        if (p.pc > QUARTO) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está dentro de um quarto do salário mínimo, faixa em que a lei da assistência social dá prioridade a esse tipo de ajuda."] };
      }
    },
    {
      id: "orfaofeminicidio", tema: "Dinheiro", nome: "Pensão especial para filhos órfãos de feminicídio",
      resumo: "Benefício de um salário mínimo por mês para filhos e dependentes menores de 18 anos que ficaram órfãos em razão de feminicídio.",
      fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF do responsável e da criança", "Certidão de nascimento", "Documentos do caso (certidão de óbito, boletim de ocorrência ou decisão da Justiça)"],
      como: ["Procure uma unidade do INSS ou o CRAS: eles ajudam no pedido e na atualização do CadÚnico.", "Leve os documentos do caso.", "Guarde o protocolo e acompanhe pelo Meu INSS ou pelo 135."],
      avaliar(p) {
        if (!p.orfao) return null;
        return { nivel: "provavel", porque: ["O governo federal criou uma pensão especial de um salário mínimo para esses filhos e dependentes menores de 18 anos."] };
      }
    },
    /* ---------- Dinheiro: INSS ---------- */
    {
      id: "salariofamilia", tema: "Dinheiro", nome: "Salário-família",
      resumo: "Valor pago junto com o salário ou o benefício do INSS, por filho de até 14 anos (ou filho com invalidez, de qualquer idade). Em " + REF.ano + ": " + real(REF.salarioFamiliaCota) + " por filho, para quem ganha até " + real(REF.salarioFamiliaLimite) + " por mês.",
      fonte: "https://meu.inss.gov.br",
      leve: ["Certidão de nascimento do filho", "CPF do filho", "Caderneta de vacinação e comprovante de frequência escolar, conforme a idade"],
      como: ["Entregue os documentos ao empregador (ou ao INSS, se for aposentado ou receber auxílio).", "Apresente a caderneta de vacinação e o comprovante de escola quando forem pedidos.", "Confira no holerite se o valor foi incluído."],
      avaliar(p) {
        if (!p.filhos14 || p.inss === "nao") return null;
        return { nivel: "possivel", porque: ["Quem tem filho de até 14 anos e trabalha com carteira assinada (ou recebe benefício do INSS) pode ter direito, se o salário do trabalhador for de até " + real(REF.salarioFamiliaLimite) + " por mês."] };
      }
    },
    {
      id: "pensaomorte", tema: "Dinheiro", nome: "Pensão por morte",
      resumo: "Paga pelo INSS aos dependentes de quem contribuía e faleceu.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF de quem pede", "Certidão de óbito", "Documentos que provem o vínculo (casamento, união estável ou nascimento)"],
      como: ["Reúna os documentos e peça o quanto antes: o prazo faz diferença no valor e na data de início.", "Faça o pedido pelo Meu INSS ou pelo 135.", "Acompanhe o resultado e cumpra as exigências, se houver."],
      avaliar(p) {
        if (!p.luto || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Cônjuge, companheiro(a), filhos e outros dependentes de quem contribuía ao INSS podem pedir a pensão."] };
      }
    },
    {
      id: "reclusao", tema: "Dinheiro", nome: "Auxílio-reclusão",
      resumo: "Pago aos dependentes de segurado de baixa renda do INSS que está preso em regime fechado. Em " + REF.ano + ", a média dos salários do preso não pode passar de " + real(REF.salarioFamiliaLimite) + ".",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF dos dependentes", "Certidão de recolhimento à prisão (fornecida pela unidade prisional)", "Documentos que provem o vínculo com o preso"],
      como: ["Peça à unidade prisional a certidão de recolhimento à prisão.", "Faça o pedido pelo Meu INSS ou pelo 135.", "Renove a certidão nas datas pedidas pelo INSS para manter o pagamento."],
      avaliar(p) {
        if (!p.preso || p.inss === "nao") return null;
        return { nivel: "possivel", porque: ["Vale para dependentes de quem contribuía ao INSS, tinha baixa renda e não recebe salário nem outro benefício do INSS. O benefício não é pago ao preso, e sim à família."] };
      }
    },
    {
      id: "maternidade", tema: "Dinheiro", nome: "Salário-maternidade",
      resumo: "Pago pelo INSS a gestantes e a quem adotou uma criança, dentro das regras de contribuição.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Atestado médico da gestação ou certidão de nascimento", "Comprovantes de contribuição ou de atividade"],
      como: ["Confira no Meu INSS se você tem direito.", "Faça o pedido pelo Meu INSS.", "Acompanhe o andamento e cumpra as exigências, se houver."],
      avaliar(p) {
        if (!p.gest || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Gestantes e mães de recém-nascidos que contribuem ao INSS (ou trabalham com carteira assinada) podem receber o salário-maternidade."] };
      }
    },
    {
      id: "incapacidade", tema: "Dinheiro", nome: "Auxílio por incapacidade temporária (antigo auxílio-doença)",
      resumo: "Pago pelo INSS a quem contribui e não pode trabalhar por doença ou acidente.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Atestado ou laudo médico recente", "Comprovantes de contribuição ou de trabalho"],
      como: ["Confira no Meu INSS se as contribuições estão em dia.", "Agende a perícia médica pelo Meu INSS ou pelo 135.", "Leve laudos e exames no dia da perícia."],
      avaliar(p) {
        if (!p.doenca || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Quem tem uma doença que impede de trabalhar e contribui ao INSS pode pedir o auxílio."] };
      }
    },
    {
      id: "acidente", tema: "Dinheiro", nome: "Auxílio-acidente",
      resumo: "Pago pelo INSS a quem ficou com sequela permanente depois de um acidente, quando a sequela reduz a capacidade de trabalho. Vale 50% do salário de benefício e pode ser recebido junto com o salário.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Laudos que descrevam a sequela", "Comprovantes de contribuição"],
      como: ["Peça ao médico um laudo que descreva a sequela e a limitação para o trabalho.", "Faça o pedido pelo Meu INSS ou pelo 135.", "Vá à perícia médica levando os laudos."],
      avaliar(p) {
        if (!p.doenca || p.inss !== "sim") return null;
        return { nivel: "possivel", porque: ["Só se aplica se a causa foi um acidente e ficou sequela. Se for esse o caso, vale pedir."] };
      }
    },
    {
      id: "incapacidadeperm", tema: "Dinheiro", nome: "Aposentadoria por incapacidade permanente",
      resumo: "Aposentadoria do INSS para quem não pode mais trabalhar por doença ou acidente, sem perspectiva de recuperação.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Laudos e exames médicos", "Comprovantes de contribuição"],
      como: ["Quem já recebe auxílio por incapacidade temporária pode ser avaliado pela perícia para a aposentadoria.", "Se for o caso, peça pelo Meu INSS ou pelo 135.", "Leve todos os laudos à perícia."],
      avaliar(p) {
        if (!p.doenca || p.inss !== "sim") return null;
        return { nivel: "possivel", porque: ["Depende da perícia médica concluir que a pessoa não pode mais trabalhar."] };
      }
    },
    {
      id: "aposdef", tema: "Dinheiro", nome: "Aposentadoria da pessoa com deficiência",
      resumo: "Quem contribuiu ao INSS e tem deficiência pode se aposentar com menos idade e menos tempo de contribuição, conforme o grau da deficiência (leve, moderada ou grave).",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Laudos médicos", "Comprovantes de contribuição"],
      como: ["Consulte o histórico de contribuições no Meu INSS.", "Peça a avaliação da deficiência pelo INSS, que define o grau.", "Faça o pedido pelo Meu INSS ou pelo 135."],
      avaliar(p) {
        if (!p.pcd || p.inss !== "sim" || p.menor) return null;
        return { nivel: "possivel", porque: ["A lei prevê regras especiais de aposentadoria para pessoas com deficiência que contribuíram ao INSS."] };
      }
    },
    {
      id: "aposentadoria", tema: "Dinheiro", nome: "Aposentadoria pelo INSS",
      resumo: "Quem contribuiu ao INSS pode se aposentar por idade ou por tempo de contribuição, conforme a regra que vale para cada pessoa.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Comprovantes de trabalho e contribuição", "Comprovante de endereço"],
      como: ["Consulte o histórico de contribuições no Meu INSS.", "Confira qual regra de idade e tempo vale para você.", "Faça o pedido pelo Meu INSS ou ligue 135."],
      avaliar(p) {
        if (!p.idoso60 || p.inss !== "sim") return null;
        return { nivel: "possivel", porque: ["A pessoa tem 60 anos ou mais e já contribuiu ao INSS. Falta conferir se atinge a idade e o tempo exigidos."] };
      }
    },
    {
      id: "aposrural", tema: "Dinheiro", nome: "Aposentadoria rural (segurado especial)",
      resumo: "Quem trabalha na roça, na agricultura familiar ou na pesca artesanal pode se aposentar por idade (55 anos para mulheres e 60 para homens), comprovando 15 anos de trabalho rural, mesmo sem ter contribuído em carnê.",
      negado: true, fonte: "https://meu.inss.gov.br",
      leve: ["Documento com foto e CPF", "Provas do trabalho rural (declaração do sindicato, notas de venda, bloco de produtor, CAF, contratos)", "Comprovante de residência"],
      como: ["Junte documentos que mostrem os anos de trabalho no campo.", "Faça o pedido pelo Meu INSS ou pelo 135.", "Se tiver dificuldade, procure o sindicato rural ou o CRAS."],
      avaliar(p) {
        if (!p.rural || !p.maior55) return null;
        return { nivel: "possivel", porque: ["A idade mínima é de 55 anos para mulheres e de 60 para homens. Falta conferir a idade exata e os 15 anos de trabalho rural."] };
      }
    },
    {
      id: "facultativo", tema: "Dinheiro", nome: "INSS com contribuição reduzida para dona ou dono de casa",
      resumo: "Quem cuida da própria casa, sem renda própria e em família de baixa renda, pode contribuir ao INSS com 5% do salário mínimo e ter direito a benefícios como aposentadoria, salário-maternidade e auxílio por incapacidade.",
      precisaCad: true, fonte: "https://www.gov.br/inss/pt-br/saiba-mais/seus-direitos-e-deveres/categorias-de-segurados/facultativo-de-baixa-renda-dono-de-casa",
      leve: ["Documento com foto e CPF", "Número do CadÚnico", "Número do NIS/PIS, se tiver"],
      como: ["Confirme com o CRAS que a família está no CadÚnico com os dados atualizados.", "Peça a inscrição como segurado facultativo de baixa renda pelo Meu INSS ou pelo 135.", "Pague a guia todo mês, no valor reduzido."],
      avaliar(p) {
        if (!p.donacasa || p.menor) return null;
        return { nivel: nivelCad(p), porque: ["É um caminho para quem não tem carteira assinada e quer ter proteção do INSS pagando pouco."] };
      }
    },
    {
      id: "dividas", tema: "Dinheiro", nome: "Dívidas em atraso: negociar e limpar o nome sem pagar intermediário",
      resumo: "Quem está com dívida em atraso pode negociar direto com o credor, pelo consumidor.gov.br ou pelo Procon. O Novo Desenrola Brasil, programa federal para quem ganhava até 5 salários mínimos, aceitou adesões até 31 de agosto de 2026: confira no site do governo se abriu uma nova fase. Depois de pagar ou fechar acordo, o credor deve tirar o seu nome do cadastro de inadimplentes em até 5 dias úteis, e dívidas com mais de 5 anos não podem continuar registradas.",
      fonte: "https://www.consumidor.gov.br",
      leve: ["Documento com foto e CPF", "Contratos, faturas e extratos da dívida", "Comprovantes de renda", "Protocolos e propostas de negociação anteriores"],
      como: ["Liste todas as dívidas (credor, valor e há quanto tempo estão em atraso) e separe primeiro o que é essencial, como luz, água e comida.", "Procure o credor para negociar direto e peça a proposta por escrito.", "Se não houver acordo, registre a reclamação no consumidor.gov.br ou no Procon da sua cidade.", "Depois de pagar, guarde o comprovante e confira se o nome saiu do cadastro de inadimplentes em até 5 dias úteis.", "Se o credor se recusar ou cobrar de forma abusiva, procure a Defensoria Pública."],
      avaliar(p) {
        if (!p.dividas) return null;
        return { nivel: "possivel", porque: ["Quem deve tem direito a negociar, e há canais gratuitos para isso.", "Desconfie de quem cobra para limpar o nome ou promete desconto por mensagem: é sinal de golpe."] };
      }
    },
    {
      id: "desastre", tema: "Dinheiro", nome: "Ajuda depois de enchente, deslizamento ou outro desastre",
      resumo: "Quando o município tem situação de emergência ou calamidade reconhecida, a Defesa Civil cadastra as famílias atingidas. Isso pode dar acesso ao saque calamidade do FGTS (até " + real(6220) + " por desastre, limitado ao saldo, para moradores das áreas informadas à Caixa) e, em alguns desastres, ao Auxílio Reconstrução do governo federal, como os " + real(5100) + " pagos em parcela única às famílias desalojadas ou desabrigadas do Rio Grande do Sul em 2024. Cada benefício só vale se foi liberado para a sua área.",
      fonte: "https://www.gov.br/mdr",
      leve: ["Documento com foto e CPF", "Comprovante de residência na área atingida", "Fotos ou registro dos danos", "Aplicativo FGTS ou agência da Caixa, para pedir o saque"],
      como: ["Procure a Defesa Civil do município (telefone 199) e peça o cadastro da família e o registro dos danos.", "Pergunte se o município teve situação de emergência ou calamidade reconhecida e se o seu endereço foi informado à Caixa.", "Se foi, peça o saque calamidade do FGTS pelo aplicativo FGTS ou em uma agência da Caixa, dentro do prazo informado.", "Pergunte à prefeitura ou ao CRAS se há Auxílio Reconstrução ou benefício eventual para as famílias desalojadas ou desabrigadas.", "Guarde protocolos e comprovantes de tudo."],
      avaliar(p) {
        if (!p.desastre) return null;
        return { nivel: "possivel", porque: ["Os benefícios dependem de o desastre ter sido reconhecido oficialmente e de a sua casa estar na área atingida cadastrada pela Defesa Civil."] };
      }
    },
    /* ---------- Trabalho ---------- */
    {
      id: "seguro", tema: "Trabalho", nome: "Seguro-desemprego",
      resumo: "Pagamento de 3 a 5 parcelas para quem foi demitido sem justa causa. Em " + REF.ano + ", cada parcela vai de " + real(SM) + " (o piso é o salário mínimo) até " + real(REF.seguroTeto) + ", conforme a média dos últimos 3 salários. O pedido pode ser feito do 7º ao 120º dia depois da demissão (até 90 dias para empregado doméstico).",
      fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Documento com foto e CPF", "Carteira de Trabalho", "Termo de rescisão do contrato"],
      como: ["Faça o pedido logo: o prazo é curto, em geral até 120 dias depois da demissão.", "Use o aplicativo Carteira de Trabalho Digital ou o gov.br.", "Acompanhe as parcelas pelos mesmos canais."],
      avaliar(p) {
        if (!p.desemp || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Quem foi demitido sem justa causa e tinha carteira assinada pode pedir o seguro-desemprego.", p.inss === "sim" ? "Você informou que já trabalhou com carteira assinada." : "Confira no aplicativo Carteira de Trabalho Digital se há vínculos registrados."] };
      }
    },
    {
      id: "fgts", tema: "Trabalho", nome: "Saque do FGTS",
      resumo: "O FGTS é uma reserva em nome do trabalhador. Quem é demitido sem justa causa pode sacar o saldo e recebe a multa de 40% paga pelo empregador. Em alguns casos de doença grave também é possível sacar.",
      fonte: "https://www.caixa.gov.br",
      leve: ["Documento com foto e CPF", "Carteira de Trabalho", "Termo de rescisão (demissão) ou laudo médico (doença grave)"],
      como: ["Consulte o saldo no aplicativo FGTS.", "Peça o saque no aplicativo ou em uma agência da Caixa, com os documentos do caso.", "Em caso de doença grave, confira no aplicativo ou na Caixa quais doenças a lei aceita."],
      avaliar(p) {
        if (p.desemp && p.inss !== "nao") return { nivel: nivelInss(p), porque: ["Demissão sem justa causa dá direito ao saque do saldo do FGTS, se havia carteira assinada com FGTS depositado."] };
        if (p.doenca && p.inss === "sim") return { nivel: "possivel", porque: ["A lei permite o saque em alguns casos de doença grave. Confira se a doença está na lista."] };
        return null;
      }
    },
    {
      id: "abono", tema: "Trabalho", nome: "Abono salarial (PIS/Pasep)",
      resumo: "Valor pago uma vez por ano a quem trabalhou com carteira assinada e ganhou pouco. No calendário de " + REF.ano + " (ano-base 2024) vale para quem teve média de até " + real(REF.abonoLimite) + " por mês e trabalhou ao menos 30 dias.",
      fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["CPF", "Conta gov.br", "Aplicativo Carteira de Trabalho Digital"],
      como: ["Abra o aplicativo Carteira de Trabalho Digital, entre com a conta gov.br e consulte se há abono a receber.", "Confira o valor, o banco pagador e o prazo final para sacar.", "Se os dados do trabalho estiverem errados, peça a correção ao empregador."],
      avaliar(p) {
        if (p.inss !== "sim" || p.menor) return null;
        return { nivel: "possivel", porque: ["O direito depende do que o trabalhador ganhou e do que o empregador informou no ano-base. A consulta no aplicativo mostra na hora se você tem valor a receber."] };
      }
    },
    {
      id: "defeso", tema: "Trabalho", nome: "Seguro-defeso (pescador artesanal)",
      resumo: "Compensação financeira para pescador artesanal profissional nos meses em que a pesca é proibida para proteger a reprodução dos peixes.",
      fonte: "https://www.gov.br/trabalho-e-emprego/pt-br/acesso-a-informacao/acoes-e-programas/programas-projetos-acoes-obras-e-atividades/seguro-desemprego-do-pescador-artesanal",
      leve: ["Documento com foto e CPF", "Registro de pescador profissional artesanal", "Comprovante de residência e CadÚnico"],
      como: ["Confirme se o seu registro de pescador está regular.", "Peça o benefício no período do defeso, pelos canais oficiais do governo.", "Em dúvida, procure a colônia de pescadores ou o CRAS."],
      avaliar(p) {
        if (!p.rural || p.menor) return null;
        return { nivel: "possivel", porque: ["Só vale para quem vive da pesca artesanal. Se esse é o seu caso, confira o registro e os prazos."] };
      }
    },
    {
      id: "campo", tema: "Trabalho", nome: "Apoio para quem vive no campo (Fomento Rural, cisternas, Luz para Todos)",
      resumo: "Programas do governo para famílias de baixa renda da zona rural: dinheiro e apoio para produzir, cisternas para ter água e ligação de energia elétrica.",
      precisaCad: true, fonte: "https://www.gov.br/mds/pt-br/acoes-e-programas/acesso-a-alimentos-e-a-agua/programa-fomento-rural",
      leve: ["CadÚnico atualizado", "Documento com foto e CPF", "Comprovante de que mora ou trabalha na área rural"],
      como: ["Atualize o CadÚnico no CRAS.", "Pergunte no CRAS, na prefeitura ou na empresa de assistência técnica rural que projetos estão abertos na sua região.", "Procure o sindicato rural para ajuda com os documentos."],
      avaliar(p) {
        if (!p.rural || p.pc > METADE) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está abaixo de meio salário mínimo. A oferta depende da sua região."] };
      }
    },
    {
      id: "acredita", tema: "Trabalho", nome: "Acredita no Primeiro Passo",
      resumo: "Programa do governo para famílias do CadÚnico que querem aumentar a renda pelo trabalho: orientação, cursos e acesso a crédito para pequenos negócios.",
      precisaCad: true, fonte: "https://www.gov.br/mds/pt-br/acoes-e-programas/programa-acredita-no-primeiro-passo",
      leve: ["CadÚnico atualizado", "Documento com foto e CPF"],
      como: ["Atualize o CadÚnico no CRAS.", "Pergunte no CRAS como participar no seu município."],
      avaliar(p) {
        if (p.menor || p.cad === "nao" || p.pc > METADE) return null;
        return { nivel: "possivel", porque: ["Vale para famílias de baixa renda do CadÚnico. A oferta depende do município."] };
      }
    },
    /* ---------- Moradia e contas da casa ---------- */
    {
      id: "tarifa", tema: "Contas da casa", nome: "Tarifa Social de Energia Elétrica",
      resumo: "Gratuidade nos primeiros 80 kWh de consumo por mês, o que costuma zerar a conta de quem gasta pouco. Vale para famílias de baixa renda no CadÚnico, para quem tem alguém da casa que recebe o BPC e para famílias indígenas e quilombolas inscritas no CadÚnico. Acima de 80 kWh, paga-se só a diferença.",
      precisaCad: true, fonte: "https://www.gov.br/aneel/pt-br/assuntos/tarifas/tarifa-social",
      leve: ["CPF do titular da conta de luz", "Número do CadÚnico (NIS)", "Conta de luz recente"],
      como: ["Pergunte à distribuidora de energia se o desconto já está na sua conta.", "Se não estiver, peça a inclusão pelo canal de atendimento da distribuidora."],
      avaliar(p) {
        const direito = p.pc <= METADE || p.recebebpc || p.tradicional;
        if (!direito) return null;
        const porque = [];
        if (p.pc <= METADE) porque.push(pcTxt(p) + " está abaixo de meio salário mínimo, faixa que dá direito à gratuidade nos primeiros 80 kWh para famílias do CadÚnico.");
        if (p.recebebpc) porque.push("Famílias com alguém que recebe o BPC também têm direito.");
        if (p.tradicional) porque.push("Famílias indígenas e quilombolas inscritas no CadÚnico também têm direito.");
        return { nivel: nivelCad(p), porque: porque };
      }
    },
    {
      id: "luzdopovo", tema: "Contas da casa", nome: "Luz do Povo",
      resumo: "Isenção de parte da conta de luz (consumo de até 120 kWh por mês) para famílias do CadÚnico com renda por pessoa entre meio e um salário mínimo.",
      precisaCad: true, fonte: "https://www.gov.br/mme/pt-br/luzdopovo",
      leve: ["CPF do titular da conta de luz", "Número do CadÚnico (NIS)", "Conta de luz recente"],
      como: ["Mantenha o CadÚnico atualizado.", "Pergunte à distribuidora de energia se a sua conta já tem a isenção.", "Se não tiver, peça a inclusão."],
      avaliar(p) {
        if (!(p.pc > METADE && p.pc <= SM)) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está entre meio e um salário mínimo, faixa em que o programa se aplica a famílias do CadÚnico."] };
      }
    },
    {
      id: "agua", tema: "Contas da casa", nome: "Tarifa Social de Água e Esgoto",
      resumo: "Desconto na conta de água e esgoto para famílias do CadÚnico com renda de até meio salário mínimo por pessoa, ou com pessoa com deficiência ou idosa de 65 anos ou mais que recebe o BPC. As regras e o desconto mudam conforme a empresa de saneamento.",
      precisaCad: true, fonte: "https://www.gov.br/ana/pt-br/assuntos/saneamento-basico/tarifa-social-de-agua-e-esgoto",
      leve: ["CPF do titular da conta de água", "Número do CadÚnico (NIS)", "Conta de água recente"],
      como: ["Pergunte à empresa de água e esgoto da sua cidade se existe a tarifa social e como pedir.", "Leve o número do CadÚnico e a conta recente.", "Acompanhe se o desconto apareceu nas próximas contas."],
      avaliar(p) {
        if (p.pc > METADE) return null;
        return { nivel: nivelCad(p), porque: [pcTxt(p) + " está abaixo de meio salário mínimo, faixa prevista para o desconto."] };
      }
    },
    {
      id: "gas", tema: "Contas da casa", nome: "Gás do Povo",
      resumo: "Recarga gratuita do botijão de 13 kg em revenda credenciada, por meio de um vale, para famílias do CadÚnico com renda de até meio salário mínimo por pessoa e cadastro atualizado nos últimos 2 anos. Substituiu o Auxílio Gás em dinheiro. O número de recargas por ano depende do tamanho da família (famílias com 4 ou mais pessoas têm até 6 por ano).",
      precisaCad: true, fonte: "https://www.gov.br/mds",
      leve: ["CadÚnico atualizado", "CPF do responsável familiar", "Botijão vazio para a troca"],
      como: ["A seleção das famílias é feita pelo governo a partir do CadÚnico, então mantenha o cadastro atualizado.", "Consulte no aplicativo oficial se a família foi selecionada.", "Retire a recarga em uma revenda credenciada."],
      avaliar(p) {
        if (p.pc > METADE) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está abaixo de meio salário mínimo. A escolha das famílias depende do governo, por isso vale conferir."] };
      }
    },
    {
      id: "telefonetv", tema: "Contas da casa", nome: "Telefone Popular e kit gratuito de TV digital",
      resumo: "Tarifa reduzida no telefone fixo e kits gratuitos de conversão para a TV digital, para famílias de baixa renda inscritas no CadÚnico.",
      precisaCad: true, fonte: "https://www.gov.br/mds",
      leve: ["Número do CadÚnico (NIS)", "Documento com foto e CPF", "Comprovante de endereço"],
      como: ["Para o telefone, pergunte à operadora sobre o plano popular.", "Para o kit de TV, procure os canais do programa ou o CRAS para saber se a sua região está atendida."],
      avaliar(p) {
        if (p.pc > METADE) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está abaixo de meio salário mínimo. A disponibilidade depende da sua região e da operadora."] };
      }
    },
    {
      id: "moradia", tema: "Moradia", nome: "Minha Casa, Minha Vida",
      resumo: "Programa de moradia para quem não tem casa própria, com juros menores e, nas faixas de menor renda, desconto (subsídio). Em " + REF.ano + ", vale para famílias com renda bruta de até " + real(REF.mcmv[3]) + " por mês.",
      fonte: "https://www.gov.br/cidades/pt-br/acesso-a-informacao/acoes-e-programas/habitacao/programa-minha-casa-minha-vida",
      leve: ["CPF e documento com foto", "Comprovante de renda da família", "Comprovante de residência", "CadÚnico atualizado (as faixas de menor renda pedem)"],
      como: ["Descubra a sua faixa: pela renda total da casa, antes dos descontos.", "Nas faixas de menor renda, procure a secretaria de habitação da prefeitura. Nas faixas maiores, procure a Caixa ou um banco que participa do programa.", "Entregue os documentos e acompanhe o andamento."],
      avaliar(p) {
        if (!p.semcasa) return null;
        const f = REF.mcmv, r = p.renda;
        if (r > f[3]) return { nivel: "improvavel", porque: ["A renda total da casa (" + real(r) + ") passa de " + real(f[3]) + ", limite do programa."] };
        const faixa = r <= f[0] ? 1 : r <= f[1] ? 2 : r <= f[2] ? 3 : 4;
        return { nivel: "possivel", porque: ["A renda total da casa (" + real(r) + ") se encaixa na Faixa " + faixa + " do programa em " + REF.ano + ". As vagas e o valor do imóvel dependem da sua cidade."] };
      }
    },
    {
      id: "reformacasa", tema: "Moradia", nome: "Reforma Casa Brasil: crédito da Caixa para reformar a casa",
      resumo: "Crédito da Caixa para reformar, ampliar ou adaptar a casa (por exemplo, com acessibilidade), para quem mora em área urbana e tem renda familiar bruta de até " + real(REF.reformaCasaLimite) + " por mês. Em " + REF.ano + ", o programa tem juros abaixo de 1% ao mês, prazo de até 72 meses e crédito que pode chegar a R$ 50 mil por família, conforme a análise da Caixa.",
      fonte: "https://www.caixa.gov.br",
      leve: ["CPF e documento com foto", "Comprovante de renda da família", "Documentos do imóvel (a Caixa informa o que pedir)", "Orçamento da obra"],
      como: ["Confira se a casa fica em área urbana e se a renda bruta da família está dentro do limite.", "Peça a simulação e a análise de crédito pelo aplicativo ou site da Caixa, ou em uma agência.", "Siga as regras da Caixa para liberar o dinheiro: ela pede a comprovação da obra.", "Use o valor só na reforma: se a obra não for comprovada, há multa e o nome pode ir para o cadastro de inadimplentes."],
      avaliar(p) {
        if (!p.reforma) return null;
        const limite = REF.reformaCasaLimite;
        if (p.renda > limite) return { nivel: "improvavel", porque: ["A renda total da casa (" + real(p.renda) + ") passa de " + real(limite) + ", limite do programa. Rendas maiores podem ter outras linhas de crédito da Caixa, com regras próprias."] };
        return { nivel: "possivel", porque: ["A renda total da casa (" + real(p.renda) + ") está dentro do limite de " + real(limite) + " do programa. A aprovação depende da análise de crédito da Caixa e de a casa ficar em área urbana."] };
      }
    },
    {
      id: "regularizacao", tema: "Moradia", nome: "Regularização fundiária (Reurb): escritura para imóvel sem registro",
      resumo: "A Reurb é o processo, conduzido pela prefeitura, para dar documento a imóveis em áreas irregulares ou sem registro. Na modalidade de interesse social (Reurb-S), para famílias de baixa renda, os custos da regularização e do registro em cartório costumam ficar com o poder público. A regra federal considera renda familiar de até " + real(5 * SM) + " (5 salários mínimos), e a prefeitura pode adotar regras locais.",
      fonte: "https://www.gov.br/cidades/pt-br/assuntos/publicacoes/arquivos/arquivos/cartilha_reurb.pdf",
      leve: ["Documento com foto e CPF", "Comprovante de renda da família", "Papéis que mostrem a posse do imóvel (contrato de compra e venda, recibos, carnê de IPTU, contas)", "Comprovante de endereço"],
      como: ["Procure a secretaria de habitação ou de regularização fundiária da prefeitura e pergunte se a sua área já está em processo de Reurb.", "Reúna os papéis que provem há quanto tempo você mora no imóvel e como o adquiriu.", "Peça a classificação como Reurb-S (interesse social) se a renda da família for baixa.", "Acompanhe o processo até a certidão de regularização e o registro da matrícula no cartório de imóveis.", "Se a prefeitura não ajudar, procure a Defensoria Pública para orientação."],
      avaliar(p) {
        if (!p.semescritura) return null;
        if (p.renda <= 5 * SM) return { nivel: "possivel", porque: ["A renda total da casa (" + real(p.renda) + ") está dentro do limite de " + real(5 * SM) + " da regra federal para a Reurb de interesse social. Quem decide é a prefeitura."] };
        return { nivel: "possivel", porque: ["A renda total da casa (" + real(p.renda) + ") passa do limite da Reurb de interesse social. A regularização ainda pode ser feita como Reurb de interesse específico, mas os custos podem ficar com os moradores."] };
      }
    },
    /* ---------- Transporte e mobilidade ---------- */
    {
      id: "passelivre", tema: "Transporte", nome: "Passe Livre interestadual para pessoa com deficiência",
      resumo: "Gratuidade em viagens de ônibus, trem ou barco entre estados para pessoas com deficiência de baixa renda.",
      fonte: "https://passelivre.antt.gov.br/",
      leve: ["Documento com foto e CPF", "Laudo ou atestado médico", "Comprovante de renda da família"],
      como: ["Acesse o site oficial do Passe Livre (ANTT) e faça o cadastro.", "Envie os documentos pedidos.", "Com o passe aprovado, apresente-o na hora de reservar a passagem."],
      avaliar(p) {
        if (!p.pcd) return null;
        if (p.pc <= SM) return { nivel: "provavel", porque: ["A Lei 8.899/1994 dá gratuidade em viagens interestaduais à pessoa com deficiência comprovadamente carente, com renda por pessoa de até um salário mínimo.", pcTxt(p) + " está dentro desse limite."] };
        return { nivel: "improvavel", porque: [pcTxt(p) + " passa de um salário mínimo, limite para o passe livre interestadual."] };
      }
    },
    {
      id: "carteiraidoso", tema: "Transporte", nome: "Carteira da Pessoa Idosa (viagens interestaduais)",
      resumo: "Idosos com renda de até 2 salários mínimos têm direito a vagas gratuitas em viagens interestaduais de ônibus, trem ou barco e, depois delas, a pelo menos 50% de desconto.",
      fonte: GOVBR + "/adquirir-carteira-do-idoso",
      leve: ["Documento com foto e CPF", "Comprovante de renda ou CadÚnico", "Comprovante de residência"],
      como: ["Peça a carteira no CRAS ou pelo serviço do gov.br.", "Na hora de comprar a passagem, informe que vai usar a Carteira da Pessoa Idosa.", "Reserve a vaga gratuita com antecedência."],
      avaliar(p) {
        if (!p.idoso60 || p.pc > 2 * SM) return null;
        return { nivel: "possivel", porque: ["A pessoa tem 60 anos ou mais e a renda por pessoa da casa (" + real(p.pc) + ") parece estar dentro do limite. A comprovação é individual, então confira no CRAS."] };
      }
    },
    {
      id: "transporteIdoso", tema: "Transporte", nome: "Gratuidade no transporte coletivo urbano para idosos",
      resumo: "Idosos com 65 anos ou mais não pagam o ônibus urbano.",
      fonte: "https://www.gov.br/mdh",
      leve: ["Documento com foto que comprove a idade", "Cartão do idoso, quando a sua cidade exigir"],
      como: ["Pergunte à empresa de ônibus ou à prefeitura se é preciso fazer um cadastro.", "Faça o cadastro, se for exigido.", "Apresente o documento ao embarcar."],
      avaliar(p) {
        if (!p.idoso65) return null;
        return { nivel: "provavel", porque: ["O Estatuto da Pessoa Idosa garante a gratuidade no transporte coletivo urbano a partir dos 65 anos."] };
      }
    },
    {
      id: "transportePcd", tema: "Transporte", nome: "Gratuidade ou desconto no transporte urbano para pessoa com deficiência",
      resumo: "Muitas cidades e estados dão gratuidade ou desconto no transporte urbano para pessoas com deficiência. A regra muda de lugar para lugar.",
      fonte: GOVBR,
      leve: ["Documento com foto e CPF", "Laudo médico", "Comprovante de residência"],
      como: ["Pergunte na prefeitura ou na empresa de transporte da sua cidade se existe o benefício.", "Peça a lista de documentos e o formulário.", "Faça o cadastro e retire o cartão."],
      avaliar(p) {
        if (!p.pcd) return null;
        return { nivel: "possivel", porque: ["Não há uma regra única no país. A prefeitura ou o governo do estado define como funciona."] };
      }
    },
    {
      id: "idjovem", tema: "Transporte", nome: "ID Jovem: meia-entrada e vagas gratuitas em viagens interestaduais",
      resumo: "Documento para jovens de baixa renda (de 15 a 29 anos) que dá direito a meia-entrada em eventos e a vagas no transporte interestadual.",
      precisaCad: true, fonte: GOVBR + "/obter-a-carteira-de-identidade-jovem",
      leve: ["Documento com foto", "CPF", "Número do CadÚnico (NIS)"],
      como: ["Confirme que o CadÚnico está atualizado.", "Peça a ID Jovem pelo serviço do gov.br.", "Apresente a carteira na compra do ingresso ou da passagem."],
      avaliar(p) {
        if (!(p.idade === "18-29" || p.idade === "0-17") || p.pc > METADE) return null;
        return { nivel: nivelCad(p), porque: ["A ID Jovem é para quem tem de 15 a 29 anos e vem de família de baixa renda inscrita no CadÚnico."] };
      }
    },
    {
      id: "cnh", tema: "Transporte", nome: "CNH Social (carteira de motorista gratuita)",
      resumo: "Gratuidade das taxas e despesas para tirar a carteira de motorista, para candidatos de baixa renda.",
      precisaCad: true, fonte: GOVBR,
      leve: ["Documento com foto e CPF", "Número do CadÚnico (NIS)", "Comprovante de residência"],
      como: ["Pergunte no Detran do seu estado como funciona a gratuidade e quando há inscrições.", "Confirme que o CadÚnico está atualizado.", "Faça a inscrição no período indicado."],
      avaliar(p) {
        if (p.menor || p.cad === "nao" || p.pc > METADE) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está abaixo de meio salário mínimo. A oferta e as regras dependem do seu estado."] };
      }
    },
    {
      id: "veiculo", tema: "Transporte", nome: "Isenção de impostos na compra de carro",
      resumo: "Pessoas com deficiência podem ter isenção de impostos (como IPI e IOF) ao comprar um carro, com regras próprias. Estados costumam ter isenção de ICMS e IPVA.",
      fonte: "https://www.gov.br/receitafederal",
      leve: ["Laudo médico com a indicação da deficiência", "Documento com foto e CPF", "Dados de quem vai dirigir, se não for a própria pessoa"],
      como: ["Converse com a concessionária ou com a Receita Federal sobre a isenção de IPI e IOF.", "Pergunte na secretaria da Fazenda do seu estado sobre ICMS e IPVA.", "Reúna o laudo e siga a lista de documentos de cada órgão."],
      avaliar(p) {
        if (!p.pcd) return null;
        return { nivel: "possivel", porque: ["Depende do tipo de deficiência, do laudo e de quem vai dirigir o carro. Vale confirmar no canal oficial."] };
      }
    },
    /* ---------- Direitos e documentos ---------- */
    {
      id: "ciptea", tema: "Direitos e documentos", nome: "Carteira de identificação da pessoa com autismo (CIPTEA)",
      resumo: "Documento que ajuda a provar o direito ao atendimento prioritário e a outros direitos da pessoa com autismo. Não depende de renda.",
      fonte: "https://www.gov.br/mdh",
      leve: ["Laudo ou relatório médico recente", "Documento com foto e CPF", "Comprovante de residência"],
      como: ["Pergunte no CRAS ou na secretaria de saúde ou de assistência social da sua cidade ou do seu estado qual órgão emite a carteira, pois isso muda de lugar para lugar.", "Leve os documentos e peça a carteira.", "Guarde uma cópia do laudo: ele também é pedido em outros direitos."],
      avaliar(p) {
        if (!p.tea) return null;
        return { nivel: "provavel", porque: ["A Lei 13.977/2020 criou a carteira de identificação da pessoa com autismo (CIPTEA). Ela vale independentemente da renda."] };
      }
    },
    {
      id: "prioridade", tema: "Direitos e documentos", nome: "Atendimento prioritário",
      resumo: "Pessoas com deficiência, idosos a partir de 60 anos e gestantes têm direito a fila e atendimento prioritários em bancos, repartições e serviços.",
      fonte: "https://www.gov.br/mdh",
      leve: ["Documento com foto", "Se houver, a CIPTEA ou o laudo médico"],
      como: ["Peça a prioridade no balcão ou na fila.", "Se recusarem, peça o nome do atendente e a recusa por escrito, e ligue para o Disque 100."],
      avaliar(p) {
        if (!(p.pcd || p.idoso60 || p.gest)) return null;
        return { nivel: "provavel", porque: ["A Lei 10.048/2000 garante atendimento prioritário a pessoas com deficiência, idosos a partir de 60 anos e gestantes."] };
      }
    },
    {
      id: "concursos", tema: "Direitos e documentos", nome: "Isenção da taxa de concursos públicos",
      resumo: "Famílias de baixa renda inscritas no CadÚnico podem pedir isenção da taxa de inscrição em concursos públicos. Peça com antecedência, pois o prazo costuma ser anterior ao da inscrição.",
      precisaCad: true, fonte: "https://aplicacoes.mds.gov.br/sistac/",
      leve: ["Número do CadÚnico (NIS)", "Documento com foto e CPF", "Formulário do edital"],
      como: ["Leia o edital do concurso para ver o prazo do pedido de isenção.", "Confirme que o CadÚnico está atualizado, pois em geral o cadastro precisa estar em dia antes da prova.", "Faça o pedido ao órgão que organiza o concurso."],
      avaliar(p) {
        if (p.menor || p.cad === "nao" || p.pc > METADE) return null;
        return { nivel: nivelCad(p), porque: [pcTxt(p) + " está abaixo de meio salário mínimo, faixa que costuma ser exigida."] };
      }
    },
    {
      id: "imposto", tema: "Direitos e documentos", nome: "Isenção de Imposto de Renda para aposentados e pensionistas",
      resumo: "Em " + REF.ano + ", quem ganha até " + real(REF.irIsento) + " por mês é isento. Aposentados e pensionistas com 65 anos ou mais têm ainda uma faixa extra de isenção de " + real(REF.irIdoso) + " por mês. Quem tem doença grave listada em lei pode ser isento de todo o imposto sobre a aposentadoria.",
      fonte: "https://www.gov.br/receitafederal",
      leve: ["Documento com foto e CPF", "Comprovante de rendimentos da aposentadoria ou pensão", "Laudo médico oficial (no caso de doença grave)"],
      como: ["Se você é aposentado(a) ou pensionista com 65 anos ou mais, confira se a fonte pagadora aplicou a faixa extra de isenção.", "Em caso de doença grave, peça a isenção ao INSS ou à fonte pagadora, com o laudo médico oficial.", "Se pagou imposto indevidamente nos últimos 5 anos, pergunte à Receita Federal sobre a restituição."],
      avaliar(p) {
        if (p.inss !== "sim" && !p.aposentado) return null;
        if (p.idoso65) return { nivel: "possivel", porque: ["A pessoa tem 65 anos ou mais e já contribuiu ao INSS. Se for aposentada ou pensionista, pode ter a faixa extra de isenção."] };
        if (p.doenca) return { nivel: "possivel", porque: ["Só vale se a doença estiver na lista da lei (por exemplo, câncer ou cardiopatia grave) e a pessoa for aposentada ou pensionista. O autismo, sozinho, não está na lista."] };
        if (p.aposentado) return { nivel: "possivel", porque: ["Quem recebe aposentadoria ou pensão e ganha até " + real(REF.irIsento) + " por mês é isento do Imposto de Renda em " + REF.ano + ". Confira na fonte pagadora e na declaração se a regra foi aplicada ao seu caso."] };
        return null;
      }
    },
    {
      id: "rua", tema: "Direitos e documentos", nome: "Cadastro Único e benefícios para quem está em situação de rua",
      resumo: "Quem vive em situação de rua pode fazer o Cadastro Único sem comprovante de residência, no Centro POP, no CRAS ou no CREAS. Com o cadastro, é possível pedir o Bolsa Família (famílias com pessoas em situação de rua têm prioridade no programa) e, para quem tem 65 anos ou mais ou deficiência, o BPC. O Centro POP também orienta sobre documentos, alimentação e abrigo.",
      fonte: "https://www.gov.br/mds/pt-br/acoes-e-programas/cadastro-unico/informes/informe-cadastro-unico-83",
      leve: ["Documento de identificação (RG, certidão de nascimento ou outro). Quem não tem pode pedir orientação à equipe para tirar a segunda via", "Não é preciso comprovante de residência"],
      como: ["Procure o Centro POP, o CRAS ou o CREAS mais perto e explique que está em situação de rua.", "Leve o documento de identificação. Se não tem, peça orientação à equipe para tirar a segunda via.", "Faça o Cadastro Único e peça a avaliação para o Bolsa Família e, se for o caso, para o BPC.", "Pergunte também sobre abrigo, alimentação, higiene e outros serviços do Centro POP da sua cidade."],
      avaliar(p) {
        if (!p.rua) return null;
        return { nivel: "provavel", porque: ["O Cadastro Único aceita pessoas em situação de rua sem exigir comprovante de residência, e elas têm prioridade em alguns programas."] };
      }
    },
    /* ---------- Saúde ---------- */
    {
      id: "saude", tema: "Saúde", nome: "Tratamento e terapias pelo SUS",
      resumo: "Atendimento de saúde gratuito, com encaminhamento a especialistas, terapias e centros de reabilitação.",
      negado: true, fonte: "https://www.gov.br/saude",
      leve: ["Documento com foto", "Cartão SUS, se tiver", "Laudos, receitas e exames anteriores"],
      como: ["Procure a UBS mais perto de casa e explique a situação.", "Peça o encaminhamento para o especialista, o CAPS ou um centro de reabilitação.", "Se a pessoa tem plano de saúde, as terapias para autismo indicadas pelo médico devem ser cobertas. Se o plano negar, peça a negativa por escrito e procure a Defensoria Pública."],
      avaliar(p) {
        if (!(p.pcd || p.doenca || p.tratamento)) return null;
        return { nivel: "provavel", porque: ["Todo cidadão tem direito ao atendimento pelo SUS, sem pagar."] };
      }
    },
    {
      id: "farmacia", tema: "Saúde", nome: "Farmácia Popular",
      resumo: "Medicamentos gratuitos ou com desconto em farmácias credenciadas, com receita médica. Quem recebe o Bolsa Família tem acesso gratuito a todos os medicamentos do programa.",
      fonte: "https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular",
      leve: ["Documento com foto", "CPF", "Receita médica válida"],
      como: ["Confira se o medicamento faz parte do programa.", "Procure uma farmácia credenciada.", "Apresente a receita e os documentos."],
      avaliar(p) {
        if (!(p.doenca || p.tratamento || p.idoso60 || p.pc <= REF.bolsaFamilia)) return null;
        return { nivel: "possivel", porque: ["O programa atende a todos, mas ajuda mais quem usa medicamento contínuo ou tem baixa renda."] };
      }
    },
    {
      id: "menstrual", tema: "Saúde", nome: "Dignidade Menstrual (absorventes gratuitos)",
      resumo: "Distribuição gratuita de absorventes para meninas, mulheres e outras pessoas que menstruam, em situação de vulnerabilidade.",
      precisaCad: true, fonte: "https://www.gov.br/saude/pt-br/composicao/sectics/farmacia-popular",
      leve: ["Documento com foto", "CPF", "Número do CadÚnico (NIS)"],
      como: ["Procure uma farmácia credenciada do programa Farmácia Popular.", "Leve o documento e informe o CPF.", "Em dúvida, pergunte na UBS ou no CRAS."],
      avaliar(p) {
        if (p.cad === "nao" || p.pc > METADE || p.idoso65) return null;
        return { nivel: "possivel", porque: [pcTxt(p) + " está abaixo de meio salário mínimo. Serve para quem menstrua e se encaixa nas regras do programa."] };
      }
    },
    {
      id: "prenatal", tema: "Saúde", nome: "Pré-natal, parto e registro do bebê gratuitos",
      resumo: "Acompanhamento da gravidez e parto pelo SUS, vacinas do bebê e a primeira certidão de nascimento sem custo.",
      fonte: "https://www.gov.br/saude",
      leve: ["Documento com foto", "Cartão SUS, se tiver", "Declaração de Nascido Vivo (entregue no hospital)"],
      como: ["Comece o pré-natal na UBS o quanto antes.", "Peça a Declaração de Nascido Vivo no hospital.", "Faça o registro no cartório: a primeira certidão é gratuita.", "Leve a caderneta do bebê à UBS para vacinar."],
      avaliar(p) {
        if (!p.gest) return null;
        return { nivel: "provavel", porque: ["Esses serviços são direito de toda gestante e de todo recém-nascido."] };
      }
    },
    {
      id: "primeirainfancia", tema: "Saúde", nome: "Primeira Infância no SUAS (visitas e apoio às famílias)",
      resumo: "Programa em que equipes da assistência social visitam a casa e apoiam gestantes e famílias com crianças pequenas, para ajudar no desenvolvimento da criança.",
      fonte: "https://www.gov.br/mds/pt-br/acoes-e-programas/crianca-feliz",
      leve: ["Documento com foto e CPF", "CadÚnico atualizado", "Documentos da criança"],
      como: ["Procure o CRAS e pergunte se o programa existe no seu município.", "Peça a inclusão da família.", "As visitas são combinadas com a equipe."],
      avaliar(p) {
        if (!(p.crianca6 || p.gest) || p.pc > METADE) return null;
        return { nivel: "possivel", porque: ["Vale para gestantes e famílias com crianças pequenas em situação de vulnerabilidade. A oferta depende do município."] };
      }
    },
    /* ---------- Educação ---------- */
    {
      id: "escola", tema: "Educação", nome: "Escola inclusiva e atendimento educacional especializado",
      resumo: "A escola comum não pode recusar a matrícula por causa da deficiência. Quando necessário, deve oferecer apoio, como atendimento educacional especializado e acompanhante.",
      negado: true, fonte: "https://www.gov.br/mec",
      leve: ["Certidão de nascimento e documento do responsável", "Laudo ou relatório médico", "Comprovante de residência"],
      como: ["Matricule o aluno na escola comum da rede pública.", "Entregue o laudo à escola e peça o atendimento educacional especializado e, se for preciso, um acompanhante.", "Se a escola recusar a matrícula ou o apoio, peça a recusa por escrito e procure a Defensoria Pública ou o Ministério Público."],
      avaliar(p) {
        if (!(p.pcd && (p.menor || p.estud))) return null;
        return { nivel: "provavel", porque: ["A Lei Brasileira de Inclusão (Lei 13.146/2015) garante o direito à escola sem discriminação.", p.tea ? "Para o autismo, a Lei 12.764/2012 também proíbe a recusa de matrícula." : "Isso vale para qualquer deficiência."] };
      }
    },
    {
      id: "bpcescola", tema: "Educação", nome: "BPC na Escola",
      resumo: "Programa que ajuda crianças e adolescentes com deficiência, de até 18 anos, que recebem o BPC a entrar e permanecer na escola, com apoio da assistência social, da saúde e da educação.",
      fonte: "https://www.gov.br/mds/pt-br/acoes-e-programas/suas/servicos-e-programas/bpc-na-escola",
      leve: ["Documentos da criança e do responsável", "Comprovante de que recebe o BPC", "Comprovante de matrícula"],
      como: ["Se a criança já recebe o BPC, o município deve fazer a busca ativa e o acompanhamento.", "Procure o CRAS ou a secretaria de educação para participar.", "Informe as barreiras que a criança enfrenta para ir à escola."],
      avaliar(p) {
        if (!(p.pcd && p.menor) || p.pc > METADE) return null;
        return { nivel: "possivel", porque: ["Vale para quem recebe o BPC. Se a família ainda não recebe, o primeiro passo é o pedido do BPC."] };
      }
    },
    {
      id: "pedemeia", tema: "Educação", nome: "Pé-de-Meia",
      resumo: "Incentivo financeiro, na forma de poupança, para estudantes de baixa renda do ensino médio público. Em " + REF.ano + ": R$ 200 de matrícula por ano, até 9 parcelas de R$ 200 por frequência (mínimo de 80% das aulas), R$ 1.000 por série concluída (guardados até o fim do ensino médio) e R$ 200 para quem faz os dois dias do Enem no 3º ano. Pode chegar a R$ 9.200 nos três anos.",
      precisaCad: true, fonte: "https://www.gov.br/mec/pt-br/pe-de-meia",
      leve: ["CPF do estudante", "CadÚnico atualizado", "Matrícula e frequência em dia na escola"],
      como: ["Confirme com a escola se o estudante se encaixa.", "Mantenha matrícula e frequência escolar em dia.", "Acompanhe o benefício pelo aplicativo ou banco indicado."],
      avaliar(p) {
        if (!p.estud || p.pc > METADE) return null;
        return { nivel: "possivel", porque: ["Vale para quem está no ensino médio da rede pública e tem a família no CadÚnico. " + pcTxt(p) + " está abaixo de meio salário mínimo."] };
      }
    },
    {
      id: "enem", tema: "Educação", nome: "Isenção da taxa do Enem",
      resumo: "Estudantes de escola pública e de baixa renda podem pedir isenção da taxa de inscrição do Enem.",
      fonte: "https://www.gov.br/inep",
      leve: ["CPF e documento com foto", "Conta gov.br", "Comprovantes que o edital pedir"],
      como: ["Acompanhe o edital e as datas no site do Inep.", "Peça a isenção dentro do prazo e faça a inscrição.", "Guarde o comprovante."],
      avaliar(p) {
        if (!p.estud) return null;
        return { nivel: "possivel", porque: ["As regras de isenção mudam a cada edital. Confira se a pessoa se encaixa."] };
      }
    },
    {
      id: "superior", tema: "Educação", nome: "Faculdade: ProUni, FIES Social, Sisu e assistência estudantil",
      resumo: "Caminhos para estudar no ensino superior sem pagar ou pagando menos: bolsas do ProUni em faculdades particulares, financiamento FIES Social para estudantes do CadÚnico com renda de até meio salário mínimo por pessoa, vagas reservadas no Sisu e auxílios (moradia, alimentação, transporte) nas universidades federais.",
      fonte: "https://www.gov.br/mec/pt-br/assuntos/noticias/2025/julho/fies-social-oferece-100-de-financiamento-via-cadunico",
      leve: ["Nota do Enem", "Documento com foto e CPF", "Comprovantes de renda da família e CadÚnico"],
      como: ["Faça o Enem e guarde o resultado.", "Acompanhe os editais do ProUni, do FIES e do Sisu e inscreva-se no prazo.", "Depois de aprovado, procure o setor de assistência estudantil da universidade e peça os auxílios."],
      avaliar(p) {
        if (!(p.estud || p.faculdade)) return null;
        return { nivel: "possivel", porque: [p.pc <= METADE ? pcTxt(p) + " está abaixo de meio salário mínimo, limite de renda do FIES Social. As cotas e bolsas têm critérios próprios; confira o edital de cada programa." : "Cada programa tem sua própria faixa de renda e critérios. Confira o edital."] };
      }
    },
    {
      id: "internetbrasil", tema: "Educação", nome: "Internet Brasil (chip com internet para estudantes)",
      resumo: "Chip e pacote de dados para alunos da educação básica da rede pública de famílias inscritas no CadÚnico.",
      precisaCad: true, fonte: "https://portal.internetbrasil.mcom.gov.br/",
      leve: ["CadÚnico atualizado", "Dados do aluno e da escola"],
      como: ["Confirme com a escola se ela participa do programa.", "Mantenha o CadÚnico atualizado.", "Acompanhe o cadastro e a entrega do chip pelos canais do programa."],
      avaliar(p) {
        if (!p.estud || p.pc > METADE || p.cad === "nao") return null;
        return { nivel: "possivel", porque: ["Vale para estudante da rede pública com a família no CadÚnico. A oferta depende da escola e da região."] };
      }
    },
    /* ---------- Família e filhos ---------- */
    {
      id: "paternidade", tema: "Família", nome: "Licença-paternidade e salário-paternidade",
      resumo: "O pai (ou quem adota ou recebe a guarda de uma criança) tem direito a se afastar do trabalho sem perder o emprego nem o salário. Em " + REF.ano + " são 5 dias. A Lei 15.371/2026 amplia para 10 dias em 2027, 15 em 2028 e 20 em 2029 (o último passo depende de a meta fiscal de 2028 ser cumprida). A lei também cria o salário-paternidade, pago pelo INSS a quem não é empregado com carteira, como MEI e autônomo.",
      fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Certidão de nascimento ou documento da adoção ou guarda", "Documento com foto e CPF", "Aviso ao empregador, de preferência por escrito"],
      como: ["Avise o empregador por escrito o quanto antes. A lei dá estabilidade no emprego desde o aviso até 1 mês depois do fim da licença.", "Se for MEI, autônomo ou outro segurado do INSS, peça o salário-paternidade ao INSS quando a regra começar a valer (a partir de 2027; confirme no Meu INSS).", "Se a empresa negar a licença, procure o sindicato, o Ministério do Trabalho (158) ou a Defensoria Pública."],
      avaliar(p) {
        if (!p.pai) return null;
        return { nivel: nivelInss(p), porque: ["A licença-paternidade vale para o pai empregado com carteira assinada. Quem é MEI, autônomo ou segurado especial passa a ter o salário-paternidade, pago pelo INSS.", p.inss === "sim" ? "Você informou que trabalha ou contribui com carteira assinada ou INSS." : "Confira se você tem vínculo com carteira ou contribui ao INSS."] };
      }
    },
    {
      id: "licencamaternidade", tema: "Família", nome: "Licença-maternidade e estabilidade da gestante",
      resumo: "A empregada gestante tem direito a 120 dias de licença-maternidade com salário (180 dias se a empresa participa do programa Empresa Cidadã) e não pode ser demitida sem justa causa desde a confirmação da gravidez até 5 meses depois do parto.",
      negado: true, fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Atestado ou exame que confirme a gravidez", "Documento com foto e CPF", "Certidão de nascimento do bebê, depois do parto"],
      como: ["Entregue o atestado médico ao empregador e combine a data de início da licença (ela pode começar até 28 dias antes do parto).", "Se for demitida durante a gravidez, procure o sindicato ou a Defensoria Pública: a demissão pode ser anulada e a empregada pode ser reintegrada ou indenizada.", "Guarde o exame de gravidez e as datas: a estabilidade conta desde a confirmação, mesmo que a empresa não soubesse."],
      avaliar(p) {
        if (!p.gest || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Vale para a gestante com carteira assinada. Sem carteira, veja também o salário-maternidade do INSS e a possibilidade de reconhecer o vínculo de emprego."] };
      }
    },
    {
      id: "pensaoalimenticia", tema: "Família", nome: "Pensão alimentícia para filhos: pedir ou cobrar sem pagar advogado",
      resumo: "Pai e mãe têm o dever de sustentar os filhos, mesmo sem morar com eles. Quem não pode pagar advogado consegue fazer o pedido ou a cobrança de graça pela Defensoria Pública. O valor é combinado ou decidido pelo juiz, conforme a necessidade do filho e a possibilidade de quem paga.",
      negado: true, fonte: "https://www.dpu.def.br",
      leve: ["Certidão de nascimento do filho", "Documento com foto e CPF de quem pede", "Dados de quem deve pagar (nome, endereço e onde trabalha, se souber)", "Comprovantes dos gastos do filho (escola, saúde, moradia, comida)"],
      como: ["Procure a Defensoria Pública do seu estado (ou o núcleo de prática jurídica de uma faculdade de Direito) e peça atendimento para pensão alimentícia.", "Leve os documentos da lista. Não é preciso ter sido casado com a outra parte.", "Se já existe decisão e o pagamento atrasou, peça a cobrança: a falta de pagamento pode levar ao desconto em folha e até à prisão civil do devedor."],
      avaliar(p) {
        if (!p.pensao) return null;
        return { nivel: "provavel", porque: ["O direito do filho à pensão não depende da renda de quem pede. A Defensoria atende de graça quem não pode pagar advogado."] };
      }
    },
    {
      id: "violencia", tema: "Família", nome: "Proteção contra violência doméstica e familiar",
      resumo: "A Lei Maria da Penha protege mulheres de violência física, psicológica, sexual, patrimonial e moral dentro de casa. A Justiça pode dar medida protetiva de urgência (afastar o agressor, proibir contato), garantir a matrícula dos filhos em escola perto da nova casa, manter o vínculo de trabalho por até 6 meses e conceder auxílio-aluguel por até 6 meses a quem está em situação de vulnerabilidade. Para idosos, crianças e pessoas com deficiência vale o Disque 100.",
      negado: true, fonte: "https://www.gov.br/mulheres/pt-br",
      leve: ["Documento com foto, se tiver (não é obrigatório para pedir ajuda)", "Provas: mensagens, fotos, laudos, nomes de testemunhas", "Dados do agressor (nome, endereço, onde trabalha)", "Certidão de nascimento dos filhos"],
      como: ["Em perigo agora, ligue 190. Para orientação e denúncia, ligue 180 (Central de Atendimento à Mulher, 24 horas).", "Procure a Delegacia da Mulher (ou qualquer delegacia) e peça a medida protetiva de urgência. A Defensoria Pública ajuda sem custo.", "Procure o CRAS, o CREAS e a Casa da Mulher Brasileira, onde houver, para acolhimento, abrigo e apoio psicológico e jurídico.", "Peça ao juiz também o auxílio-aluguel, o afastamento do trabalho com manutenção do emprego e a matrícula dos filhos em escola mais perto da nova casa.", "Para idoso, criança ou pessoa com deficiência, ligue 100."],
      avaliar(p) {
        if (!p.violencia) return null;
        return { nivel: "provavel", porque: ["Violência doméstica é crime, e a lei prevê proteção, abrigo e apoio. Se você corre perigo agora, ligue 190: este guia não é um canal de emergência."] };
      }
    },
    /* ---------- Trabalho (novos) ---------- */
    {
      id: "mei", tema: "Trabalho", nome: "MEI e outras formas de contribuir ao INSS por conta própria",
      resumo: "Quem trabalha por conta própria pode se formalizar como Microempreendedor Individual (MEI), de graça, e pagar uma guia mensal pequena (DAS) que inclui a contribuição ao INSS. Com isso passa a ter direito a aposentadoria, auxílio por incapacidade, salário-maternidade e salário-paternidade, e a família ganha pensão por morte. Também dá para emitir nota fiscal e pedir crédito para o negócio. Há limite de faturamento por ano e lista de atividades permitidas.",
      fonte: "https://www.gov.br/empresas-e-negocios/pt-br/empreendedor",
      leve: ["CPF e documento com foto", "Conta gov.br (nível prata ou ouro)", "Comprovante de endereço"],
      como: ["Veja se a sua atividade pode ser MEI no Portal do Empreendedor.", "Faça a inscrição pelo Portal do Empreendedor. É gratuito: desconfie de quem cobra para abrir o MEI.", "Pague o DAS todo mês (vence no dia 20) e envie a declaração anual de faturamento.", "Se já contribui, confira no Meu INSS se as contribuições estão em dia: elas contam para os benefícios."],
      avaliar(p) {
        if (!p.informal || p.menor) return null;
        return { nivel: "possivel", porque: ["Quem trabalha por conta própria ou sem carteira, em geral, não tem a proteção do INSS. O MEI é um caminho barato para tê-la.", p.inss === "nao" ? "Você informou que não contribui ao INSS, então hoje não tem essa proteção." : "Confira no Meu INSS se as suas contribuições estão em dia."] };
      }
    },
    {
      id: "domestico", tema: "Trabalho", nome: "Direitos do(a) trabalhador(a) doméstico(a)",
      resumo: "Quem trabalha em casa de família (empregada, babá, cuidador, motorista, cozinheira e outros, e diarista que vai mais de 2 dias por semana) tem direito à carteira assinada, FGTS, INSS, férias com 1/3, 13º salário, descanso semanal e horas extras. Ao ser demitido sem justa causa, pode ter seguro-desemprego de 3 parcelas de 1 salário mínimo (com FGTS recolhido por pelo menos 15 meses nos últimos 24) e saque do FGTS.",
      negado: true, fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Carteira de Trabalho (digital ou física)", "Documento com foto e CPF", "Provas do trabalho: recibos, mensagens e anotações de dias e horários"],
      como: ["Peça o registro na carteira. O empregador faz o cadastro e paga as contribuições pelo eSocial Doméstico (guia única).", "Confira se o FGTS e o INSS estão sendo depositados.", "Se for demitido sem justa causa, peça o seguro-desemprego em até 90 dias.", "Para pedir orientação ou denunciar irregularidades, ligue 158 (Ministério do Trabalho) ou procure o sindicato da categoria ou a Defensoria Pública."],
      avaliar(p) {
        if (!p.domestico || p.menor) return null;
        return { nivel: "provavel", porque: ["A Lei Complementar 150/2015 garante esses direitos ao trabalhador doméstico."] };
      }
    },
    {
      id: "semcarteira", tema: "Trabalho", nome: "Trabalho sem carteira assinada: exigir o registro e receber o que é devido",
      resumo: "Quem trabalha para um patrão, com horário, ordens e pagamento regular, tem vínculo de emprego mesmo sem carteira assinada. É possível pedir na Justiça do Trabalho o registro, o FGTS, férias com 1/3, 13º, horas extras e verbas da rescisão. O prazo para entrar com a ação é de até 2 anos depois de sair do emprego, e a cobrança vale para os últimos 5 anos.",
      negado: true, fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Documento com foto e CPF", "Provas do trabalho: mensagens, fotos, extratos de pagamento, escalas e horários", "Nomes de colegas que podem confirmar o trabalho"],
      como: ["Guarde todas as provas do trabalho e dos pagamentos.", "Procure o sindicato da categoria, a Defensoria Pública ou o Ministério do Trabalho (158), que pode fiscalizar a empresa.", "Peça orientação para entrar na Justiça do Trabalho. É possível pedir isenção de custas.", "Anote a data em que saiu do emprego: o prazo de 2 anos conta a partir dela."],
      avaliar(p) {
        if (!p.informal || p.menor) return null;
        return { nivel: "possivel", porque: ["Vale se você trabalha para um empregador, e não para si mesmo. Se trabalha de verdade por conta própria, veja o item do MEI."] };
      }
    },
    {
      id: "rescisao", tema: "Trabalho", nome: "Verbas da rescisão: o que a empresa deve pagar ao demitir",
      resumo: "Ao ser demitido sem justa causa, o trabalhador com carteira assinada tem direito a saldo de salário, aviso prévio (trabalhado ou pago), férias vencidas e proporcionais com 1/3, 13º proporcional, saque do FGTS e multa de 40% do FGTS paga pela empresa. A empresa tem 10 dias corridos para pagar. Se não pagar, pode ser cobrada na Justiça do Trabalho.",
      negado: true, fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Carteira de Trabalho", "Termo de rescisão e guia do seguro-desemprego, se houver", "Extrato do FGTS", "Holerites e recibos dos últimos meses"],
      como: ["Confira o termo de rescisão item a item: saldo de salário, aviso, férias, 13º e FGTS com multa.", "Consulte o extrato do FGTS no aplicativo para ver se todos os meses foram depositados.", "Se algo faltar, reclame por escrito à empresa e procure o sindicato ou o Ministério do Trabalho (158).", "Persistindo o problema, procure a Defensoria Pública para entrar na Justiça do Trabalho (prazo de até 2 anos depois da saída)."],
      avaliar(p) {
        if (!p.desemp || p.inss === "nao") return null;
        return { nivel: nivelInss(p), porque: ["Vale para quem foi demitido sem justa causa e tinha carteira assinada."] };
      }
    },
    {
      id: "aprendiz", tema: "Trabalho", nome: "Jovem Aprendiz: primeiro emprego com carteira assinada e curso",
      resumo: "Contrato de trabalho especial para jovens de 14 a 24 anos (sem limite de idade para pessoas com deficiência) que combina trabalho com curso de aprendizagem. Tem carteira assinada, FGTS, férias e 13º, salário proporcional às horas e jornada reduzida para quem ainda estuda. Empresas de médio e grande porte são obrigadas a ter aprendizes.",
      fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Documento com foto e CPF", "Carteira de Trabalho (a digital serve)", "Comprovante de matrícula ou de conclusão da escola", "Autorização do responsável, para menor de 18 anos"],
      como: ["Procure o Sine/Agência do Trabalhador, o CIEE, o Senac, o Senai e outras entidades de aprendizagem, que divulgam as vagas.", "Leve o currículo e os documentos.", "Confirme a idade: o contrato vale até os 24 anos, com exceção de pessoa com deficiência."],
      avaliar(p) {
        if (!(p.menor || p.jovem)) return null;
        return { nivel: p.pcd ? "provavel" : "possivel", porque: ["O contrato vale de 14 a 24 anos, sem limite de idade para pessoa com deficiência.", p.menor ? "Menor de 18 anos precisa estar estudando (ou ter concluído a escola) e ter autorização do responsável." : "Confira se você ainda tem até 24 anos."] };
      }
    },
    {
      id: "cursos", tema: "Trabalho", nome: "Cursos gratuitos de qualificação profissional",
      resumo: "Cursos de profissão gratuitos ou com bolsa: o Sistema S (Senai, Senac, Senar e Senat) e os institutos federais oferecem vagas gratuitas para pessoas de baixa renda, e as agências do trabalhador (Sine) indicam cursos e vagas de emprego. Procure também os cursos da prefeitura e do governo do estado.",
      fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Documento com foto e CPF", "Comprovante de residência", "Comprovante de escolaridade", "Comprovante de renda ou CadÚnico, quando a vaga é gratuita por renda"],
      como: ["Pergunte no Sine/Agência do Trabalhador da sua cidade quais cursos estão com vagas abertas.", "Veja o site do Senai, Senac, Senar ou Senat do seu estado e pergunte pelas vagas gratuitas.", "Procure o instituto federal mais perto: tem cursos técnicos e de qualificação gratuitos.", "Em muitos cursos, quem está no CadÚnico tem prioridade."],
      avaliar(p) {
        if (p.menor || !(p.informal || p.desemp || p.pc <= METADE)) return null;
        return { nivel: "possivel", porque: ["Cursos gratuitos ajudam quem quer entrar ou voltar ao mercado de trabalho. A oferta e os critérios mudam conforme a cidade."] };
      }
    },
    {
      id: "cotapcd", tema: "Trabalho", nome: "Reserva de vagas para pessoas com deficiência (empresas e concursos)",
      resumo: "Empresas com 100 ou mais empregados precisam reservar de 2% a 5% das vagas para pessoas com deficiência e reabilitados do INSS. Nos concursos públicos, ao menos 5% das vagas são reservadas. O autismo conta como deficiência para essas cotas.",
      negado: true, fonte: "https://www.gov.br/trabalho-e-emprego",
      leve: ["Laudo médico que descreva a deficiência (com CID)", "Documento com foto e CPF", "Currículo atualizado", "Carteira de Trabalho"],
      como: ["Peça ao médico um laudo que descreva a deficiência e as limitações.", "Cadastre o currículo no Sine/Agência do Trabalhador, que tem vagas específicas para pessoas com deficiência.", "Nos concursos, marque a vaga de pessoa com deficiência na inscrição e envie o laudo no prazo do edital.", "Se a empresa recusar por causa da deficiência, procure o Ministério Público do Trabalho ou a Defensoria Pública."],
      avaliar(p) {
        if (!p.pcd || p.menor || p.idoso65) return null;
        return { nivel: "provavel", porque: ["A Lei 8.213/1991 e a Lei Brasileira de Inclusão reservam vagas para pessoas com deficiência." + (p.tea ? " O autismo é tratado como deficiência para esse fim (Lei 12.764/2012)." : "")] };
      }
    }
  ];

  function preparar(r) {
    const pessoas = Math.max(1, Number(r.pessoas) || 1);
    const renda = Math.max(0, Number(r.renda) || 0);
    return Object.assign({}, r, {
      pessoas: pessoas, renda: renda, pc: renda / pessoas,
      pcd: !!(r.tea || r.defic),
      menor: r.idade === "0-17",
      jovem: r.idade === "18-29",
      maior55: r.idade === "55-59" || r.idade === "60-64" || r.idade === "65+",
      idoso60: r.idade === "60-64" || r.idade === "65+",
      idoso65: r.idade === "65+"
    });
  }

  /* Recebe as respostas e devolve os direitos que podem se aplicar, agrupados pelo grau de chance. */
  function avaliar(resp) {
    const p = preparar(resp);
    const itens = [];
    ITENS.forEach((it, ordem) => {
      const a = it.avaliar(p);
      if (!a) return;
      const como = it.precisaCad && p.cad !== "sim" && a.nivel !== "improvavel" ? [CAD_PASSO].concat(it.como) : it.como;
      itens.push({ id: it.id, tema: it.tema, nome: it.nome, resumo: it.resumo, nivel: a.nivel, porque: a.porque, como: como, leve: it.leve, fonte: it.fonte, negado: !!it.negado, ordem: ordem });
    });
    itens.sort((a, b) => ORDEM[a.nivel] - ORDEM[b.nivel] || a.ordem - b.ordem);
    const grupo = n => itens.filter(i => i.nivel === n);
    return { pc: p.pc, total: itens.length, provavel: grupo("provavel"), possivel: grupo("possivel"), improvavel: grupo("improvavel") };
  }

  /* Lê um valor em reais digitado do jeito brasileiro: 1500, 1.500 ou 1.500,50. Devolve NaN se não entender. */
  function lerValor(t) {
    let s = String(t).replace(/R\$/gi, "").replace(/\s/g, "");
    if (!s) return NaN;
    if (s.indexOf(",") >= 0) s = s.replace(/\./g, "").replace(",", ".");
    else if (/^\d{1,3}(\.\d{3})+$/.test(s)) s = s.replace(/\./g, "");
    return /^\d+(\.\d+)?$/.test(s) ? parseFloat(s) : NaN;
  }

  const DIREITOS = { REF: REF, real: real, avaliar: avaliar, lerValor: lerValor, total: ITENS.length, itens: ITENS };
  raiz.DIREITOS = DIREITOS;
  if (typeof module !== "undefined") module.exports = DIREITOS;
})(typeof window !== "undefined" ? window : globalThis);
