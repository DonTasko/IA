# Calculadora Financeira Portugal — Instruções

Guia completo para publicares o website, configurares a monetização e transformares a aplicação numa app Android.

## 1. Estrutura do projeto

```
calculadora-financeira-pt/
├── index.html                    (dashboard)
├── credito-habitacao.html
├── credito-auto.html
├── calculadora-salario.html
├── calculadora-iva.html
├── calculadora-margem.html
├── calculadora-juros.html
├── calculadora-poupanca.html
├── calculadora-combustivel.html
├── calculadora-eletricidade.html
├── calculadora-esforco.html
├── comparar.html                 ("Qual opção compensa mais?")
├── privacidade.html
├── termos.html
├── contacto.html
├── sobre.html
├── css/style.css
├── js/
│   ├── config.js       (AdSense, tabelas fiscais, flags)
│   ├── storage.js       (localStorage: tema, simulações, favoritos)
│   ├── calculadoras.js   (todas as fórmulas de cálculo, puras)
│   ├── share.js          (copiar / partilhar / imprimir)
│   └── app.js            (liga a UI às calculadoras)
├── icons/  (192, 512, maskable)
├── favicon.ico
├── manifest.json  (PWA)
├── sw.js          (Service Worker, cache offline)
├── robots.txt
├── sitemap.xml
└── gerar_paginas.py   (script Python usado para gerar as páginas HTML —
                         opcional, só precisas dele se quiseres editar o
                         cabeçalho/rodapé/SEO em massa outra vez)
```

Todas as calculadoras funcionam sem build step: é HTML, CSS e JavaScript puro. Basta alojar os ficheiros num servidor de ficheiros estáticos.

**Antes de publicares**, faz uma pesquisa e substituição em todos os ficheiros pelo teu domínio real:

- Procura `YOUR-DOMAIN.example` (aparece em todos os `<link rel="canonical">`, meta Open Graph, `robots.txt` e `sitemap.xml`) e substitui pelo teu domínio, ex: `https://calculadorafinanceira.pt`.
- Procura `geral@YOUR-DOMAIN.example` em `contacto.html` e substitui pelo teu email real.

Se editares o conteúdo das páginas, podes voltar a correr `python3 gerar_paginas.py` (precisa de Python 3) para regenerar tudo com o cabeçalho/rodapé atualizados — mas não é obrigatório, podes editar os `.html` diretamente também.

## 2. Publicar no GitHub Pages

1. Cria um novo repositório no GitHub (ex: `calculadora-financeira-portugal`).
2. Copia todos os ficheiros deste projeto para a raiz do repositório e faz commit + push.
3. No GitHub, vai a **Settings → Pages**.
4. Em "Source", escolhe **Deploy from a branch**, seleciona a branch `main` e a pasta `/ (root)`.
5. Guarda. Ao fim de 1-2 minutos o site fica disponível em `https://<o-teu-utilizador>.github.io/<nome-do-repositorio>/`.
6. (Opcional) Para usares um domínio próprio, cria um ficheiro `CNAME` na raiz com o domínio, e configura o DNS do domínio para apontar para o GitHub Pages.

## 3. Publicar no Netlify

