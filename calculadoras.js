/**
 * calculadoras.js
 * Funções de cálculo puras (sem tocar no DOM). Cada função recebe um
 * objeto com os campos de entrada já sanitizados (números) e devolve um
 * objeto de resultado. Todas protegem contra NaN, negativos e divisão
 * por zero, limitando valores absurdos.
 */

const Num = {
  /** Converte texto em número seguro (aceita vírgula portuguesa), nunca NaN. */
  paraNumero(valor, valorPadrao) {
    if (typeof valor === "number") return Number.isFinite(valor) ? valor : valorPadrao || 0;
    if (valor === null || valor === undefined) return valorPadrao || 0;
    const limpo = String(valor).trim().replace(/\s|€/g, "").replace(/\.(?=\d{3}(\D|$))/g, "").replace(",", ".");
    const n = parseFloat(limpo);
    return Number.isFinite(n) ? n : valorPadrao || 0;
  },

  /** Garante que o número fica dentro de um intervalo razoável. */
  limitar(valor, min, max) {
    let v = Number.isFinite(valor) ? valor : min;
    if (v < min) v = min;
    if (v > max) v = max;
    return v;
  },

  /** Divisão segura: devolve 0 em vez de Infinity/NaN quando o divisor é 0. */
  dividir(a, b) {
    if (!b) return 0;
    const r = a / b;
    return Number.isFinite(r) ? r : 0;
  },

  arredondar(valor, casas) {
    const c = casas === undefined ? 2 : casas;
    const f = Math.pow(10, c);
    return Math.round((valor + Number.EPSILON) * f) / f;
  },
};

/** Limites de segurança para evitar valores absurdos nos formulários. */
const LIMITES = {
  MONETARIO_MAX: 50000000, // 50 milhões de euros
  ANOS_MAX: 60,
  TAXA_MAX: 100, // %
  DIAS_MAX: 31,
  HORAS_MAX: 24,
  WATTS_MAX: 30000,
  KM_MAX: 20000,
};

/* ==========================================================================
   1. CRÉDITO HABITAÇÃO
   ========================================================================== */
function calcularCreditoHabitacao(entrada) {
  const valorImovel = Num.limitar(Num.paraNumero(entrada.valorImovel), 0, LIMITES.MONETARIO_MAX);
  const valorEntrada = Num.limitar(Num.paraNumero(entrada.valorEntrada), 0, valorImovel);
  const prazoAnos = Num.limitar(Num.paraNumero(entrada.prazoAnos, 30), 1, LIMITES.ANOS_MAX);
  const taxaJuroAnual = Num.limitar(Num.paraNumero(entrada.taxaJuroAnual), 0, LIMITES.TAXA_MAX);

  const valorFinanciado = Math.max(0, valorImovel - valorEntrada);
  const numPrestacoes = Math.round(prazoAnos * 12);
  const taxaMensal = taxaJuroAnual / 100 / 12;

  let prestacaoMensal;
  if (valorFinanciado <= 0 || numPrestacoes <= 0) {
    prestacaoMensal = 0;
  } else if (taxaMensal === 0) {
    prestacaoMensal = Num.dividir(valorFinanciado, numPrestacoes);
  } else {
    const fator = Math.pow(1 + taxaMensal, numPrestacoes);
    prestacaoMensal = valorFinanciado * ((taxaMensal * fator) / (fator - 1));
  }

  const totalPago = prestacaoMensal * numPrestacoes;
  const totalJuros = Math.max(0, totalPago - valorFinanciado);
  const percentFinanciamento = valorImovel > 0 ? Num.dividir(valorFinanciado, valorImovel) * 100 : 0;

  return {
    valorImovel: Num.arredondar(valorImovel),
    valorEntrada: Num.arredondar(valorEntrada),
    valorFinanciado: Num.arredondar(valorFinanciado),
    prazoAnos,
    numPrestacoes,
    taxaJuroAnual,
    prestacaoMensal: Num.arredondar(prestacaoMensal),
    totalPago: Num.arredondar(totalPago),
    totalJuros: Num.arredondar(totalJuros),
    percentFinanciamento: Num.arredondar(percentFinanciamento, 1),
  };
}

/* ==========================================================================
   2. CRÉDITO AUTOMÓVEL
   ========================================================================== */
