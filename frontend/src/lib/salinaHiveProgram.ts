import { AnchorProvider, BN, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";
import type { SalinaHive } from "@/idl/salina_hive";

export const SALINA_HIVE_PROGRAM_ID = new PublicKey("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");

export function getConnection(): Connection {
  const url = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
  return new Connection(url, "confirmed");
}

export function getProvider(): AnchorProvider {
  const connection = getConnection();
  const wallet = (globalThis as unknown as { solana?: unknown }).solana as AnchorProvider["wallet"];
  return new AnchorProvider(connection, wallet, { commitment: "confirmed" });
}

export function getProgram(): Program<SalinaHive> {
  const provider = getProvider();
  return new Program(idl as Idl, provider) as Program<SalinaHive>;
}

export type { BN }; 