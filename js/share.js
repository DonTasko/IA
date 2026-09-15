/**
 * share.js
 * Copiar, partilhar (Web Share API com fallback para links diretos) e
 * imprimir/exportar resultados. Nunca abre apps externas sem interação
 * direta do utilizador (só reage a cliques).
 */

const Partilha = {
  textoBase() {
    return "Fiz uma simulação na Calculadora Financeira Portugal.";
  },

  mostrarToast(mensagem) {
    let toast = document.querySelector(".toast");
    if (!toast) {
      toast = document.createElement("div");
      toast.className = "toast";
      toast.setAttribute("role", "status");
      toast.setAttribute("aria-live", "polite");
      document.body.appendChild(toast);
    }
    toast.textContent = mensagem;
    toast.classList.add("visivel");
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => toast.classList.remove("visivel"), 2600);
  },

  async copiarTexto(texto) {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(texto);
      } else {
        const area = document.createElement("textarea");
        area.value = texto;
        area.style.position = "fixed";
        area.style.opacity = "0";
        document.body.appendChild(area);
        area.focus();
        area.select();
        document.execCommand("copy");
        document.body.removeChild(area);
      }
      this.mostrarToast("Resultado copiado ✅");
      return true;
    } catch (erro) {
      this.mostrarToast("Não foi possível copiar. Tenta selecionar o texto manualmente.");
      return false;
    }
  },

  async partilharNativo(texto, url) {
    if (navigator.share) {
      try {
        await navigator.share({ title: (typeof APP_CONFIG !== "undefined" && APP_CONFIG.nome) || "Calculadora Financeira Portugal", text: texto, url: url || window.location.href });
        return true;
      } catch (erro) {
        // utilizador cancelou ou não suportado — sem ação adicional
        return false;
      }
    }
    return false;
  },

  linkWhatsApp(texto, url) {
    return "https://wa.me/?text=" + encodeURIComponent(texto + " " + url);
  },
  linkFacebook(url) {
    return "https://www.facebook.com/sharer/sharer.php?u=" + encodeURIComponent(url);
  },
  linkX(texto, url) {
    return "https://twitter.com/intent/tweet?text=" + encodeURIComponent(texto) + "&url=" + encodeURIComponent(url);
  },
  linkEmail(texto, url) {
    const assunto = encodeURIComponent((typeof APP_CONFIG !== "undefined" && APP_CONFIG.nome) || "Calculadora Financeira Portugal");
    const corpo = encodeURIComponent(texto + "\n\n" + url);
    return "mailto:?subject=" + assunto + "&body=" + corpo;
  },

  imprimir() {
    window.print();
  },
};

/**
 * Liga automaticamente os botões de partilha existentes num contentor.
 * Espera botões com atributos data-partilha="copiar|nativo|whatsapp|facebook|x|email|imprimir".
 * O texto a partilhar vem de uma função fornecida (para poder ser dinâmico).
 */
function ligarBotoesPartilha(contentor, obterTexto) {
  if (!contentor) return;
  const url = window.location.href;

  contentor.addEventListener("click", (evento) => {
    const botao = evento.target.closest("[data-partilha]");
    if (!botao || !contentor.contains(botao)) return;

    const tipo = botao.getAttribute("data-partilha");
    const texto = (typeof obterTexto === "function" ? obterTexto() : obterTexto) || Partilha.textoBase();

    switch (tipo) {
      case "copiar":
        Partilha.copiarTexto(texto);
        break;
      case "nativo":
        Partilha.partilharNativo(texto, url).then((ok) => {
          if (!ok) Partilha.copiarTexto(texto);
        });
        break;
      case "whatsapp":
        window.open(Partilha.linkWhatsApp(texto, url), "_blank", "noopener");
        break;
      case "facebook":
        window.open(Partilha.linkFacebook(url), "_blank", "noopener");
        break;
      case "x":
        window.open(Partilha.linkX(texto, url), "_blank", "noopener");
        break;
      case "email":
        window.location.href = Partilha.linkEmail(texto, url);
        break;
      case "imprimir":
        Partilha.imprimir();
        break;
      default:
        break;
    }
  });
}

if (typeof module !== "undefined" && module.exports) {
  module.exports = { Partilha, ligarBotoesPartilha };
}
