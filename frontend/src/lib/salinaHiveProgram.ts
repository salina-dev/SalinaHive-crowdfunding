import { AnchorProvider, BN, Program, Idl } from "@coral-xyz/anchor";
import { Connection, PublicKey } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";

export const SALINA_HIVE_PROGRAM_ID = new PublicKey("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");

export function getConnection(): Connection {
  const url = process.env.NEXT_PUBLIC_RPC_URL || "https://api.devnet.solana.com";
  return new Connection(url, "confirmed");
}

export function getProvider(): AnchorProvider {
  const connection = getConnection();
  const provider = new AnchorProvider(connection, (window as any).solana, { commitment: "confirmed" });
  return provider;
}

export function getProgram(): Program<Idl> {
  const provider = getProvider();
  return (Program as any).at(SALINA_HIVE_PROGRAM_ID, provider, idl as Idl) as Program<Idl>;
}

export type { BN }; 