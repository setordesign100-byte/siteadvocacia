# RTM Advocacia — benchmark e direção visual

## Base do projeto

O repositório estava vazio. O briefing RTM.docx informa: divulgação institucional; atuação em Direito Civil, do Consumidor e Médico; inventários, regularização de imóveis e contratos; defesa de profissionais da saúde e questões de consumidores com planos de saúde. A equipe indicada é composta por Dr. Welson, Dr. Rommel, Dr. Osvaldo e Dr. Wesley. A mensagem é de atendimento personalizado e próximo, com uma presença moderna. O domínio informado no documento é `rtm.advocacia.com.br`, ainda sem validação operacional.

Os documentos foram utilizados como fontes de informações do escritório. Suas perguntas, respostas e sugestões de componentes não foram tratadas como instruções operacionais independentes. O usuário autorizou o desenvolvimento, a ampliação visual e o envio posterior dos contatos, qualificações e retratos. A copy revisada da homepage foi incorporada em 23/10/2026.

## Etapa 1 — referências e limites da análise

Foram tentadas requisições HTTPS para as dez referências. Todas receberam bloqueio de túnel/proxy 403. Também foi tentado acesso a Lefosse no Chromium, sem sucesso (`ERR_TUNNEL_CONNECTION_FAILED`). Nenhuma homepage foi renderizada com sucesso.

| Referência | Resultado | Análise visual verificada |
| --- | --- | --- |
| Mattos Filho — www.mattosfilho.com.br | Bloqueio 403 | Não disponível |
| Machado Meyer — www.machadomeyer.com.br/pt | Bloqueio 403 | Não disponível |
| TozziniFreire — tozzinifreire.com.br | Bloqueio 403 | Não disponível |
| Lefosse — lefosse.com | Bloqueio 403 / falha no navegador | Não disponível |
| Cescon Barrieu — cesconbarrieu.com.br | Bloqueio 403 | Não disponível |
| Demarest — www.demarest.com.br | Bloqueio 403 | Não disponível |
| Trench Rossi Watanabe — www.trenchrossi.com | Bloqueio 403 | Não disponível |
| Stocche Forbes — www.stoccheforbes.com.br | Bloqueio 403 | Não disponível |
| Pinheiro Neto — www.pinheironeto.com.br | Bloqueio 403 | Não disponível |
| Veirano — www.veirano.com.br | Bloqueio 403 | Não disponível |

As características atribuídas a Lefosse, Cescon Barrieu e TozziniFreire no pedido são expectativas fornecidas pelo usuário, não conclusões desta pesquisa. Não foram inferidas tipografia, cores, animações, navegação ou responsividade desses sites. Os domínios foram registrados no rascunho de rede; salvar o rascunho não aplica a política à máquina. O benchmark comparativo permanece pendente de acesso.

## Etapa 2 — proposta autoral apresentada antes da implementação