function calcularCreditoAuto(entrada) {
  const precoVeiculo = Num.limitar(Num.paraNumero(entrada.precoVeiculo), 0, LIMITES.MONETARIO_MAX);
  const valorEntrada = Num.limitar(Num.paraNumero(entrada.valorEntrada), 0, precoVeiculo);
  const prazoAnos = Num.limitar(Num.paraNumero(entrada.prazoAnos, 7), 0.5, 15);
  const taxaJuroAnual = Num.limitar(Num.paraNumero(entrada.taxaJuroAnual), 0, LIMITES.TAXA_MAX);

  const valorFinanciado = Math.max(0, precoVeiculo - valorEntrada);
  const numPrestacoes = Math.round(prazoAnos * 12);
  const taxaMensal = taxaJuroAnual / 100 / 12;

  let prestacaoMensal;
  if (valorFinanciado <= 0 || numPrestacoes <= 0) {
    prestacaoMensal = 0;
  } else if (taxaMensal === 0) {
    prestacaoMensal = Num.dividir(valorFinanciado, numPrestacoes);
  } else {
    const fator = Math.pow(1 + taxaMensal, numPrestacoes);
    prestacaoMensal = valorFinanciado * ((taxaMensal * fator) / (fator - 1));
  }

  const totalPago = prestacaoMensal * numPrestacoes;
  const totalJuros = Math.max(0, totalPago - valorFinanciado);
  const custoFinalVeiculo = valorEntrada + totalPago;

  return {
    precoVeiculo: Num.arredondar(precoVeiculo),
    valorEntrada: Num.arredondar(valorEntrada),
    valorFinanciado: Num.arredondar(valorFinanciado),
    prazoAnos,
    numPrestacoes,
    prestacaoMensal: Num.arredondar(prestacaoMensal),
    totalPago: Num.arredondar(totalPago),
    totalJuros: Num.arredondar(totalJuros),
    custoFinalVeiculo: Num.arredondar(custoFinalVeiculo),
  };
}

/** "Quanto custa realmente este carro?" — custos recorrentes agregados. */
function calcularCustoRealCarro(entrada) {
  const prestacao = Num.limitar(Num.paraNumero(entrada.prestacao), 0, LIMITES.MONETARIO_MAX);
  const combustivel = Num.limitar(Num.paraNumero(entrada.combustivelMensal), 0, LIMITES.MONETARIO_MAX);
  const seguro = Num.limitar(Num.paraNumero(entrada.seguroMensal), 0, LIMITES.MONETARIO_MAX);
  const manutencao = Num.limitar(Num.paraNumero(entrada.manutencaoMensal), 0, LIMITES.MONETARIO_MAX);
  const iucAnual = Num.limitar(Num.paraNumero(entrada.iucAnual), 0, LIMITES.MONETARIO_MAX);
  const estacionamento = Num.limitar(Num.paraNumero(entrada.estacionamentoMensal), 0, LIMITES.MONETARIO_MAX);
  const outros = Num.limitar(Num.paraNumero(entrada.outrosMensal), 0, LIMITES.MONETARIO_MAX);
  const kmMensal = Num.limitar(Num.paraNumero(entrada.kmMensal), 0, LIMITES.KM_MAX);

  const iucMensal = Num.dividir(iucAnual, 12);
  const custoMensal = prestacao + combustivel + seguro + manutencao + iucMensal + estacionamento + outros;
  const custoAnual = custoMensal * 12;
  const custo5anos = custoAnual * 5;
  const custoPorKm = kmMensal > 0 ? Num.dividir(custoMensal, kmMensal) : 0;

  return {
    custoMensal: Num.arredondar(custoMensal),
    custoAnual: Num.arredondar(custoAnual),
    custo5anos: Num.arredondar(custo5anos),
    custoPorKm: Num.arredondar(custoPorKm, 3),
  };
}

/* ==========================================================================
   3. SALÁRIO (estimativa simplificada — ver TABELAS_FISCAIS em config.js)
   ========================================================================== */
