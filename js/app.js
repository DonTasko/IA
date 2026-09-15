/**
 * app.js
 * Wiring de interface: navegação, tema, dashboard, ligação dos
 * formulários de cada calculadora às funções puras de calculadoras.js,
 * renderização de resultados, "As minhas simulações" e comparador.
 */

/* ==========================================================================
   Formatação PT-PT
   ========================================================================== */
const Formato = {
  moeda(valor) {
    const v = Number.isFinite(valor) ? valor : 0;
    try {
      return new Intl.NumberFormat("pt-PT", { style: "currency", currency: "EUR" }).format(v);
    } catch (e) {
      return v.toFixed(2).replace(".", ",") + " €";
    }
  },
  numero(valor, casas) {
    const v = Number.isFinite(valor) ? valor : 0;
    try {
      return new Intl.NumberFormat("pt-PT", {
        minimumFractionDigits: casas === undefined ? 0 : casas,
        maximumFractionDigits: casas === undefined ? 2 : casas,
      }).format(v);
    } catch (e) {
      return String(v);
    }
  },
  percentagem(valor, casas) {
    return this.numero(valor, casas === undefined ? 1 : casas) + "%";
  },
  data(iso) {
    try {
      return new Date(iso).toLocaleDateString("pt-PT");
    } catch (e) {
      return "";
    }
  },
};

/* ==========================================================================
   Utilitários de formulário
   ========================================================================== */
function lerCampo(id) {
  const el = document.getElementById(id);
  if (!el) return "";
  if (el.type === "checkbox") return el.checked;
  return el.value;
}

function definirCampo(id, valor) {
  const el = document.getElementById(id);
  if (!el) return;
  if (el.type === "checkbox") el.checked = !!valor;
  else el.value = valor;
}

function marcarErroCampo(id, mensagem) {
  const el = document.getElementById(id);
  if (!el) return;
  const campo = el.closest(".campo");
  if (!campo) return;
  campo.classList.add("com-erro");
  const erro = campo.querySelector(".mensagem-erro");
  if (erro) erro.textContent = mensagem || "Verifica este valor.";
}

function limparErrosFormulario(form) {
  form.querySelectorAll(".campo.com-erro").forEach((c) => {
    c.classList.remove("com-erro");
    const erro = c.querySelector(".mensagem-erro");
    if (erro) erro.textContent = "";
  });
}

/**
 * Valida um formulário:
 *  1. os campos cuja id conste em `ids` não podem ficar vazios;
 *  2. QUALQUER campo numérico do formulário (inputmode="decimal"), mesmo
 *     opcional, não pode ter um valor negativo nem um texto não numérico
 *     quando preenchido.
 */
function validarObrigatorios(form, ids) {
  limparErrosFormulario(form);
  let valido = true;

  ids.forEach((id) => {
    const el = document.getElementById(id);
    if (!el) return;
    if (el.value === "" || el.value === null) {
      marcarErroCampo(id, "Introduz um valor.");
      valido = false;
    }
  });

  form.querySelectorAll('input[inputmode="decimal"]').forEach((el) => {
    if (el.value === "" || el.value === null) return; // campo opcional vazio é válido
    const n = Num.paraNumero(el.value, NaN);
    if (!Number.isFinite(n)) {
      marcarErroCampo(el.id, "Introduz um número válido.");
      valido = false;
    } else if (n < 0) {
      marcarErroCampo(el.id, "O valor não pode ser negativo.");
      valido = false;
    }
  });

  return valido;
}

/* ==========================================================================
   Renderização de resultados
   ========================================================================== */

/**
 * Constrói o HTML do painel de resultado.
 * @param {Object} spec
 *  spec.rotuloPrincipal, spec.valorPrincipal, spec.sufixoPrincipal
 *  spec.explicacao (texto simples)
 *  spec.detalhes: [{rotulo, valor}]
 *  spec.aviso: texto do aviso financeiro (opcional, usa o padrão se omitido)
 *  spec.indicador: {nivel: 'baixa'|'moderada'|'elevada', texto}
 *  spec.graficoSerie: array de números (opcional)
 *  spec.graficoRotulos: array de strings (opcional)
 */