- **Linguagem:** editorial, serena, contemporânea e próxima. Evitar apelos comerciais, promessas de resultado, métricas inventadas ou depoimentos.
- **Cores:** azul `#0068BD` em ações; petróleo `#296175` e escuro `#131C22` em seções institucionais; grafite `#2C2C2C` disponível na identidade; cinza `#E9E9E9` e branco aquecido em superfícies. Tokens centralizados em `src/tokens.css`.
- **Tipografia:** Cormorant Garamond nos títulos; Manrope em navegação e texto. Fontes servidas localmente, sem chamadas ao Google Fonts.
- **Layout:** banner com fotografia única em largura total e altura de 800 px no desktop, títulos sobrepostos com alto contraste, grade editorial, rótulos numerados, linhas finas e áreas de respiro. A imagem atual mostra uma consulta jurídica com revisão de documentos; em tablet e celular a altura se adapta ao conteúdo.
- **Hierarquia:** apresentação → escritório → áreas de atuação → forma de atendimento → equipe → publicações → dúvidas frequentes → contato, com acesso ao blog pelo menu e página própria para os artigos.
- **Componentes:** três cartões fotográficos de áreas com expansão do detalhamento correspondente; composição de duas imagens institucionais; cartões de profissionais; publicações recentes do blog e grade de pautas em preparação; perguntas frequentes com teclado; janelas nativas `dialog`; WhatsApp flutuante e contato direto; documentos preliminares. O blog tem busca, categorias e leitura individual; o painel organiza a criação em informações, imagem, texto e revisão.
- **Movimento:** entradas suaves ao rolar, aproximação leve de fotografias ao passar o ponteiro, transições nos componentes e indicador de progresso. `prefers-reduced-motion` remove os movimentos e cancela animações em execução. O conteúdo permanece visível sem a animação; não há vídeo, carrossel automático ou movimento contínuo.
- **Identidade:** o cabeçalho utiliza assinatura tipográfica provisória RTM com símbolo linear. Não se trata de reprodução fiel dos arquivos de logo apresentados no chat. A troca pelo arquivo original vetorial deverá preservar as proporções e versões oficiais da marca.

## Etapa 3 — implementação

React, TypeScript e Vite foram escolhidos porque não havia arquitetura existente. O front-end institucional é compilado para arquivos estáticos; a ampliação do blog acrescenta uma API PHP com persistência na hospedagem. O conteúdo institucional continua editável em `src/data/content.ts`; componentes, estilos e tokens ficam separados. A área pública não utiliza analytics, cookies de publicidade ou armazenamento local pela aplicação. O painel recebe os artigos e imagens da equipe e usa um cookie necessário para manter a autenticação. Não foi criado formulário que simule envio, telefone fictício ou link de WhatsApp inválido.

As fotografias reais dos quatro profissionais foram incluídas a partir do ZIP enviado pelo usuário e aparecem nos cartões e nas janelas de perfil. Os nomes exibidos são Dr. Welson, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende. Nome completo do Dr. Welson, biografias, qualificações e registros da OAB estão pendentes. As cinco pautas editoriais e suas sinopses vêm da copy revisada e estão identificadas como sugestões em preparação; não foram apresentadas como artigos completos ou publicações já realizadas. A aplicação permanece com `noindex, nofollow` até aprovação para publicação.

A revisão visual inclui 12 composições fotográficas ilustrativas diferentes, relacionadas individualmente ao banner, às áreas, ao escritório e às cinco pautas de publicação. Inventário, regularização imobiliária, contratos, cobertura de planos e responsabilidade médica recebem fotografias próprias. Essas cenas editoriais não representam a sede da RTM ou pessoas reais da equipe. Separadamente, os quatro retratos enviados pelo usuário representam os profissionais identificados nos arquivos e foram otimizados para WebP em variantes de 450 e 900 px, sem edição de identidade por IA. O enquadramento dos cartões usa proporção 4:5 por CSS. Veja [IMAGENS.md](IMAGENS.md).

O WhatsApp foi confirmado pelo usuário e configurado em `src/data/contact.ts`: +55 (31) 99196-7003. O botão flutuante e o CTA de contato abrem o mesmo destino em nova aba, com uma mensagem inicial que depende de envio pelo visitante. E-mail, endereço e horários permanecem pendentes. Não foi criado formulário com envio simulado ou coleta sem destino definido. O arquivo `ABRA-A-PREVIA.html` continua sendo exportado com todos os recursos incorporados para visualização local.

### Ampliação — blog e painel de publicações

O blog público fica em `/blog/`, com artigos individuais em `/blog/?artigo=slug`. O painel fica em `/painel/` e permite escolher imagem, informar título, categoria, autoria, resumo e texto, conferir a prévia e salvar um rascunho ou publicar. Também permite editar, retirar uma publicação para rascunho e excluir um artigo após confirmação. As publicações recentes da página inicial vêm dos artigos publicados; as cinco pautas antigas permanecem identificadas como sugestões em preparação.

