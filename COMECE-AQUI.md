# Como visualizar o site RTM

## Só quero ver a primeira versão

Não precisa instalar Node.js ou publicar o site.

1. No GitHub deste projeto, clique em **Code** e depois em **Download ZIP**.
2. Extraia o arquivo ZIP no computador.
3. Abra a pasta extraída.
4. Dê dois cliques no arquivo **ABRA-A-PREVIA.html**.

O site abre no seu navegador. Esse arquivo inclui as imagens, fontes e interações e funciona sem internet. É uma cópia da versão preparada, não um servidor com atualização automática.

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

## Situação desta apresentação

Não houve publicação na Locaweb nem alteração de DNS. Dados de contato, retratos e qualificações profissionais continuam pendentes. O site contém indicação de revisão e metadados para evitar indexação.
