# Canal de WhatsApp

O número confirmado pelo responsável pelo escritório é **+55 (31) 99196-7003**. A configuração pública fica em `src/data/contact.ts`. Não é uma credencial e não exige um serviço externo de integração.

O botão flutuante permanece no canto inferior direito, com área mínima de toque e espaço seguro para as bordas do celular. Há também um link na seção de contato. Ambos usam o mesmo destino e a mesma mensagem inicial. A URL resultante é construída por `getWhatsAppUrl`; números incompletos ou inválidos não geram um link. Se a configuração for removida, o botão informa que o canal ainda não está disponível.

O clique abre o serviço `wa.me` em outra aba com a mensagem preenchida. O visitante decide se deseja enviá-la no WhatsApp. Não há envio automático, SDK de terceiros, código de rastreamento ou requisição ao WhatsApp ao carregar a página. O aviso de privacidade informa o redirecionamento para o serviço externo.

O número inicialmente informado tinha oito dígitos após o DDD; o formato completo com o nono dígito foi confirmado pelo usuário antes da configuração. O código não acrescenta automaticamente um nono dígito a outros números.

Os testes validam a construção do link e, no navegador, interceptam a abertura externa sem iniciar uma conversa real. A existência de uma conta de WhatsApp ativa nesse número não é verificável apenas por um link bem formado; o teste de recebimento deve ser feito pelo próprio escritório.