function calcularIRSAnualEstimado(rendimentoColetavelAnual, numDependentes) {
  const escaloes = (typeof TABELAS_FISCAIS !== "undefined" && TABELAS_FISCAIS.escaloesIRS) || [];
  if (rendimentoColetavelAnual <= 0 || escaloes.length === 0) return 0;

  let escalao = escaloes[escaloes.length - 1];
  for (let i = 0; i < escaloes.length; i++) {
    if (rendimentoColetavelAnual <= escaloes[i].ate) {
      escalao = escaloes[i];
      break;
    }
  }

  let imposto = rendimentoColetavelAnual * escalao.taxa - escalao.parcelaAbater;
  imposto = Math.max(0, imposto);

  const dependentesConsiderados = Num.limitar(numDependentes, 0, TABELAS_FISCAIS.maxDependentesConsiderados || 3);
  const reducao = 1 - dependentesConsiderados * (TABELAS_FISCAIS.reducaoPorDependente || 0);
  imposto = imposto * Math.max(0.4, reducao);

  return Math.max(0, imposto);
}

function calcularSalario(entrada) {
  const salarioBruto = Num.limitar(Num.paraNumero(entrada.salarioBruto), 0, LIMITES.MONETARIO_MAX);
  const numDependentes = Num.limitar(Num.paraNumero(entrada.numDependentes, 0), 0, 10);
  const situacaoFamiliar = entrada.situacaoFamiliar || "solteiro"; // solteiro | casado-um-titular | casado-dois-titulares
  const temSubsidioAlimentacao = !!entrada.temSubsidioAlimentacao;
  const formaSubsidio = entrada.formaSubsidioAlimentacao || "cartao"; // dinheiro | cartao
  const valorSubsidioDiario = Num.limitar(Num.paraNumero(entrada.valorSubsidioAlimentacao), 0, 60);
  const diasUteisMes = Num.limitar(Num.paraNumero(entrada.diasUteisMes, 22), 0, LIMITES.DIAS_MAX);
  const numMesesAno = Num.limitar(Num.paraNumero(entrada.numMesesAno, 14), 11, 14);

  // Segurança Social (11% sobre o bruto, categoria A)
  const taxaSS = (typeof TABELAS_FISCAIS !== "undefined" && TABELAS_FISCAIS.taxaSegurancaSocialTrabalhador) || 0.11;
  const descontoSegSocial = salarioBruto * taxaSS;

  // Rendimento coletável anual aproximado (14 meses de bruto, menos SS, sem outras deduções específicas)
  const rendimentoAnualBruto = salarioBruto * numMesesAno;
  const ssAnual = descontoSegSocial * numMesesAno;
  let ajusteFamiliar = 1;
  if (situacaoFamiliar === "casado-dois-titulares") ajusteFamiliar = 1;
  if (situacaoFamiliar === "casado-um-titular") ajusteFamiliar = 0.5; // quociente conjugal simplificado (2)

  const rendimentoColetavelAnual = Math.max(0, (rendimentoAnualBruto - ssAnual) * ajusteFamiliar);
  let irsAnualEstimado = calcularIRSAnualEstimado(rendimentoColetavelAnual, numDependentes);
  if (situacaoFamiliar === "casado-um-titular") irsAnualEstimado = irsAnualEstimado * 2;

  const irsMensalEstimado = Num.dividir(irsAnualEstimado, numMesesAno);

  // Subsídio de alimentação (parte isenta soma-se ao líquido; excesso seria tributado, ignorado aqui por simplicidade)
  let subsidioAlimentacaoMensal = 0;
  if (temSubsidioAlimentacao) {
    subsidioAlimentacaoMensal = valorSubsidioDiario * diasUteisMes;
  }

  const salarioLiquidoMensal = Math.max(
    0,
    salarioBruto - descontoSegSocial - irsMensalEstimado + subsidioAlimentacaoMensal
  );

  const salarioLiquidoAnual = salarioLiquidoMensal * numMesesAno - subsidioAlimentacaoMensal * numMesesAno + subsidioAlimentacaoMensal * 11; // aproximação: subsídio pago ~11-12x

  const taxaEfetiva = salarioBruto > 0 ? Num.dividir(descontoSegSocial + irsMensalEstimado, salarioBruto) * 100 : 0;

  return {
    salarioBruto: Num.arredondar(salarioBruto),
    descontoSegSocial: Num.arredondar(descontoSegSocial),
    irsMensalEstimado: Num.arredondar(irsMensalEstimado),
    subsidioAlimentacaoMensal: Num.arredondar(subsidioAlimentacaoMensal),
    salarioLiquidoMensal: Num.arredondar(salarioLiquidoMensal),
    salarioLiquidoAnualEstimado: Num.arredondar(Math.max(0, salarioLiquidoAnual)),
    taxaEfetiva: Num.arredondar(taxaEfetiva, 1),
    numMesesAno,
    formaSubsidio,
  };
}

