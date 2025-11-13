# Certifikurs - Sistema de Certificados Académicos en Stacks Blockchain 🎓🔗

Este proyecto implementa un sistema descentralizado para la emisión y verificación de certificados académicos utilizando la blockchain de **Stacks**. Permite a instituciones educativas (academias) registrar certificados que los estudiantes pueden almacenar y verificar públicamente..

Contrato: `https://explorer.hiro.so/txid/ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV.nft?chain=testnet`

Aplicación Web: `https://certifikurs.vercel.app`

## ✨ Características Principales

* **Emisión Descentralizada**: Las academias autorizadas pueden emitir certificados directamente en la blockchain.
* **Propiedad del Estudiante**: Los certificados se asocian a la wallet de Stacks del estudiante.
* **Verificación Pública**: Cualquier persona puede verificar la autenticidad de un certificado a través del explorador público o consultando directamente el contrato.
* **Gestión Multi-Academia**: Un super administrador puede autorizar y gestionar múltiples academias.
* **Interfaz Web Moderna**: Frontend construido con Next.js, TypeScript y Tailwind CSS para una experiencia de usuario fluida.
* **Integración con Wallet**: Utiliza `@stacks/connect` para la interacción con wallets de Stacks.
* **Autenticación Segura**: Manejo de usuarios (Admin, Academia, Estudiante) mediante Supabase Auth.

## 🛠️ Tecnologías Utilizadas

* **Blockchain**: Stacks
* **Smart Contract**: Clarity
* **Frontend**: Next.js, React, TypeScript
* **Estilos**: Tailwind CSS, shadcn/ui
* **Autenticación y Base de Datos**: Supabase
* **Interacción con Stacks**: `@stacks/connect`, `@stacks/transactions`, `@stacks/wallet-sdk`

## 🚀 Puesta en Marcha

### 1. Smart Contract (Backend - Clarity)

El contrato inteligente (`nft.clar`) se encuentra en el directorio `sesion01/contracts/`.

* **Despliegue**:
    * Utiliza Clarinet para desplegar el contrato en la red deseada (devnet, testnet, mainnet). El archivo `deployments/default.testnet-plan.yaml` muestra un ejemplo para testnet.
    * Puedes usar el comando: `clarinet contract deploy --plan deployments/default.testnet-plan.yaml` (ajusta según tu configuración).
* **Configuración**:
    * El archivo `settings/Devnet.toml` contiene configuraciones para la red de desarrollo local, incluyendo cuentas de prueba.

### 2. Aplicación Web (Frontend - Next.js)

El código del frontend se encuentra en el directorio `academic-certificates/`.

* **Instalación**:
    ```bash
    cd academic-certificates
    pnpm install # o yarn install / npm install
    ```
* **Variables de Entorno**:
    * Renombra `.env.example` a `.env.local`.
    * Configura las variables de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    * Configura las variables del contrato de Stacks (`NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CONTRACT_NAME`, `NEXT_PUBLIC_NETWORK`) con los detalles de tu despliegue.
* **Ejecución**:
    ```bash
    pnpm run dev # o yarn dev / npm dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

## 🚀 Demo en Vivo y Cuentas de Prueba
Puedes ver nuestro Demo oficial en el siguiente link `https://www.youtube.com/watch?v=D4ApowgES-M`
Puedes probar la aplicación en vivo en el siguiente enlace. Para facilitar la exploración de los diferentes roles, puedes utilizar las siguientes credenciales y datos de prueba.

**Sitio Web:** `certifikurs.vercel.app`


### 1. ¿Deseas emitir un certificado? (Rol Academia)

Usa esta cuenta para probar el flujo de creación de certificados. Ya cuenta con autorización del administrador y fondos de prueba (STX) para las transacciones.

* **Email:** `academy@test.cl`
* **Contraseña:** `123456`

**Pasos:**
1.  Inicia sesión con estas credenciales.
2.  Ve al "Panel de Academia" y completa el formulario para emitir un nuevo certificado.


### 2. ¿Deseas visualizar certificados? (Rol Estudiante)

Puedes crear tu propia cuenta o usar una de prueba.

* **Opción A (Cuenta de prueba):**
    * **Email:** `christiantest@student.cl`
    * **Contraseña:** `123456`
    * **Instrucciones:** Inicia sesión y ve al "Panel de Estudiante" para ver los certificados ya asociados.

