# Como publicar no blog da RTM

O blog fica em **`https://seu-dominio.com.br/blog/`**. Para escrever e administrar os artigos, entre em **`https://seu-dominio.com.br/painel/`**, trocando `seu-dominio.com.br` pelo endereço do escritório.

## Primeiro acesso

1. Envie o novo pacote do site para a Locaweb seguindo [as instruções de publicação](COMO-PUBLICAR-NA-LOCAWEB.md).
2. Abra o endereço terminado em **`/painel/`**.
3. Em **Crie seu acesso**, cole o **código de ativação fornecido separadamente nesta conversa**.
4. Escolha seu **usuário** e uma **senha com pelo menos 12 caracteres**. Repita a senha na confirmação.
5. Clique em **Criar meu acesso**.

Guarde o usuário e a senha escolhidos. Nos próximos acessos, entre com esses dados. O código de ativação serve para criar o primeiro acesso; a criação inicial fica desabilitada quando a conta existe.

## Criar uma publicação

1. No painel, clique em **Novo artigo**.
2. Preencha o **Título**, escolha a **Categoria** e confira a **Autoria**.
3. Escreva um **Resumo** curto. Ele aparece nos cartões do blog.
4. Clique em **Selecionar imagem** e escolha uma foto do computador. Use **JPG, PNG ou WebP de até 5 MB**. Prefira uma imagem horizontal.
5. Preencha a **Descrição da imagem**, explicando o que aparece na foto. Esse texto ajuda quem usa leitor de tela.
6. Escreva o **Texto do artigo**. Separe os parágrafos com uma linha em branco.
7. Use a **prévia** para conferir a imagem e a leitura.
8. Escolha **Salvar rascunho** para continuar depois ou **Publicar artigo** para disponibilizar o texto no blog.

Ao publicar, o artigo aparece no blog e pode aparecer entre as publicações recentes da página inicial. Abra **Ver publicação** ou atualize a página do blog para conferir o resultado. As publicações seguintes são feitas pelo próprio painel, sem gerar outro ZIP do site.

Rascunhos ficam na lista do painel e não aparecem na listagem pública do blog. As cinco pautas em preparação da página inicial continuam identificadas como sugestões editoriais; elas não viram artigos publicados automaticamente.

## Editar, retirar ou excluir

- **Editar:** escolha o artigo em **Seus artigos**, faça as alterações e use **Atualizar publicação** ou **Salvar rascunho**, conforme a situação do texto.
- **Retirar do blog:** em um artigo publicado, use **Voltar para rascunho** e confirme. O texto fica guardado no painel e poderá ser publicado novamente.
- **Excluir:** use **Excluir artigo** e confirme somente quando quiser remover o registro. A exclusão não pode ser desfeita pelo painel.
- **Sair:** use **Sair** quando terminar de administrar as publicações.

## Se aparecer uma mensagem de configuração

O painel precisa funcionar na hospedagem com **PHP 8.1 ou mais recente**, **sessões** e o módulo **Fileinfo** habilitados; recomenda-se **PHP 8.2 ou mais recente**. A compatibilidade com o plano da Locaweb deve ser conferida no painel ou com o suporte da hospedagem. O site não exige instalação de Node, Python ou banco de dados no servidor.

Se aparecer uma mensagem sobre PHP, peça ao suporte para confirmar a versão e esses módulos. Se aparecer uma mensagem sobre gravação, a hospedagem precisa permitir que o PHP crie a pasta privada **`rtm-blog-private`**, ao lado de `public_html`, e a pasta de imagens **`public_html/uploads/blog/`**. O sistema cria essas pastas quando necessário.

Se a tela disser que a ativação ainda não foi incluída, envie o **ZIP de hospedagem atualizado**, que contém a configuração de ativação desta entrega. O código recebido na conversa deve corresponder a esse pacote.

O arquivo `ABRA-A-PREVIA.html` mostra uma apresentação local. O acesso e a publicação reais do blog usam a hospedagem com PHP; abrir esse HTML no computador não publica um artigo.

## Manter os artigos nas atualizações

Ao instalar uma nova versão do site, preserve **`public_html/uploads/blog/`** e a pasta **`rtm-blog-private`** fora da raiz pública. Elas guardam as imagens enviadas, os artigos e os dados de acesso. Atualize os arquivos do novo ZIP sobre os existentes, sem substituir essas pastas por cópias vazias.