/* ==========================================================================
   4. IVA
   ========================================================================== */
function calcularIVA(entrada) {
  const preco = Num.limitar(Num.paraNumero(entrada.preco), 0, LIMITES.MONETARIO_MAX);
  const taxaIVA = Num.limitar(Num.paraNumero(entrada.taxaIVA, 23), 0, LIMITES.TAXA_MAX);
  const modo = entrada.modo === "comIva" ? "comIva" : "semIva"; // preço introduzido é sem ou com IVA

  let precoSemIva, valorIva, precoComIva;
  if (modo === "comIva") {
    precoComIva = preco;
    precoSemIva = Num.dividir(preco, 1 + taxaIVA / 100);
    valorIva = precoComIva - precoSemIva;
  } else {
    precoSemIva = preco;
    valorIva = preco * (taxaIVA / 100);
    precoComIva = precoSemIva + valorIva;
  }

  return {
    precoSemIva: Num.arredondar(precoSemIva),
    valorIva: Num.arredondar(valorIva),
    precoComIva: Num.arredondar(precoComIva),
    taxaIVA,
  };
}

/* ==========================================================================
   5. MARGEM E MARKUP
   ========================================================================== */
function calcularMargem(entrada) {
  const custoProduto = Num.limitar(Num.paraNumero(entrada.custoProduto), 0, LIMITES.MONETARIO_MAX);
  const maoObra = Num.limitar(Num.paraNumero(entrada.maoObra), 0, LIMITES.MONETARIO_MAX);
  const transporte = Num.limitar(Num.paraNumero(entrada.transporte), 0, LIMITES.MONETARIO_MAX);
  const energia = Num.limitar(Num.paraNumero(entrada.energia), 0, LIMITES.MONETARIO_MAX);
  const outrosCustos = Num.limitar(Num.paraNumero(entrada.outrosCustos), 0, LIMITES.MONETARIO_MAX);
  const margemPretendida = Num.limitar(Num.paraNumero(entrada.margemPretendida), 0, 95);
  const taxaIVA = Num.limitar(Num.paraNumero(entrada.taxaIVA, 23), 0, LIMITES.TAXA_MAX);

  const custoTotal = custoProduto + maoObra + transporte + energia + outrosCustos;

  // margem sobre o preço de venda: preco = custo / (1 - margem%)
  const precoAntesIva = margemPretendida < 100 ? Num.dividir(custoTotal, 1 - margemPretendida / 100) : custoTotal;
  const valorIva = precoAntesIva * (taxaIVA / 100);
  const precoFinal = precoAntesIva + valorIva;
  const lucro = precoAntesIva - custoTotal;
  const markup = custoTotal > 0 ? Num.dividir(lucro, custoTotal) * 100 : 0;

  return {
    custoTotal: Num.arredondar(custoTotal),
    precoAntesIva: Num.arredondar(precoAntesIva),
    valorIva: Num.arredondar(valorIva),
    precoFinal: Num.arredondar(precoFinal),
    lucro: Num.arredondar(lucro),
    margem: Num.arredondar(margemPretendida, 1),
    markup: Num.arredondar(markup, 1),
  };
}

/* ==========================================================================
   6. JUROS COMPOSTOS
   ========================================================================== */
const FREQUENCIAS_CAPITALIZACAO = {
  mensal: 12,
  trimestral: 4,
  semestral: 2,
  anual: 1,
};

