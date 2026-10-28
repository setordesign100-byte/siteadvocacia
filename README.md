# RTM Advocacia

Website institucional responsivo em React + TypeScript + Vite. Versão de apresentação baseada no briefing RTM, na copy revisada da homepage e na paleta fornecida. Inclui composição fotográfica editorial, áreas detalhadas, etapas de atendimento, filtros de pautas e perguntas frequentes. Contatos, registros da OAB, biografias e retratos aguardam validação antes da publicação.

**Para apenas visualizar, veja [COMECE-AQUI.md](COMECE-AQUI.md) e abra `ABRA-A-PREVIA.html` após baixar e extrair o ZIP do repositório. Não requer instalação nem hospedagem.**

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

O conteúdo publicado fica em `dist/`. O host deve servir `index.html`, `assets/`, `images/` e `favicon.svg` na raiz do domínio, com HTTPS. O pacote **[SITE-RTM-LOCAWEB.zip](SITE-RTM-LOCAWEB.zip)** contém a compilação atual e as licenças necessárias para enviar à hospedagem. Veja **[como publicar na Locaweb](COMO-PUBLICAR-NA-LOCAWEB.md)**. Este projeto não configura hospedagem, DNS ou publicação automaticamente.

## Prévia sem servidor

```sh
npm run preview:export
```

Gera `dist/rtm-preview.html` e `ABRA-A-PREVIA.html`, arquivos independentes com código, estilos, fontes e imagens incorporados. Abra em um navegador moderno para revisar a página e suas interações sem instalar dependências ou acessar a internet. São apresentações locais; não publicam o site nem atualizam automaticamente. A tela de onboarding não oferece prévia interativa de localhost.

## Onde editar

- `src/App.tsx`: estrutura da página e navegação.
- `src/data/content.ts`: áreas, profissionais e textos introdutórios.
- `src/components/Modal.tsx`: janela acessível compartilhada.
- `src/components/EditorialImage.tsx` e `src/data/images.ts`: imagens locais responsivas.
- `src/components/EditorialHeading.tsx`: títulos com destaque tipográfico, a partir da copy centralizada.
- `src/components/usePageMotion.ts`: entradas progressivas e indicador de leitura, com suporte a movimento reduzido.
- `src/components/HeroBanner.tsx`: banner fotográfico único em largura total, relacionado às especialidades.
- `src/components/FloatingWhatsApp.tsx` e `src/data/contact.ts`: botão flutuante e número público confirmado do escritório. O link usa `wa.me` e abre uma mensagem pré-preenchida sem enviá-la automaticamente.
- `src/tokens.css`, `src/styles.css` e `src/visual-refresh.css`: identidade visual, estilos compartilhados e composição fotográfica responsiva.
- `public/images/`: arquitetura, ambiente de trabalho, patrimônio e saúde, gerados para o projeto e otimizados em WebP. Não são fotografias da sede ou da equipe.
- `tests/site.spec.ts`: testes de comportamento e verificações axe-core.
- `tests/whatsapp-links.test.mjs`: validação de números brasileiros e codificação segura da mensagem; executada pelo `npm test` antes do Playwright.
- [Direção visual e limitações do benchmark](docs/DIRECAO-VISUAL.md): decisões, fontes, escopo e pendências.
- [Imagens e preparação dos retratos](docs/IMAGENS.md): origem dos recursos e encaixe das fotos reais da equipe.
- [Captura da versão visual](docs/previa-visual.jpg): imagem estática para revisão, sem instalação.

Fontes Manrope e Cormorant Garamond distribuídas por Fontsource sob OFL; os arquivos de licença acompanham os pacotes instalados. As fontes e imagens são carregadas do próprio site. Não há analytics, formulários, cookies da aplicação ou armazenamento local. O aviso de privacidade é preliminar e deve ser ajustado ao funcionamento real da hospedagem.

**Não publicar esta apresentação como versão definitiva:** a página contém aviso de revisão e `noindex, nofollow`. Consulte a lista de pendências na documentação de direção visual. Os domínios de benchmark estão pendentes de aplicação da configuração de rede; nenhuma análise visual desses sites foi simulada.
