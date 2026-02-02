# Guía de Automatización con Jenkins y Docker en Ubuntu

Esta guía te ayudará a configurar tu entorno local Ubuntu para automatizar el despliegue de la aplicación **Gastos Compartidos** utilizando Jenkins y Docker.

## Prerrequisitos

Tu PC con Ubuntu debe estar actualizado.

```bash
sudo apt update && sudo apt upgrade -y
```

## 1. Instalación de Docker y Docker Compose

Jenkins usará Docker para construir y desplegar los contenedores.

```bash
# Instalar Docker
sudo apt install -y docker.io

# Iniciar y habilitar Docker
sudo systemctl start docker
sudo systemctl enable docker

# Añadir tu usuario al grupo docker (para no usar sudo con docker)
sudo usermod -aG docker $USER

# (Importante) Instalar Docker Compose Plugin (v2)
sudo apt install -y docker-compose-plugin
# O verificar si ya tienes docker-compose
docker compose version
```

> **Nota:** Cierra sesión y vuelve a entrar para que el cambio de grupo surta efecto.

## 2. Instalación de Java (Requerido para Jenkins)

Jenkins corre sobre Java.

```bash
sudo apt install -y openjdk-17-jdk
java -version
```

## 3. Instalación de Node.js y npm (Para el agente de Jenkins)

Aunque Docker se encargará de muchas cosas, es útil tener Node en el host si ejecutas Jenkins directamente, o configurar Jenkins para usar agentes Docker. Para simplificar, instalaremos Node en el sistema host para que el pipeline simple funcione.

```bash
curl -fsSL https://deb.nodesource.com/setup_20.x | sudo -E bash -
sudo apt install -y nodejs
node -v
npm -v
```

## 4. Instalación de Jenkins

El error `NO_PUBKEY` indica que la clave de seguridad ha cambiado o no se descargó bien. Usa estos comandos exactos para corregirlo:

```bash
# 1. Asegúrate de tener los paquetes necesarios para manejar claves y descargas
sudo apt-get install -y wget gnupg

# 2. Elimina cualquier configuración anterior fallida de Jenkins (opcional, para limpiar)
sudo rm -f /etc/apt/sources.list.d/jenkins.list

# 3. Descarga la clave oficial actualizada (versión 2023) y guárdala en el llavero del sistema
sudo wget -O /usr/share/keyrings/jenkins-keyring.asc \
  https://pkg.jenkins.io/debian-stable/jenkins.io-2023.key

# 4. Añade el repositorio oficial referenciando explícitamente esa clave descargada
echo "deb [signed-by=/usr/share/keyrings/jenkins-keyring.asc] \
  https://pkg.jenkins.io/debian-stable binary/" | sudo tee \
  /etc/apt/sources.list.d/jenkins.list > /dev/null

# 5. Actualiza los repositorios (ya no debería dar error GPG)
sudo apt-get update

# 6. Instala Jenkins
sudo apt-get install -y jenkins

# 7. Inicia el servicio
sudo systemctl start jenkins
sudo systemctl enable jenkins
```

## 5. Configurar Permisos de Jenkins para Docker

Para que Jenkins pueda ejecutar comandos de Docker (como `docker compose up`), el usuario `jenkins` debe tener permisos.

```bash
sudo usermod -aG docker jenkins
sudo systemctl restart jenkins
```

## 6. Configuración Inicial de Jenkins

1.  Abre tu navegador y ve a `http://localhost:8080`.
2.  Te pedirá la **contraseña de administrador**. Obtenla con:
    ```bash
    sudo cat /var/lib/jenkins/secrets/initialAdminPassword
    ```
3.  Selecciona **"Install suggested plugins"**.
4.  Crea tu usuario administrador.

## 7. Crear el Pipeline

1.  En el Dashboard de Jenkins, haz clic en **"Nueva Tarea" (New Item)**.
2.  Escribe un nombre, ej: `Gastos-Compartidos-Deploy`.
3.  Selecciona **Pipeline** y clic en OK.
4.  En la sección **Configuration**:
    *   Ve a la parte inferior, a **Pipeline**.
    *   **Definition**: Selecciona `Pipeline script from SCM`.
    *   **SCM**: Git.
    *   **Repository URL**: `https://github.com/lushopai/deudas-gestor.git`
    *   **Branch Specifier**: `*/main`
    *   **Script Path**: `Jenkinsfile`
5.  **Guardar**.

## 8. Automatización (Poll SCM vs Webhooks)

Como tu servidor está en una red local y GitHub no puede "avisarle" directamente (a menos que uses Ngrok), la mejor opción es que Jenkins pregunte periódicamente a GitHub si hay cambios.

### Configurar Poll SCM (Sondeo):
1.  Ve a tu Tarea (Job) en Jenkins y haz clic en **"Configurar"** (Configure) en el menú izquierdo.
2.  Baja hasta la sección **Build Triggers** (Disparadores de ejecución).
3.  Marca la casilla **Poll SCM** (Sondear SCM).
4.  En el campo **Schedule** (Programación), escribe la frecuencia con la que quieres buscar cambios.
    *   **Ejemplo recomendado (cada 2 minutos):**
        ```text
        H/2 * * * *
        ```
    *   *Explicación:* Esto le dice a Jenkins "Revisa el repositorio cada 2 minutos. Si detectas un nuevo commit, inicia el despliegue automático".
5.  Haz clic en **Guardar**.

### ¿Cómo funciona?
Jenkins mirará silenciosamente tu repo cada 2 minutos. Si no hay cambios, no hace nada. Si tú (o alguien más) hace un `git push`, Jenkins lo detectará en su siguiente chequeo, descargará el código y lanzará el Pipeline.

## 9. Ejecutar

Haz clic en **"Construir ahora" (Build Now)** para probar.

El pipeline realizará:
1.  Build de Backend (crea el .jar).
2.  Build de Frontend (compila Angular).
3.  Docker Compose Build & Up (levanta todo el sistema).

Tu aplicación estará disponible en `http://localhost:80` (Frontend) y `http://localhost:8080` (Backend).
