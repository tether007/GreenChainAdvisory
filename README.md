# CropAdvisor AI - Web3 Agricultural Disease Detection

A decentralized application that combines blockchain technology with AI to provide farmers with instant crop disease diagnosis and treatment recommendations.

## Features

- **Web3 Integration**: MetaMask wallet connection and smart contract payments
- **AI-Powered Analysis**: Gemini AI for accurate crop disease detection
- **Gasless Transactions**: Nitrolite SDK for improved user experience
- **Secure Payments**: Smart contract-based payment system
- **Database Storage**: PostgreSQL for analysis history
- **Mobile-First Design**: Responsive interface optimized for farmers

## Prerequisites

- Node.js (v18+)
- MetaMask browser extension
- PostgreSQL database
- Gemini API key
- Ethereum testnet setup (Sepolia recommended)

## Setup Instructions

### 1. Environment Configuration

Copy the environment files:
```bash
cp .env.example .env
cp server/.env.example server/.env
```

Update the environment variables with your actual values.

### 2. Database Setup

Create a PostgreSQL database and update the connection details in `server/.env`.

### 3. Smart Contract Deployment

```bash
npm install
npm run compile
npm run migrate
```

Update the contract address in `src/contracts/contractConfig.ts` after deployment.

### 4. Backend Setup

```bash
cd server
npm install
npm start
```

### 5. Frontend Setup

```bash
npm run dev
```

## API Keys Required

- **Gemini API**: Get from Google AI Studio
- **Infura**: For Ethereum network access
- **PostgreSQL**: Database credentials

## Smart Contract

The `CropAdvisor` contract handles:
- Payment processing (0.001 ETH per analysis)
- Image hash storage
- Analysis result storage
- Event emission for frontend updates

## Architecture

- **Frontend**: React + TypeScript + Tailwind CSS
- **Backend**: Node.js + Express + PostgreSQL
- **Blockchain**: Ethereum + Solidity + Truffle
- **AI**: Google Gemini API
- **Gasless**: Nitrolite SDK integration

## Usage Flow

1. Connect MetaMask wallet
2. Upload crop image
3. Pay analysis fee via smart contract
4. AI analyzes image and provides diagnosis
5. Results stored on-chain and in database
6. View analysis history and recommendations

## Security Features

- Smart contract ownership controls
- Input validation and sanitization
- Secure file handling
- Error handling and recovery
- Gas optimization