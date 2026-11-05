# RTM Advocacia

Website institucional responsivo em React + TypeScript + Vite, com blog público e painel de publicações apoiados por uma API PHP. Inclui composição fotográfica editorial, retratos reais dos quatro profissionais, áreas detalhadas, etapas de atendimento, filtros de pautas e perguntas frequentes. O WhatsApp está configurado; e-mail, endereço, horários, registros da OAB, biografias e nome completo do Dr. Welson continuam pendentes.

**Para apenas visualizar, veja [COMECE-AQUI.md](COMECE-AQUI.md) e abra `ABRA-A-PREVIA.html` após baixar e extrair o ZIP do repositório. Não requer instalação nem hospedagem.**

**Para escrever artigos, veja [COMO-USAR-O-BLOG.md](COMO-USAR-O-BLOG.md).** O blog fica em `/blog/` e o painel em `/painel/`. Os artigos, rascunhos e dados de acesso ficam na hospedagem; a publicação real precisa de PHP e não funciona apenas abrindo a prévia HTML.

## Desenvolvimento

Node.js 24 e npm 11 foram utilizados. Use o checkout existente; cada tarefa da nuvem já é isolada e não precisa de worktree adicional.

```sh
cd /workspace/siteadvocacia
npm ci --cache /workspace/.cache/npm
npm run dev -- --port 5173 --strictPort
```

Para uso fora da nuvem, execute na pasta do repositório e use um caminho de cache gravável ou omita `--cache`.

## Validação

```sh
npm run build
npm test
```

O build inclui checagem de tipos. Os testes iniciam o servidor de preview na porta 4173 e verificam o build de produção em 1440, 768 e 390 pixels. Requerem Chromium: a configuração reutiliza `/usr/bin/chromium` quando disponível. Em outra máquina, instale com `npx playwright install chromium` ou defina `PLAYWRIGHT_CHROMIUM_EXECUTABLE_PATH`. Duas execuções paralelas limitam o consumo de recursos. Nenhuma credencial é necessária.

```sh
npm run preview -- --port 4173 --strictPort
```

O conteúdo publicado fica em `dist/`. O host deve servir a página inicial e os recursos estáticos na raiz do domínio, executar a API PHP em `api/` e disponibilizar os índices de `blog/` e `painel/`, com HTTPS. O pacote **[SITE-RTM-LOCAWEB.zip](SITE-RTM-LOCAWEB.zip)** contém a compilação atual e as licenças necessárias para enviar à hospedagem. Veja **[como publicar na Locaweb](COMO-PUBLICAR-NA-LOCAWEB.md)**. Este projeto não configura hospedagem, DNS ou publicação automaticamente.

## Blog e pacote de hospedagem

Na hospedagem, o blog exige PHP 8.1 ou mais recente, com Fileinfo e sessões; recomenda-se PHP 8.2 ou mais recente. É necessária permissão de gravação em `public_html/uploads/blog/` e na pasta `rtm-blog-private` ao lado de `public_html`. A compatibilidade com o plano da Locaweb ainda precisa ser verificada. Não é necessário instalar Node, Python ou banco de dados no servidor.

Para gerar o pacote de entrega no ambiente de desenvolvimento:

```sh
npm run package:hosting
```

Esse comando executa o build e o empacotador `scripts/package-hosting.py`, que utiliza Python 3 e sua biblioteca padrão. O ZIP inclui as páginas `/blog/` e `/painel/`, os arquivos PHP em `api/` e as licenças. O empacotador guarda o código de ativação fora do Git em `../.rtm-blog-install/siteadvocacia.activation-code`, com acesso restrito, e inclui somente seu verificador SHA-256 em `api/blog-install.php`. O código original é entregue separadamente ao responsável pelo site. Um build simples contém a configuração de exemplo sem ativação; use o pacote de entrega para instalar o painel.

No primeiro acesso ao painel, o responsável informa o código de ativação e define usuário e senha. A API guarda a senha com `password_hash`, usa sessão autenticada e proteção CSRF para alterações e salva os dados JSON fora da raiz pública, com bloqueio e substituição atômica dos arquivos. Leitura de artigos publicados não cria sessão. Rascunhos e administração exigem autenticação.

Para testar a API localmente, sirva a pasta `dist` com PHP, em vez do servidor estático do Vite. O comando `npm run test:blog` executa a suíte específica do blog; consulte sua configuração e os requisitos locais antes de executá-lo. A disponibilidade de um executável PHP no ambiente de testes não confirma a configuração da hospedagem do usuário.

