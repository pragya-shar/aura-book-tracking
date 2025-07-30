/**
 * Deploy New Whole Number AuraCoin Contract
 * 
 * This script helps deploy a new AuraCoin contract with 0 decimals
 * for the perfect "1 page = 1 AURA" experience.
 */

export const WHOLE_NUMBER_AURA_CONTRACT = {
  // This will be the new contract ID once deployed
  NEW_CONTRACT_ID: '', // To be filled after deployment
  DECIMALS: 0, // Whole numbers only
  NAME: 'Aura Coin',
  SYMBOL: 'AURA'
};

/**
 * Contract deployment information and steps
 */
export const getDeploymentInfo = () => {
  return {
    currentIssue: {
      description: "Your current contract has decimal places, so Freighter shows values like 0.000000017310000466 AURA",
      contract: "CCJ53OFOFCS7XDVBWIJNXUBG7PIAASHBXPGCRJTYFRY3546X6F7Q3V2T",
      decimals: "Likely 7 or more decimal places"
    },
    solution: {
      description: "Deploy a new contract with 0 decimals for whole number tokens",
      benefits: [
        "✅ 1 page = exactly 1 AURA token",
        "✅ Freighter wallet shows whole numbers (e.g., '1236 AURA')",
        "✅ App shows whole numbers (e.g., '1236 AURA')",
        "✅ No confusing decimals anywhere",
        "✅ Perfect for point/reward systems"
      ]
    },
    deploymentSteps: [
      "1. Create new Soroban smart contract with 0 decimals",
      "2. Deploy to Stellar testnet using your Freighter wallet",
      "3. Update app configuration to use new contract ID",
      "4. Test minting/transfers with whole numbers",
      "5. Migrate existing rewards to new contract (optional)"
    ],
    migrationOptions: [
      {
        option: "Fresh Start",
        description: "Use new contract, reset all balances to 0",
        pros: ["Simple", "Clean", "No complexity"],
        cons: ["Lose current balance"]
      },
      {
        option: "Migration",
        description: "Convert existing balance to new contract",
        pros: ["Keep current balance", "Seamless transition"],
        cons: ["More complex", "Requires conversion calculation"]
      }
    ]
  };
};

/**
 * Sample Soroban contract code for whole number AuraCoin
 */
export const getSampleContractCode = () => {
  return `
// Sample Rust code for whole number AuraCoin contract
#![no_std]

use soroban_sdk::{contract, contractimpl, Env, Address, Symbol};

#[contract]
pub struct AuraCoin;

#[contractimpl]
impl AuraCoin {
    // Initialize with 0 decimals for whole numbers
    pub fn initialize(env: Env, admin: Address) {
        // Set decimals to 0 for whole number tokens
        env.storage().instance().set(&Symbol::new(&env, "decimals"), &0u8);
        env.storage().instance().set(&Symbol::new(&env, "name"), &"Aura Coin");
        env.storage().instance().set(&Symbol::new(&env, "symbol"), &"AURA");
        env.storage().instance().set(&Symbol::new(&env, "admin"), &admin);
    }
    
    pub fn decimals(env: Env) -> u8 {
        0 // Always return 0 for whole numbers
    }
    
    pub fn mint(env: Env, to: Address, amount: i128) {
        // Amount is already in whole numbers, no conversion needed
        // 1 AURA = 1 token unit (no decimals)
    }
}`;
};

/**
 * Configuration update needed after deployment
 */
export const getConfigurationUpdate = (newContractId: string) => {
  return `
// Update src/utils/auraCoinUtils.ts after deployment:

export const AURACOIN_CONFIG = {
  CONTRACT_ID: '${newContractId}', // New whole number contract
  OWNER_ADDRESS: 'GCYXOOV2VEQ2XXYO2DHLJ6JRZFAPEZKYOO5EUPWSPMELTW4IKJW3WGEI',
  NETWORK: 'testnet' as const,
  RPC_URL: 'https://soroban-testnet.stellar.org',
  NETWORK_PASSPHRASE: Networks.TESTNET
};

// Update token configuration:
export const TOKEN_DECIMALS = 0; // Whole numbers only
`;
};

/**
 * Test the current contract to see its actual decimals
 */
export const explainCurrentContractIssue = () => {
  return {
    problem: "Contract Decimals Mismatch",
    explanation: `
      Your Freighter wallet shows: 0.000000017310000466 AURA
      This suggests your deployed contract has 7+ decimal places.
      
      When you change TOKEN_DECIMALS in the app code, it only affects
      how the app displays values - it doesn't change the actual
      smart contract on the blockchain.
      
      The deployed contract's decimal configuration is PERMANENT
      and cannot be changed after deployment.
    `,
    verification: "Check console logs when loading wallet to see actual contract decimals",
    options: [
      "Option 1: Deploy new contract with 0 decimals (recommended)",
      "Option 2: Keep current contract and fix decimal math to match"
    ]
  };
};

export default {
  WHOLE_NUMBER_AURA_CONTRACT,
  getDeploymentInfo,
  getSampleContractCode,
  getConfigurationUpdate,
  explainCurrentContractIssue
};