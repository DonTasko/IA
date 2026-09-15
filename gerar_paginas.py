# -*- coding: utf-8 -*-
"""
Gerador das páginas HTML da Calculadora Financeira Portugal.
Corre uma vez para produzir todos os ficheiros .html a partir de
templates Python, garantindo cabeçalho/rodapé/SEO consistentes.
Uso: python3 gerar_paginas.py
"""
import os

RAIZ = os.path.dirname(os.path.abspath(__file__))
SITE_URL = "https://YOUR-DOMAIN.example"  # <-- substitui pelo domínio real (ver INSTRUCOES.md)

NAV_LINKS = [
    ("index.html", "Início"),
    ("credito-habitacao.html", "Crédito Habitação"),
    ("credito-auto.html", "Crédito Automóvel"),
    ("calculadora-salario.html", "Salário"),
    ("calculadora-iva.html", "IVA"),
    ("calculadora-juros.html", "Juros Compostos"),
    ("calculadora-poupanca.html", "Poupança"),
    ("comparar.html", "Comparar"),
    ("sobre.html", "Sobre"),
]

FOOTER_COLS = [
    ("Calculadoras", [
        ("credito-habitacao.html", "Crédito Habitação"),
        ("credito-auto.html", "Crédito Automóvel"),
        ("calculadora-salario.html", "Salário"),
        ("calculadora-iva.html", "Calculadora de IVA"),
        ("calculadora-margem.html", "Margem e Lucro"),
    ]),
    ("Poupança e mais", [
        ("calculadora-juros.html", "Juros Compostos"),
        ("calculadora-poupanca.html", "Poupança"),
        ("calculadora-combustivel.html", "Combustível"),
        ("calculadora-eletricidade.html", "Eletricidade"),
        ("calculadora-esforco.html", "Esforço Financeiro"),
        ("comparar.html", "Comparar Opções"),
    ]),
    ("Sobre", [
        ("sobre.html", "Sobre a aplicação"),
        ("contacto.html", "Contacto"),
        ("privacidade.html", "Privacidade"),
        ("termos.html", "Termos de Utilização"),
    ]),
]

SITEMAP_PAGES = [
    "index.html", "credito-habitacao.html", "credito-auto.html",
    "calculadora-iva.html", "calculadora-salario.html", "calculadora-juros.html",
    "calculadora-poupanca.html", "calculadora-combustivel.html",
    "calculadora-eletricidade.html", "calculadora-margem.html",
    "calculadora-esforco.html", "comparar.html",
    "privacidade.html", "termos.html", "contacto.html", "sobre.html",
]


def escapar(txt):
    return (txt.replace("&", "&amp;").replace("<", "&lt;").replace(">", "&gt;").replace('"', "&quot;"))


def anuncio(pos):
    return (
        '<div class="espaco-anuncio" data-ad-pos="%s">'
        '<span class="rotulo-anuncio">Espaço de publicidade</span>'
        "Este espaço fica reservado para anúncios (Google AdSense). "
        "Configura os IDs em <code>js/config.js</code>."
        "</div>" % pos
    )


def header_html():
    itens = "".join('<li><a href="%s">%s</a></li>' % (href, txt) for href, txt in NAV_LINKS)
    return (
        '<header class="site-header">'
        '<div class="container">'
        '<a class="marca" href="index.html"><span class="bandeira" aria-hidden="true">🇵🇹</span> Calculadora Financeira Portugal</a>'
        '<div class="acoes-header">'
        '<button type="button" class="botao-icone" data-acao-tema aria-label="Alternar tema">🌙</button>'
        '<button type="button" class="botao-menu" aria-label="Abrir menu" aria-expanded="false">☰ <span>Menu</span></button>'
        "</div>"
        "</div>"
        "</header>"
        # O <nav> fica FORA do <header> propositadamente: o header usa backdrop-filter,
        # que cria um "containing block" para elementos position:fixed dentro dele — isso
        # fazia o menu mobile (position:fixed) ficar espremido dentro da altura do header
        # em vez de ocupar o ecrã todo. Como irmão do header, o nav fixa-se corretamente
        # em relação à janela do browser.
        '<nav class="menu-principal" aria-label="Navegação principal"><ul>%s</ul></nav>' % itens
    )


def footer_html():
    cols = ""
    for titulo, links in FOOTER_COLS:
        li = "".join('<li><a href="%s">%s</a></li>' % (h, t) for h, t in links)
        cols += '<div><h4>%s</h4><ul>%s</ul></div>' % (titulo, li)

    return (
        '<footer class="site-footer">'
        '<div class="container">'
        '<div class="grelha-footer">'
        '<div><a class="marca" href="index.html"><span class="bandeira" aria-hidden="true">🇵🇹</span> Calculadora Financeira Portugal</a>'
        '<p class="mt-2">Todas as contas importantes num só lugar. Calculadoras gratuitas, em português, pensadas para Portugal. '
        "Os cálculos podem ser feitos localmente no teu dispositivo — não recolhemos dados pessoais desnecessários.</p></div>"
        + cols +
        "</div>"
        '<div class="rodape-legal">'
        '<span>© <span data-ano-atual>2026</span> Calculadora Financeira Portugal. Todos os direitos reservados.</span>'
        '<span>Os resultados apresentados são estimativas e não constituem aconselhamento financeiro, fiscal ou jurídico.</span>'
        "</div>"
        "</div>"
        "</footer>"
    )


SCRIPTS = (
    '<script src="js/config.js"></script>'
    '<script src="js/storage.js"></script>'
    '<script src="js/calculadoras.js"></script>'
    '<script src="js/share.js"></script>'
    '<script src="js/app.js"></script>'
    '<script>if("serviceWorker" in navigator){window.addEventListener("load",function(){navigator.serviceWorker.register("sw.js").catch(function(){});});}</script>'
)


def pagina(nome_ficheiro, title, description, data_pagina, body_html, extra_head=""):
    canonical = SITE_URL + "/" + nome_ficheiro
    og_title = title.split(" — ")[0]
    html = """<!DOCTYPE html>
<html lang="pt-PT">
<head>
<meta charset="UTF-8">
<meta name="viewport" content="width=device-width, initial-scale=1, viewport-fit=cover">
<title>%(title)s</title>
<meta name="description" content="%(description)s">
<link rel="canonical" href="%(canonical)s">
<meta name="robots" content="index, follow">
<meta name="theme-color" content="#0a6e4e">
<meta property="og:type" content="website">
<meta property="og:title" content="%(og_title)s">
<meta property="og:description" content="%(description)s">
<meta property="og:url" content="%(canonical)s">
<meta property="og:locale" content="pt_PT">
<meta property="og:site_name" content="Calculadora Financeira Portugal">
<meta property="og:image" content="%(site_url)s/icons/icon-512.png">
<meta name="twitter:card" content="summary">
<meta name="twitter:title" content="%(og_title)s">
<meta name="twitter:description" content="%(description)s">
<meta name="twitter:image" content="%(site_url)s/icons/icon-512.png">
<link rel="manifest" href="manifest.json">
<link rel="icon" href="favicon.ico" sizes="any">
<link rel="icon" href="icons/icon-192.png" type="image/png">
<link rel="apple-touch-icon" href="icons/icon-192.png">
<link rel="stylesheet" href="css/style.css">
%(extra_head)s</head>
<body data-pagina="%(data_pagina)s">
<a class="visualmente-oculto" href="#conteudo-principal">Saltar para o conteúdo</a>
%(header)s
<main id="conteudo-principal">
%(body)s
</main>
%(footer)s
%(scripts)s
</body>
</html>
""" % {
        "title": escapar(title),
        "description": escapar(description),
        "canonical": canonical,
        "og_title": escapar(og_title),
        "site_url": SITE_URL,
        "extra_head": extra_head,
        "data_pagina": data_pagina,
        "header": header_html(),
        "body": body_html,
        "footer": footer_html(),
        "scripts": SCRIPTS,
    }
    caminho = os.path.join(RAIZ, nome_ficheiro)
    with open(caminho, "w", encoding="utf-8") as f:
        f.write(html)
    print("Gerado:", nome_ficheiro)