function calcularJurosCompostos(entrada) {
  const capitalInicial = Num.limitar(Num.paraNumero(entrada.capitalInicial), 0, LIMITES.MONETARIO_MAX);
  const depositoMensal = Num.limitar(Num.paraNumero(entrada.depositoMensal), 0, LIMITES.MONETARIO_MAX);
  const taxaAnual = Num.limitar(Num.paraNumero(entrada.taxaAnual), 0, LIMITES.TAXA_MAX);
  const anos = Num.limitar(Num.paraNumero(entrada.anos, 10), 0, LIMITES.ANOS_MAX);
  const frequencia = FREQUENCIAS_CAPITALIZACAO[entrada.frequencia] || 12;

  const meses = Math.round(anos * 12);
  const taxaMensal = taxaAnual / 100 / 12;
  const capitalInvestido = capitalInicial + depositoMensal * meses;

  // Simulação mês a mês (capitalização aplicada de acordo com a frequência escolhida)
  let saldo = capitalInicial;
  const serieAnual = [];
  const periodoCapitalizacaoMeses = Math.max(1, Math.round(12 / frequencia));

  for (let m = 1; m <= meses; m++) {
    saldo += depositoMensal;
    if (m % periodoCapitalizacaoMeses === 0) {
      const taxaPeriodo = (taxaAnual / 100) / frequencia;
      saldo *= 1 + taxaPeriodo;
    }
    if (m % 12 === 0) {
      serieAnual.push(Num.arredondar(saldo));
    }
  }
  if (meses % 12 !== 0) serieAnual.push(Num.arredondar(saldo));
  if (serieAnual.length === 0) serieAnual.push(Num.arredondar(saldo));

  const valorFinal = saldo;
  const jurosGanhos = Math.max(0, valorFinal - capitalInvestido);

  return {
    capitalInicial: Num.arredondar(capitalInicial),
    capitalInvestido: Num.arredondar(capitalInvestido),
    jurosGanhos: Num.arredondar(jurosGanhos),
    valorFinal: Num.arredondar(valorFinal),
    anos,
    serieAnual,
  };
}

/* ==========================================================================
   7. POUPANÇA
   ========================================================================== */
function calcularPoupanca(entrada) {
  const inicial = Num.limitar(Num.paraNumero(entrada.inicial), 0, LIMITES.MONETARIO_MAX);
  const mensal = Num.limitar(Num.paraNumero(entrada.mensal), 0, LIMITES.MONETARIO_MAX);
  const anos = Num.limitar(Num.paraNumero(entrada.anos, 5), 0, LIMITES.ANOS_MAX);
  const rendimentoAnual = Num.limitar(Num.paraNumero(entrada.rendimentoAnual), 0, LIMITES.TAXA_MAX);

  const resultado = calcularJurosCompostos({
    capitalInicial: inicial,
    depositoMensal: mensal,
    taxaAnual: rendimentoAnual,
    anos,
    frequencia: "mensal",
  });

  return {
    totalInvestido: resultado.capitalInvestido,
    rendimento: resultado.jurosGanhos,
    valorFinal: resultado.valorFinal,
    anos,
    serieAnual: resultado.serieAnual,
  };
}

/** Compara o cenário atual com um cenário poupando mais X €/mês. */
function compararPoupancaComExtra(entrada, extraMensal) {
  const base = calcularPoupanca(entrada);
  const comExtra = calcularPoupanca(
    Object.assign({}, entrada, { mensal: Num.paraNumero(entrada.mensal) + Num.paraNumero(extraMensal, 50) })
  );
  return {
    base,
    comExtra,
    diferencaValorFinal: Num.arredondar(comExtra.valorFinal - base.valorFinal),
  };
}

/* ==========================================================================
   8. COMBUSTÍVEL
   ========================================================================== */
function calcularCombustivel(entrada) {
  const distancia = Num.limitar(Num.paraNumero(entrada.distancia), 0, LIMITES.KM_MAX);
  const consumo = Num.limitar(Num.paraNumero(entrada.consumo, 6), 0, 60); // L/100km
  const precoCombustivel = Num.limitar(Num.paraNumero(entrada.precoCombustivel), 0, 10);
  const passageiros = Num.limitar(Num.paraNumero(entrada.passageiros, 1), 1, 20);
  const idaEVolta = !!entrada.idaEVolta;

  const distanciaTotal = idaEVolta ? distancia * 2 : distancia;
  const litrosConsumidos = (distanciaTotal * consumo) / 100;
  const custoViagem = litrosConsumidos * precoCombustivel;
  const custoPorKm = distanciaTotal > 0 ? Num.dividir(custoViagem, distanciaTotal) : 0;
  const custoPorPessoa = Num.dividir(custoViagem, passageiros);

  return {
    distanciaTotal: Num.arredondar(distanciaTotal, 1),
    litrosConsumidos: Num.arredondar(litrosConsumidos, 2),
    custoViagem: Num.arredondar(custoViagem),
    custoPorKm: Num.arredondar(custoPorKm, 3),
    custoPorPessoa: Num.arredondar(custoPorPessoa),
  };
}

