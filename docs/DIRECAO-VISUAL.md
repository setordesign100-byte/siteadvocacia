# RTM Advocacia — benchmark e direção visual

## Base do projeto

O repositório estava vazio. O briefing RTM.docx informa: divulgação institucional; atuação em Direito Civil, do Consumidor e Médico; inventários, regularização de imóveis e contratos; defesa de profissionais da saúde e questões de consumidores com planos de saúde. A equipe reúne Dr. Eltonson Rezende, Dr. Rommel, Dr. Osvaldo e Dr. Wesley; o primeiro profissional foi inicialmente referido como Dr. Welson e teve o nome corrigido pelo responsável. A mensagem é de atendimento personalizado e próximo, com uma presença moderna. O domínio inicialmente informado no documento era `rtm.advocacia.com.br`. Em 05/11/2026, o responsável confirmou o domínio de publicação **`rtmadvocacia.com.br`**; a disponibilidade e a configuração operacional da hospedagem não foram confirmadas por esse dado.

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

React, TypeScript e Vite foram escolhidos porque não havia arquitetura existente. O front-end institucional é compilado para arquivos estáticos; a ampliação do blog acrescenta uma API PHP com persistência na hospedagem. O conteúdo institucional continua editável em `src/data/content.ts`; componentes, estilos e tokens ficam separados. A área pública não utiliza analytics, cookies de publicidade ou armazenamento local pela aplicação. O painel recebe artigos, imagens e os dados dos acessos autorizados; as senhas são armazenadas como hashes e um cookie necessário mantém a autenticação. Não foi criado formulário que simule envio, telefone fictício ou link de WhatsApp inválido.

As fotografias reais dos quatro profissionais foram incluídas a partir do ZIP enviado pelo usuário e aparecem nos cartões e nas janelas de perfil. Os nomes exibidos são Dr. Eltonson Rezende, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende. O nome do Dr. Eltonson Rezende foi confirmado pelo responsável; biografias, qualificações e registros da OAB estão pendentes. As cinco pautas editoriais e suas sinopses vêm da copy revisada e estão identificadas como sugestões em preparação; não foram apresentadas como artigos completos ou publicações já realizadas. O responsável confirmou a versão final; o metadado `noindex, nofollow` permanece e não foi alterado no pedido de retirada da faixa superior.

A revisão visual inclui 12 composições fotográficas ilustrativas diferentes, relacionadas individualmente ao banner, às áreas, ao escritório e às cinco pautas de publicação. Inventário, regularização imobiliária, contratos, cobertura de planos e responsabilidade médica recebem fotografias próprias. Essas cenas editoriais não representam a sede da RTM ou pessoas reais da equipe. Separadamente, os quatro retratos enviados pelo usuário representam os profissionais identificados nos arquivos e foram otimizados para WebP em variantes de 450 e 900 px, sem edição de identidade por IA. O enquadramento dos cartões usa proporção 4:5 por CSS. A foto coletiva fornecida foi acrescentada acima dos perfis, com a proporção do PNG de 1098 × 731 px preservada em variantes WebP de 640 e 1098 px. Veja [IMAGENS.md](IMAGENS.md).

O WhatsApp foi confirmado pelo usuário e configurado em `src/data/contact.ts`: +55 (31) 99196-7003. O botão flutuante e o CTA de contato abrem o mesmo destino em nova aba, com uma mensagem inicial que depende de envio pelo visitante. E-mail, endereço e horários permanecem pendentes. Não foi criado formulário com envio simulado ou coleta sem destino definido. O arquivo `ABRA-A-PREVIA.html` continua sendo exportado com todos os recursos incorporados para visualização local.

### Ampliação — blog e painel de publicações

O blog público fica em `/blog/`, com artigos individuais em `/blog/?artigo=slug`. O painel fica em `/painel/` e permite escolher imagem, informar título, categoria, autoria, resumo e texto, conferir a prévia e salvar um rascunho ou publicar. Também permite editar, retirar uma publicação para rascunho e excluir um artigo após confirmação. As publicações recentes da página inicial vêm dos artigos publicados; as cinco pautas antigas permanecem identificadas como sugestões em preparação.

