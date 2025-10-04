# Sistema de Certificados Académicos - Stacks Blockchain

Sistema de certificación académica basado en la blockchain de Stacks que permite a múltiples academias emitir certificados verificables que se almacenan directamente en las wallets de los estudiantes.

## Características

- 🔒 **Seguridad Blockchain**: Los certificados se almacenan de forma inmutable en Stacks
- ✅ **Verificación Instantánea**: Cualquier persona puede verificar la autenticidad
- 🎓 **Multi-Academia**: Múltiples instituciones pueden participar
- 💎 **Propiedad del Estudiante**: Los certificados van directo al wallet del estudiante
- 🔐 **Autenticación con Supabase**: Sistema seguro de login y registro
- ⚡ **Interfaz Moderna**: Construido con Next.js y Tailwind CSS
- 📱 **Responsive**: Funciona en desktop y móvil
- 🛠️ **Fácil de usar**: Interface intuitiva para academias y estudiantes

## Configuración de Stacks

### 1. Desplegar el Contrato

Primero necesitas desplegar el contrato `nft.clar` (ubicado en `/sesion01/contracts/nft.clar`) en la red de Stacks:

```bash
# Usando Clarinet (recomendado)
cd sesion01
clarinet deployments generate --devnet
clarinet deployments apply --devnet
```

### 2. Configurar Variables de Entorno para Stacks

Actualiza el archivo `.env.local` con los datos de tu contrato:

```bash
# Stacks Blockchain Configuration
NEXT_PUBLIC_CONTRACT_ADDRESS=TU_DIRECCION_DEL_CONTRATO
NEXT_PUBLIC_CONTRACT_NAME=nft
NEXT_PUBLIC_NETWORK=testnet  # o mainnet para producción
```

### 3. Configurar Base de Datos (Supabase)

Ejecuta el script SQL `supabase-setup.sql` en tu proyecto de Supabase para crear la tabla de perfiles:

1. Ve a tu proyecto en [Supabase Dashboard](https://supabase.com/dashboard)
2. Ve a SQL Editor
3. Copia y pega el contenido de `supabase-setup.sql`
4. Ejecuta el script

Esto creará:
- Tabla `profiles` para almacenar direcciones de Stacks de usuarios
- Políticas de seguridad RLS
- Trigger para crear perfiles automáticamente

## Deploy to Vercel

Vercel deployment will guide you through creating a Supabase account and project.

After installation of the Supabase integration, all relevant environment variables will be assigned to the project so the deployment is fully functioning.

[![Deploy with Vercel](https://vercel.com/button)](https://vercel.com/new/clone?repository-url=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&project-name=nextjs-with-supabase&repository-name=nextjs-with-supabase&demo-title=nextjs-with-supabase&demo-description=This+starter+configures+Supabase+Auth+to+use+cookies%2C+making+the+user%27s+session+available+throughout+the+entire+Next.js+app+-+Client+Components%2C+Server+Components%2C+Route+Handlers%2C+Server+Actions+and+Middleware.&demo-url=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2F&external-id=https%3A%2F%2Fgithub.com%2Fvercel%2Fnext.js%2Ftree%2Fcanary%2Fexamples%2Fwith-supabase&demo-image=https%3A%2F%2Fdemo-nextjs-with-supabase.vercel.app%2Fopengraph-image.png)

The above will also clone the Starter kit to your GitHub, you can clone that locally and develop locally.

If you wish to just develop locally and not deploy to Vercel, [follow the steps below](#clone-and-run-locally).

## Clone and run locally

1. You'll first need a Supabase project which can be made [via the Supabase dashboard](https://database.new)

2. Create a Next.js app using the Supabase Starter template npx command

   ```bash
   npx create-next-app --example with-supabase with-supabase-app
   ```

   ```bash
   yarn create next-app --example with-supabase with-supabase-app
   ```

   ```bash
   pnpm create next-app --example with-supabase with-supabase-app
   ```

3. Use `cd` to change into the app's directory

   ```bash
   cd with-supabase-app
   ```

4. Rename `.env.example` to `.env.local` and update the following:

   ```
   NEXT_PUBLIC_SUPABASE_URL=[INSERT SUPABASE PROJECT URL]
   NEXT_PUBLIC_SUPABASE_ANON_KEY=[INSERT SUPABASE PROJECT API ANON KEY]
   ```

   Both `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` can be found in [your Supabase project's API settings](https://supabase.com/dashboard/project/_?showConnect=true)

5. You can now run the Next.js local development server:

   ```bash
   npm run dev
   ```

   The starter kit should now be running on [localhost:3000](http://localhost:3000/).

6. This template comes with the default shadcn/ui style initialized. If you instead want other ui.shadcn styles, delete `components.json` and [re-install shadcn/ui](https://ui.shadcn.com/docs/installation/next)

> Check out [the docs for Local Development](https://supabase.com/docs/guides/getting-started/local-development) to also run Supabase locally.

## Feedback and issues

Please file feedback and issues over on the [Supabase GitHub org](https://github.com/supabase/supabase/issues/new/choose).

## More Supabase examples

- [Next.js Subscription Payments Starter](https://github.com/vercel/nextjs-subscription-payments)
- [Cookie-based Auth and the Next.js 13 App Router (free course)](https://youtube.com/playlist?list=PL5S4mPUpp4OtMhpnp93EFSo42iQ40XjbF)
- [Supabase Auth and the Next.js App Router](https://github.com/supabase/supabase/tree/master/examples/auth/nextjs)