/* ==========================================================================
   9. ELETRICIDADE
   ========================================================================== */
function calcularEletricidade(entrada) {
  const potenciaWatts = Num.limitar(Num.paraNumero(entrada.potenciaWatts), 0, LIMITES.WATTS_MAX);
  const horasDia = Num.limitar(Num.paraNumero(entrada.horasDia), 0, LIMITES.HORAS_MAX);
  const diasMes = Num.limitar(Num.paraNumero(entrada.diasMes, 30), 0, 31);
  const precoKwh = Num.limitar(Num.paraNumero(entrada.precoKwh, 0.18), 0, 5);

  const consumoDiarioKwh = (potenciaWatts * horasDia) / 1000;
  const consumoMensalKwh = consumoDiarioKwh * diasMes;
  const custoDiario = consumoDiarioKwh * precoKwh;
  const custoMensal = consumoMensalKwh * precoKwh;
  const custoAnual = custoMensal * 12;

  return {
    consumoDiarioKwh: Num.arredondar(consumoDiarioKwh, 3),
    consumoMensalKwh: Num.arredondar(consumoMensalKwh, 2),
    custoDiario: Num.arredondar(custoDiario, 3),
    custoMensal: Num.arredondar(custoMensal),
    custoAnual: Num.arredondar(custoAnual),
  };
}

/* ==========================================================================
   10. ESFORÇO FINANCEIRO
   ========================================================================== */
function calcularEsforcoFinanceiro(entrada) {
  const rendimentoLiquido = Num.limitar(Num.paraNumero(entrada.rendimentoLiquido), 0, LIMITES.MONETARIO_MAX);
  const prestacaoCasa = Num.limitar(Num.paraNumero(entrada.prestacaoCasa), 0, LIMITES.MONETARIO_MAX);
  const creditoAuto = Num.limitar(Num.paraNumero(entrada.creditoAuto), 0, LIMITES.MONETARIO_MAX);
  const cartoesCredito = Num.limitar(Num.paraNumero(entrada.cartoesCredito), 0, LIMITES.MONETARIO_MAX);
  const outrasPrestacoes = Num.limitar(Num.paraNumero(entrada.outrasPrestacoes), 0, LIMITES.MONETARIO_MAX);

  const totalPrestacoes = prestacaoCasa + creditoAuto + cartoesCredito + outrasPrestacoes;
  const taxaEsforco = rendimentoLiquido > 0 ? Num.dividir(totalPrestacoes, rendimentoLiquido) * 100 : 0;

  let nivel = "baixa";
  if (taxaEsforco >= 50) nivel = "elevada";
  else if (taxaEsforco >= 35) nivel = "moderada";

  return {
    totalPrestacoes: Num.arredondar(totalPrestacoes),
    taxaEsforco: Num.arredondar(taxaEsforco, 1),
    nivel,
  };
}

/* ==========================================================================
   COMPARADOR GENÉRICO
   ========================================================================== */
function compararCreditos(entradaA, entradaB, tipo) {
  const calc = tipo === "auto" ? calcularCreditoAuto : calcularCreditoHabitacao;
  const a = calc(entradaA);
  const b = calc(entradaB);
  return {
    a,
    b,
    diferencaPrestacao: Num.arredondar((a.prestacaoMensal || 0) - (b.prestacaoMensal || 0)),
    diferencaTotalPago: Num.arredondar((a.totalPago || 0) - (b.totalPago || 0)),
    diferencaTotalJuros: Num.arredondar((a.totalJuros || 0) - (b.totalJuros || 0)),
  };
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = {
    Num,
    LIMITES,
    calcularCreditoHabitacao,
    calcularCreditoAuto,
    calcularCustoRealCarro,
    calcularSalario,
    calcularIRSAnualEstimado,
    calcularIVA,
    calcularMargem,
    calcularJurosCompostos,
    calcularPoupanca,
    compararPoupancaComExtra,
    calcularCombustivel,
    calcularEletricidade,
    calcularEsforcoFinanceiro,
    compararCreditos,
  };
}