# ---------------------------------------------------------------------------
# Helpers de formulário
# ---------------------------------------------------------------------------
def campo_moeda(id_, rotulo, ajuda="", valor="", passo="0.01", obrigatorio=True):
    # type="text" + inputmode="decimal": permite escrever "3,5" (vírgula portuguesa).
    # A conversão e validação numérica reais são feitas em js/calculadoras.js (Num.paraNumero)
    # e js/app.js (validarObrigatorios), não pelo browser.
    req = " required" if obrigatorio else ""
    return (
        '<div class="campo">'
        '<label for="%s">%s</label>'
        '<div class="input-com-prefixo"><span class="prefixo">€</span>'
        '<input type="text" id="%s" name="%s" inputmode="decimal" autocomplete="off" placeholder="0,00" value="%s"%s>'
        "</div>"
        + ('<span class="ajuda-campo">%s</span>' % ajuda if ajuda else "")
        + '<span class="mensagem-erro"></span>'
        "</div>"
    ) % (id_, rotulo, id_, id_, valor, req)


def campo_numero(id_, rotulo, sufixo="", ajuda="", valor="", passo="1", min_="0", max_=None, obrigatorio=True):
    req = " required" if obrigatorio else ""
    sufixo_html = '<span class="sufixo">%s</span>' % sufixo if sufixo else ""
    return (
        '<div class="campo">'
        '<label for="%s">%s</label>'
        '<div class="input-com-prefixo"><input type="text" id="%s" name="%s" inputmode="decimal" autocomplete="off" placeholder="0" value="%s"%s>%s</div>'
        + ('<span class="ajuda-campo">%s</span>' % ajuda if ajuda else "")
        + '<span class="mensagem-erro"></span>'
        "</div>"
    ) % (id_, rotulo, id_, id_, valor, req, sufixo_html)


def campo_select(id_, rotulo, opcoes, ajuda="", container_id=None):
    ops = "".join('<option value="%s"%s>%s</option>' % (v, ' selected' if sel else '', t) for v, t, sel in opcoes)
    abre = '<div class="campo" id="%s">' % container_id if container_id else '<div class="campo">'
    return (
        abre +
        '<label for="%s">%s</label>'
        '<select id="%s" name="%s">%s</select>'
        + ('<span class="ajuda-campo">%s</span>' % ajuda if ajuda else "")
        + "</div>"
    ) % (id_, rotulo, id_, id_, ops)


def campo_checkbox(id_, rotulo):
    return (
        '<div class="campo campo-checkbox">'
        '<input type="checkbox" id="%s" name="%s">'
        '<label for="%s">%s</label>'
        "</div>"
    ) % (id_, id_, id_, rotulo)


def botao_submit(texto="Calcular"):
    return '<button type="submit" class="botao botao-primario botao-bloco">%s</button>' % texto


def resultado_div(id_="resultado"):
    return '<div id="%s" class="painel-resultado oculto" aria-live="polite"></div>' % id_


def cabecalho_pagina(kicker, titulo, subtitulo):
    return (
        '<div class="container pagina-header">'
        '<span class="kicker">%s</span>'
        "<h1>%s</h1>"
        '<p class="subtitulo">%s</p>'
        "</div>"
    ) % (kicker, titulo, subtitulo)


def bloco_conteudo_texto(html_interno):
    return '<div class="container"><div class="cartao conteudo-texto">%s</div></div>' % html_interno


# ---------------------------------------------------------------------------
# index.html — Dashboard
# ---------------------------------------------------------------------------
CARTOES = [
    ("credito-habitacao", "credito-habitacao.html", "🏠", "Crédito Habitação", "Calcula prestação, juros e custo total."),
    ("credito-auto", "credito-auto.html", "🚗", "Crédito Automóvel", "Calcula prestação e custo total do financiamento."),
    ("salario", "calculadora-salario.html", "💰", "Salário", "Calcula valores de salário bruto/líquido."),
    ("juros", "calculadora-juros.html", "📈", "Juros", "Calcula juros simples e compostos."),
    ("poupanca", "calculadora-poupanca.html", "💶", "Poupança", "Descobre quanto podes acumular ao longo do tempo."),
    ("combustivel", "calculadora-combustivel.html", "⛽", "Combustível", "Calcula o custo de uma viagem e por quilómetro."),
    ("eletricidade", "calculadora-eletricidade.html", "⚡", "Eletricidade", "Estima o custo mensal de equipamentos elétricos."),
    ("iva", "calculadora-iva.html", "🧾", "IVA", "Calcula preço com IVA e sem IVA."),
    ("margem", "calculadora-margem.html", "📊", "Margem e Lucro", "Calcula margem, markup e preço de venda."),
    ("esforco", "calculadora-esforco.html", "🏦", "Esforço Financeiro", "% do rendimento usada em prestações."),
    ("comparar", "comparar.html", "⚖️", "Comparar Opções", "Qual opção compensa mais? Compara cenários."),
]


def gerar_cartoes():
    html = ""
    for id_, href, emoji, titulo, desc in CARTOES:
        html += (
            '<div class="cartao-calc">'
            '<button type="button" class="botao-icone botao-favorito" data-favorito="%s" aria-label="Adicionar aos favoritos">☆</button>'
            '<a class="cartao-calc-link" href="%s">'
            '<span class="emoji" aria-hidden="true">%s</span>'
            "<h3>%s</h3><p>%s</p>"
            "</a>"
            "</div>"
        ) % (id_, href, emoji, titulo, desc)
    return html


