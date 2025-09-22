import { Connection } from '@solana/web3.js'

export async function confirmAndLogSignature(connection: Connection, signature: string, label?: string) {
  try {
    await connection.confirmTransaction(signature, 'confirmed')
  } catch {}
  const url = `https://explorer.solana.com/tx/${signature}?cluster=devnet`
  if (label) {
    console.log(`${label}: ${url}`)
  } else {
    console.log(url)
  }
} 