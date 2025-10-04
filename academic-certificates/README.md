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