def gerar_index():
    body = (
        '<div class="container hero">'
        '<span class="kicker">🇵🇹 Feito para Portugal</span>'
        "<h1>Calculadora Financeira Portugal</h1>"
        '<p class="lead">Simula, compara e percebe melhor o teu dinheiro. Crédito habitação, crédito automóvel, '
        "salário, IVA, poupança, combustível, eletricidade e muito mais — tudo em português, com € e sem complicações.</p>"
        "</div>"
        '<div class="container">' + anuncio("top") + "</div>"
        '<div class="container" id="calculadoras">'
        '<div class="titulo-seccao"><h2>As calculadoras</h2><p>Escolhe uma ferramenta para começar. Toca na estrela para guardares os teus favoritos.</p></div>'
        '<div class="grelha-cartoes">' + gerar_cartoes() + "</div>"
        "</div>"
        '<div class="container">' + anuncio("middle") + "</div>"
        '<section class="faixa-alt">'
        '<div class="container">'
        '<div class="titulo-seccao"><h2>As minhas simulações</h2><p>Guardadas apenas neste dispositivo — nunca enviadas para nenhum servidor.</p></div>'
        '<div id="listaSimulacoes" class="lista-simulacoes"></div>'
        '<div class="mt-4"><button type="button" id="limparSimulacoes" class="botao botao-secundario">Apagar todas as simulações</button></div>'
        "</div>"
        "</section>"
        '<div class="container">'
        '<div class="cartao conteudo-texto mt-6">'
        "<h2>Uma caixa de ferramentas financeiras pensada para Portugal</h2>"
        "<p>A Calculadora Financeira Portugal reúne, num único sítio, as contas que mais precisamos de fazer no "
        "dia a dia: quanto vou pagar por mês num crédito habitação, quanto fica um carro financiado, qual é o meu "
        "salário líquido, quanto é um preço com IVA, ou quanto posso poupar até uma determinada idade. Tudo calculado "
        "em euros, com terminologia portuguesa e formatos de número portugueses.</p>"
        "<p>Todas as calculadoras funcionam diretamente no teu telemóvel ou computador, sem criares conta, sem "
        "instalares nada e sem enviares os teus dados para servidor nenhum — os cálculos e as simulações guardadas "
        "ficam sempre no teu dispositivo.</p>"
        "<h3>Porque usar esta aplicação?</h3>"
        "<ul>"
        "<li>Resultados imediatos, com explicações em linguagem simples.</li>"
        "<li>Interface rápida, moderna e pensada primeiro para smartphone.</li>"
        "<li>Modo escuro, partilha por WhatsApp/Email e exportação para PDF via impressão.</li>"
        "<li>Sem necessidade de registo, login ou dados pessoais.</li>"
        "</ul>"
        "</div>"
        "</div>"
        '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "index.html",
        "Calculadora Financeira Portugal — Crédito, IVA, Salário, Poupança e Mais",
        "Calculadoras financeiras gratuitas para Portugal. Simula crédito, salário, IVA, poupança, combustível, eletricidade, margem e muito mais.",
        "inicio",
        body,
    )


