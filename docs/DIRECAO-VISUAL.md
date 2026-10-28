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
- **Layout:** banner com fotografia única em largura total, títulos sobrepostos com alto contraste, grade editorial, rótulos numerados, linhas finas e áreas de respiro. Em 28/10/2026 a abertura dividida foi substituída por uma composição relacionada às três especialidades: contratos, patrimônio imobiliário e saúde.
- **Hierarquia:** apresentação → escritório → áreas de atuação → forma de atendimento → equipe → publicações → dúvidas frequentes → contato.
- **Componentes:** três cartões fotográficos de áreas com expansão do detalhamento correspondente; composição de duas imagens institucionais; cartões de profissionais; grade fotográfica de pautas com filtros; perguntas frequentes com teclado; janelas nativas `dialog`; WhatsApp flutuante e contato direto; documentos preliminares.
- **Movimento:** entradas suaves ao rolar, aproximação leve de fotografias ao passar o ponteiro, transições nos componentes e indicador de progresso. `prefers-reduced-motion` remove os movimentos e cancela animações em execução. O conteúdo permanece visível sem a animação; não há vídeo, carrossel automático ou movimento contínuo.
- **Identidade:** o cabeçalho utiliza assinatura tipográfica provisória RTM com símbolo linear. Não se trata de reprodução fiel dos arquivos de logo apresentados no chat. A troca pelo arquivo original vetorial deverá preservar as proporções e versões oficiais da marca.

## Etapa 3 — implementação

React, TypeScript e Vite foram escolhidos porque não havia arquitetura existente. A aplicação é estática, sem backend, coleta de dados, analytics ou cookies da aplicação. O conteúdo é editável em `src/data/content.ts`; componentes, estilos e tokens ficam separados. Não foi criado formulário que simule envio, telefone fictício ou link de WhatsApp inválido.

Fotos da equipe usam composições tipográficas explicitamente identificadas como retratos em preparação. Biografias e registros da OAB estão pendentes. As cinco pautas editoriais e suas sinopses vêm da copy revisada e estão identificadas como sugestões em preparação; não foram apresentadas como artigos completos ou publicações já realizadas. A aplicação permanece com `noindex, nofollow` até aprovação para publicação.

A revisão visual inclui composições fotográficas ilustrativas geradas para o projeto: banner jurídico, ambiente de trabalho, atendimento, patrimônio/contratos, imóveis e saúde. A fotografia arquitetônica da primeira versão foi preservada fora do banner atual. As imagens não representam a sede da RTM ou pessoas reais da equipe. Os cartões aceitam `photo` e `photoAlt` para receber os retratos autorizados posteriormente. Veja [IMAGENS.md](IMAGENS.md).

O WhatsApp foi confirmado pelo usuário e configurado em `src/data/contact.ts`: +55 (31) 99196-7003. O botão flutuante e o CTA de contato abrem o mesmo destino em nova aba, com uma mensagem inicial que depende de envio pelo visitante. E-mail, endereço e horários permanecem pendentes. Não foi criado formulário com envio simulado ou coleta sem destino definido. O arquivo `ABRA-A-PREVIA.html` continua sendo exportado com todos os recursos incorporados para visualização local.

## Etapa 4 — qualidade e limites

A compilação executa o TypeScript antes de gerar o build. A suíte Playwright usa Chromium em desktop, tablet e celular para verificar conteúdo, imagem, âncoras, ausência de transbordamento horizontal, áreas expansíveis, perfis, artigos, contato, navegação responsiva, foco ao fechar janelas, privacidade e acessibilidade via axe-core. Isso não equivale a auditoria WCAG completa nem comprova compatibilidade em Safari e Firefox. A revisão visual foi realizada com screenshots desktop e mobile.

As imagens são WebP responsivas; as fontes são locais; não há scripts de terceiros no runtime. Core Web Vitals de campo dependem de hospedagem e tráfego reais e não foram medidos. Aprovação jurídica/editorial, conformidade efetiva com publicidade da OAB e política definitiva de dados dependem da revisão do escritório.

### Resultado da validação desta entrega

- `npm ci --cache /workspace/.cache/npm`: instalação reproduzida com lockfile.
- `npm run build`: checagem TypeScript e geração de produção aprovadas. O empacotador emite avisos sobre a diretiva `use client` da biblioteca de ícones; a aplicação é inteiramente cliente e os testes de runtime passaram.
- `npm test`: 8 testes de construção de links de WhatsApp e 39 testes de navegador aprovados, sem falhas ou testes ignorados. Os testes de navegador são distribuídos em desktop, tablet e celular e cobrem banner integral, fotografias responsivas, cartões e detalhes de áreas, equipe, pautas e filtros, perguntas frequentes, navegação, WhatsApp e movimento reduzido. A abertura externa de WhatsApp é interceptada nos testes, sem envio de mensagens. As verificações axe-core não encontraram violações das regras automatizadas selecionadas na página e nos diálogos de privacidade e termos, após o término das animações de entrada.
- Verificação adicional em 320, 375, 390, 560, 700, 768, 800, 1024, 1050, 1440 e 1920 pixels: nenhum transbordamento horizontal.
- Preferência de movimento reduzido: rolagem passa a `auto` conforme esperado.
- Servidor de desenvolvimento: resposta HTTP 200, imagem carregada e nenhum erro de execução no navegador durante a revisão.
- Prévia independente: 12 imagens visíveis após rolagem, fontes, filtros e destino do WhatsApp validados com a rede desativada, sem erros e sem requisições externas ao carregar o documento.
- Uma captura estática da revisão visual está em [previa-visual.jpg](previa-visual.jpg). Ela documenta a versão de 28/10/2026; não é um endereço de site publicado.
- `install_script`, `start_skill` e domínios dos dez benchmarks salvos no rascunho do ambiente. Publicação e restauração em uma nova tarefa não foram realizadas nem validadas.

### Antes da publicação

1. Confirmar nome institucional e qualificações/inscrição da sociedade, quando aplicáveis.
2. Incluir nomes completos, registros da OAB, biografias e fotos autorizadas da equipe.
3. Confirmar e-mail, endereço e horários. O WhatsApp já está conectado ao número confirmado; o escritório deve conferir o recebimento no aplicativo.
4. Substituir a assinatura provisória pelo arquivo oficial do logo.
5. Revisar áreas, textos institucionais e conteúdos informativos com os responsáveis.
6. Definir controlador, canal de privacidade, serviços da hospedagem e política de retenção; atualizar o aviso conforme o tratamento real.
7. Configurar domínio, HTTPS, URL canônica, metadados de compartilhamento e sitemap com o endereço confirmado; retirar `noindex` somente após aprovação.
8. Retomar o benchmark quando houver acesso aos sites e medir o desempenho no ambiente de hospedagem.