function renderizarResultado(container, spec) {
  if (!container) return;

  const detalhesHtml = (spec.detalhes || [])
    .map(
      (d) =>
        '<div class="item-detalhe"><div class="rotulo">' +
        escaparHtml(d.rotulo) +
        '</div><div class="valor">' +
        escaparHtml(d.valor) +
        "</div></div>"
    )
    .join("");

  let indicadorHtml = "";
  if (spec.indicador) {
    indicadorHtml =
      '<span class="indicador indicador-' +
      spec.indicador.nivel +
      '">' +
      escaparHtml(spec.indicador.texto) +
      "</span>";
  }

  let graficoHtml = "";
  if (spec.graficoSerie && spec.graficoSerie.length) {
    const max = Math.max.apply(null, spec.graficoSerie.concat([1]));
    const barras = spec.graficoSerie
      .map((v) => {
        const altura = Math.max(2, Math.round((v / max) * 100));
        return '<div class="barra" style="height:' + altura + '%" title="' + Formato.moeda(v) + '"></div>';
      })
      .join("");
    const rotulos = (spec.graficoRotulos || spec.graficoSerie.map((_, i) => "Ano " + (i + 1)))
      .map((r) => "<span>" + escaparHtml(r) + "</span>")
      .join("");
    graficoHtml =
      '<div class="mt-4"><div class="grafico-barras">' +
      barras +
      '</div><div class="grafico-legenda">' +
      rotulos +
      "</div></div>";
  }

  container.innerHTML =
    '<div class="resultado-principal">' +
    '<div class="rotulo">' +
    escaparHtml(spec.rotuloPrincipal) +
    "</div>" +
    '<div class="valor">' +
    escaparHtml(spec.valorPrincipal) +
    (spec.sufixoPrincipal ? "<small> " + escaparHtml(spec.sufixoPrincipal) + "</small>" : "") +
    "</div>" +
    (indicadorHtml ? '<div class="mt-2">' + indicadorHtml + "</div>" : "") +
    "</div>" +
    (spec.explicacao ? '<div class="explicacao-simples">' + escaparHtml(spec.explicacao) + "</div>" : "") +
    (detalhesHtml ? '<div class="grelha-detalhes">' + detalhesHtml + "</div>" : "") +
    graficoHtml +
    '<div class="aviso-financeiro">⚠️ <span>' +
    escaparHtml(spec.aviso || APP_CONFIG.avisoFinanceiro) +
    "</span></div>" +
    '<div class="linha-botoes">' +
    '<button type="button" class="botao botao-secundario" data-acao="novo-calculo">↺ Novo cálculo</button>' +
    '<button type="button" class="botao botao-secundario" data-acao="guardar-simulacao">💾 Guardar</button>' +
    "</div>" +
    '<div class="grelha-partilha">' +
    '<button type="button" class="botao-partilha" data-partilha="copiar">📋 Copiar</button>' +
    '<button type="button" class="botao-partilha" data-partilha="nativo">🔗 Partilhar</button>' +
    '<button type="button" class="botao-partilha" data-partilha="whatsapp">🟢 WhatsApp</button>' +
    '<button type="button" class="botao-partilha" data-partilha="facebook">📘 Facebook</button>' +
    '<button type="button" class="botao-partilha" data-partilha="x">✖️ X</button>' +
    '<button type="button" class="botao-partilha" data-partilha="email">✉️ Email</button>' +
    '<button type="button" class="botao-partilha" data-partilha="imprimir">🖨️ Exportar / Imprimir</button>' +
    "</div>";

  container.classList.remove("oculto");
  container.setAttribute("aria-live", "polite");
  container.scrollIntoView({ behavior: "smooth", block: "nearest" });
}

function escaparHtml(valor) {
  const div = document.createElement("div");
  div.textContent = valor === undefined || valor === null ? "" : String(valor);
  return div.innerHTML;
}

function gerarTextoPartilha(titulo, spec) {
  const linhas = [titulo, spec.rotuloPrincipal + ": " + spec.valorPrincipal + (spec.sufixoPrincipal ? " " + spec.sufixoPrincipal : "")];
  (spec.detalhes || []).forEach((d) => linhas.push(d.rotulo + ": " + d.valor));
  linhas.push("");
  linhas.push(Partilha.textoBase());
  return linhas.join("\n");
}

/** Liga o botão "Novo cálculo" e "Guardar simulação" de um painel de resultado. */
function ligarAcoesResultado(container, form, guardarInfo) {
  container.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-acao]");
    if (!botao) return;
    const acao = botao.getAttribute("data-acao");
    if (acao === "novo-calculo") {
      container.classList.add("oculto");
      container.innerHTML = "";
      if (form) {
        form.reset();
        limparErrosFormulario(form);
        form.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    } else if (acao === "guardar-simulacao") {
      if (typeof guardarInfo === "function") {
        GestorSimulacoes.guardar(guardarInfo());
        Partilha.mostrarToast("Simulação guardada 💾");
      }
    }
  });
}

/* ==========================================================================
   Tema, menu e inicialização geral
   ========================================================================== */
function inicializarTemaEMenu() {
  GestorTema.inicializar();

  const botaoTema = document.querySelector("[data-acao-tema]");
  if (botaoTema) {
    atualizarIconeTema(botaoTema);
    botaoTema.addEventListener("click", () => {
      GestorTema.alternar();
      atualizarIconeTema(botaoTema);
    });
  }

  const botaoMenu = document.querySelector(".botao-menu");
  const menu = document.querySelector("nav.menu-principal");
  if (botaoMenu && menu) {
    botaoMenu.addEventListener("click", () => {
      const aberto = menu.classList.toggle("aberto");
      botaoMenu.setAttribute("aria-expanded", aberto ? "true" : "false");
    });
    menu.querySelectorAll("a").forEach((link) =>
      link.addEventListener("click", () => {
        menu.classList.remove("aberto");
        botaoMenu.setAttribute("aria-expanded", "false");
      })
    );
  }

  // marca o link ativo consoante a página atual
  const caminhoAtual = window.location.pathname.split("/").pop() || "index.html";
  document.querySelectorAll("nav.menu-principal a[href]").forEach((link) => {
    const href = link.getAttribute("href");
    if (href === caminhoAtual) link.classList.add("ativo");
  });

  document.querySelectorAll("[data-ano-atual]").forEach((el) => {
    el.textContent = String((typeof APP_CONFIG !== "undefined" && APP_CONFIG.ano) || new Date().getFullYear());
  });
}

function atualizarIconeTema(botao) {
  const pref = GestorTema.obterPreferencia();
  const escuro =
    pref === "escuro" || (pref === "sistema" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
  botao.textContent = escuro ? "☀️" : "🌙";
  botao.setAttribute("aria-label", escuro ? "Ativar modo claro" : "Ativar modo escuro");
  botao.title = botao.getAttribute("aria-label");
}

/** Deteta se a app está a correr dentro de um WebView Android (WebIntoApp e semelhantes). */
function detetarAmbienteAndroid() {
  const ua = navigator.userAgent || "";
  const provavelWebView = /wv|; wv\)/i.test(ua) || (typeof window.Android !== "undefined");
  document.documentElement.classList.toggle("ambiente-android", provavelWebView);
  return provavelWebView;
}