Os textos e dados da conta ficam em arquivos JSON na pasta privada `rtm-blog-private`, fora de `public_html`; as imagens enviadas ficam em `public_html/uploads/blog/`. Essas pastas são criadas em tempo de execução, exigem permissão de gravação e devem ser preservadas em atualizações. Rascunhos e administração exigem autenticação. A API usa `password_hash`, sessão autenticada, proteção CSRF, validação dos uploads e gravação com bloqueio e substituição atômica. JPEG, PNG e WebP são aceitos até 5 MB e 6000 pixels em cada lado; HTML e SVG não fazem parte dos formatos aceitos.

A página de acesso restrito oferece somente login. A conta principal `admin.rtm` é provisionada a partir da configuração confiável do pacote, que contém somente o usuário, o hash da senha e a identificação de provisionamento. A senha original é gerada fora do repositório e do ZIP e fornecida separadamente ao responsável. A versão anterior com código de ativação é substituída; o endpoint de cadastro inicial fica fechado, inclusive para o código anterior. O primeiro visitante não pode escolher a conta principal.

Somente o administrador principal pode listar, criar ou revogar contas de editor em **Gerenciar acessos**. Editores podem administrar as publicações, mas a API rejeita ações de administração de contas para esse perfil. A conta principal não pode ser revogada por ela mesma. Todos os usuários autenticados podem alterar a própria senha; a troca de senha e a revogação invalidam as outras sessões correspondentes. A API verifica o perfil e a versão da credencial em cada ação protegida.

