# KipuBank 🏦

Un sistema de vault personal construido en Solidity que permite a los usuarios depositar y retirar ETH de forma segura con límites de protección.

## 📋 Descripción

KipuBank es un smart contract que implementa un sistema de banco descentralizado donde cada usuario tiene su propio vault personal. El contrato enforce límites de seguridad tanto globales como por transacción para proteger los fondos de los usuarios.

### 🔑 Características Principales

- **Vaults Personales**: Cada usuario tiene su propio vault de ETH
- **Límite Global**: El banco tiene un límite máximo de ETH que puede contener (bankCap)
- **Límite de Retiro**: Los usuarios pueden retirar hasta un máximo por transacción
- **Seguridad**: Implementa el patrón checks-effects-interactions y manejo seguro de transferencias
- **Eventos**: Emite eventos para todos los depósitos y retiros
- **Errores Personalizados**: Utiliza errores personalizados para mayor eficiencia de gas

## 🏗️ Arquitectura del Contrato

### Variables de Estado

- `BANK_CAP` (immutable): Límite máximo de ETH que puede contener el banco
- `WITHDRAWAL_LIMIT` (immutable): Límite máximo de retiro por transacción  
- `OWNER` (constant): Dirección del propietario del contrato
- `userVaults` (mapping): Mapeo de direcciones a balances de vault
- `totalDeposits`: Número total de depósitos realizados
- `totalWithdrawals`: Número total de retiros realizados
- `totalBalance`: Balance total del contrato

### Eventos

```solidity
event Deposit(address indexed user, uint256 amount, uint256 newVaultBalance);
event Withdrawal(address indexed user, uint256 amount, uint256 remainingVaultBalance);
```

### Errores Personalizados

- `DepositExceedsBankCap()`: Cuando un depósito excedería el límite del banco
- `ZeroDepositNotAllowed()`: Cuando se intenta depositar 0 ETH
- `InsufficientVaultBalance()`: Cuando el usuario no tiene fondos suficientes
- `WithdrawalExceedsLimit()`: Cuando un retiro excede el límite por transacción
- `ZeroWithdrawalNotAllowed()`: Cuando se intenta retirar 0 ETH
- `TransferFailed()`: Cuando falla una transferencia de ETH

### Funciones Principales

#### `deposit()` - External Payable
Permite a los usuarios depositar ETH en su vault personal.

#### `withdraw(uint256 amount)` - External  
Permite a los usuarios retirar ETH de su vault personal.

#### `getVaultBalance(address user)` - External View
Retorna el balance del vault de un usuario específico.

#### `getBankInfo()` - External View
Retorna información general del banco (límites, balances, estadísticas).

## 🚀 Instalación y Configuración

### Prerrequisitos

- Node.js v16 o superior
- npm o yarn
- Una wallet con ETH en testnet para desplegar

### Instalación

```bash
# Clonar el repositorio
git clone https://github.com/sasasamaes/kipu-bank.git
cd kipu-bank

# Instalar dependencias
npm install

# Configurar variables de entorno
cp .env.example .env
# Editar .env con tus claves reales
```

### Configuración del archivo .env

```bash
SEPOLIA_URL=https://sepolia.infura.io/v3/YOUR_INFURA_KEY
PRIVATE_KEY=your_private_key_here
ETHERSCAN_API_KEY=your_etherscan_api_key
```

## 🛠️ Compilación y Testing

### Compilar el contrato

```bash
npm run compile
```

### Ejecutar tests

```bash
npm test
```

### Reporte de gas

```bash
REPORT_GAS=true npm test
```

## 🚀 Despliegue

### Red Local (Hardhat)

```bash
npx hardhat node
npx hardhat run scripts/deploy.js --network localhost
```

### Testnet (Sepolia)

```bash
npm run deploy:testnet
```

### Verificación en Etherscan

Después del despliegue, verifica el contrato:

```bash
npx hardhat verify --network sepolia DEPLOYED_CONTRACT_ADDRESS "100000000000000000000" "1000000000000000000"
```

*Los parámetros son: BANK_CAP (100 ETH) y WITHDRAWAL_LIMIT (1 ETH) en wei*

## 🔧 Interacción con el Contrato

### Depositar ETH

```javascript
// Conectar al contrato
const kipuBank = await ethers.getContractAt("KipuBank", contractAddress);

// Depositar 1 ETH
const tx = await kipuBank.deposit({ value: ethers.parseEther("1") });
await tx.wait();
```

### Retirar ETH

```javascript
// Retirar 0.5 ETH
const tx = await kipuBank.withdraw(ethers.parseEther("0.5"));
await tx.wait();
```

### Consultar Balance

```javascript
const balance = await kipuBank.getVaultBalance(userAddress);
console.log("Balance del vault:", ethers.formatEther(balance), "ETH");
```

### Información del Banco

```javascript
const bankInfo = await kipuBank.getBankInfo();
console.log("Bank Cap:", ethers.formatEther(bankInfo[0]), "ETH");
console.log("Withdrawal Limit:", ethers.formatEther(bankInfo[1]), "ETH");
console.log("Current Balance:", ethers.formatEther(bankInfo[2]), "ETH");
console.log("Total Deposits:", bankInfo[3].toString());
console.log("Total Withdrawals:", bankInfo[4].toString());
```

## 🔒 Consideraciones de Seguridad

1. **Patrón CEI**: El contrato sigue checks-effects-interactions
2. **Reentrancy Protection**: Utiliza transferencias seguras con `call`
3. **Validación de Entrada**: Todas las entradas son validadas
4. **Límites de Protección**: Implementa límites tanto globales como por transacción
5. **Errores Personalizados**: Más eficientes en gas que strings

## 📊 Gastos de Gas Estimados

| Operación | Gas Estimado |
|-----------|-------------|
| Deploy    | ~800,000    |
| Deposit   | ~50,000     |
| Withdraw  | ~35,000     |
| View Functions | 0 (solo lectura) |

## 🧪 Casos de Prueba

El proyecto incluye tests comprehensivos que cubren:

- ✅ Despliegue correcto del contrato
- ✅ Depósitos válidos e inválidos
- ✅ Retiros válidos e inválidos  
- ✅ Límites de seguridad
- ✅ Múltiples usuarios
- ✅ Funciones view
- ✅ Eventos emitidos
- ✅ Errores personalizados

## 📄 Licencia

Este proyecto está licenciado bajo la Licencia MIT.

## 👨‍💻 Autor

**Francisco Campos**
- GitHub: [@sasasamaes](https://github.com/sasasamaes)
- Email: hey@francampos.me

## 🤝 Contribuciones

Las contribuciones son bienvenidas. Por favor:

1. Fork el proyecto
2. Crea una rama para tu feature (`git checkout -b feature/AmazingFeature`)
3. Commit tus cambios (`git commit -m 'Add some AmazingFeature'`)
4. Push a la rama (`git push origin feature/AmazingFeature`)
5. Abre un Pull Request

## 📈 Próximas Mejoras

- [ ] Implementar funciones de administración
- [ ] Agregar límites de tiempo para retiros
- [ ] Implementar sistema de recompensas
- [ ] Integración con tokens ERC20
- [ ] Dashboard web para interacción

---

**⚠️ Disclaimer**: Este contrato es para fines educativos. En un entorno de producción, considera auditorías de seguridad adicionales. 