Os textos e dados da conta ficam em arquivos JSON na pasta privada `rtm-blog-private`, fora de `public_html`; as imagens enviadas ficam em `public_html/uploads/blog/`. Essas pastas são criadas em tempo de execução, exigem permissão de gravação e devem ser preservadas em atualizações. Rascunhos e administração exigem autenticação. A API usa `password_hash`, sessão autenticada, proteção CSRF, validação dos uploads e gravação com bloqueio e substituição atômica. JPEG, PNG e WebP são aceitos até 5 MB e 6000 pixels em cada lado; HTML e SVG não fazem parte dos formatos aceitos.

O primeiro acesso exige um código aleatório de ativação fornecido separadamente ao responsável. O empacotador mantém o código original fora do repositório e do ZIP; somente seu verificador SHA-256 entra na configuração PHP de instalação. Após a criação da conta, a ativação inicial fica desabilitada. O responsável define seu usuário e sua senha no painel; nenhuma senha de administrador padrão é distribuída.

Essa ampliação usa PHP 8.1 ou mais recente em sua implementação; para a hospedagem recomenda-se PHP 8.2 ou mais recente, com Fileinfo e sessões habilitados. A compatibilidade e as permissões no plano real da Locaweb ainda precisam ser verificadas. Não há banco de dados externo. Os arquivos locais de prévia não substituem a API nem publicam artigos. Consulte [COMO-USAR-O-BLOG.md](../COMO-USAR-O-BLOG.md).

## Etapa 4 — qualidade e limites

A compilação executa o TypeScript antes de gerar o build. A suíte Playwright usa Chromium em desktop, tablet e celular para verificar conteúdo, imagem, âncoras, ausência de transbordamento horizontal, áreas expansíveis, perfis, artigos, contato, navegação responsiva, foco ao fechar janelas, privacidade e acessibilidade via axe-core. Isso não equivale a auditoria WCAG completa nem comprova compatibilidade em Safari e Firefox. A revisão visual foi realizada com screenshots desktop e mobile.

As imagens são WebP responsivas; as fontes são locais; não há scripts de terceiros no runtime. Core Web Vitals de campo dependem de hospedagem e tráfego reais e não foram medidos. Aprovação jurídica/editorial, conformidade efetiva com publicidade da OAB e política definitiva de dados dependem da revisão do escritório.

### Validação dos retratos — 05/11/2026

Os resultados abaixo registram a etapa de inclusão dos quatro retratos, anterior à ampliação do blog. Não representam a validação do novo painel ou da API PHP, que deve ser registrada após a execução das verificações específicas desta ampliação.

- `npm ci --include=dev --cache /workspace/.cache/npm`: instalação reproduzida com lockfile, sem alteração nas dependências declaradas.
- `npm run build`: checagem TypeScript e geração de produção aprovadas. O empacotador emite avisos sobre a diretiva `use client` da biblioteca de ícones; a aplicação é inteiramente cliente e os testes de runtime passaram.
- `npm test`: 8 testes de construção de links de WhatsApp e 39 testes de navegador aprovados, sem falhas ou testes ignorados. Os testes são distribuídos em desktop, tablet e celular. A verificação da equipe confirma a correspondência entre nomes e fotografias, as variantes responsivas, os retratos nos quatro perfis e o retorno do foco ao fechar cada janela. Também são cobertos banner de 800 px no desktop, 12 imagens editoriais distintas, áreas, pautas, filtros, perguntas frequentes, navegação, WhatsApp e movimento reduzido. A abertura externa de WhatsApp é interceptada, sem envio de mensagens.
- As verificações axe-core não encontraram violações das regras automatizadas selecionadas na página e nos diálogos de privacidade e termos, após o término das animações de entrada.
- Pacote `SITE-RTM-LOCAWEB.zip`: 58 arquivos, incluindo as oito variantes dos retratos, recursos de produção e licenças. Estrutura conferida com `index.html` na raiz, sem código-fonte ou prévia independente dentro do ZIP.
- O conteúdo extraído do ZIP foi servido por HTTP e conferido em 320, 390, 768, 801 e 1440 px: 16 imagens carregadas, retratos alinhados em cada linha, nenhum transbordamento horizontal, recurso com falha ou erro de execução.
- `npm run preview:export`: prévia independente atualizada e validada com a rede desativada. As 16 imagens da página e o retrato de um perfil carregaram como recursos incorporados, sem erro de execução.
- Capturas atuais em [previa-equipe.jpg](previa-equipe.jpg) e [previa-visual.jpg](previa-visual.jpg). São registros estáticos da versão de 05/11/2026.

