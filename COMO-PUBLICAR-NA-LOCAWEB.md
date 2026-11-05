# Publicar a RTM na Locaweb

Baixe o arquivo **SITE-RTM-LOCAWEB.zip** atualizado deste repositório. Ele contém o site compilado, com os retratos reais dos quatro profissionais, as imagens editoriais, os estilos, as fontes e o WhatsApp configurado.

## Enviar os arquivos

1. No Windows, clique com o botão direito no ZIP e escolha **Extrair tudo**.
2. Acesse o gerenciador de arquivos ou o FTP da sua hospedagem Locaweb e abra a pasta **public_html**, identificada nesta hospedagem como a pasta pública do domínio.
3. Envie **todo o conteúdo extraído do novo ZIP** para `public_html`. Ao atualizar o site existente, confirme a substituição dos arquivos de mesmo nome. O arquivo `index.html` deve ficar diretamente em `public_html`, junto com as pastas `assets`, `images`, `licenses` e o arquivo `favicon.svg`.
4. Não crie uma pasta `SITE-RTM` dentro de `public_html` para guardar o site. O `index.html` precisa ficar na raiz pública, conforme a estrutura abaixo.
5. Acesse o seu domínio pelo navegador. Se ainda aparecer a versão anterior, recarregue com **Ctrl + F5** no Windows. Domínio e HTTPS são configurados no painel da hospedagem.

```text
public_html/
├── index.html
├── favicon.svg
├── assets/
├── images/
└── licenses/
```

Se o painel permitir extrair ZIPs, você também pode enviar o arquivo e extraí-lo diretamente na pasta pública. Confirme que ele não criou uma pasta adicional entre a raiz do domínio e o `index.html`.

O pacote é para a **raiz do domínio**, por exemplo `https://seu-dominio.com.br/`. Os recursos usam caminhos a partir da raiz; para hospedar em uma subpasta, como `/site/`, é necessário ajustar o projeto e gerar outro pacote. Não é necessário instalar Node, React ou banco de dados no servidor. A página usa navegação por âncoras e não exige regras de reescrita.

## Conteúdo desta entrega

Este ZIP contém a versão atual de revisão. Permanecem os avisos de apresentação, os perfis e as pautas em preparação, os dados profissionais pendentes e os documentos de privacidade e termos preliminares. O WhatsApp confirmado é **(31) 99196-7003**.

O metadado `noindex, nofollow` permanece ativo: a página pode ser acessada pelo domínio, mas solicita aos mecanismos de busca que não a indexem. Ele poderá ser retirado na finalização das informações institucionais. As fotografias editoriais são ilustrativas. Os retratos reais de Dr. Welson, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende aparecem nos cartões e nos perfis da equipe. Os registros da OAB, as biografias e o nome completo do Dr. Welson continuam pendentes.

O ZIP contém os arquivos estáticos gerados por `npm run build` e as licenças das dependências distribuídas. O código-fonte, as ferramentas de desenvolvimento e o arquivo de prévia independente ficam fora do pacote. Gere um novo pacote após alterações no site; este arquivo não se atualiza automaticamente.
