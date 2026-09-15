/**
 * storage.js
 * Tudo o que toca em localStorage vive aqui. Nada é enviado para nenhum
 * servidor — todos os dados ficam apenas no dispositivo do utilizador.
 */

const ChavesStorage = {
  TEMA: "cfp_tema",
  SIMULACOES: "cfp_simulacoes",
  FAVORITOS: "cfp_favoritos",
  DEFINICOES: "cfp_definicoes",
};

const StorageSeguro = {
  disponivel() {
    try {
      const teste = "__cfp_teste__";
      window.localStorage.setItem(teste, "1");
      window.localStorage.removeItem(teste);
      return true;
    } catch (erro) {
      return false;
    }
  },

  obter(chave, valorPadrao) {
    if (!this.disponivel()) return valorPadrao;
    try {
      const bruto = window.localStorage.getItem(chave);
      if (bruto === null) return valorPadrao;
      return JSON.parse(bruto);
    } catch (erro) {
      console.warn("Não foi possível ler '" + chave + "' do localStorage.", erro);
      return valorPadrao;
    }
  },

  definir(chave, valor) {
    if (!this.disponivel()) return false;
    try {
      window.localStorage.setItem(chave, JSON.stringify(valor));
      return true;
    } catch (erro) {
      console.warn("Não foi possível guardar '" + chave + "' no localStorage.", erro);
      return false;
    }
  },

  remover(chave) {
    if (!this.disponivel()) return;
    try {
      window.localStorage.removeItem(chave);
    } catch (erro) {
      /* silencioso */
    }
  },
};

/* ---------- Tema ---------- */
const GestorTema = {
  obterPreferencia() {
    return StorageSeguro.obter(ChavesStorage.TEMA, "sistema"); // "claro" | "escuro" | "sistema"
  },

  aplicar(preferencia) {
    const raiz = document.documentElement;
    if (preferencia === "claro") {
      raiz.setAttribute("data-theme", "light");
    } else if (preferencia === "escuro") {
      raiz.setAttribute("data-theme", "dark");
    } else {
      raiz.removeAttribute("data-theme");
    }
  },

  guardar(preferencia) {
    StorageSeguro.definir(ChavesStorage.TEMA, preferencia);
    this.aplicar(preferencia);
  },

  alternar() {
    const atual = this.obterPreferencia();
    const escuroAtivo =
      atual === "escuro" ||
      (atual === "sistema" && window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const nova = escuroAtivo ? "claro" : "escuro";
    this.guardar(nova);
    return nova;
  },

  inicializar() {
    this.aplicar(this.obterPreferencia());
  },
};

/* ---------- Simulações guardadas ---------- */
const GestorSimulacoes = {
  listar() {
    return StorageSeguro.obter(ChavesStorage.SIMULACOES, []);
  },

  guardar(simulacao) {
    const lista = this.listar();
    const registo = Object.assign(
      {
        id: "sim_" + Date.now() + "_" + Math.random().toString(36).slice(2, 8),
        data: new Date().toISOString(),
      },
      simulacao
    );
    lista.unshift(registo);
    const limite = (typeof APP_CONFIG !== "undefined" && APP_CONFIG.limites && APP_CONFIG.limites.maxSimulacoesGuardadas) || 20;
    const listaLimitada = lista.slice(0, limite);
    StorageSeguro.definir(ChavesStorage.SIMULACOES, listaLimitada);
    return registo;
  },

  remover(id) {
    const lista = this.listar().filter((s) => s.id !== id);
    StorageSeguro.definir(ChavesStorage.SIMULACOES, lista);
    return lista;
  },

  limparTudo() {
    StorageSeguro.definir(ChavesStorage.SIMULACOES, []);
  },

  porTipo(tipo) {
    return this.listar().filter((s) => s.tipo === tipo);
  },
};

/* ---------- Favoritos (calculadoras marcadas com estrela no dashboard) ---------- */
const GestorFavoritos = {
  listar() {
    return StorageSeguro.obter(ChavesStorage.FAVORITOS, []);
  },

  alternar(idCalculadora) {
    const lista = this.listar();
    const indice = lista.indexOf(idCalculadora);
    if (indice >= 0) {
      lista.splice(indice, 1);
    } else {
      lista.push(idCalculadora);
    }
    StorageSeguro.definir(ChavesStorage.FAVORITOS, lista);
    return lista;
  },

  ehFavorito(idCalculadora) {
    return this.listar().includes(idCalculadora);
  },
};

/* ---------- Definições gerais ---------- */
const GestorDefinicoes = {
  obter() {
    return StorageSeguro.obter(ChavesStorage.DEFINICOES, {});
  },
  definir(parcial) {
    const atuais = this.obter();
    const novas = Object.assign({}, atuais, parcial);
    StorageSeguro.definir(ChavesStorage.DEFINICOES, novas);
    return novas;
  },
};

if (typeof module !== "undefined" && module.exports) {
  module.exports = { StorageSeguro, GestorTema, GestorSimulacoes, GestorFavoritos, GestorDefinicoes, ChavesStorage };
}