/* ==========================================================================
   Publicidade — carregamento condicional (apenas ativa fora do WebView e com adsenseEnabled=true)
   ========================================================================== */
function inicializarPublicidade() {
  const ehAndroid = detetarAmbienteAndroid();
  if (ehAndroid) return; // a app Android usa o seu próprio sistema de anúncios
  if (!APP_CONFIG.adsenseEnabled) return;
  if (!APP_CONFIG.adsensePublisherId || APP_CONFIG.adsensePublisherId.indexOf("YOUR_") === 0) return;

  const script = document.createElement("script");
  script.async = true;
  script.src = "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=" + APP_CONFIG.adsensePublisherId;
  script.crossOrigin = "anonymous";
  document.head.appendChild(script);

  const mapaSlots = {
    top: APP_CONFIG.adsenseTopSlot,
    middle: APP_CONFIG.adsenseMiddleSlot,
    bottom: APP_CONFIG.adsenseBottomSlot,
  };

  document.querySelectorAll(".espaco-anuncio[data-ad-pos]").forEach((el) => {
    const slot = mapaSlots[el.getAttribute("data-ad-pos")];
    if (!slot || slot.indexOf("YOUR_") === 0) return;
    el.innerHTML =
      '<ins class="adsbygoogle" style="display:block" data-ad-client="' +
      APP_CONFIG.adsensePublisherId +
      '" data-ad-slot="' +
      slot +
      '" data-ad-format="auto" data-full-width-responsive="true"></ins>';
    try {
      (window.adsbygoogle = window.adsbygoogle || []).push({});
    } catch (e) {
      /* silencioso */
    }
  });
}

/* ==========================================================================
   Dashboard (index.html): favoritos + "As minhas simulações"
   ========================================================================== */
function inicializarDashboard() {
  document.querySelectorAll("[data-favorito]").forEach((botao) => {
    const id = botao.getAttribute("data-favorito");
    const atualizarIcone = () => {
      const ativo = GestorFavoritos.ehFavorito(id);
      botao.classList.toggle("ativo", ativo);
      botao.textContent = ativo ? "★" : "☆";
      botao.setAttribute("aria-label", ativo ? "Remover dos favoritos" : "Adicionar aos favoritos");
    };
    atualizarIcone();
    botao.addEventListener("click", (evento) => {
      evento.preventDefault();
      evento.stopPropagation();
      GestorFavoritos.alternar(id);
      atualizarIcone();
    });
  });

  renderizarListaSimulacoes();
}

function renderizarListaSimulacoes() {
  const lista = document.getElementById("listaSimulacoes");
  if (!lista) return;
  const simulacoes = GestorSimulacoes.listar();

  if (simulacoes.length === 0) {
    lista.innerHTML =
      '<div class="estado-vazio"><div class="emoji-grande">🗂️</div><p>Ainda não guardaste nenhuma simulação.<br>Os resultados que guardares em qualquer calculadora aparecem aqui.</p></div>';
    return;
  }

  lista.innerHTML = simulacoes
    .map(
      (s) =>
        '<div class="item-simulacao" data-id="' +
        s.id +
        '"><div class="info"><strong>' +
        escaparHtml(s.titulo || "Simulação") +
        "</strong><span>" +
        escaparHtml(s.resumo || "") +
        " · " +
        Formato.data(s.data) +
        '</span></div><div class="acoes"><button type="button" class="botao botao-secundario botao-sm" data-remover="' +
        s.id +
        '">Apagar</button></div></div>'
    )
    .join("");

  lista.querySelectorAll("[data-remover]").forEach((botao) => {
    botao.addEventListener("click", () => {
      GestorSimulacoes.remover(botao.getAttribute("data-remover"));
      renderizarListaSimulacoes();
      Partilha.mostrarToast("Simulação apagada");
    });
  });

  const botaoLimpar = document.getElementById("limparSimulacoes");
  if (botaoLimpar && !botaoLimpar._ligado) {
    botaoLimpar._ligado = true;
    botaoLimpar.addEventListener("click", () => {
      GestorSimulacoes.limparTudo();
      renderizarListaSimulacoes();
      Partilha.mostrarToast("Todas as simulações foram apagadas");
    });
  }
}

/* ==========================================================================
   Inicializadores por calculadora
   ========================================================================== */

