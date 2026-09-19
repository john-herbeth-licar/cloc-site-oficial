// ==========================================================
// C'LOC - CONFIGURAÇÕES
// ==========================================================

// Altere aqui a disponibilidade manualmente.
// true  = disponível
// false = indisponível
const equipamentos = [
  {
    id: "mini-cacamba",
    nome: "Mini Caçamba",
    diaria: 99.9,
    disponivel: false,
    icone: "▰",
  },
  {
    id: "betoneira",
    nome: "Betoneira",
    diaria: 83.33,
    disponivel: true,
    icone: "◈",
  },
  {
    id: "compactador",
    nome: "Compactador de Solo",
    diaria: 220.0,
    disponivel: true,
    icone: "▲",
  },
];

// COLE A URL DA SUA IMPLANTAÇÃO DO GOOGLE APPS SCRIPT AQUI.
// Exemplo: https://script.google.com/macros/s/XXXXXXXX/exec
const GOOGLE_APPS_SCRIPT_URL =
  "https://script.google.com/macros/s/AKfycbyG0L71rMlSTdYQud0zN4H4seBMKsKeE5uA9-gyvwVf_oeXm2JF69uhDuDpQgQaQGyi/exec";

// WhatsApp da empresa, com código do país e DDD, somente números.
const WHATSAPP_EMPRESA = "5598985405248";

let equipamentoSelecionado = null;

const equipamentosEl = document.getElementById("equipamentos");
const resumoEl = document.getElementById("resumo");
const secaoFormularioEl = document.getElementById("secao-formulario");
const form = document.getElementById("formLocacao");
const btnEnviar = document.getElementById("btnEnviar");
const mensagemEl = document.getElementById("mensagem");

// ==========================================================
// FORMATAÇÃO
// ==========================================================

