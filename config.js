/**
 * config.js
 * Configuração central da aplicação.
 *
 * -----------------------------------------------------------------------
 * MONETIZAÇÃO (Google AdSense) — website apenas
 * -----------------------------------------------------------------------
 * Substitui os placeholders abaixo pelos valores reais fornecidos pelo
 * Google AdSense depois de a tua conta ser aprovada. Enquanto
 * `adsenseEnabled` for `false`, nenhum anúncio é carregado — os espaços
 * de anúncio ficam apenas com o aviso visual "Espaço de publicidade".
 *
 * Onde colocar cada valor (ver também INSTRUCOES.md):
 *  - YOUR_ADSENSE_PUBLISHER_ID -> "ca-pub-XXXXXXXXXXXXXXXX"
 *  - YOUR_ADSENSE_SLOT_TOP     -> ID do bloco de anúncio do topo
 *  - YOUR_ADSENSE_SLOT_MIDDLE  -> ID do bloco de anúncio do meio
 *  - YOUR_ADSENSE_SLOT_BOTTOM  -> ID do bloco de anúncio do fundo
 *
 * -----------------------------------------------------------------------
 * ANDROID / WEBINTOAPP
 * -----------------------------------------------------------------------
 * O código AdSense do website NÃO é usado dentro da app Android gerada
 * pelo WebIntoApp. Nessa plataforma, a publicidade é configurada do lado
 * do WebIntoApp (ou de outro SDK de anúncios para Android), fora deste
 * projeto HTML. `androidAdsEnabled` serve apenas para a app conseguir
 * ajustar o layout (ex: não mostrar os espaços de anúncio do website
 * dentro do WebView, se preferires anúncios nativos da app).
 * -----------------------------------------------------------------------
 */

const APP_CONFIG = {
  nome: "Calculadora Financeira Portugal",
  nomeCurto: "Finanças PT",
  versao: "1.0.0",
  ano: 2026,

  // --- AdSense (website) ---
  adsenseEnabled: false, // muda para true depois de configurares os IDs abaixo
  adsensePublisherId: "YOUR_ADSENSE_PUBLISHER_ID",
  adsenseTopSlot: "YOUR_ADSENSE_SLOT_TOP",
  adsenseMiddleSlot: "YOUR_ADSENSE_SLOT_MIDDLE",
  adsenseBottomSlot: "YOUR_ADSENSE_SLOT_BOTTOM",

  // --- Android / WebIntoApp ---
  // É detetado automaticamente no arranque (ver app.js -> detetarAmbienteAndroid),
  // mas pode ser forçado aqui para testes.
  androidAdsEnabled: false,

  // --- Premium (estrutura preparada, sem pagamentos implementados) ---
  premium: {
    ativo: false,
    beneficios: [
      "Sem publicidade",
      "Histórico ilimitado de simulações",
      "Comparação avançada entre cenários",
      "Exportação de resultados em PDF",
      "Gráficos avançados",
    ],
  },

  // --- Limites da versão gratuita ---
  limites: {
    maxSimulacoesGuardadas: 20,
  },

  // Aviso legal reutilizado em todas as calculadoras financeiras
  avisoFinanceiro:
    "Este resultado é meramente indicativo e não constitui aconselhamento financeiro, fiscal ou jurídico.",
  avisoCredito:
    "Estes valores são estimativas e não constituem uma proposta de crédito. Consulta sempre a tua instituição financeira.",
};

/**
 * TABELAS_FISCAIS
 * -----------------------------------------------------------------------
 * Estrutura isolada para que os valores fiscais possam ser atualizados
 * no futuro sem tocar na lógica de cálculo (js/calculadoras.js).
 *
 * Valores de referência para Portugal Continental, categoria A
 * (trabalho dependente), com base nos escalões de IRS de 2025 e nos
 * valores de Segurança Social / subsídio de alimentação em vigor em
 * 2025/2026. Confirma sempre os valores atualizados junto da Autoridade
 * Tributária (www.portaldasfinancas.gov.pt) e da Segurança Social Direta,
 * pois estas tabelas são revistas todos os anos (normalmente em janeiro).
 *
 * IMPORTANTE: a calculadora de salário usa um MODELO SIMPLIFICADO sobre
 * estes escalões anuais — não reproduz a tabela oficial de retenção na
 * fonte mensal (que tem regras adicionais consoante o número de titulares,
 * deficiência, etc.). Serve para dar uma estimativa rápida, nunca para
 * substituir o recibo de vencimento real.
 */
const TABELAS_FISCAIS = {
  anoReferencia: 2025,

  // Escalões de IRS (rendimento coletável anual, taxa marginal, parcela a abater)
  escaloesIRS: [
    { ate: 8059, taxa: 0.125, parcelaAbater: 0 },
    { ate: 12160, taxa: 0.16, parcelaAbater: 282.07 },
    { ate: 17233, taxa: 0.215, parcelaAbater: 950.87 },
    { ate: 22306, taxa: 0.244, parcelaAbater: 1450.63 },
    { ate: 28400, taxa: 0.314, parcelaAbater: 3012.04 },
    { ate: 41629, taxa: 0.349, parcelaAbater: 4006.44 },
    { ate: 44987, taxa: 0.431, parcelaAbater: 7419.81 },
    { ate: 83696, taxa: 0.446, parcelaAbater: 8094.57 },
    { ate: Infinity, taxa: 0.48, parcelaAbater: 10939.83 },
  ],

  // Redução aproximada da taxa efetiva por dependente (modelo simplificado)
  reducaoPorDependente: 0.02, // 2% por dependente, máx. 3 dependentes considerados
  maxDependentesConsiderados: 3,

  // Segurança Social
  taxaSegurancaSocialTrabalhador: 0.11, // 11%
  taxaSegurancaSocialEntidade: 0.2375, // 23.75% (informativo, não usado no líquido do trabalhador)

  // Subsídio de alimentação — limites de isenção (2026)
  subsidioAlimentacao: {
    isencaoDinheiro: 6.15, // €/dia, pago em dinheiro
    isencaoCartao: 10.46, // €/dia, pago em cartão refeição
  },

  salarioMinimoNacional: 920, // 2026, valor bruto mensal

  fonte:
    "Escalões de IRS 2025 (OE2025) e valores de Segurança Social/subsídio de alimentação 2025-2026. Atualiza este objeto todos os anos.",
};

// Taxas de IVA em vigor em Portugal Continental
const TAXAS_IVA = [
  { rotulo: "Taxa normal — 23%", valor: 23 },
  { rotulo: "Taxa intermédia — 13%", valor: 13 },
  { rotulo: "Taxa reduzida — 6%", valor: 6 },
];

// Exemplos pré-definidos para a calculadora de eletricidade
const APARELHOS_ELETRICOS = [
  { nome: "Televisão (LED)", watts: 80 },
  { nome: "Frigorífico", watts: 150 },
  { nome: "Aquecedor elétrico", watts: 2000 },
  { nome: "Ar condicionado", watts: 1200 },
  { nome: "Computador de secretária", watts: 250 },
  { nome: "Máquina de lavar roupa", watts: 1500 },
  { nome: "Secador de cabelo", watts: 1800 },
  { nome: "Forno elétrico", watts: 2200 },
];

if (typeof module !== "undefined" && module.exports) {
  module.exports = { APP_CONFIG, TABELAS_FISCAIS, TAXAS_IVA, APARELHOS_ELETRICOS };
}
