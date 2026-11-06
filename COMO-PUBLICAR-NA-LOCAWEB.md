# Publicar a RTM na Locaweb

Baixe o arquivo **SITE-RTM-LOCAWEB.zip** atualizado deste repositório. Ele contém o site, o blog e o painel para criar publicações, além dos retratos da equipe, das imagens, das fontes e do WhatsApp configurado.

O blog precisa de **PHP 8.1 ou mais recente**, **sessões** e **Fileinfo** habilitados na hospedagem; recomenda-se **PHP 8.2 ou mais recente**. A disponibilidade desses recursos no seu plano da Locaweb ainda precisa ser conferida. O PHP também deve permitir gravação nas pastas de dados e imagens indicadas abaixo.

## Enviar os arquivos

1. No Windows, clique com o botão direito no ZIP e escolha **Extrair tudo**.
2. Acesse o gerenciador de arquivos ou o FTP da sua hospedagem Locaweb e abra a pasta **public_html**, identificada nesta hospedagem como a pasta pública do domínio.
3. Envie **todo o conteúdo extraído do novo ZIP** para `public_html`. Ao atualizar o site existente, confirme a substituição dos arquivos de mesmo nome. Deixe `index.html` diretamente em `public_html`, com as pastas `assets`, `images`, `licenses`, `blog`, `painel`, `api` e o arquivo `favicon.svg`.
4. Confira a estrutura abaixo. Os arquivos ficam diretamente em `public_html`, sem uma pasta `SITE-RTM` intermediária.
5. Acesse o seu domínio pelo navegador. Se ainda aparecer a versão anterior, recarregue com **Ctrl + F5** no Windows. Domínio e HTTPS são configurados no painel da hospedagem.
6. Abra **[https://rtmadvocacia.com.br/painel/](https://rtmadvocacia.com.br/painel/)** e entre com seu usuário e sua senha atuais. No primeiro acesso, use **`admin.rtm`** e a senha principal fornecida separadamente nesta conversa. O pacote cria a conta principal a partir da configuração confiável; a página não oferece cadastro público. Veja [como usar o blog e liberar editores](COMO-USAR-O-BLOG.md).

```text
public_html/
├── index.html
├── favicon.svg
├── assets/
├── images/
├── licenses/
├── blog/
├── painel/
└── api/
```

Se o painel permitir extrair ZIPs, você também pode enviar o arquivo e extraí-lo diretamente na pasta pública. Confirme que ele não criou uma pasta adicional entre a raiz do domínio e o `index.html`.

O pacote é para a **raiz do domínio informado**, `https://rtmadvocacia.com.br/`. A disponibilidade dos endereços depende do envio do pacote e da configuração de PHP e HTTPS; este guia não confirma que a hospedagem já foi atualizada. Os recursos usam caminhos a partir da raiz; para hospedar em uma subpasta, como `/site/`, é necessário ajustar o projeto e gerar outro pacote. O blog público fica em **[https://rtmadvocacia.com.br/blog/](https://rtmadvocacia.com.br/blog/)**, os artigos têm endereços como **`/blog/?artigo=titulo-do-artigo`** e o painel restrito fica em **[https://rtmadvocacia.com.br/painel/](https://rtmadvocacia.com.br/painel/)**. As páginas usam arquivos de índice e não exigem regras de reescrita. Não é necessário instalar Node, Python ou banco de dados na hospedagem.

## Preservar as publicações nas atualizações

O blog cria duas pastas para seus dados:

- **`public_html/uploads/blog/`**: imagens enviadas pelo painel.
- **`rtm-blog-private`**, ao lado de `public_html`: artigos, contas autorizadas e arquivos de controle. Essa pasta fica fora da área pública.

**Preserve essas duas pastas ao atualizar o site.** Os arquivos do novo ZIP podem substituir os arquivos de mesmo nome da aplicação, mas as imagens enviadas e os dados privados devem continuar na hospedagem. Essas pastas de conteúdo não fazem parte do ZIP e são criadas pelo PHP quando necessário.

Se o painel informar que não pode criar ou gravar essas pastas, peça ao suporte da Locaweb para conferir as permissões do PHP. Evite mover a pasta privada para dentro de `public_html`.

## Conteúdo desta entrega

Este ZIP contém a versão confirmada pelo responsável, com publicação real pelo painel e a faixa superior “Versão de apresentação” retirada a seu pedido. Permanecem os dados profissionais pendentes e os documentos de privacidade e termos preliminares. As cinco pautas sugeridas da página inicial continuam em preparação; os artigos criados e publicados pelo painel são conteúdos separados. O WhatsApp confirmado é **(31) 99196-7003**.

O metadado `noindex, nofollow` permanece ativo: a página pode ser acessada pelo domínio, mas solicita aos mecanismos de busca que não a indexem. Ele poderá ser retirado na finalização das informações institucionais. As fotografias editoriais são ilustrativas. A foto coletiva fornecida aparece acima dos perfis, e os retratos de Dr. Eltonson Rezende, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende continuam nos cartões e nos perfis da equipe. Os registros da OAB e as biografias continuam pendentes.

O ZIP contém o front-end compilado, a API PHP, a configuração principal e as licenças das dependências distribuídas. A configuração principal contém o usuário `admin.rtm`, o hash da senha e a identificação de provisionamento; a senha original é fornecida separadamente na conversa e fica fora do ZIP. O antigo cadastro por código de ativação fica desabilitado nesta versão. Somente o administrador principal pode liberar ou revogar editores pelo painel. O código-fonte de desenvolvimento e a prévia independente ficam fora do pacote. As alterações na estrutura do site exigem um novo pacote; os artigos são administrados pelo painel e ficam salvos na hospedagem.

Nas atualizações normais, os nomes de usuário e as senhas alterados no painel são preservados. Quando uma nova credencial principal for entregue para substituir a anterior, use os novos dados. A atualização da versão anterior mantém artigos e imagens, substitui o acesso por ativação pelo login principal fornecido e invalida as sessões antigas.
