# 💻 Documentación Técnica del Frontend (`/academic-certificates`)

La aplicación web está construida con **Next.js 15 (App Router)** y sirve como interfaz principal para interactuar con los contratos inteligentes de Stacks y la gestión de usuarios fuera de la cadena (off-chain) mediante Supabase.

## 📂 Arquitectura del Proyecto

El código está organizado siguiendo una arquitectura modular que separa la interfaz de usuario (UI), la lógica de servidor (Server Actions) y la integración con la blockchain (Libs).

```text
academic-certificates/
├── app/                        # Rutas y Vistas (App Router)
│   ├── actions/                # Server Actions (Lógica de Backend/Supabase)
│   ├── academy/                # Panel privado para Academias (Protected)
│   ├── admin/                  # Panel privado para Administradores (Protected)
│   ├── student/                # Panel privado para Estudiantes (Protected)
│   ├── explorer/               # Página pública de exploración
│   └── validator/              # Página pública de validación de certificados
├── components/                 # Componentes de UI (Átomos y Moléculas)
│   ├── ui/                     # Shadcn UI (Botones, Inputs, Cards, etc.)
│   ├── academy/                # Formularios y tablas específicos de Academia
│   └── wallet-connection.tsx   # Componente para conectar Wallet (Leather/Xverse)
├── lib/                        # Lógica de Negocio y Configuración
│   ├── stacks/                 # Funciones de interacción con Smart Contracts
│   └── supabase/               # Cliente y Middleware de Supabase
└── types/                      # Definiciones de Tipos TypeScript (Interfaces)

```

## 🔗 Integración con Stacks (`/lib/stacks`)

Este directorio contiene la lógica para interactuar con la blockchain. Está dividido por roles para mantener la seguridad y el orden:

* **`admin/`**: Funciones restringidas al Super Admin.
* `registry.ts`: Contiene la función `authorizeSchool` que llama al contrato `registry` para aprobar nuevas instituciones.
* `fund-schools-manager.ts`: Gestiona la transferencia de STX para fondear las wallets de las academias nuevas.


* **`academy/`**: Funciones para instituciones.
* `certificates-manager.ts`: Prepara y ejecuta la función `issue-certificate` del contrato `certificate-manager-v1`. Maneja las post-conditions para asegurar la transferencia del activo NFT.


* **`public/`**: Lectura pública sin coste de gas.
* `explorer.ts`: Recupera datos de certificados (`get-certificate`), detalles de escuelas y listas de estudiantes directamente de la cadena.
* `certificate-validator.ts`: Lógica criptográfica para validar la autenticidad de un certificado dado un ID o Hash de transacción.



## ⚡ Server Actions (`/app/actions`)

Utilizamos **Server Actions** para manejar la lógica sensible y las mutaciones de datos de forma segura en el servidor, reduciendo el código enviado al cliente.

* **`auth/`**: Gestión de sesiones.
* `login.ts` / `signup.ts`: Manejan la autenticación con Supabase Auth.


* **`academy/`**: Lógica de negocio para escuelas.
* `certificates.ts`: Valida los datos del formulario de emisión (Zod) antes de solicitar la firma de la wallet.
* `courses.ts`: Gestiona el CRUD de cursos (off-chain en Supabase) vinculados a los certificados.


* **`admin/`**:
* `academies.ts`: Gestiona el registro de datos de escuelas en la base de datos antes de su aprobación en blockchain.



## 🔐 Seguridad y Autenticación

* **Middleware (`middleware.ts`)**: Protege las rutas `/admin`, `/academy` y `/student`. Verifica el token de sesión de Supabase y el rol del usuario en la metadata antes de renderizar la página.
* **Gestión de Wallet**: La conexión con la wallet de Stacks (para firmar transacciones) se maneja en el cliente usando `@stacks/connect`. La sesión de la wallet es independiente de la sesión de la base de datos, permitiendo un modelo híbrido seguro.

## 🎨 Componentes Clave

* **`wallet-connection.tsx`**: Botón centralizado que gestiona el estado de conexión con Stacks. Detecta si el usuario tiene Leather o Xverse instalado.
* **`certificate-details-form.tsx`**: Formulario principal de emisión. Incluye validación de campos y feedback visual durante el proceso de firma de transacción.
* **`public-explorer.tsx`**: Componente de búsqueda que permite filtrar certificados en tiempo real consultando la blockchain.

```

```
