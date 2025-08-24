import { AnchorProvider, BN, Program, Idl, Wallet } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";
import type { SalinaHive } from "@/idl/salina_hive";

export const SALINA_HIVE_PROGRAM_ID = new PublicKey("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");

export function getConnection(): Connection {
  const url =
    process.env.NEXT_PUBLIC_SOLANA_RPC ||
    process.env.NEXT_PUBLIC_RPC_URL ||
    "https://api.devnet.solana.com";
  return new Connection(url, "confirmed");
}

export function getProvider(): AnchorProvider {
  const connection = getConnection();
  const win = globalThis as unknown as { solana?: Wallet };
  if (!win.solana) throw new Error("Wallet not available");
  return new AnchorProvider(connection, win.solana, { commitment: "confirmed" });
}

export function getProgram(): Program<SalinaHive> {
  const provider = getProvider();
  // Program reads programId from IDL address when not provided
  return new Program(idl as Idl, provider) as Program<SalinaHive>;
}

export type { BN }; 