Ao atualizar a aplicação, preserve `uploads/blog/` na raiz pública e `rtm-blog-private` fora dela. Os dados criados na hospedagem ficam fora do pacote e não devem ser substituídos por arquivos vazios.

## Prévia sem servidor

```sh
npm run preview:export
```

Gera `dist/rtm-preview.html` e `ABRA-A-PREVIA.html`, arquivos independentes com código, estilos, fontes e imagens incorporados. Abra em um navegador moderno para revisar a página institucional sem instalar dependências. O blog e a administração dependem da API PHP na hospedagem; essa cópia HTML não publica nem salva artigos. A tela de onboarding não oferece prévia interativa de localhost.

## Onde editar

- `src/App.tsx`: estrutura da página e navegação.
- `src/blog/`: listagem pública, artigo, painel, prévia e cliente da API do blog.
- `server/blog/`: API PHP, autenticação, persistência e configuração de ativação de exemplo.
- `scripts/build-pages.mjs`: páginas de entrada do blog e do painel e cópia da API para o build.
- `scripts/package-hosting.py`: pacote de entrega e configuração de ativação sem incluir o código original.
- `src/data/content.ts`: áreas, profissionais e textos introdutórios.
- `src/components/Modal.tsx`: janela acessível compartilhada.
- `src/components/EditorialImage.tsx` e `src/data/images.ts`: imagens locais responsivas.
- `src/components/EditorialHeading.tsx`: títulos com destaque tipográfico, a partir da copy centralizada.
- `src/components/usePageMotion.ts`: entradas progressivas e indicador de leitura, com suporte a movimento reduzido.
- `src/components/HeroBanner.tsx`: banner fotográfico único em largura total, relacionado às especialidades.
- `src/components/FloatingWhatsApp.tsx` e `src/data/contact.ts`: botão flutuante e número público confirmado do escritório. O link usa `wa.me` e abre uma mensagem pré-preenchida sem enviá-la automaticamente.
- `src/tokens.css`, `src/styles.css` e `src/visual-refresh.css`: identidade visual, estilos compartilhados e composição fotográfica responsiva.
- `public/images/`: imagens editoriais ilustrativas geradas para o projeto e os quatro retratos reais enviados pelo usuário, todos otimizados em WebP. Os arquivos `team-{welson,rommel,osvaldo,wesley}-{450,900}.webp` são usados nos cartões e nos perfis da equipe; as demais imagens não representam a sede ou os profissionais da RTM.
- `tests/site.spec.ts`: testes de comportamento e verificações axe-core.
- `tests/whatsapp-links.test.mjs`: validação de números brasileiros e codificação segura da mensagem; executada pelo `npm test` antes do Playwright.
- [Direção visual e limitações do benchmark](docs/DIRECAO-VISUAL.md): decisões, fontes, escopo e pendências.
- [Como usar o blog](COMO-USAR-O-BLOG.md): primeiro acesso e rotina de publicação.
- [Tela do blog](docs/previa-blog.jpg) e [painel de publicações](docs/previa-painel-blog.jpg): capturas da revisão em ambiente de testes.
- [Imagens e preparação dos retratos](docs/IMAGENS.md): origem dos recursos e encaixe das fotos reais da equipe.
- [Captura da versão visual](docs/previa-visual.jpg): imagem estática para revisão, sem instalação.
- [Equipe com as fotos enviadas](docs/previa-equipe.jpg): retratos reais associados aos nomes fornecidos.

Fontes Manrope e Cormorant Garamond distribuídas por Fontsource sob OFL; os arquivos de licença acompanham os pacotes instalados. As fontes e imagens são carregadas do próprio site. A navegação pública não utiliza analytics, cookies de publicidade ou armazenamento local pela aplicação. O painel usa um cookie necessário de sessão para autenticação e recebe os textos e imagens enviados pela equipe. O aviso de privacidade é preliminar e deve refletir também a configuração real da hospedagem.

**Não publicar esta apresentação como versão definitiva:** a página contém aviso de revisão e `noindex, nofollow`. Consulte a lista de pendências na documentação de direção visual. Os domínios de benchmark estão pendentes de aplicação da configuração de rede; nenhuma análise visual desses sites foi simulada.