function initCreditoHabitacao() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["valorImovel", "prazoAnos", "taxaJuroAnual"])) return;

    const dados = {
      valorImovel: lerCampo("valorImovel"),
      valorEntrada: lerCampo("valorEntrada"),
      prazoAnos: lerCampo("prazoAnos"),
      taxaJuroAnual: lerCampo("taxaJuroAnual"),
    };
    const r = calcularCreditoHabitacao(dados);
    const tipoTaxa = lerCampo("tipoTaxa") || "fixa";

    const spec = {
      rotuloPrincipal: "Prestação mensal estimada",
      valorPrincipal: Formato.moeda(r.prestacaoMensal),
      sufixoPrincipal: "/ mês",
      explicacao:
        "Com estes valores, pagarás aproximadamente " +
        Formato.moeda(r.prestacaoMensal) +
        " por mês, durante " +
        r.prazoAnos +
        " anos (taxa " +
        (tipoTaxa === "variavel" ? "variável, apenas informativa" : "fixa, apenas informativa") +
        ").",
      detalhes: [
        { rotulo: "Valor financiado", valor: Formato.moeda(r.valorFinanciado) },
        { rotulo: "Total pago", valor: Formato.moeda(r.totalPago) },
        { rotulo: "Total de juros", valor: Formato.moeda(r.totalJuros) },
        { rotulo: "Nº de prestações", valor: Formato.numero(r.numPrestacoes) },
        { rotulo: "% financiado", valor: Formato.percentagem(r.percentFinanciamento) },
      ],
      aviso: APP_CONFIG.avisoCredito,
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("🏠 Simulação de Crédito Habitação", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "credito-habitacao",
      titulo: "🏠 Crédito Habitação",
      resumo: Formato.moeda(r.prestacaoMensal) + "/mês · " + r.prazoAnos + " anos",
      dados: dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initCreditoAuto() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (form && resultado) {
    form.addEventListener("submit", (evento) => {
      evento.preventDefault();
      if (!validarObrigatorios(form, ["precoVeiculo", "prazoAnos", "taxaJuroAnual"])) return;

      const dados = {
        precoVeiculo: lerCampo("precoVeiculo"),
        valorEntrada: lerCampo("valorEntrada"),
        prazoAnos: lerCampo("prazoAnos"),
        taxaJuroAnual: lerCampo("taxaJuroAnual"),
      };
      const r = calcularCreditoAuto(dados);

      const spec = {
        rotuloPrincipal: "Prestação mensal estimada",
        valorPrincipal: Formato.moeda(r.prestacaoMensal),
        sufixoPrincipal: "/ mês",
        explicacao:
          "Financiando " + Formato.moeda(r.valorFinanciado) + " durante " + r.prazoAnos + " anos, pagarás cerca de " + Formato.moeda(r.prestacaoMensal) + " por mês.",
        detalhes: [
          { rotulo: "Valor financiado", valor: Formato.moeda(r.valorFinanciado) },
          { rotulo: "Total pago", valor: Formato.moeda(r.totalPago) },
          { rotulo: "Total de juros", valor: Formato.moeda(r.totalJuros) },
          { rotulo: "Custo final do veículo", valor: Formato.moeda(r.custoFinalVeiculo) },
        ],
        aviso: APP_CONFIG.avisoCredito,
      };

      renderizarResultado(resultado, spec);
      resultado._ultimoTexto = gerarTextoPartilha("🚗 Simulação de Crédito Automóvel", spec);
      resultado._ultimoGuardar = () => ({
        tipo: "credito-auto",
        titulo: "🚗 Crédito Automóvel",
        resumo: Formato.moeda(r.prestacaoMensal) + "/mês · " + r.prazoAnos + " anos",
        dados: dados,
        resultado: r,
      });
    });
    ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
    ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
  }

  // "Quanto custa realmente este carro?"
  const formCusto = document.getElementById("formCustoReal");
  const resultadoCusto = document.getElementById("resultadoCustoReal");
  if (formCusto && resultadoCusto) {
    formCusto.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const dados = {
        prestacao: lerCampo("crPrestacao"),
        combustivelMensal: lerCampo("crCombustivel"),
        seguroMensal: lerCampo("crSeguro"),
        manutencaoMensal: lerCampo("crManutencao"),
        iucAnual: lerCampo("crIuc"),
        estacionamentoMensal: lerCampo("crEstacionamento"),
        outrosMensal: lerCampo("crOutros"),
        kmMensal: lerCampo("crKm"),
      };
      const r = calcularCustoRealCarro(dados);
      const spec = {
        rotuloPrincipal: "Custo mensal estimado",
        valorPrincipal: Formato.moeda(r.custoMensal),
        sufixoPrincipal: "/ mês",
        explicacao: "Somando prestação, combustível, seguro, manutenção, IUC e estacionamento, este carro custa-te aproximadamente " + Formato.moeda(r.custoMensal) + " por mês.",
        detalhes: [
          { rotulo: "Custo anual", valor: Formato.moeda(r.custoAnual) },
          { rotulo: "Custo em 5 anos", valor: Formato.moeda(r.custo5anos) },
          { rotulo: "Custo por km", valor: Formato.moeda(r.custoPorKm) },
        ],
      };
      renderizarResultado(resultadoCusto, spec);
      resultadoCusto._ultimoTexto = gerarTextoPartilha("🚗 Quanto custa realmente este carro?", spec);
      resultadoCusto._ultimoGuardar = () => ({
        tipo: "custo-real-carro",
        titulo: "🚗 Custo real do carro",
        resumo: Formato.moeda(r.custoMensal) + "/mês",
        dados,
        resultado: r,
      });
    });
    ligarAcoesResultado(resultadoCusto, formCusto, () => resultadoCusto._ultimoGuardar && resultadoCusto._ultimoGuardar());
    ligarBotoesPartilha(resultadoCusto, () => resultadoCusto._ultimoTexto);
  }
}

