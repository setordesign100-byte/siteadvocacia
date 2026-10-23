# Direção de imagens

As imagens de ambientes, arquitetura e objetos são composições geradas para este projeto, não registros da sede da RTM, de clientes, de atendimentos ou dos seus profissionais. A paleta combina pedra clara, luz natural, azul petróleo e sombras suaves. Não há retratos fictícios nem marcas de terceiros.

| Base em `public/images/` | Uso | Variantes |
| --- | --- | --- |
| `architecture` | Abertura arquitetônica | 640 e 1000 px |
| `office-editorial` | Apresentação institucional e faixa editorial | 640 e 1200 px |
| `civil-editorial` | Patrimônio, imóveis e contratos | 640 e 1200 px |
| `health-editorial` | Direito Médico e planos de saúde | 640 e 1200 px |

Todas as variantes são WebP. O componente `EditorialImage` centraliza os tamanhos responsivos, a descrição e a prioridade de carregamento. Apenas a imagem principal tem prioridade alta; as demais usam carregamento adiado. Imagens repetidas reutilizam o mesmo recurso no cache do navegador. Não há requisições a bancos de imagens externos.

Os originais de geração foram preservados no ambiente em `/workspace/generated_images`, fora do código publicado. As versões otimizadas necessárias para o site estão no GitHub.

## Fotografias reais da equipe

Os cartões atuais mostram iniciais e o aviso de fotografia em breve. Para incluir cada fotografia autorizada, use as propriedades `photo` e `photoAlt` do profissional em `src/data/content.ts`. O componente adapta o retrato ao enquadramento vertical 4:5, sem mudar a estrutura da página. Nomes completos, qualificações e inscrições na OAB continuam aguardando confirmação.

Prefira retratos individuais com iluminação semelhante, fundo neutro e espaço ao redor do rosto; a imagem do site pode ser preparada como WebP com 600 a 900 pixels de largura. Não inclua dados pessoais além dos autorizados para publicação.

## Movimento

As entradas usam opacidade e deslocamento vertical curto, sem ocultar conteúdo permanentemente antes da execução do JavaScript. Fotografias têm aproximação leve ao passar o ponteiro. A troca de área atualiza a imagem relacionada, sem rotação automática. A linha fina no cabeçalho acompanha o avanço na página.

`prefers-reduced-motion` remove animações e rolagem suave; mudanças dessa preferência também cancelam animações que estejam em execução. Não há vídeo automático, movimento contínuo ou carrossel temporizado.