# ---------------------------------------------------------------------------
# Crédito Habitação
# ---------------------------------------------------------------------------
def gerar_credito_habitacao():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("valorImovel", "Valor do imóvel", "O preço de compra do imóvel.")
        + campo_moeda("valorEntrada", "Entrada inicial", "Quanto vais pagar logo, do teu bolso.", obrigatorio=False)
        + campo_numero("prazoAnos", "Prazo (anos)", "anos", "Duração do crédito.", valor="30", min_="1", max_="50")
        + campo_numero("taxaJuroAnual", "Taxa de juro anual (TAN)", "%", "Taxa anual nominal, ex: 3,5", passo="0.01")
        + "</div>"
        + campo_select(
            "tipoTaxa", "Tipo de taxa (informativo)",
            [("fixa", "Fixa", True), ("variavel", "Variável", False), ("mista", "Mista", False)],
            "Não altera o cálculo — serve apenas para classificares a tua simulação.",
        )
        + botao_submit("Calcular prestação")
        + "</form>"
    )
    body = (
        cabecalho_pagina("🏠 Crédito Habitação", "Calculadora de Crédito Habitação", "Calcula a prestação mensal, os juros e o custo total do teu crédito à habitação.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Como funciona a simulação de crédito habitação</h2>"
            "<p>Esta calculadora usa a fórmula financeira padrão de amortização constante (sistema francês), a mesma "
            "lógica usada pela generalidade dos simuladores bancários: a partir do valor financiado, do prazo em anos "
            "e da taxa de juro anual (TAN), calcula-se uma prestação mensal fixa que amortiza capital e juros ao longo "
            "de todo o prazo.</p>"
            "<h3>O que é a TAN e a taxa fixa/variável?</h3>"
            "<p>A TAN (Taxa Anual Nominal) é a taxa de juro que a instituição financeira aplica ao capital em dívida. "
            "Num crédito de taxa variável, a TAN costuma ser indexada à Euribor mais um spread; numa taxa fixa, o valor "
            "mantém-se constante durante um período acordado. Nesta calculadora, essa escolha é apenas informativa — "
            "não altera a fórmula de cálculo, que assume sempre uma taxa constante durante todo o prazo simulado.</p>"
            "<h3>Aviso importante</h3>"
            "<p>Os resultados desta página são estimativas simplificadas e não incluem comissões, seguros obrigatórios, "
            "imposto de selo ou spread real aplicado pelo banco. Não constituem uma proposta de crédito nem substituem "
            "uma Ficha de Informação Normalizada (FIN) fornecida por uma instituição de crédito.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "credito-habitacao.html",
        "Crédito Habitação — Simulador de Prestação e Juros | Calculadora Financeira Portugal",
        "Simula a prestação mensal, o total de juros e o custo total do teu crédito habitação em segundos, gratuitamente.",
        "credito-habitacao",
        body,
    )


# ---------------------------------------------------------------------------
# Crédito Automóvel
# ---------------------------------------------------------------------------
def gerar_credito_auto():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("precoVeiculo", "Preço do veículo")
        + campo_moeda("valorEntrada", "Entrada", obrigatorio=False)
        + campo_numero("prazoAnos", "Prazo (anos)", "anos", valor="7", min_="0.5", max_="15", passo="0.5")
        + campo_numero("taxaJuroAnual", "Taxa de juro anual", "%", passo="0.01")
        + "</div>"
        + botao_submit("Calcular prestação")
        + "</form>"
    )

    formulario_custo = (
        '<form id="formCustoReal" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("crPrestacao", "Prestação mensal", obrigatorio=False)
        + campo_moeda("crCombustivel", "Combustível / mês", obrigatorio=False)
        + campo_moeda("crSeguro", "Seguro / mês", obrigatorio=False)
        + campo_moeda("crManutencao", "Manutenção / mês", obrigatorio=False)
        + campo_moeda("crIuc", "IUC (anual)", obrigatorio=False)
        + campo_moeda("crEstacionamento", "Estacionamento / mês", obrigatorio=False)
        + campo_moeda("crOutros", "Outros custos / mês", obrigatorio=False)
        + campo_numero("crKm", "Km percorridos / mês", "km", obrigatorio=False)
        + "</div>"
        + botao_submit("Calcular custo real")
        + "</form>"
    )

    body = (
        cabecalho_pagina("🚗 Crédito Automóvel", "Calculadora de Crédito Automóvel", "Calcula a prestação mensal e o custo total do financiamento do teu carro.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">'
        + '<div class="titulo-seccao mt-6"><h2>Quanto custa realmente este carro?</h2>'
        + "<p>Soma todos os custos mensais — prestação, combustível, seguro, manutenção, IUC e estacionamento — para saberes o custo real de ter este carro.</p></div>"
        + '<div class="cartao">' + formulario_custo + "</div>"
        + '<div class="mt-4">' + resultado_div("resultadoCustoReal") + "</div>"
        + "</div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Simulação de crédito automóvel em Portugal</h2>"
            "<p>Tal como no crédito habitação, o crédito automóvel usa normalmente um sistema de prestações constantes: "
            "pagas todos os meses o mesmo valor, que inclui capital e juros, até ao fim do prazo contratado. Esta "
            "calculadora ajuda-te a perceber rapidamente qual será essa prestação e quanto vais pagar de juros no total.</p>"
            "<h3>Não te esqueças dos custos escondidos</h3>"
            "<p>A prestação do crédito é só uma parte do custo de ter um carro. Combustível, seguro automóvel, "
            "manutenção, Imposto Único de Circulação (IUC) e estacionamento pesam todos os meses na carteira. Usa a "
            "secção 'Quanto custa realmente este carro?' para teres uma visão completa, incluindo o custo por "
            "quilómetro percorrido.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "credito-auto.html",
        "Crédito Automóvel — Simulador de Prestação e Custo Real | Calculadora Financeira Portugal",
        "Simula a prestação do crédito automóvel e descobre o custo mensal real do teu carro, incluindo combustível, seguro e manutenção.",
        "credito-auto",
        body,
    )


# ---------------------------------------------------------------------------
# Salário
# ---------------------------------------------------------------------------
def gerar_salario():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("salarioBruto", "Salário bruto mensal")
        + campo_numero("numDependentes", "Número de dependentes", "", valor="0", min_="0", max_="10", obrigatorio=False)
        + campo_select(
            "situacaoFamiliar", "Situação familiar",
            [("solteiro", "Solteiro(a) / sem quociente conjugal", True),
             ("casado-dois-titulares", "Casado(a), dois titulares", False),
             ("casado-um-titular", "Casado(a), um titular", False)],
        )
        + campo_select(
            "numMesesAno", "Nº de meses/ano considerados",
            [("14", "14 (com subsídios de férias e Natal)", True), ("12", "12", False)],
        )
        + "</div>"
        + campo_checkbox("temSubsidioAlimentacao", "Recebo subsídio de alimentação")
        + '<div class="grelha-campos duas-colunas oculto" id="camposSubsidioAlimentacao">'
        + campo_select(
            "formaSubsidioAlimentacao", "Forma de pagamento",
            [("cartao", "Cartão / vale refeição", True), ("dinheiro", "Dinheiro", False)],
        )
        + campo_moeda("valorSubsidioAlimentacao", "Valor diário do subsídio", valor="6.00", obrigatorio=False)
        + campo_numero("diasUteisMes", "Dias úteis por mês", "dias", valor="22", min_="0", max_="31", obrigatorio=False)
        + "</div>"
        + botao_submit("Calcular salário líquido")
        + "</form>"
    )
    body = (
        cabecalho_pagina("💰 Salário", "Calculadora de Salário Bruto para Líquido", "Estima o teu salário líquido a partir do salário bruto, com desconto de Segurança Social e IRS.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Como é calculado o salário líquido</h2>"
            "<p>Ao salário bruto mensal são descontados 11% para a Segurança Social e uma retenção na fonte de IRS, "
            "calculada com base nos escalões de IRS em vigor. Esta calculadora soma depois o subsídio de alimentação "
            "(que é isento de descontos até um limite diário) para chegar ao valor líquido estimado.</p>"
            "<h3>Estimativa, não tabela oficial de retenção</h3>"
            "<p><strong>Esta calculadora usa um modelo simplificado</strong> sobre os escalões anuais de IRS — "
            "não reproduz, linha a linha, a tabela oficial de retenção na fonte mensal publicada pela Autoridade "
            "Tributária, que tem regras adicionais consoante o número de titulares, deficiência ou outras situações "
            "específicas. O valor real depende sempre da tua situação fiscal individual: consulta o teu recibo de "
            "vencimento ou o simulador oficial do Portal das Finanças para um valor exato.</p>"
            "<h3>Segurança Social e subsídio de alimentação</h3>"
            "<p>A taxa de desconto para a Segurança Social de um trabalhador por conta de outrem é, em regra, de 11% "
            "sobre a remuneração bruta. O subsídio de alimentação está isento de IRS e Segurança Social até um "
            "determinado valor diário — mais elevado quando pago em cartão refeição do que em dinheiro.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-salario.html",
        "Calculadora de Salário — Bruto para Líquido | Calculadora Financeira Portugal",
        "Calcula o teu salário líquido a partir do bruto, com Segurança Social, IRS estimado e subsídio de alimentação.",
        "salario",
        body,
    )


# ---------------------------------------------------------------------------
# IVA
# ---------------------------------------------------------------------------
def gerar_iva():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("preco", "Preço")
        + campo_select(
            "modoIva", "O preço introduzido é...",
            [("semIva", "Sem IVA (quero calcular o preço final)", True), ("comIva", "Com IVA (quero calcular o valor sem IVA)", False)],
        )
        + campo_select(
            "taxaIVASelect", "Taxa de IVA",
            [("23", "Taxa normal — 23%", True), ("13", "Taxa intermédia — 13%", False),
             ("6", "Taxa reduzida — 6%", False), ("personalizada", "Personalizada", False)],
            container_id=None,
        )
        + "</div>"
        + '<div class="grelha-campos oculto" id="campoTaxaPersonalizada">'
        + campo_numero("taxaPersonalizada", "Taxa personalizada", "%", valor="0", min_="0", max_="100", obrigatorio=False)
        + "</div>"
        + botao_submit("Calcular IVA")
        + "</form>"
    )
    body = (
        cabecalho_pagina("🧾 IVA", "Calculadora de IVA Portugal", "Calcula o preço com IVA ou sem IVA, com as taxas em vigor em Portugal Continental.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Taxas de IVA em Portugal Continental</h2>"
            "<p>Em Portugal Continental existem três taxas de IVA: a taxa normal de 23%, aplicável à generalidade dos "
            "bens e serviços; a taxa intermédia de 13%, usada por exemplo em alguns serviços de restauração; e a taxa "
            "reduzida de 6%, aplicável a bens de primeira necessidade. As Regiões Autónomas dos Açores e da Madeira "
            "têm taxas diferentes — usa a opção 'Personalizada' se precisares de simular esses casos.</p>"
            "<h3>Como calcular o preço com IVA</h3>"
            "<p>Preço com IVA = Preço sem IVA × (1 + taxa / 100). Para inverter o cálculo, isto é, para saberes quanto "
            "é o preço sem IVA a partir de um preço final, basta dividir o preço com IVA por (1 + taxa / 100).</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-iva.html",
        "Calculadora de IVA Portugal — 23%, 13% e 6% | Calculadora Financeira Portugal",
        "Calcula rapidamente o preço com IVA ou sem IVA em Portugal, com as taxas normal, intermédia e reduzida.",
        "iva",
        body,
    )


# ---------------------------------------------------------------------------
# Margem e Markup
# ---------------------------------------------------------------------------
def gerar_margem():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("custoProduto", "Custo do produto")
        + campo_moeda("maoObra", "Mão de obra", obrigatorio=False)
        + campo_moeda("transporte", "Transporte", obrigatorio=False)
        + campo_moeda("energia", "Energia", obrigatorio=False)
        + campo_moeda("outrosCustos", "Outros custos", obrigatorio=False)
        + campo_numero("margemPretendida", "Margem pretendida", "%", "Percentagem de margem sobre o preço de venda.", valor="30", min_="0", max_="95")
        + campo_select(
            "taxaIVAMargem", "IVA a aplicar",
            [("23", "23%", True), ("13", "13%", False), ("6", "6%", False), ("0", "Isento", False)],
        )
        + "</div>"
        + botao_submit("Calcular preço de venda")
        + "</form>"
    )
    body = (
        cabecalho_pagina("📊 Margem e Lucro", "Calculadora de Margem, Markup e Preço de Venda", "Descobre quanto deves cobrar para atingires a margem de lucro que pretendes.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Quanto devo cobrar?</h2>"
            "<p>Introduz todos os custos associados ao teu produto ou serviço (custo de compra, mão de obra, "
            "transporte, energia e outros custos) e a margem de lucro que pretendes obter. A calculadora soma os "
            "custos, aplica a margem sobre o preço de venda e acrescenta o IVA, devolvendo o preço final recomendado.</p>"
            "<h3>Margem vs. markup — qual a diferença?</h3>"
            "<p>A <strong>margem</strong> é o lucro calculado como percentagem do preço de venda (lucro ÷ preço de "
            "venda). O <strong>markup</strong> é o lucro calculado como percentagem do custo (lucro ÷ custo). São "
            "duas formas diferentes de olhar para o mesmo lucro em euros, e é fácil confundi-las — por isso esta "
            "calculadora mostra sempre as duas.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-margem.html",
        "Calculadora de Margem e Markup — Quanto Devo Cobrar? | Calculadora Financeira Portugal",
        "Calcula a margem, o markup e o preço de venda recomendado a partir dos teus custos, para empresários e vendedores.",
        "margem",
        body,
    )


# ---------------------------------------------------------------------------
# Juros Compostos
# ---------------------------------------------------------------------------
def gerar_juros():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("capitalInicial", "Capital inicial", obrigatorio=False)
        + campo_moeda("depositoMensal", "Depósito mensal", obrigatorio=False)
        + campo_numero("taxaAnual", "Taxa de juro anual", "%", passo="0.01")
        + campo_numero("anos", "Período (anos)", "anos", valor="10", min_="1", max_="60")
        + "</div>"
        + campo_select(
            "frequencia", "Frequência de capitalização",
            [("mensal", "Mensal", True), ("trimestral", "Trimestral", False),
             ("semestral", "Semestral", False), ("anual", "Anual", False)],
        )
        + botao_submit("Calcular juros compostos")
        + "</form>"
    )
    body = (
        cabecalho_pagina("📈 Juros", "Calculadora de Juros Compostos", "Simula a evolução do teu capital com juros compostos e reforços mensais.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>O que são juros compostos</h2>"
            "<p>Nos juros compostos, os juros ganhos em cada período passam a fazer parte do capital, gerando por sua "
            "vez novos juros nos períodos seguintes — é o chamado 'juro sobre juro'. É o mecanismo por trás da "
            "generalidade dos produtos de poupança e investimento a longo prazo, e é também o mecanismo por trás do "
            "crescimento da dívida em cartões de crédito não pagos a tempo.</p>"
            "<h3>Capitalização mensal, trimestral, semestral ou anual</h3>"
            "<p>A frequência de capitalização determina de quanto em quanto tempo os juros são somados ao capital. "
            "Quanto mais frequente for a capitalização, maior será o valor final, para a mesma taxa anual nominal — "
            "por isso é importante comparar sempre produtos financeiros com a mesma base de cálculo.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-juros.html",
        "Calculadora de Juros Compostos | Calculadora Financeira Portugal",
        "Simula juros compostos com depósitos mensais e diferentes frequências de capitalização. Vê a evolução do teu capital.",
        "juros",
        body,
    )


# ---------------------------------------------------------------------------
# Poupança
# ---------------------------------------------------------------------------
def gerar_poupanca():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("poupancaInicial", "Dinheiro inicial", obrigatorio=False)
        + campo_moeda("poupancaMensal", "Poupança mensal")
        + campo_numero("poupancaAnos", "Período (anos)", "anos", valor="5", min_="1", max_="60")
        + campo_numero("poupancaRendimento", "Rendimento anual estimado", "%", passo="0.01")
        + "</div>"
        + botao_submit("Calcular poupança")
        + "</form>"
    )
    body = (
        cabecalho_pagina("💶 Poupança", "Calculadora de Poupança", "Descobre quanto podes acumular ao longo do tempo, poupando todos os meses.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div()
        + '<button type="button" id="botaoMais50" class="botao botao-secundario mt-4 oculto">E se eu poupar mais €50 por mês?</button>'
        + '<div id="comparacaoExtra" class="cartao mt-4 oculto"></div>'
        + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Quanto terei daqui a X anos?</h2>"
            "<p>Esta calculadora projeta a evolução da tua poupança mensal ao longo do tempo, considerando um "
            "rendimento anual estimado (por exemplo, de um depósito a prazo, certificados de aforro ou um fundo de "
            "investimento). O resultado mostra o total que investiste, o rendimento gerado e o valor final acumulado.</p>"
            "<h3>O poder de poupar mais um pouco todos os meses</h3>"
            "<p>Pequenos aumentos na poupança mensal fazem uma diferença surpreendente ao longo de vários anos, graças "
            "ao efeito dos juros compostos. Usa o botão 'E se eu poupar mais €50 por mês?' para comparares os dois "
            "cenários lado a lado.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-poupanca.html",
        "Calculadora de Poupança — Quanto Vou Acumular? | Calculadora Financeira Portugal",
        "Simula quanto podes poupar ao longo dos anos e compara com o cenário de poupares mais €50 por mês.",
        "poupanca",
        body,
    )


# ---------------------------------------------------------------------------
# Combustível
# ---------------------------------------------------------------------------
def gerar_combustivel():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_numero("distancia", "Distância", "km")
        + campo_numero("consumo", "Consumo do veículo", "L/100km", valor="6", passo="0.1")
        + campo_moeda("precoCombustivel", "Preço do combustível (€/litro)", valor="1.70", passo="0.001")
        + campo_numero("passageiros", "Número de passageiros", "", valor="1", min_="1", max_="20", obrigatorio=False)
        + "</div>"
        + campo_checkbox("idaEVolta", "Viagem de ida e volta")
        + botao_submit("Calcular custo da viagem")
        + "</form>"
    )
    body = (
        cabecalho_pagina("⛽ Combustível", "Calculadora de Combustível", "Calcula o custo de uma viagem e o custo por quilómetro.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Como calcular o custo de uma viagem</h2>"
            "<p>O custo de uma viagem depende de três fatores: a distância a percorrer, o consumo médio do veículo "
            "(em litros por cada 100 km) e o preço do combustível. Multiplicando estes valores obtém-se o número de "
            "litros consumidos e o custo total — útil para decidires se compensa ir de carro próprio, partilhar "
            "viagem ou usar outro meio de transporte.</p>"
            "<h3>Custo por pessoa em viagens partilhadas</h3>"
            "<p>Se viajares acompanhado, divide o custo total pelo número de passageiros para saberes quanto cada "
            "pessoa deve contribuir — uma forma simples e justa de dividir despesas em viagens partilhadas (boleias, "
            "BlaBlaCar, ou simplesmente entre amigos e família).</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-combustivel.html",
        "Calculadora de Combustível — Custo de Viagem e por Km | Calculadora Financeira Portugal",
        "Calcula o custo de uma viagem de carro, o custo por quilómetro e o custo por pessoa em viagens partilhadas.",
        "combustivel",
        body,
    )


# ---------------------------------------------------------------------------
# Eletricidade
# ---------------------------------------------------------------------------
def gerar_eletricidade():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        + campo_select("aparelhoPreDefinido", "Aparelho (opcional, preenche a potência)", [("", "— Escolhe um exemplo —", True)])
        + '<div class="grelha-campos duas-colunas">'
        + campo_numero("potenciaWatts", "Potência", "W", valor="1000", min_="0", max_="30000")
        + campo_numero("horasDia", "Horas por dia", "h", valor="2", min_="0", max_="24", passo="0.1")
        + campo_numero("diasMes", "Dias por mês", "dias", valor="30", min_="0", max_="31")
        + campo_moeda("precoKwh", "Preço do kWh", valor="0.18", passo="0.001")
        + "</div>"
        + botao_submit("Calcular custo")
        + "</form>"
    )
    body = (
        cabecalho_pagina("⚡ Eletricidade", "Calculadora de Consumo Elétrico", "Quanto custa deixar este aparelho ligado? Calcula o consumo e o custo em euros.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>Quanto custa deixar este aparelho ligado?</h2>"
            "<p>O consumo de um aparelho elétrico depende da sua potência (em watts) e do tempo que fica ligado. "
            "Multiplicando a potência pelas horas de utilização obtém-se o consumo em watts-hora, que se converte em "
            "quilowatt-hora (kWh) — a unidade usada na tua fatura da luz — dividindo por 1000.</p>"
            "<h3>Exemplos de potência típica</h3>"
            "<p>Usa o seletor de exemplos para preencheres rapidamente a potência típica de televisões, frigoríficos, "
            "aquecedores, ar condicionado, computadores, máquinas de lavar roupa, secadores de cabelo e fornos "
            "elétricos. Os valores são aproximados — consulta sempre a ficha técnica do teu aparelho para um valor "
            "exato.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-eletricidade.html",
        "Calculadora de Consumo e Custo de Eletricidade | Calculadora Financeira Portugal",
        "Calcula quanto custa deixar um aparelho elétrico ligado: consumo diário, mensal e anual, e custo em euros.",
        "eletricidade",
        body,
    )


# ---------------------------------------------------------------------------
# Esforço Financeiro
# ---------------------------------------------------------------------------
def gerar_esforco():
    formulario = (
        '<form id="formCalculadora" class="form-calculadora" novalidate>'
        '<div class="grelha-campos duas-colunas">'
        + campo_moeda("rendimentoLiquido", "Rendimento mensal líquido")
        + campo_moeda("prestacaoCasa", "Prestação da casa", obrigatorio=False)
        + campo_moeda("creditoAuto", "Crédito automóvel", obrigatorio=False)
        + campo_moeda("cartoesCredito", "Cartões / créditos pessoais", obrigatorio=False)
        + campo_moeda("outrasPrestacoes", "Outras prestações", obrigatorio=False)
        + "</div>"
        + botao_submit("Calcular taxa de esforço")
        + "</form>"
    )
    body = (
        cabecalho_pagina("🏦 Esforço Financeiro", "Calculadora de Taxa de Esforço", "Calcula a percentagem do teu rendimento que é usada para pagar prestações.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container"><div class="cartao">' + formulario + "</div>"
        + '<div class="mt-4">' + resultado_div() + "</div></div>"
        + '<div class="container">' + anuncio("middle") + "</div>"
        + bloco_conteudo_texto(
            "<h2>O que é a taxa de esforço</h2>"
            "<p>A taxa de esforço é a percentagem do rendimento líquido de um agregado familiar que é usada para pagar "
            "prestações de crédito — habitação, automóvel, cartões e outros créditos pessoais. É um dos indicadores "
            "que as instituições financeiras analisam ao avaliar um novo pedido de crédito.</p>"
            "<h3>Como interpretar o resultado</h3>"
            "<p>Como referência geral, uma taxa de esforço abaixo de 35% costuma ser considerada confortável, entre "
            "35% e 50% é considerada moderada, e acima de 50% é considerada elevada e pode dificultar a aprovação de "
            "novo crédito ou colocar em risco o orçamento familiar em caso de imprevistos. Esta classificação é "
            "meramente indicativa e <strong>não substitui uma análise financeira profissional</strong>.</p>"
        )
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "calculadora-esforco.html",
        "Calculadora de Taxa de Esforço Financeiro | Calculadora Financeira Portugal",
        "Calcula a percentagem do teu rendimento usada em prestações de crédito e percebe se a tua taxa de esforço é baixa, moderada ou elevada.",
        "esforco",
        body,
    )


# ---------------------------------------------------------------------------
# Comparar
# ---------------------------------------------------------------------------
def gerar_comparar():
    def bloco_credito(sufixo, titulo):
        return (
            '<div class="cartao">'
            + "<h3>" + titulo + "</h3>"
            + campo_moeda("valor" + sufixo, "Valor do imóvel / veículo")
            + campo_moeda("entrada" + sufixo, "Entrada", obrigatorio=False)
            + campo_numero("prazo" + sufixo, "Prazo (anos)", "anos", valor="30" if sufixo == "A" else "25", min_="1", max_="50")
            + campo_numero("taxa" + sufixo, "Taxa de juro anual", "%", passo="0.01")
            + "</div>"
        )

    seccao_credito = (
        '<div class="cartao">'
        '<div class="titulo-seccao"><h2>Crédito A vs Crédito B</h2><p>Compara duas propostas de crédito (habitação ou automóvel) lado a lado.</p></div>'
        + campo_select("tipoComparacaoCredito", "Tipo de crédito", [("habitacao", "Crédito Habitação", True), ("auto", "Crédito Automóvel", False)])
        + '<div class="grelha-campos duas-colunas">'
        + bloco_credito("A", "Opção A")
        + bloco_credito("B", "Opção B")
        + "</div>"
        + '<button type="button" id="botaoCompararCredito" class="botao botao-primario botao-bloco mt-2">Comparar</button>'
        + '<div id="resultadoCompararCredito" class="mt-4 oculto"></div>'
        + "</div>"
    )

    seccao_comprar_financiar = (
        '<div class="cartao mt-6">'
        '<div class="titulo-seccao"><h2>Comprar a pronto vs Financiar</h2><p>Compara pagar o veículo de uma vez ou recorrer a financiamento.</p></div>'
        + '<form id="formComprarFinanciar" class="form-calculadora" novalidate>'
        + '<div class="grelha-campos duas-colunas">'
        + campo_moeda("cfPreco", "Preço do veículo")
        + campo_moeda("cfEntrada", "Entrada (se financiares)", obrigatorio=False)
        + campo_numero("cfPrazo", "Prazo (anos)", "anos", valor="7", min_="0.5", max_="15", passo="0.5")
        + campo_numero("cfTaxa", "Taxa de juro anual", "%", passo="0.01")
        + "</div>"
        + botao_submit("Comparar")
        + "</form>"
        + '<div id="resultadoComprarFinanciar" class="mt-4 oculto"></div>'
        + "</div>"
    )

    seccao_poupanca = (
        '<div class="cartao mt-6">'
        '<div class="titulo-seccao"><h2>Poupar €100 vs €200 por mês</h2><p>Compara dois valores de poupança mensal diferentes.</p></div>'
        + '<form id="formCompararPoupanca" class="form-calculadora" novalidate>'
        + '<div class="grelha-campos duas-colunas">'
        + campo_moeda("pcInicial", "Dinheiro inicial", obrigatorio=False)
        + campo_numero("pcAnos", "Período (anos)", "anos", valor="5", min_="1", max_="60")
        + campo_moeda("pcMensalA", "Poupança mensal — cenário A", valor="100")
        + campo_moeda("pcMensalB", "Poupança mensal — cenário B", valor="200")
        + campo_numero("pcRendimento", "Rendimento anual estimado", "%", passo="0.01")
        + "</div>"
        + botao_submit("Comparar cenários")
        + "</form>"
        + '<div id="resultadoCompararPoupanca" class="mt-4 oculto"></div>'
        + "</div>"
    )

    def bloco_carro(sufixo, titulo):
        return (
            '<div class="cartao">'
            + "<h3>" + titulo + "</h3>"
            + campo_moeda("carro" + sufixo + "Prestacao", "Prestação / mês", obrigatorio=False)
            + campo_moeda("carro" + sufixo + "Combustivel", "Combustível / mês", obrigatorio=False)
            + campo_moeda("carro" + sufixo + "Seguro", "Seguro / mês", obrigatorio=False)
            + campo_moeda("carro" + sufixo + "Manutencao", "Manutenção / mês", obrigatorio=False)
            + campo_moeda("carro" + sufixo + "Iuc", "IUC anual", obrigatorio=False)
            + campo_numero("carro" + sufixo + "Km", "Km / mês", "km", obrigatorio=False)
            + "</div>"
        )

    seccao_carro = (
        '<div class="cartao mt-6">'
        '<div class="titulo-seccao"><h2>Carro A vs Carro B</h2><p>Compara o custo mensal real de duas alternativas de carro.</p></div>'
        + '<form id="formCompararCarro" class="form-calculadora" novalidate>'
        + '<div class="grelha-campos duas-colunas">'
        + bloco_carro("A", "Carro A")
        + bloco_carro("B", "Carro B")
        + "</div>"
        + botao_submit("Comparar carros")
        + "</form>"
        + '<div id="resultadoCompararCarro" class="mt-4 oculto"></div>'
        + "</div>"
    )

    body = (
        cabecalho_pagina("⚖️ Comparar", "Qual opção compensa mais?", "Compara créditos, cenários de poupança e alternativas de carro lado a lado, para decidires com mais informação.")
        + '<div class="container">' + anuncio("top") + "</div>"
        + '<div class="container">' + seccao_credito + seccao_comprar_financiar + seccao_poupanca + seccao_carro + "</div>"
        + '<div class="container">' + anuncio("bottom") + "</div>"
    )
    pagina(
        "comparar.html",
        "Comparar Créditos, Poupança e Carros — Qual Opção Compensa Mais? | Calculadora Financeira Portugal",
        "Compara duas propostas de crédito, dois cenários de poupança ou duas alternativas de carro lado a lado, em segundos.",
        "comparar",
        body,
    )


# ---------------------------------------------------------------------------
# Páginas institucionais / legais
# ---------------------------------------------------------------------------
def gerar_privacidade():
    conteudo = (
        "<h2>Política de Privacidade</h2>"
        "<p>A Calculadora Financeira Portugal foi criada para funcionar sem recolher dados pessoais desnecessários. "
        "Não é necessário criar conta, não pedimos nome, telefone ou email para usares qualquer uma das calculadoras.</p>"
        "<h3>Onde ficam os teus dados</h3>"
        "<p>Todos os valores que introduzes nas calculadoras são processados diretamente no teu dispositivo (browser "
        "ou aplicação Android). As simulações que optares por guardar através do botão 'Guardar' ficam armazenadas "
        "apenas localmente, através da tecnologia localStorage do teu browser, e nunca são enviadas para nenhum "
        "servidor. Se limpares os dados do browser ou desinstalares a aplicação, essas simulações são apagadas.</p>"
        "<h3>Publicidade</h3>"
        "<p>Na versão website, esta aplicação está preparada para apresentar anúncios através do Google AdSense, que "
        "pode usar cookies e identificadores para apresentar publicidade relevante, de acordo com a sua própria "
        "política de privacidade. Na versão Android, a publicidade (quando ativada) pode ser fornecida por um "
        "sistema de anúncios diferente, próprio da plataforma. Podes consultar mais informação sobre como o Google "
        "usa dados em <a href=\"https://policies.google.com/technologies/partner-sites\" rel=\"noopener\" target=\"_blank\">policies.google.com</a>.</p>"
        "<h3>Cookies e armazenamento local</h3>"
        "<p>Usamos apenas armazenamento local (localStorage) para guardar a tua preferência de tema (claro/escuro), "
        "as tuas simulações guardadas e os teus favoritos. Este armazenamento não identifica pessoalmente o "
        "utilizador e não sai do teu dispositivo.</p>"
        "<h3>Contacto</h3>"
        "<p>Para questões relacionadas com privacidade, consulta a página <a href=\"contacto.html\">Contacto</a>.</p>"
    )
    body = cabecalho_pagina("🔒 Privacidade", "Política de Privacidade", "Como tratamos (ou melhor, como não recolhemos) os teus dados.") + bloco_conteudo_texto(conteudo)
    pagina("privacidade.html", "Política de Privacidade | Calculadora Financeira Portugal",
           "Sabe como a Calculadora Financeira Portugal trata a privacidade: sem contas, sem dados pessoais, cálculos feitos localmente.",
           "outra", body)


def gerar_termos():
    conteudo = (
        "<h2>Termos de Utilização</h2>"
        "<p>Ao usares a Calculadora Financeira Portugal, aceitas os seguintes termos.</p>"
        "<h3>1. Natureza do serviço</h3>"
        "<p>Esta aplicação disponibiliza calculadoras financeiras gratuitas, de caráter meramente informativo e "
        "educativo. Os resultados apresentados são estimativas, calculadas a partir de fórmulas financeiras padrão "
        "e de dados introduzidos pelo próprio utilizador.</p>"
        "<h3>2. Sem aconselhamento profissional</h3>"
        "<p>Nada nesta aplicação constitui aconselhamento financeiro, fiscal, jurídico ou de investimento. As "
        "simulações de crédito não constituem uma proposta de crédito nem substituem a Ficha de Informação "
        "Normalizada fornecida por instituições de crédito. Antes de tomares decisões financeiras importantes, "
        "consulta um profissional qualificado ou a tua instituição financeira.</p>"
        "<h3>3. Exatidão dos resultados</h3>"
        "<p>Fazemos um esforço razoável para que os cálculos estejam corretos, mas não garantimos a exatidão "
        "absoluta dos resultados, nomeadamente porque tabelas fiscais e taxas legais são atualizadas periodicamente "
        "pelas entidades competentes. Consulta sempre fontes oficiais para valores definitivos.</p>"
        "<h3>4. Utilização permitida</h3>"
        "<p>Podes usar esta aplicação livremente para fins pessoais ou profissionais. Não é permitido tentar "
        "extrair, copiar ou redistribuir o código-fonte da aplicação para fins comerciais concorrentes sem "
        "autorização.</p>"
        "<h3>5. Publicidade</h3>"
        "<p>A aplicação pode apresentar publicidade (Google AdSense no website, ou outro sistema de anúncios na "
        "versão Android) para suportar os custos de desenvolvimento e manutenção do serviço gratuito.</p>"
        "<h3>6. Alterações</h3>"
        "<p>Estes termos podem ser atualizados periodicamente. A versão mais recente estará sempre disponível "
        "nesta página.</p>"
    )
    body = cabecalho_pagina("📄 Termos", "Termos de Utilização", "As condições de utilização da Calculadora Financeira Portugal.") + bloco_conteudo_texto(conteudo)
    pagina("termos.html", "Termos de Utilização | Calculadora Financeira Portugal",
           "Consulta os termos de utilização da Calculadora Financeira Portugal, incluindo avisos sobre a natureza informativa dos resultados.",
           "outra", body)


def gerar_contacto():
    conteudo = (
        "<h2>Contacto</h2>"
        "<p>Tens sugestões, encontraste um erro de cálculo ou queres reportar um problema? Ficamos contentes por "
        "saber — usa um dos contactos abaixo.</p>"
        '<div class="cartao mt-4">'
        '<p><strong>Email:</strong> <a href="mailto:geral@YOUR-DOMAIN.example">geral@YOUR-DOMAIN.example</a></p>'
        '<p class="texto-fraco">Substitui este endereço de email pelo teu contacto real antes de publicares o site (ver INSTRUCOES.md).</p>'
        "</div>"
        "<p class=\"mt-4\">Antes de nos contactares sobre um valor que te parece incorreto, confirma se se trata de uma "
        "calculadora marcada como estimativa — a maioria dos resultados desta aplicação são estimativas "
        "simplificadas, não tabelas oficiais.</p>"
    )
    body = cabecalho_pagina("✉️ Contacto", "Contacto", "Fala connosco.") + bloco_conteudo_texto(conteudo)
    pagina("contacto.html", "Contacto | Calculadora Financeira Portugal",
           "Contacta a equipa da Calculadora Financeira Portugal para sugestões, dúvidas ou reporte de erros.",
           "outra", body)


def gerar_sobre():
    conteudo = (
        "<h2>Sobre a Calculadora Financeira Portugal</h2>"
        "<p>A Calculadora Financeira Portugal nasceu de uma ideia simples: juntar, num único sítio rápido e em "
        "português, as contas financeiras que mais fazemos no dia a dia em Portugal — crédito habitação, crédito "
        "automóvel, salário, IVA, poupança, combustível, eletricidade, margem de lucro e esforço financeiro.</p>"
        "<h3>O que nos guia</h3>"
        "<ul>"
        "<li><strong>Simplicidade</strong> — resultados claros, explicados em linguagem simples, sem jargão "
        "financeiro desnecessário.</li>"
        "<li><strong>Privacidade</strong> — sem contas obrigatórias, sem recolha de dados pessoais desnecessários.</li>"
        "<li><strong>Transparência</strong> — deixamos sempre claro quando um resultado é uma estimativa e não "
        "substitui aconselhamento profissional.</li>"
        "<li><strong>Rapidez</strong> — sem frameworks pesados, para funcionar bem mesmo em ligações mais lentas.</li>"
        "</ul>"
        "<h3>Disponível em várias formas</h3>"
        "<p>Esta aplicação funciona como website, como aplicação web instalável no telemóvel (PWA) e está preparada "
        "para ser publicada como aplicação Android.</p>"
    )
    body = cabecalho_pagina("ℹ️ Sobre", "Sobre esta aplicação", "Quem somos e porque criámos a Calculadora Financeira Portugal.") + bloco_conteudo_texto(conteudo)
    pagina("sobre.html", "Sobre | Calculadora Financeira Portugal",
           "Conhece a Calculadora Financeira Portugal: calculadoras financeiras gratuitas, em português, feitas para simplificar as tuas contas.",
           "outra", body)


# ---------------------------------------------------------------------------
# manifest.json, robots.txt, sitemap.xml
# ---------------------------------------------------------------------------
def gerar_manifest():
    import json
    manifest = {
        "name": "Calculadora Financeira Portugal",
        "short_name": "Finanças PT",
        "description": "Calculadoras financeiras gratuitas para Portugal: crédito, salário, IVA, poupança e mais.",
        "start_url": "./index.html",
        "scope": "./",
        "display": "standalone",
        "orientation": "portrait-primary",
        "background_color": "#f4f6f9",
        "theme_color": "#0a6e4e",
        "lang": "pt-PT",
        "icons": [
            {"src": "icons/icon-192.png", "sizes": "192x192", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-192-maskable.png", "sizes": "192x192", "type": "image/png", "purpose": "maskable"},
            {"src": "icons/icon-512.png", "sizes": "512x512", "type": "image/png", "purpose": "any"},
            {"src": "icons/icon-512-maskable.png", "sizes": "512x512", "type": "image/png", "purpose": "maskable"},
        ],
    }
    with open(os.path.join(RAIZ, "manifest.json"), "w", encoding="utf-8") as f:
        json.dump(manifest, f, ensure_ascii=False, indent=2)
    print("Gerado: manifest.json")


def gerar_robots():
    conteudo = (
        "User-agent: *\n"
        "Allow: /\n\n"
        "Sitemap: %s/sitemap.xml\n" % SITE_URL
    )
    with open(os.path.join(RAIZ, "robots.txt"), "w", encoding="utf-8") as f:
        f.write(conteudo)
    print("Gerado: robots.txt")


def gerar_sitemap():
    itens = "\n".join(
        '  <url>\n    <loc>%s/%s</loc>\n    <changefreq>monthly</changefreq>\n    <priority>%s</priority>\n  </url>'
        % (SITE_URL, pg, "1.0" if pg == "index.html" else "0.7")
        for pg in SITEMAP_PAGES
    )
    xml = '<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n%s\n</urlset>\n' % itens
    with open(os.path.join(RAIZ, "sitemap.xml"), "w", encoding="utf-8") as f:
        f.write(xml)
    print("Gerado: sitemap.xml")


def gerar_sw():
    conteudo = """const CACHE_NOME = "cfp-cache-v1";
const FICHEIROS_ESSENCIAIS = [
  "./index.html",
  "./css/style.css",
  "./js/config.js",
  "./js/storage.js",
  "./js/calculadoras.js",
  "./js/share.js",
  "./js/app.js",
  "./manifest.json",
];

self.addEventListener("install", (evento) => {
  evento.waitUntil(
    caches.open(CACHE_NOME).then((cache) => cache.addAll(FICHEIROS_ESSENCIAIS)).catch(() => {})
  );
  self.skipWaiting();
});

self.addEventListener("activate", (evento) => {
  evento.waitUntil(
    caches.keys().then((chaves) =>
      Promise.all(chaves.filter((chave) => chave !== CACHE_NOME).map((chave) => caches.delete(chave)))
    )
  );
  self.clients.claim();
});

// Estratégia: network-first para HTML (conteúdo sempre atualizado quando há rede),
// cache-first para o resto (CSS/JS/ícones), com fallback para cache quando offline.
self.addEventListener("fetch", (evento) => {
  const pedido = evento.request;
  if (pedido.method !== "GET") return;

  const ehHtml = pedido.headers.get("accept") && pedido.headers.get("accept").includes("text/html");

  if (ehHtml) {
    evento.respondWith(
      fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_NOME).then((cache) => cache.put(pedido, copia));
          return resposta;
        })
        .catch(() => caches.match(pedido).then((resp) => resp || caches.match("./index.html")))
    );
    return;
  }

  evento.respondWith(
    caches.match(pedido).then((respostaCache) => {
      if (respostaCache) return respostaCache;
      return fetch(pedido)
        .then((resposta) => {
          const copia = resposta.clone();
          caches.open(CACHE_NOME).then((cache) => cache.put(pedido, copia));
          return resposta;
        })
        .catch(() => respostaCache);
    })
  );
});
"""
    with open(os.path.join(RAIZ, "sw.js"), "w", encoding="utf-8") as f:
        f.write(conteudo)
    print("Gerado: sw.js")


if __name__ == "__main__":
    gerar_index()
    gerar_credito_habitacao()
    gerar_credito_auto()
    gerar_salario()
    gerar_iva()
    gerar_margem()
    gerar_juros()
    gerar_poupanca()
    gerar_combustivel()
    gerar_eletricidade()
    gerar_esforco()
    gerar_comparar()
    gerar_privacidade()
    gerar_termos()
    gerar_contacto()
    gerar_sobre()
    gerar_manifest()
    gerar_robots()
    gerar_sitemap()
    gerar_sw()
    print("\nConcluído.")




