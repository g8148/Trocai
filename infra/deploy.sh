#!/bin/bash
#
# Deploy do Trocai na VPS.
#
# Chamado pelo workflow .github/workflows/deploy.yml, que ja fez o
# `git fetch` + `git reset --hard origin/main` antes de invocar este script.
# Por isso o script NAO faz git pull: se ele atualizasse o proprio arquivo
# durante a execucao, o Bash releria o script alterado no meio da rodada.
#
# Uso manual: bash /opt/Trocai/infra/deploy.sh
#
set -euo pipefail

REPO_DIR="/opt/Trocai"
API_DIR="$REPO_DIR/app/api"
WEB_DIR="$REPO_DIR/app/web"
VENV="$API_DIR/.venv"
BACKUP_DIR="/var/backups/trocai"

log() {
    echo "[deploy] $(date '+%Y-%m-%d %H:%M:%S') - $*"
}

log "Iniciando deploy de $(git -C "$REPO_DIR" rev-parse --short HEAD)"

# --- BACKEND -----------------------------------------------------------------

log "Instalando dependencias da API..."
"$VENV/bin/pip" install -r "$API_DIR/requirements.txt" --quiet

# Backup antes de migrar. Nao e rollback automatico: e o botao de desfazer
# para o caso de uma migration aplicar e o deploy falhar depois dela.
# Restaurar com:
#   gunzip -c ARQUIVO.sql.gz | docker exec -i trocai-db psql -U trocai trocai
log "Backup do banco..."
if [ ! -w "$BACKUP_DIR" ]; then
    echo "[deploy] ERRO: $BACKUP_DIR nao existe ou nao e gravavel pelo usuario"
    echo "[deploy] Crie com:  sudo install -d -m 700 -o ubuntu -g ubuntu $BACKUP_DIR"
    exit 1
fi
# O dump contem dados pessoais (CPF, e-mail, coordenadas, hashes de senha).
# O umask 077 garante 0600 no arquivo: legivel so pelo dono, nunca pelos
# outros usuarios e containers que dividem a maquina.
(
    umask 077
    docker exec trocai-db pg_dump -U trocai trocai \
        | gzip > "$BACKUP_DIR/$(date '+%Y-%m-%d-%H%M%S').sql.gz"
)
# Mantem apenas os 5 backups mais recentes.
ls -t "$BACKUP_DIR"/*.sql.gz 2>/dev/null | tail -n +6 | xargs -r rm --

log "Aplicando migrations..."
cd "$API_DIR" && "$VENV/bin/python" manage.py migrate --noinput

# Sem --clear: apagar o STATIC_ROOT inteiro antes de recriar deixa uma janela
# de alguns segundos servindo 404 nos arquivos estaticos.
log "Coletando arquivos estaticos..."
cd "$API_DIR" && "$VENV/bin/python" manage.py collectstatic --noinput

# --- FRONTEND ----------------------------------------------------------------
# O build roda ANTES de qualquer restart. Se o build do Next falhar, o
# `set -e` aborta aqui e os dois servicos seguem rodando a versao anterior.

log "Instalando dependencias do frontend..."
cd "$WEB_DIR" && npm ci --prefer-offline --no-audit --no-fund

log "Build do frontend..."
cd "$WEB_DIR" && npm run build

# --- RESTART -----------------------------------------------------------------

log "Reiniciando servico da API..."
sudo systemctl restart trocai-api

log "Reiniciando servico do frontend..."
sudo systemctl restart trocai-web

log "Deploy concluido com sucesso!"
