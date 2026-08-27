# Infraestrutura

Configuração da VPS de produção do Trocaí, versionada. O objetivo é que uma
pessoa com uma VPS Ubuntu limpa consiga reconstruir a produção usando apenas
o que está neste repositório.

## Arquivos

| Arquivo | Vai para | O que faz |
| -- | -- | -- |
| `deploy.sh` | fica no repo, roda de `/opt/Trocai/infra/deploy.sh` | Instala dependências, migra o banco, builda o front e reinicia os serviços |
| `systemd/trocai-api.service` | `/etc/systemd/system/` | Roda a API Django com Gunicorn em `127.0.0.1:8000` |
| `systemd/trocai-web.service` | `/etc/systemd/system/` | Roda o Next.js em produção na porta `3002` |
| `cloudflared/config.example.yml` | `/etc/cloudflared/config.yml` | Expõe API e front pela internet via Cloudflare Tunnel, sem abrir portas |

Nada aqui contém segredo. O `.env` da API e as credenciais do túnel do
Cloudflare ficam **apenas na VPS** e nunca são versionados.

## Arquitetura

O tráfego externo entra pelo Cloudflare Tunnel, que fala com dois processos
locais. Nenhuma porta da VPS fica exposta à internet.

```
Internet
   |
   v
Cloudflare Tunnel  (cloudflared.service)
   |
   |-- api-trocai.<dominio>  --> localhost:8000  trocai-api  (Gunicorn/Django)
   |-- trocai.<dominio>      --> localhost:3002  trocai-web  (Next.js)
                                       |
                                       v
                                  PostgreSQL (localhost:5432)
```

## Montando uma VPS do zero

> **O que foi validado.** Os passos 1, 3 e 4 foram executados num container
> Ubuntu 24.04 limpo: os pacotes do `apt` existem, o venv cria, as
> `requirements.txt` instalam, e a partir do `.env.example` copiado o
> `manage.py check` passa sem issues, o `migrate` aplica todas as migrations e
> o `collectstatic` roda. Os passos 5 a 7 (systemd, cloudflared, sudoers) **não**
> foram testados numa máquina limpa — dependem de init, DNS e credenciais
> próprios — e foram derivados da VPS em produção.


Ubuntu limpa, usuário `ubuntu` com sudo.

### 1. Dependências do sistema

```bash
sudo apt update
sudo apt install -y git python3 python3-venv python3-pip docker.io docker-compose-v2

# Node 22 pelo NodeSource — o nodejs do apt no Ubuntu 24.04 e antigo demais
# para o Next 16. E assim que a VPS atual esta configurada.
curl -fsSL https://deb.nodesource.com/setup_22.x | sudo -E bash -
sudo apt install -y nodejs

sudo usermod -aG docker ubuntu   # relogar depois disso
```

**Versão do Python:** o projeto exige **3.12 ou superior** — é o que o Django
6.0 declara em `Requires-Python`. Não fixamos uma versão exata de propósito: a
VPS roda o 3.12.3 que vem no Ubuntu 24.04, e as máquinas de desenvolvimento
rodam versões mais novas. O `python3` do sistema serve nos dois casos, sem PPA.

### 2. Banco de dados

O Postgres **não** é instalado via apt: roda em container, a partir do
`app/api/docker-compose.yml` já versionado no repositório. É o mesmo arquivo
usado em desenvolvimento e em produção. Ele sobe no passo 4, depois do clone.

> **Hardening pendente.** Esse compose publica a porta como `5432:5432` (bind
> em `0.0.0.0`) e traz a senha `trocai_dev_2026` fixa no arquivo versionado.
> Na VPS atual o banco **não** está acessível pela internet — a Security List da
> Oracle bloqueia a 5432 na borda (verificado: conexão externa dá timeout).
> Ainda assim vale corrigir, porque a proteção é de camada única: portas
> publicadas pelo Docker contornam a chain INPUT do iptables, então o firewall
> da nuvem é a única barreira. Numa VPS nova, antes de subir, troque a porta
> para `127.0.0.1:5432:5432` e mova a senha para variável de ambiente.

### 3. Clonar o repositório

```bash
sudo mkdir -p /opt/Trocai
sudo chown ubuntu:ubuntu /opt/Trocai
git clone https://github.com/g8148/Trocai.git /opt/Trocai
```

### 4. Configurar a API

```bash
cd /opt/Trocai/app/api
docker compose up -d          # sobe o Postgres

python3 -m venv .venv
.venv/bin/pip install -r requirements.txt

cp .env.example .env
```

Edite o `.env` com os valores de produção. No mínimo:

```
SECRET_KEY=<gere uma chave nova>
DEBUG=False
ALLOWED_HOSTS=api-trocai.<dominio>,localhost
CORS_ALLOWED_ORIGINS=https://trocai.<dominio>
FRONTEND_URL=https://trocai.<dominio>
DB_PASSWORD=<a senha definida no passo 2>
```

### 5. Instalar os serviços do systemd

```bash
sudo cp /opt/Trocai/infra/systemd/trocai-api.service /etc/systemd/system/
sudo cp /opt/Trocai/infra/systemd/trocai-web.service /etc/systemd/system/
sudo systemctl daemon-reload
sudo systemctl enable trocai-api trocai-web
```

Os units gravam log em `/var/log/trocai-api-*.log`. Crie os arquivos com dono
`ubuntu` antes do primeiro start, senão o Gunicorn não consegue escrever:

```bash
sudo touch /var/log/trocai-api-access.log /var/log/trocai-api-error.log
sudo chown ubuntu:ubuntu /var/log/trocai-api-*.log
```

### 6. Cloudflare Tunnel

```bash
sudo cp /opt/Trocai/infra/cloudflared/config.example.yml /etc/cloudflared/config.yml
```