**Opção A — arrastar e largar:**
1. Entra em [app.netlify.com](https://app.netlify.com) e cria conta/sessão.
2. Na página "Sites", arrasta a pasta do projeto para a área de upload ("Deploy manually").
3. O Netlify publica automaticamente e dá-te um URL (`https://nome-aleatorio.netlify.app`).
4. Em **Site settings → Domain management**, podes mudar o subdomínio ou associar um domínio próprio.

**Opção B — via Git (recomendado para atualizações contínuas):**
1. Faz push do projeto para um repositório GitHub/GitLab/Bitbucket.
2. No Netlify, "Add new site → Import an existing project" e liga o repositório.
3. Como não há build step, deixa o "Build command" vazio e o "Publish directory" como `.` (raiz).
4. Deploy automático a cada push.

## 4. Configurar o Google AdSense (website)

A aplicação já está preparada — só faltam os teus IDs reais.

1. Cria conta em [google.com/adsense](https://www.google.com/adsense) e submete o teu site para aprovação (precisa do site já estar publicado e com algum conteúdo, o que já tens).
2. Depois de aprovado, cria os blocos de anúncio ("Ad units") que quiseres — recomendamos pelo menos 3: um para o topo, um para o meio do conteúdo e um para o fundo.
3. Abre `js/config.js` e substitui:

   | Placeholder no código              | O que colocar |
   |-------------------------------------|---------------|
   | `YOUR_ADSENSE_PUBLISHER_ID`         | O teu Publisher ID, formato `ca-pub-XXXXXXXXXXXXXXXX` |
   | `YOUR_ADSENSE_SLOT_TOP`             | ID do bloco de anúncio do topo |
   | `YOUR_ADSENSE_SLOT_MIDDLE`          | ID do bloco de anúncio do meio |
   | `YOUR_ADSENSE_SLOT_BOTTOM`          | ID do bloco de anúncio do fundo |

4. Muda `adsenseEnabled: false` para `adsenseEnabled: true` no mesmo ficheiro.
5. Os anúncios aparecem automaticamente nos blocos já existentes em todas as páginas — procura por `<div class="espaco-anuncio" data-ad-pos="top|middle|bottom">` se quiseres adicionar/mover blocos.
6. Não é preciso mexer em mais nenhum ficheiro — a lógica de carregamento condicional está em `js/app.js`, função `inicializarPublicidade()`.

**Nota:** enquanto `adsenseEnabled` for `false`, esses espaços mostram apenas o aviso "Espaço de publicidade" — nunca ficam vazios/quebrados, mas também não carregam nenhum script do Google.

## 5. Transformar em APK Android (WebIntoApp)

1. Publica primeiro o website (passos 2 ou 3), porque o WebIntoApp precisa de um URL público para "embrulhar".
2. Entra em [webintoapp.com](https://www.webintoapp.com) e cria uma nova app, indicando o URL do teu site publicado.
3. Configura nome da app, ícone (usa os ficheiros em `icons/icon-512.png`), splash screen e cor de tema (`#0a6e4e`, já definida em `manifest.json`).
4. **Publicidade na app Android:** o código do Google AdSense do website (passo 4) **não corre dentro da APK gerada** — o WebView normalmente bloqueia ou ignora anúncios de display web. Configura a publicidade da app diretamente nas definições de anúncios do WebIntoApp (ou equivalente), que costuma oferecer integração própria com AdMob ou outro SDK de anúncios Android. `js/config.js` tem a flag `androidAdsEnabled` preparada para o dia em que quiseres diferenciar comportamento dentro do WebView.
5. Gera o `.apk` (ou `.aab` para a Play Store) na plataforma WebIntoApp.
6. Testa a app num telemóvel Android antes de submeteres à loja: confirma que todos os botões respondem a toque, o teclado numérico aparece nos campos certos, e a partilha (WhatsApp/Email) abre corretamente a partir de dentro do WebView.

## 6. Checklist para publicação na Google Play

- [ ] Conta de programador Google Play criada (taxa única de registo).
- [ ] `.aab` (Android App Bundle) gerado pelo WebIntoApp.
- [ ] Nome da app e descrição curta/longa escritos em português de Portugal.
- [ ] Ícone da app (512×512) e imagem de destaque (feature graphic, 1024×500).
- [ ] Pelo menos 2 capturas de ecrã de telemóvel (recomendado: 4-8, incluindo modo claro e escuro).
- [ ] Política de privacidade publicada num URL público — usa a página `privacidade.html` do teu site já publicado.
- [ ] Classificação de conteúdo (questionário da Play Console) preenchida — esta app é informativa/financeira, sem conteúdo sensível.
- [ ] Categoria da app definida como "Finanças".
- [ ] Declaração sobre anúncios (se ativares publicidade) preenchida na Play Console.
- [ ] Declaração de conformidade com a política de dados do utilizador (a app não recolhe dados pessoais — só localStorage local).
- [ ] Testes internos feitos com pelo menos 2-3 dispositivos Android diferentes.
- [ ] Versão (`versionCode`/`versionName`) definida no WebIntoApp antes do primeiro upload.

## 7. Sugestões para aumentar downloads organicamente

1. **SEO orgânico**: os títulos e descrições de cada página já estão otimizados para termos como "calculadora crédito habitação Portugal", "calculadora IVA", "salário líquido Portugal" — continua a criar conteúdo (ex: um blog com artigos sobre finanças pessoais em Portugal) a apontar para estas calculadoras.
2. **Partilha social**: os botões de partilha (WhatsApp, Facebook, X, Email) já estão prontos — incentiva os primeiros utilizadores a partilhar os resultados das suas simulações.
3. **Comunidades portuguesas**: partilha a app em grupos de Facebook/Reddit sobre finanças pessoais, crédito habitação e poupança em Portugal (com cuidado para não pareceres spam — participa genuinamente e só partilhes quando fizer sentido).
4. **App Store Optimization (ASO)** na Play Store: usa palavras-chave como "crédito habitação", "calculadora IVA", "salário líquido" no título e descrição da ficha da app.
5. **Avaliações**: pede aos primeiros utilizadores satisfeitos para deixarem uma avaliação de 5 estrelas na Play Store — isto tem um enorme impacto na visibilidade orgânica.
6. **Atualizações regulares**: atualiza as tabelas fiscais (`js/config.js` → `TABELAS_FISCAIS`) todos os anos, em janeiro, quando saem os novos escalões de IRS — e anuncia isso como "atualizado para o ano X" na loja, o que ajuda tanto no SEO como na perceção de qualidade.
7. **Parcerias**: contacta blogs e criadores de conteúdo portugueses sobre finanças pessoais para experimentarem e mencionarem a app.

## 8. Manutenção anual recomendada

Os valores fiscais em `js/config.js` (objeto `TABELAS_FISCAIS`) devem ser revistos todos os anos, normalmente em janeiro, quando o Orçamento do Estado altera:

- Escalões de IRS (`escaloesIRS`)
- Taxa de Segurança Social (raramente muda, mas confirma)
- Limites de isenção do subsídio de alimentação (`subsidioAlimentacao`)
- Salário mínimo nacional (`salarioMinimoNacional`)

Todos estes valores estão isolados num único objeto, exatamente para facilitar esta atualização anual sem tocar na lógica de cálculo.
