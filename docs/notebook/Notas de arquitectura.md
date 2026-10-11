La arquitectura y el despliegue *on-premises* de la plataforma de encuestas **Visión Cero (INTT)** están diseñados para garantizar alta disponibilidad, seguridad perimetral y procesamiento masivo de información, con capacidad para procesar **1.000.000 de encuestas en 15 días continuos** y picos de tráfico de **30 a 50 transacciones por segundo (POST/Submits)**[1][2].

---

### 1\. Topología de Red y Segmentación en 4 Zonas (VLANs)

El sistema se despliega en el centro de datos local del INTT bajo un modelo de **defensa en profundidad**, dividiendo la infraestructura en **4 zonas de seguridad segmentadas** mediante VLANs para que la base de datos nunca tenga contacto directo con Internet[1][3]:

* **Zona 0: Red Externa (Internet):** Tráfico ciudadano proveniente de dispositivos móviles o PC que ingresa a través del firewall perimetral (UTM) por los puertos 80 y 443[3].
* **Zona 1: DMZ Pública (VLAN 10 - Proxy &amp; Web):** Aloja el servidor perimetral **Nginx (** **VM-WEB-LB01** **)**, encargado de la terminación SSL, compresión Gzip, entrega de activos estáticos y limitación de tasa (*Rate Limiting*)[3].
* **Zona 2: Red de Aplicación Interna (VLAN 20 - App Cluster):** Cluster de aplicación compuesto por dos instancias Next.js Standalone (**VM-APP01** y **VM-APP02**), administradas por **PM2 en modo cluster multinúcleo** (4 workers por máquina)[3].
* **Zona 3: Red de Datos Aislada (VLAN 30 - Persistencia &amp; Caché):** Zona totalmente privada donde residen el motor **PostgreSQL 16 Enterprise (** **VM-DB01** **)** con el concentrador de conexiones **PgBouncer**, y un servidor **Redis (** **VM-CACHE01** **)** para el manejo de caché y tasa de peticiones[3].

---

### 2\. Dimensionamiento e Infraestructura On-Premises

La infraestructura completa recomendada requiere **26 vCPU, 60 GB de RAM y 460 GB de almacenamiento** distribuida en 5 Máquinas Virtuales (o consolidada en 2 VMs)[4]:

* **VM-WEB-LB01** **(Nginx):** 4 vCPU / 8 GB RAM / 60 GB SSD[4].
* **VM-APP01** **y** **VM-APP02** **(Next.js + PM2):** 6 vCPU / 12 GB RAM / 80 GB SSD cada una[4].
* **VM-DB01** **(PostgreSQL 16 + PgBouncer):** 8 vCPU / 24 GB RAM / 200 GB en **SSD NVMe (RAID 10)**[4].
* **VM-CACHE01** **(Redis):** 2 vCPU / 4 GB RAM / 40 GB SSD[4].

Con los **24 GB de RAM** asignados a la base de datos, la totalidad de los datos e índices de 1.000.000 de registros (\~2 GB) residen en memoria caché del sistema operativo, permitiendo escrituras y lecturas inmediatas[5][6].

---

### 3\. Arquitectura de Software y Patrón CQRS (Sumarización Analítica)

Para evitar que el Dashboard analítico (`/?admin=1`) colapse el servidor al procesar 1.000.000 de respuestas en JSON en tiempo real, la plataforma implementa el patrón **CQRS (Command Query Responsibility Segregation)**[7]:

1. **Escritura (OLTP):** Las encuestas enviadas por los ciudadanos se persisten rápidamente en la tabla `SurveyResponse` en un campo de texto JSON (`@db.Text`) sin ejecutar cálculos pesados[7][8].
2. **Proceso de Sumarización (Batch / Cron):** Un script en segundo plano (`npm run survey:summarize`) pre-calcula los **\~46 indicadores** del cuestionario y guarda un registro consolidado de **\~8.6 KB** en la tabla `SurveySummary` con la clave `'latest'`[7][9].
3. **Lectura (OLAP):** La API del Dashboard (`GET /api/survey/stats`) lee únicamente la fila `'latest'`, entregando todos los gráficos e indicadores en **menos de 5 milisegundos** sin afectar la base de datos[7][10].

---

### 4\. Modelo de Seguridad y Protección Anti-Bot

El envío de encuestas y el panel de administración están protegidos por **4 capas de seguridad**[11][12]:

1. **Rate Limiting Perimetral:** Nginx limita las peticiones en `/api/survey/submit` a un máximo de **10 solicitudes por minuto por IP**[11].
2. **Honeypot Invisible:** Un campo trampa oculto detecta y neutraliza envíos automatizados creados por bots[12].
3. **Cloudflare Turnstile:** Validación server-side obligatoria de un token criptográfico anti-bot antes de insertar registros en la base de datos[12][13].
4. **Acceso Zero-Trust al Dashboard:** La ruta administrativa (`/?admin=1`) y sus APIs asociadas están **bloqueadas en Nginx para Internet público**; solo se permite el paso a peticiones originadas desde la **Intranet o VPN institucional del INTT** (subredes `10.0.0.0/8`, `172.16.0.0/12`, `192.168.0.0/16`)[14][15]. El login utiliza cookies `httpOnly` firmadas con **HMAC-SHA256** y comparación en tiempo constante (`crypto.timingSafeEqual`)[12].

---

### 5\. Despliegue y Mantenimiento Automatizado

El despliegue en servidores Linux (Ubuntu Server 22.04/24.04 o Debian 12) se realiza mediante un script de instalación desatendida (`install.sh`)[16][17]:

* **Gestor de Procesos:** PM2 ejecuta la compilación *standalone* de Next.js en modo *cluster*, distribuyendo la carga de manera balanceada en todos los núcleos de CPU del servidor[3][18].
* **Respaldos Automáticos:** Una tarea programada en `cron` ejecuta diariamente a las **02:00 AM** un respaldo comprimido de PostgreSQL (`pg_dump`) con retención rotativa[19][20].
* **Recargas sin Inactividad:** Se utiliza el comando `pm2 reload` para aplicar actualizaciones de código con cero tiempo de caídas[20].