Siga as instruções no topo do próprio arquivo para criar o túnel e substituir
os placeholders `<TUNNEL_ID>`. Se a VPS já tiver um túnel servindo outros
projetos, **acrescente** os blocos de ingress do Trocaí aos existentes, sempre
antes da regra final `http_status:404`.

### 7. Permitir que o deploy reinicie os serviços

O `deploy.sh` roda `sudo systemctl restart` sem TTY, então o `sudo` não pode
pedir senha. Em imagens de nuvem Ubuntu o usuário padrão já vem com `NOPASSWD`
total via `/etc/sudoers.d/90-cloud-init-users` — é o caso da VPS atual, que não
tem regra específica do Trocaí. Confirme com:

```bash
sudo -n systemctl is-active trocai-api
```

Se pedir senha, crie uma regra restrita a esses dois comandos:

```bash
echo 'ubuntu ALL=(ALL) NOPASSWD: /usr/bin/systemctl restart trocai-api, /usr/bin/systemctl restart trocai-web' \
  | sudo tee /etc/sudoers.d/trocai-deploy
sudo chmod 440 /etc/sudoers.d/trocai-deploy
```

### 8. Diretório de backups

O `deploy.sh` faz um `pg_dump` antes de cada `migrate` e guarda os cinco mais
recentes. O diretório precisa existir e pertencer ao usuário do deploy:

```bash
sudo install -d -m 700 -o ubuntu -g ubuntu /var/backups/trocai
```

O modo `700` não é detalhe: o dump contém CPF, e-mail, coordenadas e hashes de
senha dos usuários. Com as permissões padrão ele sairia legível por qualquer
usuário ou container da máquina. O `deploy.sh` complementa isso gerando cada
arquivo sob `umask 077`.

Sem isso o deploy aborta com uma mensagem explicando o comando acima. Para
restaurar um backup:

```bash
gunzip -c /var/backups/trocai/ARQUIVO.sql.gz \
  | docker exec -i trocai-db psql -U trocai trocai
```

### 9. Primeiro deploy

```bash
bash /opt/Trocai/infra/deploy.sh
```

## Deploy contínuo

Todo push na `main` dispara `.github/workflows/deploy.yml`, que entra por SSH
na VPS e roda:

```bash
cd /opt/Trocai
git fetch origin main
git reset --hard origin/main
bash /opt/Trocai/infra/deploy.sh
```

O workflow usa os secrets `VPS_HOST`, `VPS_USER` e `VPS_SSH_KEY`, configurados
no repositório do GitHub.

### Por que o `git pull` está no workflow e não no script

O `deploy.sh` é versionado, então ele mesmo é atualizado pelo `git pull`. Se o
pull acontecesse dentro do script, o Bash — que lê o arquivo sob demanda
durante a execução, e não de uma vez — poderia continuar lendo a partir de um
offset inválido no arquivo recém-trocado. Deixando o pull no workflow, o script
só é lido depois de já estar na versão final.

O `git reset --hard` em vez de `git pull` também elimina a possibilidade de
conflito de merge: a working tree da VPS é sempre um espelho exato da `main`.
**Consequência:** qualquer alteração feita à mão dentro de `/opt/Trocai` é
descartada no próximo deploy. Mudanças de infra vêm por commit, não por edição
direta na VPS.

### Ordem das etapas do deploy

O build do Next roda **antes** de qualquer `systemctl restart`. Com `set -e`,
um build quebrado aborta o script e os dois serviços seguem no ar servindo a
versão anterior.

## npm, não Bun

O projeto usa **npm** tanto em desenvolvimento quanto em produção, com o
`package-lock.json` como única fonte de verdade. O `bun.lock` foi removido:
manter dois lockfiles no mesmo repositório fazia dev e produção resolverem
árvores de dependências diferentes.

O deploy usa `npm ci`, que instala exatamente o que está no lockfile e falha se
ele estiver dessincronizado do `package.json` — ao contrário do `npm install`,
que corrigia o lockfile silenciosamente a cada deploy e deixava a VPS com a
working tree suja.

## Limitações conhecidas

- **Sem rollback automático.** Se as migrations aplicarem e o build falhar
  depois, o banco fica à frente do código. O deploy tira um `pg_dump` antes de
  migrar (ver passo 8), então dá para voltar o banco à mão, mas nada reverte
  sozinho.
- **`collectstatic` sem `--clear`.** Arquivos estáticos removidos do código
  continuam no `STATIC_ROOT`. Foi uma troca consciente: o `--clear` apagava o
  diretório inteiro antes de recriá-lo, deixando alguns segundos de 404 nos
  estáticos a cada deploy. Para limpar, rode com `--clear` manualmente numa
  janela de manutenção.
- **Senha do banco versionada em repositório público.** O
  `app/api/docker-compose.yml` fixa `POSTGRES_PASSWORD=trocai_dev_2026` e o
  repositório é público, então a senha é legível por qualquer pessoa. O acesso
  externo à 5432 está bloqueado pela Security List da Oracle, mas o bind é
  `0.0.0.0` e o iptables local não cobre portas publicadas pelo Docker — a
  proteção é de camada única. Corrigir fora desta issue: bind em `127.0.0.1`,
  senha por variável de ambiente e rotação da senha atual.
- **Nginx roda na VPS mas não serve o Trocaí.** O Cloudflare Tunnel fala direto
  com `localhost:8000` e `localhost:3002`; nenhum site habilitado no nginx
  referencia o projeto. Nada a configurar nele.
- **Restart do Next com o build trocado embaixo.** O `npm run build` reescreve
  o `.next/` enquanto o serviço antigo ainda está no ar; entre o build e o
  restart, requisições podem pegar chunks inconsistentes. A janela é de poucos
  segundos.
