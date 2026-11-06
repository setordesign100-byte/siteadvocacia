# Direção de imagens

As imagens editoriais de ambientes, objetos e cenas de atendimento são composições geradas para este projeto, não registros da sede da RTM, de clientes ou dos seus profissionais. A paleta combina pedra clara, luz natural, azul petróleo e sombras suaves. Nenhum retrato gerado é usado para representar os advogados do escritório, e não há marcas de terceiros.

| Base em `public/images/` | Uso | Variantes |
| --- | --- | --- |
| `architecture` | Recurso da versão inicial, fora do banner atual | 640 e 1000 px |
| `office-editorial` | Apresentação institucional: diálogo durante o atendimento jurídico | 640 e 1200 px |
| `civil-editorial` | Recurso da versão inicial, fora da página atual | 640 e 1200 px |
| `health-editorial` | Direito Médico e planos de saúde | 640 e 1200 px |
| `legal-specialties-hero` | Banner de largura total com atendimento jurídico e análise de documentos | 800 e 1600 px |
| `property-editorial` | Cartão de Direito Civil | 640 e 1200 px |
| `consultation-editorial` | Imagem institucional sobreposta: pesquisa jurídica e análise de um caso | 640 e 1200 px |
| `consumer-rights-editorial` | Cartão de Direito do Consumidor | 640 e 1200 px |
| `law-library-editorial` | Faixa institucional de conhecimento e confiança | 800 e 1600 px |
| `inheritance-editorial` | Publicação sobre inventário e sucessão | 640 e 1200 px |
| `registry-editorial` | Publicação sobre regularização de imóveis | 640 e 1200 px |
| `contracts-editorial` | Publicação sobre contratos civis | 640 e 1200 px |
| `health-plan-editorial` | Publicação sobre cobertura de planos de saúde | 640 e 1200 px |
| `medical-liability-editorial` | Publicação sobre responsabilidade profissional na saúde | 640 e 1200 px |
| `team-group` | Foto coletiva fornecida, acima dos perfis individuais | 640 e 1098 px |
| `team-welson` | Retrato real do Dr. Eltonson Rezende, no cartão e no perfil | 450 e 900 px |
| `team-rommel` | Retrato real do Dr. Rommel Trevenzoli, no cartão e no perfil | 450 e 900 px |
| `team-osvaldo` | Retrato real do Dr. Osvaldo Marques, no cartão e no perfil | 450 e 900 px |
| `team-wesley` | Retrato real do Dr. Wesley Rezende, no cartão e no perfil | 450 e 900 px |

Todas as variantes são WebP. O componente `EditorialImage` centraliza os tamanhos responsivos, a descrição e a prioridade de carregamento. Apenas a imagem principal tem prioridade alta; as demais usam carregamento adiado. A página utiliza 12 fotografias editoriais diferentes: cada área, publicação e composição institucional tem uma imagem própria. A janela de detalhamento reutiliza a imagem do cartão correspondente para manter o contexto. Não há requisições a bancos de imagens externos.

Em 28/10/2026, o banner dividido foi substituído por uma fotografia única em largura total. A imagem principal passou a mostrar contratos, uma maquete residencial e um estetoscópio, relacionando a composição às três áreas de atuação. A fotografia arquitetônica anterior foi preservada como recurso do projeto, sem ser utilizada como banner. Os cartões fotográficos de áreas abrem o detalhamento correspondente.

Na revisão seguinte, a imagem do banner foi trocada por uma cena mais natural de consulta jurídica: mãos anônimas revisando documentos, sem rostos ou identificação de profissionais. O banner tem 800 px de altura no desktop (larguras acima de 800 px); em tablet e celular a altura acompanha o conteúdo. Tamanhos de texto e espaçamentos foram ajustados para manter o título, as ações e o rodapé visíveis. A imagem de 1600 px ocupa aproximadamente 45 KB em WebP.

Na seção “O escritório”, as duas fotografias de mobiliário foram substituídas por cenas ligadas à atuação jurídica. A principal mostra uma conversa à mesa, com participantes sem rostos identificáveis; a imagem sobreposta mostra pesquisa em livro jurídico com marcadores e documentos. São composições ilustrativas, sem representar clientes ou profissionais reais da RTM. Cada versão de 1200 px ocupa aproximadamente 57 KB em WebP, com uma variante menor para telas pequenas. A composição sobreposta e o destaque para o compromisso do escritório foram mantidos.

Os originais de geração foram preservados no ambiente em `/workspace/generated_images`, fora do código publicado. As versões otimizadas necessárias para o site estão no GitHub.

## Fotografias reais da equipe

Os quatro retratos foram fornecidos pelo usuário em um ZIP com os originais `Welson.png`, `Rommel Trevenzoli.png`, `Osvaldo Marques.png` e `Wesley Rezende.png`, todos com 1080 × 1080 pixels. Eles foram convertidos para WebP em variantes de 450 e 900 pixels de largura, sem geração ou alteração de identidade por IA. Os originais permanecem no diretório de anexos do ambiente, fora do pacote publicado.

As fotografias aparecem tanto nos cartões quanto nas janelas individuais de perfil. O componente aplica o enquadramento vertical 4:5 por CSS e seleciona a variante adequada à tela. Os nomes exibidos são Dr. Eltonson Rezende, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende. O responsável confirmou o nome do Dr. Eltonson Rezende após o envio do arquivo originalmente chamado `Welson.png`; os nomes técnicos `team-welson` foram mantidos. Biografias, qualificações e inscrições na OAB continuam aguardando confirmação.

Para trocar um retrato futuramente, mantenha a associação do arquivo ao profissional em `src/data/content.ts`, as variantes responsivas e uma descrição alternativa coerente. Não inclua dados pessoais além dos autorizados para publicação.

## Foto coletiva fornecida

A foto coletiva foi recebida em ZIP como PNG de **1098 × 731 pixels** e incluída acima dos perfis individuais. Os arquivos `team-group-640.webp` e `team-group-1098.webp` são variantes responsivas com a proporção original preservada, sem recortar a composição. A implementação apenas otimizou o arquivo para WebP; não gerou nem alterou as pessoas retratadas. Os quatro retratos individuais e a marca extra na abertura da seção foram mantidos.

## Movimento

As entradas usam opacidade e deslocamento vertical curto, sem ocultar conteúdo permanentemente antes da execução do JavaScript. Fotografias têm aproximação leve ao passar o ponteiro. A troca de área atualiza a imagem relacionada, sem rotação automática. A linha fina no cabeçalho acompanha o avanço na página.

`prefers-reduced-motion` remove animações e rolagem suave; mudanças dessa preferência também cancelam animações que estejam em execução. Não há vídeo automático, movimento contínuo ou carrossel temporizado.