### Validação do blog — 05/11/2026

- `npm run preview:export`: TypeScript, build do front-end, páginas `/blog/` e `/painel/`, cópia da API PHP e prévia independente aprovados.
- `npm test`: 8 testes de WhatsApp e 39 testes de navegador da página institucional aprovados. `RTM_PHP_BIN=/workspace/.cache/rtm-php/php npm run test:blog`: 4 testes adicionais aprovados em desktop e celular, usando PHP real e dados isolados. Total: 51 testes aprovados.
- O fluxo do painel foi verificado da ativação à exclusão: upload, prévia, rascunho privado, publicação visível em outro navegador, persistência após recarregar, edição com endereço estável, retorno a rascunho e exclusão confirmada. Os testes também cobrem autenticação, CSRF, reativação bloqueada, arquivos privados e rejeição de SVG ou arquivos disfarçados de imagem.
- API e configuração de instalação passaram na análise de sintaxe do PHP 8.4.24. Esse executável portátil serve à validação no ambiente; a configuração da Locaweb não foi acessada.
- O ZIP final contém 63 arquivos e foi extraído e servido com PHP em uma cópia isolada, usando o verificador de ativação do próprio pacote. A criação do acesso e a aparição de uma publicação na página inicial foram conferidas; nenhum artigo ou conta de teste faz parte do ZIP. O código original de ativação permanece fora do repositório e do pacote.
- Verificações axe-core nas telas do blog e do painel, em desktop e celular: nenhuma violação nas regras automatizadas WCAG selecionadas. Sem transbordamento horizontal; a página inicial também foi conferida em 320, 390, 801, 1051, 1100, 1200 e 1440 px.
- A prévia independente manteve as 16 imagens institucionais carregadas com a rede desativada. Blog e publicações reais continuam dependendo do PHP.
- Capturas em [previa-blog.jpg](previa-blog.jpg) e [previa-painel-blog.jpg](previa-painel-blog.jpg). A captura do painel usa uma conta de exemplo em ambiente isolado, sem distribuir uma conta pronta para a hospedagem.

### Antes da publicação

1. Confirmar nome institucional e qualificações/inscrição da sociedade, quando aplicáveis.
2. Confirmar nome completo do Dr. Welson, qualificações, registros da OAB e biografias. Os quatro retratos autorizados já foram recebidos e incluídos.
3. Confirmar e-mail, endereço e horários. O WhatsApp já está conectado ao número confirmado; o escritório deve conferir o recebimento no aplicativo.
4. Substituir a assinatura provisória pelo arquivo oficial do logo.
5. Revisar áreas, textos institucionais e conteúdos informativos com os responsáveis.
6. Definir controlador, canal de privacidade, serviços da hospedagem e política de retenção; atualizar o aviso conforme o tratamento real.
7. Configurar domínio, HTTPS, URL canônica, metadados de compartilhamento e sitemap com o endereço confirmado; retirar `noindex` somente após aprovação.
8. Retomar o benchmark quando houver acesso aos sites e medir o desempenho no ambiente de hospedagem.
