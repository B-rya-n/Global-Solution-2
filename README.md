# Facilita Cidadão

Protótipo acadêmico CitizenTech para reduzir a dificuldade de encontrar e acessar serviços públicos. O site organiza orientações em linguagem simples, reúne fontes oficiais e ajuda a pessoa a identificar onde procurar atendimento, o que separar e qual é o próximo passo.

## Problema e público

Pessoas podem ter dificuldade para descobrir o serviço público adequado, especialmente quando têm pouca familiaridade com ferramentas digitais, deficiência, conectividade limitada ou vivem longe do atendimento. O projeto atende cidadãos que precisam de orientação para serviços, direitos, golpes, vestibulares e atendimento local.

## Solução

O Facilita Cidadão oferece busca de serviços e orientações, checklist de documentos, passos para solicitar atendimento, localizador de unidades em Suzano, orientador inicial de direitos, ajustes de leitura, alto contraste e leitura em voz alta. É um guia independente; não substitui os canais oficiais.

## ODS relacionados

- ODS 10 — Redução das desigualdades: tornar orientações e caminhos de acesso mais compreensíveis.
- ODS 11 — Cidades e comunidades sustentáveis: ajudar moradores a localizar serviços e recursos públicos do território.
- ODS 3 — Saúde e bem-estar: facilitar a busca por informações e serviços de saúde.

## Tecnologias

- HTML semântico, CSS e JavaScript.
- React com componentes funcionais e hooks na busca de serviços e no orientador de direitos.
- Dados locais em arrays de objetos, renderizados na página pelo DOM/React.
- CSS Grid, Flexbox e media queries para adaptar as páginas a telas menores.
- Python gera o índice local de busca; o site continua funcionando sem backend ou etapa de compilação.

## Como abrir

1. Extraia a pasta do projeto, se estiver compactada.
2. Abra `index.html` em um navegador moderno. Não há etapa de instalação ou compilação.
3. Navegue pelo menu ou use a busca da página inicial. Para os fluxos interativos, mantenha os arquivos `assets/` e `pages/` junto ao `index.html`.

## Funcionalidade principal para demonstrar

Na página **Serviços**, pesquise uma necessidade ou escolha uma categoria. Abra uma opção, marque documentos que já separou e consulte as etapas e o canal oficial. A busca usa 33 registros locais em `assets/js/dados.js`; o React atualiza os resultados na própria página.

A busca geral procura texto nas páginas do site e também nos catálogos de serviços, direitos, vestibulares e unidades. Se o conteúdo das páginas for alterado, atualize o índice local com `py -3 tools/gerar-indice-site.py`.

## Equipe


1. Nome completo: ______________________________  RM: __________
2. Nome completo: ______________________________  RM: __________
3. Nome completo: ______________________________  RM: __________

## Vídeo pitch

Link público do vídeo (até 3 minutos): 



## Fontes e atualização

As páginas apontam para canais oficiais quando tratam de regras, benefícios e serviços. Regras, editais, telefones e disponibilidade podem mudar; confirme no órgão responsável. O dado de inclusão digital apresentado na página inicial vem do IBGE, PNAD Contínua TIC 2025: [usuários de internet em 2025](https://agenciadenoticias.ibge.gov.br/agencia-noticias/2012-agencia-de-noticias/noticias/47408-proporcao-de-usuarios-da-internet-no-pais-ultrapassou-90-da-populacao-de-10-anos-ou-mais-em-2025).

## Privacidade

O protótipo não pede cadastro, senha ou CPF. As respostas dos formulários são processadas no navegador e não são enviadas a um servidor pelo site. Links para serviços externos e permissões de localização ficam sujeitos às regras desses serviços.
