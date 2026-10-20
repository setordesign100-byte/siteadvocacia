#!/usr/bin/env bash
cd -- "$(dirname -- "${BASH_SOURCE[0]}")" || exit 1
if ! command -v node >/dev/null 2>&1; then
  echo "Instale o Node.js 24 LTS em https://nodejs.org/ e abra este iniciador novamente."
  read -r -p "Pressione Enter para fechar. "
  exit 1
fi
node scripts/start-local.mjs
rtm_exit=$?
if [ "$rtm_exit" -ne 0 ]; then
  read -r -p "Pressione Enter para fechar. "
fi
exit "$rtm_exit"
