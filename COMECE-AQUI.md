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
2. Abra a pasta extraída no VS Code.
3. Abra o terminal integrado na pasta que contém `package.json`.
4. Execute:

```sh
npm ci
npm run dev
```

5. Mantenha o terminal aberto e use o endereço informado pelo Vite, normalmente `http://localhost:5173`.

Alterações salvas nos arquivos **desse computador** aparecem automaticamente no navegador. Esta conversa na nuvem não edita diretamente os arquivos do seu computador. Para trabalhar com o assistente nesses arquivos, use o Codex no VS Code ou no terminal local. Alterações feitas na nuvem precisam ser transferidas ao computador antes de aparecerem na prévia local.

Para atualizar o arquivo de apresentação independente, execute `npm run preview:export` na pasta do projeto. Ele gera `ABRA-A-PREVIA.html` e `dist/rtm-preview.html`.

## Situação desta apresentação

Não houve publicação na Locaweb nem alteração de DNS. Dados de contato, retratos e qualificações profissionais continuam pendentes. O site contém indicação de revisão e metadados para evitar indexação.