* **Opción B (Tu propia cuenta):**
    1.  Regístrate con tu propio email y el rol de "Estudiante".
    2.  Usa la cuenta de **Academia** (del punto 1) para emitirte un certificado usando el correo con el que te haz registrado como estudiante.
    3.  Vuelve a tu cuenta de estudiante y podrás ver el certificado que acabas de recibir.


### 3. ¿Quieres conocer el panel de Administrador?

Con esta cuenta podrás *visualizar* la interfaz del administrador, pero no podrás ejecutar acciones, ya que estas están restringidas solo a la wallet del Super Administrador.

* **Email:** `test@testadmin.com`
* **Contraseña:** `123456`


### 4. Exploración Pública

Puedes usar el explorador público (`/explorer`) sin iniciar sesión para verificar la data en la blockchain.

* **Verificar por ID de Certificado:**
    * Prueba buscando un ID entre `1` y `12`.
* **Buscar por Email de Estudiante:**
    * Usa el email: `christiantest@student.cl` o el que te hayas creado.
* **Buscar por Wallet de Academia:**
    * Usa la dirección: `ST32F1KRYMZJXMSNTDZB69EVG8RNKAYAV16VJ4J1H`
* **Ver una transacción de ejemplo:** (`/validator`)
    * Puedes analizar esta transacción en el validador oficial de nuestra web: `0x3a78e75d02546a78d2c0e55d720ae8a6eb020df4eaa650485160884252564eaf`
      

## ⚙️ Uso del Sistema

La aplicación web tiene diferentes secciones según el rol del usuario:

1.  **Explorador Público (`/explorer`)**:
    * Permite a cualquier persona buscar y verificar certificados por ID, dirección de estudiante o dirección de academia.
    * Muestra estadísticas generales del sistema como el total de certificados y la dirección del super administrador.
2.  **Panel de Academia (`/academy`)**:
    * Requiere autenticación de Supabase y conexión con una wallet de Stacks autorizada.
    * Permite a las academias emitir nuevos certificados ingresando los datos del estudiante, curso y calificación.
    * Muestra una lista de los certificados emitidos por esa academia.
3.  **Panel de Estudiante (`/student`)**:
    * Requiere autenticación de Supabase.
    * Muestra los certificados asociados a la dirección de Stacks vinculada al perfil del estudiante.
    * Permite buscar certificados de otras direcciones.
4.  **Panel de Administrador (`/admin`)**:
    * Requiere autenticación de Supabase como admin y conexión con la wallet del super administrador.
    * Permite registrar nuevas academias, desactivarlas y ver estadísticas del sistema.
    * Permite cambiar la dirección del super administrador.
    * Permite fondear (enviar STX) a las wallets de las academias para cubrir las tasas de transacción.
5.  **Validador Público (`validator`)**:
    * Permite a cualquier persona validar un certificado por el ID de la transacción.
    * Muestra un botón que redirige directamente a la transacción en el Explorador de Stacks.


## 📄 Contrato Inteligente (`nft.clar`)

* **Ubicación**: `sesion01/contracts/nft.clar`
* **Funcionalidades Principales**:
    * `add-school`: Registra una nueva academia (solo super-admin).
    * `deactivate-school`: Desactiva una academia (solo super-admin).
    * `issue-certificate`: Emite un nuevo certificado (solo academias activas).
    * `change-super-admin`: Cambia la dirección del super-admin (solo super-admin actual).
    * Funciones `read-only` para consultar certificados, escuelas, estudiantes y estadísticas (`get-certificate`, `get-student-certificates`, `get-school-certificates`, `get-school-info`, `get-total-certificates`, `get-super-admin`).
* **Estructura de Datos**:
    * `authorized-schools`: Mapa de academias autorizadas.
    * `certificates`: Mapa que almacena los detalles de cada certificado por ID.
    * `student-certificates`: Mapa que relaciona la wallet de un estudiante con una lista de IDs de sus certificados.
    * `school-certificates`: Mapa que relaciona la wallet de una escuela con una lista de IDs de certificados emitidos.

## 📜 Licencia

Este proyecto está bajo la Licencia Pública General GNU v3.0. Consulta el archivo `LICENSE` para más detalles.
