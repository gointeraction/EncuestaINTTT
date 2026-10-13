# Modelo de ramas y entornos (INTT)

Modelo acordado con el cliente. Se definirá sobre **GitLab** propio del INTT; los nombres aplican
igual si hoy el repo vive en GitHub, y migran sin cambios (sólo cambia la URL del remoto).

| Rama | Rol | Entorno que despliega | Protección |
|------|-----|-----------------------|------------|
| `main` | **Master** (espejo de lo liberado) | — (referencia) | Protegida: sólo *maintainers* con merge por MR |
| `produccion` | Despliegue **productivo** | **PRODUCCIÓN** (`production`, `intt_encuesta`) | **Bloqueada**: sólo el administrador de despliegue puede fusionar/publicar |
| `calidad` | Despliegue de **QA** | **QA** (`qa`, `intt_encuesta_qa`) | Protegida: merge por MR desde `desarrollo` |
| `desarrollo` | Integración / trabajo diario | Desarrollo local (Docker Compose) | Libre para el equipo de desarrollo |

## 1. Flujo de promoción

```
feature/* ──MR──▶ desarrollo ──MR──▶ calidad ──MR──▶ produccion ──(merge)──▶ main
                     │                     │                 │
                (dev local)            (despliegue QA)   (despliegue PROD)
```

1. El trabajo diario entra a **`desarrollo`** por *Merge Request*.
2. Cuando una versión es apta para QA, se promueve **`desarrollo` → `calidad`** (MR). El servidor de QA
   despliega la rama `calidad`.
3. Validado QA, se promueve **`calidad` → `produccion`** (MR). El servidor de producción despliega la
   rama `produccion`.
4. **`main`** (Master) recibe el merge de `produccion` y queda como foto del estado liberado; se etiqueta
   (`v1.0.0`, …) para poder hacer *rollback*.

> Correspondencia script → entorno: `deploy.sh --env qa` despliega la rama `calidad`;
> `deploy.sh --env production` despliega la rama `produccion`. Se puede forzar otra con `--branch`.

## 2. Protección en GitLab (Settings → Repository → Protected branches)

| Rama | Allowed to merge | Allowed to push | Allowed to force push |
|------|------------------|-----------------|-----------------------|
| `main` | Maintainers | No one | Deshabilitado |
| `produccion` | **Deploy Admin** (rol dedicado) | **No one** (sólo vía MR aprobado) | Deshabilitado |
| `calidad` | Maintainers / Developers | No one | Deshabilitado |
| `desarrollo` | Developers | Developers | Deshabilitado |

Complementos recomendados:

- **Merge request approvals** en `produccion` (≥1 aprobación del responsable de despliegue).
- **Push rules** o *Deploy tokens* de sólo lectura para los servidores que hacen `git pull`.
- **Environments** de GitLab (`QA`, `Production`) con *protected environments* para que sólo el
  administrador de despliegue ejecute el job de producción.
- **Variables CI/CD** por entorno: credenciales y claves **nunca** en el repo (`.env.*` está gitignored).
- Convención de tags al liberar: `vMAYOR.MENOR.PARCHE` sobre `main` (base para `rollback.sh --ref`).

> Alternativa si no se usa CI de GitLab: los servidores despliegan con `deploy.sh --pull`
> (pull de la rama protegida) desde una cuenta con permiso de *lectura* únicamente.

## 3. Ejecución del despliegue según la rama

| Acción | QA | Producción |
|--------|----|------------|
| Rama | `calidad` | `produccion` |
| `APP_ENV` | `qa` | `production` |
| `.env` | `.env.qa` | `.env.production` |
| Proyecto compose | `encuesta-intt-qa` | `encuesta-intt-prod` |
| Base de datos | `intt_encuesta_qa` | `intt_encuesta` |
| Comando | `deploy.sh --env qa --pull` | `deploy.sh --env production --pull` |

## 4. Migración al GitLab del cliente

### 4.1. Clave SSH para registrar en GitLab

Genera el par y registra la **pública** en GitLab (Deploy Key de lectura, o clave de usuario):

```bash
deploy/intt/scripts/gen-deploy-key.sh --name intt_gitlab --comment "encuesta-intt@intt-gitlab"
# imprime la CLAVE PÚBLICA a pegar en GitLab → Settings → Repository → Deploy keys
```

- En la **máquina que empuja** (migración): registra la pública con *Grant write permissions*.
- En cada **servidor que hace `git pull`**: ejecuta el script **en ese servidor** y registra su
  pública **sin** permiso de escritura. La privada nunca sale del host.

Configura `~/.ssh/config`:

```
Host gitlab.intt.gob.ve
    HostName gitlab.intt.gob.ve
    User git
    IdentityFile ~/.ssh/intt_gitlab
    IdentitiesOnly yes
```

Comprueba con `ssh -T git@gitlab.intt.gob.ve` (debe responder *Welcome to GitLab*).

### 4.2. Empujar el repositorio

```bash
git remote add intt git@gitlab.intt.gob.ve:<grupo>/EncuestaINTTT.git
git push intt main desarrollo calidad produccion
git push intt --tags
```

Los scripts no contienen ninguna URL de repositorio: se pasa con `--repo <url>` en `install.sh`.