function moeda(valor) {
  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function escaparHTML(texto) {
  return String(texto)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

// ==========================================================
// RENDERIZAÇÃO DOS EQUIPAMENTOS
// ==========================================================

function renderizarEquipamentos() {
  const imagens = {
    "mini-cacamba": "assets/mini-cacamba.webp",
    "betoneira": "assets/betoneira.webp",
    "compactador": "assets/compactador.webp",
  };

  const descricoes = {
    "mini-cacamba": "Ideal para pequenas e médias obras.",
    "betoneira": "Mais agilidade e eficiência na sua obra.",
    "compactador": "Compactação de solo com alto desempenho.",
  };

  equipamentosEl.innerHTML = equipamentos
    .map(
      (eq) => `
    <article class="card-equipamento ${eq.disponivel ? "" : "indisponivel"}"
             data-id="${eq.id}">
      <div class="card-topo">
        <span class="status ${eq.disponivel ? "" : "indisponivel"}">
          ${eq.disponivel ? "Disponível" : "Indisponível"}
        </span>
      </div>

      <div class="icone">
        <img src="${imagens[eq.id] || ""}" alt="${escaparHTML(eq.nome)}">
      </div>

      <h3>${escaparHTML(eq.nome)}</h3>
      <p class="card-descricao">${descricoes[eq.id] || "Equipamento para sua obra."}</p>

      <div class="preco">
        ${moeda(eq.diaria)}
        <small>/ diária</small>
      </div>

      ${
        eq.disponivel
          ? `
        <div class="controles">
          <div class="controle">
            <label for="qtd-${eq.id}">Quantidade</label>
            <input id="qtd-${eq.id}" type="number" min="1" step="1" value="1"
                   class="campo-qtd" data-id="${eq.id}">
          </div>

          <div class="controle">
            <label for="dias-${eq.id}">Dias</label>
            <input id="dias-${eq.id}" type="number" min="1" step="1" value="1"
                   class="campo-dias" data-id="${eq.id}">
          </div>
        </div>
      `
          : ""
      }
    </article>
  `,
    )
    .join("");

  document
    .querySelectorAll(".card-equipamento:not(.indisponivel)")
    .forEach((card) => {
      card.addEventListener("click", (evento) => {
        if (evento.target.tagName === "INPUT") return;
        selecionarEquipamento(card.dataset.id);
      });
    });

  document.querySelectorAll(".campo-qtd, .campo-dias").forEach((input) => {
    input.addEventListener("input", (evento) => {
      selecionarEquipamento(evento.target.dataset.id);
      atualizarResumo();
    });
  });
}

function selecionarEquipamento(id) {
  const eq = equipamentos.find((item) => item.id === id && item.disponivel);
  if (!eq) return;

  equipamentoSelecionado = eq;

  document
    .querySelectorAll(".card-equipamento")
    .forEach((card) =>
      card.classList.toggle("selecionado", card.dataset.id === id),
    );

  resumoEl.classList.remove("hidden");
  secaoFormularioEl.classList.remove("hidden");
  atualizarResumo();

  secaoFormularioEl.scrollIntoView({
    behavior: "smooth",
    block: "start",
  });
}

// ==========================================================
// CÁLCULO
// ==========================================================

function obterNumeros() {
  if (!equipamentoSelecionado) return { quantidade: 0, dias: 0 };

  const qtdInput = document.getElementById(`qtd-${equipamentoSelecionado.id}`);
  const diasInput = document.getElementById(
    `dias-${equipamentoSelecionado.id}`,
  );

  const quantidade = Math.max(1, parseInt(qtdInput.value, 10) || 1);
  const dias = Math.max(1, parseInt(diasInput.value, 10) || 1);

  qtdInput.value = quantidade;
  diasInput.value = dias;

  return { quantidade, dias };
}

function atualizarResumo() {
  if (!equipamentoSelecionado) return;

  const { quantidade, dias } = obterNumeros();
  const total = equipamentoSelecionado.diaria * quantidade * dias;

  document.getElementById("resumoEquipamento").textContent =
    equipamentoSelecionado.nome;

  const resumoImagem = document.getElementById("resumoImagem");
  if (resumoImagem) {
    const imagens = {
      "mini-cacamba": "assets/mini-cacamba.webp",
      "betoneira": "assets/betoneira.webp",
      "compactador": "assets/compactador.webp",
    };
    resumoImagem.src = imagens[equipamentoSelecionado.id] || "";
    resumoImagem.alt = equipamentoSelecionado.nome;
  }

  document.getElementById("resumoQuantidade").textContent = quantidade;
  document.getElementById("resumoDias").textContent = dias;
  document.getElementById("resumoDiaria").textContent = moeda(
    equipamentoSelecionado.diaria,
  );
  document.getElementById("resumoTotal").textContent = moeda(total);
}

// ==========================================================
// WHATSAPP
// ==========================================================

function criarMensagemWhatsApp(dados) {
  return [
    "🟡 *NOVA SOLICITAÇÃO DE LOCAÇÃO - C'LOC*",
    "",
    "*EQUIPAMENTO*",
    `• ${dados.equipamento}`,
    `• Quantidade: ${dados.quantidade}`,
    `• Dias: ${dados.dias}`,
    `• Diária: ${dados.diaria}`,
    `• Total estimado: *${dados.total}*`,
    "",
    "*DADOS DO CLIENTE*",
    `• Nome: ${dados.nome}`,
    `• Endereço: ${dados.endereco}`,
    `• Cidade: ${dados.cidade}`,
    `• Telefone: ${dados.telefone}`,
    "",
    "Aguardando confirmação de disponibilidade, pagamento e demais condições.",
  ].join("\n");
}

// ==========================================================
// GOOGLE PLANILHAS
// ==========================================================

async function enviarParaGooglePlanilhas(dados) {
  if (
    !GOOGLE_APPS_SCRIPT_URL ||
    GOOGLE_APPS_SCRIPT_URL === "COLE_AQUI_A_URL_DO_SEU_APPS_SCRIPT"
  ) {
    console.warn("URL do Google Apps Script ainda não configurada.");
    return false;
  }

  try {
    // text/plain evita preflight CORS em uma implantação padrão do Apps Script.
    await fetch(GOOGLE_APPS_SCRIPT_URL, {
      method: "POST",
      mode: "no-cors",
      headers: {
        "Content-Type": "text/plain;charset=utf-8",
      },
      body: JSON.stringify(dados),
    });

    return true;
  } catch (erro) {
    console.error("Erro ao enviar para o Google Planilhas:", erro);
    return false;
  }
}

// ==========================================================
// FORMULÁRIO
// ==========================================================

form.addEventListener("submit", async (evento) => {
  evento.preventDefault();

  if (!equipamentoSelecionado) {
    mostrarMensagem("Selecione um equipamento.", "erro");
    return;
  }

  const { quantidade, dias } = obterNumeros();

  const nome = document.getElementById("nome").value.trim();
  const endereco = document.getElementById("endereco").value.trim();
  const cidade = document.getElementById("cidade").value.trim();
  const telefone = document.getElementById("telefone").value.trim();

  const total = equipamentoSelecionado.diaria * quantidade * dias;

  const dados = {
    dataHora: new Date().toISOString(),
    equipamento: equipamentoSelecionado.nome,
    quantidade,
    dias,
    diaria: equipamentoSelecionado.diaria,
    total,
    nome,
    endereco,
    cidade,
    telefone,
    status: "SOLICITAÇÃO",
  };

  btnEnviar.disabled = true;
  btnEnviar.textContent = "ENVIANDO SOLICITAÇÃO...";

  // Primeiro registra a solicitação na planilha.
  const planilhaEnviada = await enviarParaGooglePlanilhas(dados);

  // Depois abre o WhatsApp com todos os dados preenchidos.
  const mensagem = criarMensagemWhatsApp({
    ...dados,
    diaria: moeda(dados.diaria),
    total: moeda(dados.total),
  });

  const urlWhatsApp = `https://wa.me/${WHATSAPP_EMPRESA}?text=${encodeURIComponent(mensagem)}`;

  window.open(urlWhatsApp, "_blank", "noopener,noreferrer");

  if (planilhaEnviada) {
    mostrarMensagem(
      "Solicitação enviada! O WhatsApp será aberto para concluir o atendimento.",
      "sucesso",
    );
  } else {
    mostrarMensagem(
      "O WhatsApp será aberto. Atenção: a integração com o Google Planilhas ainda não está configurada.",
      "erro",
    );
  }

  btnEnviar.disabled = false;
  btnEnviar.textContent = "SOLICITAR LOCAÇÃO PELO WHATSAPP";
});

function mostrarMensagem(texto, tipo) {
  mensagemEl.textContent = texto;
  mensagemEl.className = `mensagem ${tipo}`;
}

// ==========================================================
// MÁSCARA SIMPLES DE TELEFONE
// ==========================================================

document.getElementById("telefone").addEventListener("input", (evento) => {
  let valor = evento.target.value.replace(/\D/g, "").slice(0, 11);

  if (valor.length <= 10) {
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{4})(\d)/, "$1-$2");
  } else {
    valor = valor.replace(/^(\d{2})(\d)/g, "($1) $2");
    valor = valor.replace(/(\d{5})(\d)/, "$1-$2");
  }

  evento.target.value = valor;
});

// ==========================================================
// INICIALIZAÇÃO
// ==========================================================

renderizarEquipamentos();
