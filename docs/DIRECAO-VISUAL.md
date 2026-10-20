# RTM Advocacia — benchmark e direção visual

## Base do projeto

O repositório estava vazio. O briefing RTM.docx informa: divulgação institucional; atuação em Direito Civil, do Consumidor e Médico; inventários, regularização de imóveis e contratos; defesa de profissionais da saúde e questões de consumidores com planos de saúde. A equipe indicada é composta por Dr. Welson, Dr. Rommel, Dr. Osvaldo e Dr. Wesley. A mensagem é de atendimento personalizado e próximo, com uma presença moderna. O domínio informado no documento é `rtm.advocacia.com.br`, ainda sem validação operacional.

O documento foi utilizado como fonte de informações do escritório. Suas perguntas e respostas não foram tratadas como novas instruções operacionais. O usuário autorizou o desenvolvimento e o envio posterior dos contatos e qualificações.

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
- **Layout:** hero em dois painéis, títulos de grande escala, grade editorial, rótulos numerados, linhas finas e áreas de respiro. A imagem arquitetônica foi gerada para esta composição; não representa a sede do escritório.
- **Hierarquia:** apresentação → escritório → áreas de atuação → equipe → perspectivas → contato.
- **Componentes:** áreas expansíveis; cartões de profissionais e conteúdos; janelas nativas `dialog`; aviso de contato e privacidade preliminar.
- **Movimento:** transições curtas em links e cartões; rolagem suave. `prefers-reduced-motion` remove os movimentos. Nenhum vídeo, carrossel automático ou animação de entrada bloqueia a leitura.
- **Identidade:** o cabeçalho utiliza assinatura tipográfica provisória RTM com símbolo linear. Não se trata de reprodução fiel dos arquivos de logo apresentados no chat. A troca pelo arquivo original vetorial deverá preservar as proporções e versões oficiais da marca.

## Etapa 3 — implementação

React, TypeScript e Vite foram escolhidos porque não havia arquitetura existente. A aplicação é estática, sem backend, coleta de dados, analytics ou cookies da aplicação. O conteúdo é editável em `src/data/content.ts`; componentes, estilos e tokens ficam separados. Não foi criado formulário que simule envio, telefone fictício ou link de WhatsApp inválido.

Fotos da equipe usam composições tipográficas explicitamente identificadas como retratos em preparação. Biografias e registros da OAB estão pendentes. Os três textos introdutórios são rascunhos editoriais criados para revisão, não publicações fornecidas pelo escritório; não têm autores ou datas fictícios. A aplicação permanece com `noindex, nofollow` até aprovação para publicação.

## Etapa 4 — qualidade e limites

A compilação executa o TypeScript antes de gerar o build. A suíte Playwright usa Chromium em desktop, tablet e celular para verificar conteúdo, imagem, âncoras, ausência de transbordamento horizontal, áreas expansíveis, perfis, artigos, contato, navegação responsiva, foco ao fechar janelas, privacidade e acessibilidade via axe-core. Isso não equivale a auditoria WCAG completa nem comprova compatibilidade em Safari e Firefox. A revisão visual foi realizada com screenshots desktop e mobile.

As imagens são WebP responsivas; as fontes são locais; não há scripts de terceiros no runtime. Core Web Vitals de campo dependem de hospedagem e tráfego reais e não foram medidos. Aprovação jurídica/editorial, conformidade efetiva com publicidade da OAB e política definitiva de dados dependem da revisão do escritório.

### Resultado da validação desta entrega

- `npm ci --cache /workspace/.cache/npm`: instalação reproduzida com lockfile.
- `npm run build`: checagem TypeScript e geração de produção aprovadas. O empacotador emite avisos sobre a diretiva `use client` da biblioteca de ícones; a aplicação é inteiramente cliente e os testes de runtime passaram.
- `npm test`: 18 testes aprovados, sem falhas ou testes ignorados, distribuídos em desktop, tablet e celular. As verificações axe-core não encontraram violações das regras automatizadas selecionadas na página e no diálogo de privacidade.
- Verificação adicional em 320, 375, 390, 768, 1024, 1440 e 1920 pixels: nenhum transbordamento horizontal.
- Preferência de movimento reduzido: rolagem passa a `auto` conforme esperado.
- Servidor de desenvolvimento: resposta HTTP 200, imagem carregada e nenhum erro de execução no navegador durante a revisão.
- `install_script`, `start_skill` e domínios dos dez benchmarks salvos no rascunho do ambiente. Publicação e restauração em uma nova tarefa não foram realizadas nem validadas.

### Antes da publicação

1. Confirmar nome institucional e qualificações/inscrição da sociedade, quando aplicáveis.
2. Incluir nomes completos, registros da OAB, biografias e fotos autorizadas da equipe.
3. Confirmar telefone, WhatsApp, e-mail, endereço e horários; conectar os CTAs aos canais reais.
4. Substituir a assinatura provisória pelo arquivo oficial do logo.
5. Revisar áreas, textos institucionais e conteúdos informativos com os responsáveis.
6. Definir controlador, canal de privacidade, serviços da hospedagem e política de retenção; atualizar o aviso conforme o tratamento real.
7. Configurar domínio, HTTPS, URL canônica, metadados de compartilhamento e sitemap com o endereço confirmado; retirar `noindex` somente após aprovação.
8. Retomar o benchmark quando houver acesso aos sites e medir o desempenho no ambiente de hospedagem.