function initSalario() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  const checkboxSubsidio = document.getElementById("temSubsidioAlimentacao");
  const camposSubsidio = document.getElementById("camposSubsidioAlimentacao");
  if (checkboxSubsidio && camposSubsidio) {
    const atualizar = () => camposSubsidio.classList.toggle("oculto", !checkboxSubsidio.checked);
    checkboxSubsidio.addEventListener("change", atualizar);
    atualizar();
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["salarioBruto"])) return;

    const dados = {
      salarioBruto: lerCampo("salarioBruto"),
      numDependentes: lerCampo("numDependentes"),
      situacaoFamiliar: lerCampo("situacaoFamiliar"),
      temSubsidioAlimentacao: lerCampo("temSubsidioAlimentacao"),
      formaSubsidioAlimentacao: lerCampo("formaSubsidioAlimentacao"),
      valorSubsidioAlimentacao: lerCampo("valorSubsidioAlimentacao"),
      diasUteisMes: lerCampo("diasUteisMes"),
      numMesesAno: lerCampo("numMesesAno"),
    };
    const r = calcularSalario(dados);

    const spec = {
      rotuloPrincipal: "Salário líquido estimado",
      valorPrincipal: Formato.moeda(r.salarioLiquidoMensal),
      sufixoPrincipal: "/ mês",
      explicacao: "Estimativa. O valor real depende da situação fiscal individual — consulta sempre o teu recibo de vencimento.",
      detalhes: [
        { rotulo: "Desconto Segurança Social (11%)", valor: Formato.moeda(r.descontoSegSocial) },
        { rotulo: "Retenção de IRS estimada", valor: Formato.moeda(r.irsMensalEstimado) },
        { rotulo: "Subsídio de alimentação", valor: Formato.moeda(r.subsidioAlimentacaoMensal) },
        { rotulo: "Taxa de desconto efetiva", valor: Formato.percentagem(r.taxaEfetiva) },
        { rotulo: "Líquido anual estimado", valor: Formato.moeda(r.salarioLiquidoAnualEstimado) },
      ],
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("💰 Simulação de Salário", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "salario",
      titulo: "💰 Salário",
      resumo: Formato.moeda(r.salarioLiquidoMensal) + " líquido/mês",
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initIVA() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  const selectTaxa = document.getElementById("taxaIVASelect");
  const campoPersonalizada = document.getElementById("campoTaxaPersonalizada");
  if (selectTaxa && campoPersonalizada) {
    const atualizar = () => campoPersonalizada.classList.toggle("oculto", selectTaxa.value !== "personalizada");
    selectTaxa.addEventListener("change", atualizar);
    atualizar();
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["preco"])) return;

    const taxaSelecionada = lerCampo("taxaIVASelect");
    const taxaIVA = taxaSelecionada === "personalizada" ? lerCampo("taxaPersonalizada") : taxaSelecionada;
    const modo = lerCampo("modoIva") || "semIva";

    const dados = { preco: lerCampo("preco"), taxaIVA, modo };
    const r = calcularIVA(dados);

    const spec = {
      rotuloPrincipal: "Preço final (com IVA)",
      valorPrincipal: Formato.moeda(r.precoComIva),
      explicacao: "Sobre " + Formato.moeda(modo === "comIva" ? r.precoComIva : r.precoSemIva) + " à taxa de " + Formato.percentagem(r.taxaIVA, 0) + ".",
      detalhes: [
        { rotulo: "Preço sem IVA", valor: Formato.moeda(r.precoSemIva) },
        { rotulo: "Valor do IVA", valor: Formato.moeda(r.valorIva) },
        { rotulo: "Preço com IVA", valor: Formato.moeda(r.precoComIva) },
      ],
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("🧾 Cálculo de IVA", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "iva",
      titulo: "🧾 IVA",
      resumo: Formato.moeda(r.precoSemIva) + " → " + Formato.moeda(r.precoComIva),
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initMargem() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["custoProduto", "margemPretendida"])) return;

    const dados = {
      custoProduto: lerCampo("custoProduto"),
      maoObra: lerCampo("maoObra"),
      transporte: lerCampo("transporte"),
      energia: lerCampo("energia"),
      outrosCustos: lerCampo("outrosCustos"),
      margemPretendida: lerCampo("margemPretendida"),
      taxaIVA: lerCampo("taxaIVAMargem"),
    };
    const r = calcularMargem(dados);

    const spec = {
      rotuloPrincipal: "Preço de venda recomendado",
      valorPrincipal: Formato.moeda(r.precoFinal),
      explicacao: "Para uma margem de " + Formato.percentagem(r.margem) + ", deves cobrar " + Formato.moeda(r.precoFinal) + " (IVA incluído).",
      detalhes: [
        { rotulo: "Custo total", valor: Formato.moeda(r.custoTotal) },
        { rotulo: "Preço antes de IVA", valor: Formato.moeda(r.precoAntesIva) },
        { rotulo: "IVA", valor: Formato.moeda(r.valorIva) },
        { rotulo: "Lucro por unidade", valor: Formato.moeda(r.lucro) },
        { rotulo: "Markup", valor: Formato.percentagem(r.markup) },
      ],
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("📊 Cálculo de Margem e Preço de Venda", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "margem",
      titulo: "📊 Margem e Lucro",
      resumo: "Preço: " + Formato.moeda(r.precoFinal),
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initJuros() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["taxaAnual", "anos"])) return;

    const dados = {
      capitalInicial: lerCampo("capitalInicial"),
      depositoMensal: lerCampo("depositoMensal"),
      taxaAnual: lerCampo("taxaAnual"),
      anos: lerCampo("anos"),
      frequencia: lerCampo("frequencia"),
    };
    const r = calcularJurosCompostos(dados);

    const spec = {
      rotuloPrincipal: "Valor final estimado",
      valorPrincipal: Formato.moeda(r.valorFinal),
      explicacao: "Ao fim de " + r.anos + " anos, terás investido " + Formato.moeda(r.capitalInvestido) + " e ganho " + Formato.moeda(r.jurosGanhos) + " em juros.",
      detalhes: [
        { rotulo: "Capital investido", valor: Formato.moeda(r.capitalInvestido) },
        { rotulo: "Juros ganhos", valor: Formato.moeda(r.jurosGanhos) },
        { rotulo: "Valor final", valor: Formato.moeda(r.valorFinal) },
      ],
      graficoSerie: r.serieAnual,
      graficoRotulos: r.serieAnual.map((_, i) => "Ano " + (i + 1)),
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("📈 Simulação de Juros Compostos", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "juros-compostos",
      titulo: "📈 Juros Compostos",
      resumo: Formato.moeda(r.valorFinal) + " em " + r.anos + " anos",
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initPoupanca() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  let ultimosDados = null;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["poupancaMensal", "poupancaAnos", "poupancaRendimento"])) return;

    const dados = {
      inicial: lerCampo("poupancaInicial"),
      mensal: lerCampo("poupancaMensal"),
      anos: lerCampo("poupancaAnos"),
      rendimentoAnual: lerCampo("poupancaRendimento"),
    };
    ultimosDados = dados;
    const r = calcularPoupanca(dados);

    const spec = {
      rotuloPrincipal: "Terás acumulado",
      valorPrincipal: Formato.moeda(r.valorFinal),
      explicacao: "Poupando " + Formato.moeda(dados.mensal) + " por mês durante " + r.anos + " anos, acumulas aproximadamente " + Formato.moeda(r.valorFinal) + ".",
      detalhes: [
        { rotulo: "Total investido", valor: Formato.moeda(r.totalInvestido) },
        { rotulo: "Rendimento", valor: Formato.moeda(r.rendimento) },
        { rotulo: "Valor final", valor: Formato.moeda(r.valorFinal) },
      ],
      graficoSerie: r.serieAnual,
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("💶 Simulação de Poupança", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "poupanca",
      titulo: "💶 Poupança",
      resumo: Formato.moeda(r.valorFinal) + " em " + r.anos + " anos",
      dados,
      resultado: r,
    });

    const botaoExtra = document.getElementById("botaoMais50");
    if (botaoExtra) botaoExtra.classList.remove("oculto");
  });

  const botaoExtra = document.getElementById("botaoMais50");
  const comparacaoExtra = document.getElementById("comparacaoExtra");
  if (botaoExtra && comparacaoExtra) {
    botaoExtra.addEventListener("click", () => {
      if (!ultimosDados) return;
      const c = compararPoupancaComExtra(ultimosDados, 50);
      comparacaoExtra.classList.remove("oculto");
      comparacaoExtra.innerHTML =
        '<h3>E se poupasses mais €50 por mês?</h3><div class="tabela-scroll"><table class="tabela-comparacao"><thead><tr><th></th><th>Cenário atual</th><th>Com +€50/mês</th></tr></thead><tbody>' +
        "<tr><td>Total investido</td><td>" + Formato.moeda(c.base.totalInvestido) + "</td><td>" + Formato.moeda(c.comExtra.totalInvestido) + "</td></tr>" +
        "<tr><td>Rendimento</td><td>" + Formato.moeda(c.base.rendimento) + "</td><td>" + Formato.moeda(c.comExtra.rendimento) + "</td></tr>" +
        '<tr><td>Valor final</td><td>' + Formato.moeda(c.base.valorFinal) + '</td><td class="destaque">' + Formato.moeda(c.comExtra.valorFinal) + "</td></tr>" +
        "</tbody></table></div><p class=\"mt-2\">Diferença ao fim do período: <strong>" + Formato.moeda(c.diferencaValorFinal) + "</strong></p>";
    });
  }

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initCombustivel() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["distancia", "consumo", "precoCombustivel"])) return;

    const dados = {
      distancia: lerCampo("distancia"),
      consumo: lerCampo("consumo"),
      precoCombustivel: lerCampo("precoCombustivel"),
      passageiros: lerCampo("passageiros"),
      idaEVolta: lerCampo("idaEVolta"),
    };
    const r = calcularCombustivel(dados);

    const spec = {
      rotuloPrincipal: "Custo da viagem",
      valorPrincipal: Formato.moeda(r.custoViagem),
      explicacao: "Para " + Formato.numero(r.distanciaTotal, 1) + " km, vais gastar aproximadamente " + Formato.numero(r.litrosConsumidos, 1) + " litros.",
      detalhes: [
        { rotulo: "Distância total", valor: Formato.numero(r.distanciaTotal, 1) + " km" },
        { rotulo: "Litros consumidos", valor: Formato.numero(r.litrosConsumidos, 2) + " L" },
        { rotulo: "Custo por km", valor: Formato.moeda(r.custoPorKm) },
        { rotulo: "Custo por pessoa", valor: Formato.moeda(r.custoPorPessoa) },
      ],
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("⛽ Cálculo de Combustível", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "combustivel",
      titulo: "⛽ Combustível",
      resumo: Formato.moeda(r.custoViagem) + " · " + Formato.numero(r.distanciaTotal, 0) + " km",
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initEletricidade() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  const selectAparelho = document.getElementById("aparelhoPreDefinido");
  if (selectAparelho && typeof APARELHOS_ELETRICOS !== "undefined") {
    APARELHOS_ELETRICOS.forEach((a, i) => {
      const opt = document.createElement("option");
      opt.value = String(i);
      opt.textContent = a.nome + " (~" + a.watts + " W)";
      selectAparelho.appendChild(opt);
    });
    selectAparelho.addEventListener("change", () => {
      const i = parseInt(selectAparelho.value, 10);
      if (Number.isInteger(i) && APARELHOS_ELETRICOS[i]) {
        definirCampo("potenciaWatts", APARELHOS_ELETRICOS[i].watts);
      }
    });
  }

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["potenciaWatts", "horasDia"])) return;

    const dados = {
      potenciaWatts: lerCampo("potenciaWatts"),
      horasDia: lerCampo("horasDia"),
      diasMes: lerCampo("diasMes"),
      precoKwh: lerCampo("precoKwh"),
    };
    const r = calcularEletricidade(dados);

    const spec = {
      rotuloPrincipal: "Custo mensal estimado",
      valorPrincipal: Formato.moeda(r.custoMensal),
      explicacao: "Este aparelho consome " + Formato.numero(r.consumoMensalKwh, 2) + " kWh por mês, o que custa cerca de " + Formato.moeda(r.custoMensal) + ".",
      detalhes: [
        { rotulo: "Consumo diário", valor: Formato.numero(r.consumoDiarioKwh, 3) + " kWh" },
        { rotulo: "Consumo mensal", valor: Formato.numero(r.consumoMensalKwh, 2) + " kWh" },
        { rotulo: "Custo diário", valor: Formato.moeda(r.custoDiario) },
        { rotulo: "Custo anual", valor: Formato.moeda(r.custoAnual) },
      ],
    };

    renderizarResultado(resultado, spec);
    resultado._ultimoTexto = gerarTextoPartilha("⚡ Cálculo de Eletricidade", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "eletricidade",
      titulo: "⚡ Eletricidade",
      resumo: Formato.moeda(r.custoMensal) + "/mês",
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

function initEsforco() {
  const form = document.getElementById("formCalculadora");
  const resultado = document.getElementById("resultado");
  if (!form || !resultado) return;

  form.addEventListener("submit", (evento) => {
    evento.preventDefault();
    if (!validarObrigatorios(form, ["rendimentoLiquido"])) return;

    const dados = {
      rendimentoLiquido: lerCampo("rendimentoLiquido"),
      prestacaoCasa: lerCampo("prestacaoCasa"),
      creditoAuto: lerCampo("creditoAuto"),
      cartoesCredito: lerCampo("cartoesCredito"),
      outrasPrestacoes: lerCampo("outrasPrestacoes"),
    };
    const r = calcularEsforcoFinanceiro(dados);

    const textoNivel = { baixa: "Taxa de esforço baixa", moderada: "Taxa de esforço moderada", elevada: "Taxa de esforço elevada" }[r.nivel];

    const spec = {
      rotuloPrincipal: "Taxa de esforço",
      valorPrincipal: Formato.percentagem(r.taxaEsforco),
      explicacao: "As tuas prestações mensais representam " + Formato.percentagem(r.taxaEsforco) + " do teu rendimento líquido. Este valor não substitui uma análise profissional de crédito.",
      detalhes: [{ rotulo: "Total de prestações/mês", valor: Formato.moeda(r.totalPrestacoes) }],
      indicador: { nivel: r.nivel, texto: textoNivel },
    };

    renderizarResultado(resultado, spec);

    const barra = document.createElement("div");
    barra.className = "mt-2";
    barra.innerHTML = '<div class="barra-percentagem"><span style="width:' + Math.min(100, r.taxaEsforco) + '%"></span></div>';
    resultado.insertBefore(barra, resultado.querySelector(".explicacao-simples"));

    resultado._ultimoTexto = gerarTextoPartilha("🏦 Cálculo de Esforço Financeiro", spec);
    resultado._ultimoGuardar = () => ({
      tipo: "esforco-financeiro",
      titulo: "🏦 Esforço Financeiro",
      resumo: Formato.percentagem(r.taxaEsforco) + " (" + r.nivel + ")",
      dados,
      resultado: r,
    });
  });

  ligarAcoesResultado(resultado, form, () => resultado._ultimoGuardar && resultado._ultimoGuardar());
  ligarBotoesPartilha(resultado, () => resultado._ultimoTexto);
}

/* ==========================================================================
   Comparador
   ========================================================================== */
function initComparar() {
  // Crédito A vs Crédito B
  const botaoComparar = document.getElementById("botaoCompararCredito");
  const resultadoCredito = document.getElementById("resultadoCompararCredito");

  if (botaoComparar && resultadoCredito) {
    botaoComparar.addEventListener("click", () => {
      const tipo = lerCampo("tipoComparacaoCredito") || "habitacao";
      const lerBloco = (sufixo) => ({
        valorImovel: lerCampo("valor" + sufixo),
        precoVeiculo: lerCampo("valor" + sufixo),
        valorEntrada: lerCampo("entrada" + sufixo),
        prazoAnos: lerCampo("prazo" + sufixo),
        taxaJuroAnual: lerCampo("taxa" + sufixo),
      });
      const c = compararCreditos(lerBloco("A"), lerBloco("B"), tipo === "auto" ? "auto" : "habitacao");
      const melhor = c.a.prestacaoMensal <= c.b.prestacaoMensal ? "A" : "B";

      resultadoCredito.classList.remove("oculto");
      resultadoCredito.innerHTML =
        '<div class="tabela-scroll"><table class="tabela-comparacao"><thead><tr><th></th><th>Opção A</th><th>Opção B</th></tr></thead><tbody>' +
        "<tr><td>Prestação mensal</td><td" + (melhor === "A" ? ' class="destaque"' : "") + ">" + Formato.moeda(c.a.prestacaoMensal) + "</td><td" + (melhor === "B" ? ' class="destaque"' : "") + ">" + Formato.moeda(c.b.prestacaoMensal) + "</td></tr>" +
        "<tr><td>Total de juros</td><td>" + Formato.moeda(c.a.totalJuros) + "</td><td>" + Formato.moeda(c.b.totalJuros) + "</td></tr>" +
        "<tr><td>Total pago</td><td>" + Formato.moeda(c.a.totalPago) + "</td><td>" + Formato.moeda(c.b.totalPago) + "</td></tr>" +
        "</tbody></table></div>" +
        '<p class="mt-2">A opção <strong>' + melhor + "</strong> tem uma prestação mensal " + Formato.moeda(Math.abs(c.diferencaPrestacao)) + " mais baixa.</p>" +
        '<div class="aviso-financeiro mt-2">⚠️ <span>' + APP_CONFIG.avisoCredito + "</span></div>";
    });
  }

  // Poupar €100 vs €200 (genérico: dois valores mensais à escolha)
  const formPoupancaComparar = document.getElementById("formCompararPoupanca");
  const resultadoPoupancaComparar = document.getElementById("resultadoCompararPoupanca");
  if (formPoupancaComparar && resultadoPoupancaComparar) {
    formPoupancaComparar.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const base = {
        inicial: lerCampo("pcInicial"),
        mensal: lerCampo("pcMensalA"),
        anos: lerCampo("pcAnos"),
        rendimentoAnual: lerCampo("pcRendimento"),
      };
      const mensalB = Num.paraNumero(lerCampo("pcMensalB"));
      const a = calcularPoupanca(base);
      const b = calcularPoupanca(Object.assign({}, base, { mensal: mensalB }));

      resultadoPoupancaComparar.classList.remove("oculto");
      resultadoPoupancaComparar.innerHTML =
        '<div class="tabela-scroll"><table class="tabela-comparacao"><thead><tr><th></th><th>' + Formato.moeda(base.mensal) + "/mês</th><th>" + Formato.moeda(mensalB) + "/mês</th></tr></thead><tbody>" +
        "<tr><td>Total investido</td><td>" + Formato.moeda(a.totalInvestido) + "</td><td>" + Formato.moeda(b.totalInvestido) + "</td></tr>" +
        "<tr><td>Rendimento</td><td>" + Formato.moeda(a.rendimento) + "</td><td>" + Formato.moeda(b.rendimento) + "</td></tr>" +
        '<tr><td>Valor final</td><td>' + Formato.moeda(a.valorFinal) + '</td><td class="destaque">' + Formato.moeda(b.valorFinal) + "</td></tr>" +
        "</tbody></table></div>";
    });
  }

  // Carro A vs Carro B (custo real)
  const formCarroComparar = document.getElementById("formCompararCarro");
  const resultadoCarroComparar = document.getElementById("resultadoCompararCarro");
  if (formCarroComparar && resultadoCarroComparar) {
    formCarroComparar.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const lerCarro = (s) => ({
        prestacao: lerCampo("carro" + s + "Prestacao"),
        combustivelMensal: lerCampo("carro" + s + "Combustivel"),
        seguroMensal: lerCampo("carro" + s + "Seguro"),
        manutencaoMensal: lerCampo("carro" + s + "Manutencao"),
        iucAnual: lerCampo("carro" + s + "Iuc"),
        estacionamentoMensal: 0,
        outrosMensal: 0,
        kmMensal: lerCampo("carro" + s + "Km"),
      });
      const a = calcularCustoRealCarro(lerCarro("A"));
      const b = calcularCustoRealCarro(lerCarro("B"));

      resultadoCarroComparar.classList.remove("oculto");
      resultadoCarroComparar.innerHTML =
        '<div class="tabela-scroll"><table class="tabela-comparacao"><thead><tr><th></th><th>Carro A</th><th>Carro B</th></tr></thead><tbody>' +
        "<tr><td>Custo mensal</td><td>" + Formato.moeda(a.custoMensal) + "</td><td>" + Formato.moeda(b.custoMensal) + "</td></tr>" +
        "<tr><td>Custo anual</td><td>" + Formato.moeda(a.custoAnual) + "</td><td>" + Formato.moeda(b.custoAnual) + "</td></tr>" +
        "<tr><td>Custo em 5 anos</td><td>" + Formato.moeda(a.custo5anos) + "</td><td>" + Formato.moeda(b.custo5anos) + "</td></tr>" +
        "<tr><td>Custo por km</td><td>" + Formato.moeda(a.custoPorKm) + "</td><td>" + Formato.moeda(b.custoPorKm) + "</td></tr>" +
        "</tbody></table></div>";
    });
  }

  // Comprar vs Financiar
  const formComprarFinanciar = document.getElementById("formComprarFinanciar");
  const resultadoComprarFinanciar = document.getElementById("resultadoComprarFinanciar");
  if (formComprarFinanciar && resultadoComprarFinanciar) {
    formComprarFinanciar.addEventListener("submit", (evento) => {
      evento.preventDefault();
      const precoAVista = Num.paraNumero(lerCampo("cfPreco"));
      const financiamento = calcularCreditoAuto({
        precoVeiculo: precoAVista,
        valorEntrada: lerCampo("cfEntrada"),
        prazoAnos: lerCampo("cfPrazo"),
        taxaJuroAnual: lerCampo("cfTaxa"),
      });

      resultadoComprarFinanciar.classList.remove("oculto");
      resultadoComprarFinanciar.innerHTML =
        '<div class="tabela-scroll"><table class="tabela-comparacao"><thead><tr><th></th><th>Comprar a pronto</th><th>Financiar</th></tr></thead><tbody>' +
        "<tr><td>Custo total</td><td>" + Formato.moeda(precoAVista) + "</td><td>" + Formato.moeda(financiamento.custoFinalVeiculo) + "</td></tr>" +
        "<tr><td>Juros pagos</td><td>" + Formato.moeda(0) + "</td><td>" + Formato.moeda(financiamento.totalJuros) + "</td></tr>" +
        "<tr><td>Impacto imediato na tesouraria</td><td>" + Formato.moeda(precoAVista) + " de uma vez</td><td>" + Formato.moeda(financiamento.valorEntrada) + " + " + Formato.moeda(financiamento.prestacaoMensal) + "/mês</td></tr>" +
        "</tbody></table></div>" +
        '<div class="aviso-financeiro mt-2">⚠️ <span>' + APP_CONFIG.avisoCredito + "</span></div>";
    });
  }
}

/* ==========================================================================
   Arranque
   ========================================================================== */
document.addEventListener("DOMContentLoaded", () => {
  inicializarTemaEMenu();
  inicializarPublicidade();

  const pagina = document.body.getAttribute("data-pagina");
  const inicializadores = {
    inicio: inicializarDashboard,
    "credito-habitacao": initCreditoHabitacao,
    "credito-auto": initCreditoAuto,
    salario: initSalario,
    iva: initIVA,
    margem: initMargem,
    juros: initJuros,
    poupanca: initPoupanca,
    combustivel: initCombustivel,
    eletricidade: initEletricidade,
    esforco: initEsforco,
    comparar: initComparar,
  };

  if (pagina && inicializadores[pagina]) {
    inicializadores[pagina]();
  }
});
