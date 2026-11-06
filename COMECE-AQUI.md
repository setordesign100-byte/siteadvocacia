# Como visualizar o site RTM

## Quero publicar no blog

Depois de enviar o novo pacote à Locaweb, abra **[https://rtmadvocacia.com.br/painel/](https://rtmadvocacia.com.br/painel/)**. Entre com o usuário principal **`admin.rtm`** e a senha fornecida separadamente nesta conversa. A tela oferece apenas login. O administrador principal libera outros editores em **Gerenciar acessos**; visitantes não criam contas. Depois, use **Novo artigo** para preencher título, imagem e texto, conferir a prévia e salvar um rascunho ou publicar.

Veja [o passo a passo do blog](COMO-USAR-O-BLOG.md) e [como enviar o novo pacote à Locaweb](COMO-PUBLICAR-NA-LOCAWEB.md). O blog público fica em **[https://rtmadvocacia.com.br/blog/](https://rtmadvocacia.com.br/blog/)** após a instalação do pacote. Ele precisa da hospedagem com PHP habilitado; as publicações ficam salvas no servidor.

## Só quero ver a primeira versão

Não precisa instalar Node.js ou publicar o site.

1. No GitHub deste projeto, clique em **Code** e depois em **Download ZIP**.
2. Extraia o arquivo ZIP no computador.
3. Abra a pasta extraída.
4. Dê dois cliques no arquivo **ABRA-A-PREVIA.html**.

O site institucional abre no seu navegador. Esse arquivo inclui as imagens, fontes e interações locais. A consulta e a publicação reais do blog dependem da API PHP na hospedagem; o HTML independente não salva artigos nem representa um servidor com atualização automática.

O endereço `localhost` não serve para abrir essa cópia. Use o arquivo HTML.

## Quero desenvolver e acompanhar as alterações

1. Instale **Node.js 24 LTS** pelo site oficial: https://nodejs.org/.
2. Na pasta extraída, abra **INICIAR-NO-WINDOWS.cmd** no Windows ou **INICIAR-NO-MAC.command** no Mac. O iniciador prepara as dependências e abre o navegador automaticamente. No Mac, a abertura por dois cliques pode depender das permissões do sistema; também é possível executar `bash INICIAR-NO-MAC.command` no terminal.
3. Mantenha a janela do iniciador aberta enquanto usa o site.
4. Para editar, abra essa mesma pasta no VS Code.

No Linux ou para iniciar pelo terminal em qualquer sistema, execute na pasta que contém `package.json`:

```sh
npm run start:local
```

O endereço exibido normalmente será `http://127.0.0.1:5173`. Se a porta estiver ocupada, o iniciador escolhe outra e informa o endereço correto. Ele utiliza apenas a interface local do computador, prepara as dependências na primeira execução e as atualiza quando o lockfile mudar. A primeira preparação precisa de internet. Se ocorrer um erro, a janela mostra a mensagem e permanece aberta nos atalhos Windows/Mac.

O iniciador foi executado e validado em Linux com Node.js 24. Os atalhos de Windows e macOS precisam ser conferidos nesses sistemas; não foram executados na máquina do usuário.

Alterações salvas nos arquivos **desse computador** aparecem automaticamente no navegador. Esta conversa na nuvem não edita diretamente os arquivos do seu computador. Para trabalhar com o assistente nesses arquivos, use o Codex no VS Code ou no terminal local. Alterações feitas na nuvem precisam ser transferidas ao computador antes de aparecerem na prévia local.

Para atualizar o arquivo de apresentação independente, execute `npm run preview:export` na pasta do projeto. Ele gera `ABRA-A-PREVIA.html` e `dist/rtm-preview.html`.

## Situação da versão

Os retratos reais de Dr. Eltonson Rezende, Dr. Rommel Trevenzoli, Dr. Osvaldo Marques e Dr. Wesley Rezende foram incluídos a partir do ZIP enviado pelo usuário. O nome do Dr. Eltonson Rezende foi confirmado posteriormente pelo responsável. O WhatsApp está configurado; registros da OAB, biografias, e-mail, endereço e horários continuam pendentes. O responsável confirmou a versão final e pediu a retirada da faixa superior de apresentação. Os metadados para evitar indexação permanecem nesta alteração. A foto coletiva aguarda o envio do arquivo original acessível para ser incluída acima dos perfis.

O repositório não altera a hospedagem ou o DNS automaticamente. Para enviar ou atualizar os arquivos na pasta `public_html` da Locaweb, use o pacote **SITE-RTM-LOCAWEB.zip** e siga [as instruções de publicação](COMO-PUBLICAR-NA-LOCAWEB.md). Nas atualizações, preserve as imagens de `public_html/uploads/blog/` e a pasta de dados `rtm-blog-private` fora da raiz pública.
