# Como publicar no blog da RTM

Após instalar o pacote atualizado na Locaweb, use estes endereços:

- **Acesso restrito:** [https://rtmadvocacia.com.br/painel/](https://rtmadvocacia.com.br/painel/)
- **Blog público:** [https://rtmadvocacia.com.br/blog/](https://rtmadvocacia.com.br/blog/)

O domínio foi informado pelo responsável pelo escritório. A disponibilidade dessas páginas depende do envio do novo ZIP e da configuração de PHP e HTTPS na hospedagem; a atualização da Locaweb não é feita automaticamente por este repositório.

## Entrar com o login principal

1. Envie o novo pacote completo para a Locaweb seguindo [as instruções de publicação](COMO-PUBLICAR-NA-LOCAWEB.md).
2. Abra [o acesso restrito](https://rtmadvocacia.com.br/painel/).
3. Informe o usuário **`admin.rtm`** e a **senha principal fornecida separadamente nesta conversa**.
4. Clique em **Entrar no painel**.

A tela de entrada oferece apenas login. O acesso principal vem configurado no pacote; visitantes não escolhem o primeiro usuário nem criam contas por essa tela. O código de ativação da versão anterior não é usado nesta versão.

## Autorizar outra pessoa

Somente o administrador principal pode criar e revogar acessos.

1. Entre com o login principal e clique em **Gerenciar acessos**.
2. Em **Acessos autorizados**, preencha **Usuário do novo acesso**, **Senha do novo acesso** e **Confirmar senha do novo acesso**.
3. Use uma senha com pelo menos **12 caracteres** e clique em **Criar acesso de editor**.
4. Entregue o usuário e a senha à pessoa autorizada. Ela entra pelo mesmo endereço do painel.

O editor pode preparar e administrar as publicações do blog, mas não pode criar ou revogar contas. Para retirar um acesso, use **Revogar acesso de...** na lista e confirme em **Confirmar revogação**. A revogação impede novas ações daquele usuário, inclusive em uma sessão que já estava aberta. O administrador principal não pode revogar o próprio acesso.

## Alterar seu usuário de entrada

Entre no painel, escolha **Alterar meu usuário**, preencha **Novo usuário** e confirme a **Senha atual**. Clique em **Salvar novo usuário**. Use letras sem acento, números, ponto, hífen ou sublinhado, com pelo menos 3 caracteres. No próximo acesso, entre com o novo usuário e a mesma senha. Cada pessoa altera somente o próprio usuário; suas permissões e publicações são preservadas. As outras sessões desse acesso precisarão entrar novamente.

## Alterar sua senha

Entre no painel, escolha **Alterar minha senha**, preencha **Senha atual**, **Nova senha** e **Confirmar nova senha** e clique em **Salvar nova senha**. Cada usuário pode alterar a própria senha. A nova senha substitui a anterior e encerra as outras sessões desse acesso.

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

Se a tela informar que a conta principal não foi configurada, envie o **ZIP de hospedagem atualizado completo**, incluindo a pasta `api`. A senha fornecida nesta conversa corresponde à configuração principal incluída nesse pacote.

O arquivo `ABRA-A-PREVIA.html` mostra uma apresentação local. O acesso e a publicação reais do blog usam a hospedagem com PHP; abrir esse HTML no computador não publica um artigo.

## Manter os artigos e os acessos nas atualizações

Ao instalar uma nova versão do site, preserve **`public_html/uploads/blog/`** e a pasta **`rtm-blog-private`** fora da raiz pública. Elas guardam as imagens enviadas, os artigos e os acessos autorizados. Atualize os arquivos do novo ZIP sobre os existentes, sem substituir essas pastas por cópias vazias.

Nas atualizações normais, as senhas alteradas no painel continuam valendo. Se for entregue uma nova credencial principal para substituir a anterior, use os novos dados. Ao passar da versão anterior com código de ativação para esta versão, use o novo login principal entregue separadamente; preserve os artigos e as imagens já existentes.