A mesma identificação de provisionamento preserva senhas alteradas no painel em atualizações normais. Uma nova identificação aplica a nova credencial principal de forma intencional. A migração da conta única anterior mantém artigos e imagens e substitui as credenciais antigas pelo login principal entregue ao responsável. Os acessos destinados à hospedagem são [rtmadvocacia.com.br/painel/](https://rtmadvocacia.com.br/painel/) e [rtmadvocacia.com.br/blog/](https://rtmadvocacia.com.br/blog/), após o envio do pacote atualizado.

Essa ampliação usa PHP 8.1 ou mais recente em sua implementação; para a hospedagem recomenda-se PHP 8.2 ou mais recente, com Fileinfo e sessões habilitados. A compatibilidade e as permissões no plano real da Locaweb ainda precisam ser verificadas. Não há banco de dados externo. Os arquivos locais de prévia não substituem a API nem publicam artigos. Consulte [COMO-USAR-O-BLOG.md](../COMO-USAR-O-BLOG.md).

## Etapa 4 — qualidade e limites

A compilação executa o TypeScript antes de gerar o build. A suíte Playwright usa Chromium em desktop, tablet e celular para verificar conteúdo, imagem, âncoras, ausência de transbordamento horizontal, áreas expansíveis, perfis, artigos, contato, navegação responsiva, foco ao fechar janelas, privacidade e acessibilidade via axe-core. Isso não equivale a auditoria WCAG completa nem comprova compatibilidade em Safari e Firefox. A revisão visual foi realizada com screenshots desktop e mobile.

As imagens são WebP responsivas; as fontes são locais; não há scripts de terceiros no runtime. Core Web Vitals de campo dependem de hospedagem e tráfego reais e não foram medidos. A conformidade efetiva com publicidade da OAB e a política definitiva de dados dependem das informações e da revisão do escritório.

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

### Validação anterior do blog — 05/11/2026

Os resultados desta seção pertencem à versão anterior com ativação por código. Não comprovam a ampliação de perfis, o provisionamento do login principal ou a revogação de acessos; os resultados específicos da versão restrita devem ser registrados após suas verificações.

- `npm run preview:export`: TypeScript, build do front-end, páginas `/blog/` e `/painel/`, cópia da API PHP e prévia independente aprovados.
- `npm test`: 8 testes de WhatsApp e 39 testes de navegador da página institucional aprovados. `RTM_PHP_BIN=/workspace/.cache/rtm-php/php npm run test:blog`: 4 testes adicionais aprovados em desktop e celular, usando PHP real e dados isolados. Total: 51 testes aprovados.
- O fluxo do painel foi verificado da ativação à exclusão: upload, prévia, rascunho privado, publicação visível em outro navegador, persistência após recarregar, edição com endereço estável, retorno a rascunho e exclusão confirmada. Os testes também cobrem autenticação, CSRF, reativação bloqueada, arquivos privados e rejeição de SVG ou arquivos disfarçados de imagem.
- API e configuração de instalação passaram na análise de sintaxe do PHP 8.4.24. Esse executável portátil serve à validação no ambiente; a configuração da Locaweb não foi acessada.
- O ZIP final contém 63 arquivos e foi extraído e servido com PHP em uma cópia isolada, usando o verificador de ativação do próprio pacote. A criação do acesso e a aparição de uma publicação na página inicial foram conferidas; nenhum artigo ou conta de teste faz parte do ZIP. O código original de ativação permanece fora do repositório e do pacote.
- Verificações axe-core nas telas do blog e do painel, em desktop e celular: nenhuma violação nas regras automatizadas WCAG selecionadas. Sem transbordamento horizontal; a página inicial também foi conferida em 320, 390, 801, 1051, 1100, 1200 e 1440 px.
- A prévia independente manteve as 16 imagens institucionais carregadas com a rede desativada. Blog e publicações reais continuam dependendo do PHP.
- Capturas em [previa-blog.jpg](previa-blog.jpg) e [previa-painel-blog.jpg](previa-painel-blog.jpg). A captura do painel usa uma conta de exemplo em ambiente isolado, sem distribuir uma conta pronta para a hospedagem.

### Validação do acesso restrito — 05/11/2026

- `npm run preview:export`: checagem TypeScript, compilação, páginas e API aprovadas. A conta principal é provisionada pelo pacote; a página pública contém somente login e o antigo endpoint `setup` retorna 404.
- `npm test`: 8 testes de WhatsApp e 39 testes da página institucional aprovados. `RTM_PHP_BIN=/workspace/.cache/rtm-php/php npm run test:blog`: 6 testes adicionais aprovados em desktop e celular. Total: 53 testes aprovados.
- As verificações incluem publicação completa, rejeição de cadastro público, autorização do administrador, criação de editor, bloqueio de promoção ou criação de contas por editores, revogação de sessões já abertas, proteção do acesso principal e troca de senha com invalidação das outras sessões.
- O ZIP final foi extraído e servido com PHP em uma cópia isolada, usando o usuário e a senha principal correspondentes à sua configuração. O login funcionou sem criar conta pela interface. Um arquivo legado de conta, os artigos e uma imagem anterior permaneceram intactos; somente o novo principal foi provisionado. Nenhuma conta ou publicação de teste integra o ZIP.
- Login, painel, gerenciamento de acessos e troca de senha foram revisados em 1440, 390 e 320 px: nenhuma violação nas regras automatizadas WCAG selecionadas pelo axe-core, nenhum erro de execução e nenhum transbordamento horizontal.
- PHP 8.4: análise de sintaxe dos três arquivos distribuídos aprovada. A senha original ficou fora do repositório e do ZIP; o pacote contém somente seu hash. O código de ativação anterior não permite criar usuários nesta versão.
- Capturas em [previa-acesso-restrito.jpg](previa-acesso-restrito.jpg), [previa-acessos-autorizados.jpg](previa-acessos-autorizados.jpg) e [previa-painel-blog.jpg](previa-painel-blog.jpg). São registros de uma instalação isolada para revisão.
- O domínio foi confirmado pelo responsável. A consulta externa a `rtmadvocacia.com.br` foi bloqueada pelo proxy deste ambiente (403 no túnel); isso não é um diagnóstico do site. Não houve envio de arquivos à Locaweb, alteração de DNS ou validação do painel em produção.

### Manual ilustrado e alteração do próprio login — 06/11/2026

A solicitação do manual incluiu ensinar a mudança do nome de usuário, função que ainda não existia na versão anterior. Foi acrescentado o controle **Alterar meu usuário**, com confirmação da senha atual. A API exige autenticação e CSRF, mantém o identificador e o perfil do usuário, preserva as publicações e invalida as outras sessões. Nomes duplicados são recusados; o nome de provisionamento principal permanece reservado ao administrador. A sessão atual recebe o usuário atualizado, inclusive para o preenchimento do próximo login.

- `npm run preview:export`: build e prévia independente atualizados.
- `npm test`: 8 testes de WhatsApp e 39 testes institucionais aprovados. `npm run test:blog`, com PHP real, aprovou 8 testes em desktop e celular. Total: **55 testes aprovados**.
- O novo teste verifica a alteração pela interface, a manutenção das permissões e artigos, a entrada com o novo nome após uma nova inicialização, a invalidação de outra sessão e a rejeição de senha incorreta, nomes duplicados e tentativa de um editor assumir o nome reservado do principal.
- O pacote de hospedagem foi atualizado com a nova função, sem mudar a credencial principal entregue nem a identificação de provisionamento. Os dados já alterados pelo responsável na hospedagem continuam sendo a referência para seu acesso.

O manual em [PDF](../entregas/MANUAL-PAINEL-RTM.pdf) inclui os dados de acesso fornecidos com a entrega e instruções com prints reais de uma instalação isolada. Por conter a credencial principal solicitada pelo responsável, o PDF é criptografado; a senha de abertura é entregue separadamente na conversa. O PDF sem proteção, as credenciais em texto puro e as capturas intermediárias ficam fora do repositório e do ZIP de hospedagem. O documento informa que dados alterados pelo responsável substituem a credencial inicial impressa.

O PDF final tem 12 páginas A4, sumário clicável e prints com passos numerados. Todas as páginas foram renderizadas e revisadas visualmente; a abertura com a senha correta, a rejeição de senha incorreta, os links e a criptografia AES-256 foram verificados. O pacote de hospedagem não inclui o manual nem suas credenciais em texto puro.

### Marca na apresentação da equipe — 06/11/2026

A marca RTM já utilizada no cabeçalho e no rodapé também aparece na abertura da seção da equipe, entre linhas discretas. A aplicação permanece visível em celulares e telas maiores, com espaçamento adaptado à largura da tela. Após o recebimento do arquivo em ZIP, a foto coletiva fornecida foi incluída acima dos perfis individuais, sem substituir os retratos existentes.

O build e a prévia independente foram atualizados, e quatro testes existentes em celular passaram: navegação e largura da página, equipe e perfis, movimento reduzido e verificações automatizadas de acessibilidade. A aplicação da marca foi revisada em capturas de celular e desktop; o ZIP de hospedagem contém a alteração.

### Confirmação da versão e retirada da faixa

O responsável confirmou a versão final e solicitou retirar a faixa superior “Versão de apresentação”. Essa faixa foi removida. O pedido não altera os metadados `noindex, nofollow` nem preenche os dados profissionais que ainda não foram fornecidos. A foto coletiva foi posteriormente recebida em ZIP e incluída na posição solicitada, acima dos perfis individuais. As variantes `team-group-640.webp` e `team-group-1098.webp` preservam a proporção original de 1098 × 731 px, sem recortes nem geração ou alteração das pessoas pela implementação.

Os avisos específicos do rodapé e dos documentos legais permanecem, pois a solicitação se limitou à faixa superior. Build, prévia independente e ZIP foram atualizados; seis testes existentes em desktop e celular passaram, cobrindo conteúdo e ausência de transbordamento, navegação e verificações automatizadas WCAG.

### Foto coletiva fornecida acima dos perfis

O PNG de 1098 × 731 px enviado em ZIP foi incluído em `figure.team-group`, antes da grade dos quatro perfis. As variantes WebP têm 640 × 426 e 1098 × 731 px; a apresentação usa altura automática e largura máxima de 1040 px, mantendo a composição sem recortes. A implementação otimizou o arquivo fornecido, sem gerar ou alterar as pessoas da foto. A marca extra e os perfis individuais foram mantidos.

Build e prévia independente passaram. Doze testes existentes em desktop, tablet e celular foram aprovados, cobrindo conteúdo e ausência de transbordamento, os quatro perfis, movimento reduzido e verificações automatizadas WCAG. O pacote de hospedagem atualizado contém 65 arquivos, incluindo as duas variantes da foto coletiva.

### Pendências de conteúdo e configuração

1. Confirmar nome institucional e qualificações/inscrição da sociedade, quando aplicáveis.
2. Confirmar qualificações, registros da OAB e biografias. Os quatro retratos autorizados já foram recebidos e incluídos; o nome do Dr. Eltonson Rezende está confirmado.
3. Confirmar e-mail, endereço e horários. O WhatsApp já está conectado ao número confirmado; o escritório deve conferir o recebimento no aplicativo.
4. Substituir a assinatura provisória pelo arquivo oficial do logo.
5. Revisar áreas, textos institucionais e conteúdos informativos com os responsáveis.
6. Definir controlador, canal de privacidade, serviços da hospedagem e política de retenção; atualizar o aviso conforme o tratamento real.
7. Configurar domínio, HTTPS, URL canônica, metadados de compartilhamento e sitemap conforme a hospedagem; `noindex, nofollow` permanece ativo e não foi alterado neste pedido.
8. Retomar o benchmark quando houver acesso aos sites e medir o desempenho no ambiente de hospedagem.
