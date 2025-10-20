# Certifikurs - Sistema de Certificados Académicos en Stacks Blockchain 🎓🔗

Este proyecto implementa un sistema descentralizado para la emisión y verificación de certificados académicos utilizando la blockchain de **Stacks**. Permite a instituciones educativas (academias) registrar certificados que los estudiantes pueden almacenar y verificar públicamente.

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
    npm install # o yarn install / pnpm install
    ```
* **Variables de Entorno**:
    * Renombra `.env.example` a `.env.local`.
    * Configura las variables de Supabase (`NEXT_PUBLIC_SUPABASE_URL`, `NEXT_PUBLIC_SUPABASE_ANON_KEY`).
    * Configura las variables del contrato de Stacks (`NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CONTRACT_NAME`, `NEXT_PUBLIC_NETWORK`) con los detalles de tu despliegue.
* **Ejecución**:
    ```bash
    npm run dev # o yarn dev / pnpm dev
    ```
    La aplicación estará disponible en `http://localhost:3000`.

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
