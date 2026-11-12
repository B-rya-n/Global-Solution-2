(function () {
  "use strict";
  const form = document.getElementById("form-orientador-golpe");
  const saida = document.getElementById("resultado-orientador-golpe");
  const erro = document.getElementById("erro-orientador-golpe");
  if (!form || !saida || !erro) return;

  const passos = {
    mensagem: {
      titulo: "Você ainda pode interromper o contato.",
      itens: ["Não responda, não abra outros links e não instale aplicativos enviados por essa pessoa.", "Bloqueie e denuncie a mensagem no aplicativo.", "Se a mensagem diz ser de um banco ou órgão, procure você mesmo o canal oficial."]
    },
    link: {
      titulo: "Proteja suas contas agora.",
      itens: ["Se informou senha ou código bancário, ligue para o banco pelo aplicativo oficial ou pelo número do cartão e peça bloqueio e proteção da conta.", "Troque a senha a partir de um aparelho seguro. Nunca compartilhe códigos de confirmação.", "Guarde mensagens, links, números e horários. Se houver prejuízo, registre boletim de ocorrência."]
    },
    pix: {
      titulo: "Fale com seu banco imediatamente.",
      itens: ["No aplicativo ou atendimento oficial, conteste o Pix e peça o Mecanismo Especial de Devolução (MED).", "Guarde o comprovante e as conversas. A devolução depende da análise e pode ser parcial ou não acontecer.", "Registre um boletim de ocorrência. Não pague terceiros que prometem recuperar o dinheiro."],
      fonte: "https://www.bcb.gov.br/meubc/faqs/p/vitima-fez-um-pix-e-caiu-em-um-golpe"
    },
    outro: {
      titulo: "Pare e confirme por outro canal.",
      itens: ["Não faça pagamentos nem compartilhe senhas, códigos ou documentos enquanto não confirmar a situação.", "Fale com a empresa ou órgão usando o aplicativo, site ou telefone que você já conhece.", "Se já houve prejuízo, fale com o banco e guarde as provas."]
    }
  };

  form.addEventListener("change", () => {
    erro.hidden = true;
    form.querySelectorAll(".golpe-opcao").forEach(opcao => {
      const radio = opcao.querySelector('input[name="situacao-golpe"]');
      opcao.classList.toggle("selecionada", !!radio && radio.checked);
    });
  });
  form.addEventListener("submit", event => {
    event.preventDefault();
    const escolha = form.querySelector('input[name="situacao-golpe"]:checked');
    if (!escolha) {
      erro.hidden = false;
      const primeiro = form.querySelector('input[name="situacao-golpe"]');
      if (primeiro) primeiro.focus();
      return;
    }
    const resposta = passos[escolha.value];
    const titulo = document.createElement("h3");
    titulo.textContent = resposta.titulo;
    const lista = document.createElement("ol");
    resposta.itens.forEach(texto => {
      const item = document.createElement("li");
      item.textContent = texto;
      lista.append(item);
    });
    saida.replaceChildren(titulo, lista);
    if (resposta.fonte) {
      const fonte = document.createElement("p");
      const link = document.createElement("a");
      link.href = resposta.fonte;
      link.target = "_blank";
      link.rel = "noopener";
      link.textContent = "Ver orientação oficial do Banco Central sobre golpes com Pix (abre em outra aba)";
      fonte.append(link);
      saida.append(fonte);
    }
    saida.hidden = false;
    saida.focus();
  });
})();
