# Certifikurs - Sistema de Certificados Académicos en Stacks Blockchain 🎓🔗

Este proyecto implementa un sistema descentralizado para la emisión y verificación de certificados académicos utilizando la blockchain de **Stacks**. Permite a instituciones educativas (academias) registrar certificados que los estudiantes pueden almacenar y verificar públicamente.

**Contratos en Testnet:**
* **Registry**: `https://explorer.hiro.so/txid/ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV.registry?chain=testnet`
* **Manager**: `https://explorer.hiro.so/txid/ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV.certificate-manager-v1?chain=testnet`
* **Data**: `https://explorer.hiro.so/txid/ST15Z41T89K34CD6Q1N8DX2VZGCP50ATNAHPFXMBV.certificate-data?chain=testnet`

**Aplicación Web:** `https://certifikurs.vercel.app`

## ✨ Características Principales

* **Emisión Descentralizada**: Las academias autorizadas pueden emitir certificados directamente en la blockchain.
* **Propiedad del Estudiante**: Los certificados se asocian a la wallet de Stacks del estudiante.
* **Verificación Pública**: Cualquier persona puede verificar la autenticidad a través del explorador o el contrato.
* **Gestión Multi-Academia**: Un super administrador puede autorizar y gestionar múltiples academias.
* **Interfaz Moderna**: Frontend construido con Next.js, TypeScript y Tailwind CSS.
* **Autenticación Segura**: Manejo de usuarios (Admin, Academia, Estudiante) mediante Supabase Auth.

## 🛠️ Tecnologías Utilizadas

* **Blockchain**: Stacks
* **Smart Contracts**: Clarity
* **Frontend**: Next.js, React, TypeScript
* **Estilos**: Tailwind CSS, shadcn/ui
* **Base de Datos**: Supabase
* **SDKs**: `@stacks/connect`, `@stacks/transactions`, `@stacks/wallet-sdk`

## 📂 Estructura del Proyecto

* **`certifikurs/`**: Contiene el proyecto de Clarinet con los contratos inteligentes modularizados.
* **`academic-certificates/`**: Contiene la aplicación frontend desarrollada en Next.js.

## 🚀 Puesta en Marcha

### 1. Smart Contracts (Directorio `certifikurs/`)

* **Despliegue**:
    * Utiliza Clarinet para desplegar en la red deseada. El archivo `deployments/default.testnet-plan.yaml` contiene el plan para testnet.
    * Comando: `clarinet deployments apply --testnet`.
* **Configuración**:
    * El archivo `settings/Devnet.toml` contiene cuentas de prueba para desarrollo local.

### 2. Aplicación Web (Directorio `academic-certificates/`)

* **Instalación**:
    ```bash
    cd academic-certificates
    pnpm install
    ```
* **Variables de Entorno**:
    * Configura `.env.local` con tus credenciales de Supabase y las direcciones de los contratos desplegados (`NEXT_PUBLIC_CONTRACT_ADDRESS`, `NEXT_PUBLIC_CONTRACT_NAME`, `NEXT_PUBLIC_NETWORK`).
* **Ejecución**:
    ```bash
    pnpm run dev
    ```

## 🚀 Demo y Cuentas de Prueba
**Video Demo:** `https://www.youtube.com/watch?v=D4ApowgES-M`

### 1. Rol Academia (Emisor)
* **Email:** `academy@test.cl` | **Password:** `123456`
* Usa esta cuenta para emitir certificados. Ya está autorizada y tiene STX de prueba.

### 2. Rol Estudiante (Receptor)
* **Email:** `christiantest@student.cl` | **Password:** `123456`
* Inicia sesión para ver los certificados asociados a tu perfil.

### 3. Rol Administrador
* **Email:** `test@testadmin.com` | **Password:** `123456`
* Permite visualizar la interfaz de gestión, aunque las acciones están restringidas a la wallet del Super Admin.

### 4. Exploración Pública
* **Búsqueda por ID:** Prueba con IDs del `1` al `12`.
* **Wallet Academia:** `ST394TJKHT35TTP3RBARBT7P1KP59BQ4BBA3RSXD0`.

## ⚙️ Uso del Sistema

1. **Explorador (`/explorer`)**: Búsqueda pública de certificados por ID o Wallet.
2. **Panel Academia (`/academy`)**: Emisión de certificados y listado de envíos.
3. **Panel Estudiante (`/student`)**: Visualización de logros propios vinculados a la wallet.
4. **Panel Admin (`/admin`)**: Gestión de instituciones y estadísticas del sistema.
5. **Validador (`/validator`)**: Validación directa mediante el ID de transacción.

## 📄 Contratos Inteligentes

Ubicados en `certifikurs/contracts/`:
* **`registry.clar`**: Registro de contratos autorizados autorizadas.
* **`certificate-data.clar`**: Almacenamiento y estructura de los certificados.
* **`certificate-manager-v1.clar`**: Lógica de negocio y orquestación de permisos.

## 📜 Licencia

Este proyecto está bajo la Licencia Pública General **GNU v3.0**.
