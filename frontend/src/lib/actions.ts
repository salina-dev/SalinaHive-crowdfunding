"use client";

import { BN, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";
import { useAnchorProvider } from "@/components/solana/solana-provider";
import type { SalinaHive } from "@/idl/salina_hive";
import { useMemo } from "react";

export const SALINA_HIVE_PROGRAM_ID = new PublicKey("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");
const enc = new TextEncoder();

export type PlatformAccount = {
  authority: PublicKey;
  feeBps: number;
  treasury: PublicKey;
  campaignCount: BN;
  bump: number;
};

export type CampaignAccount = {
  platform: PublicKey;
  creator: PublicKey;
  cid: BN;
  title: string;
  description: string;
  imageUrl: string;
  goalLamports: BN;
  raisedLamports: BN;
  deadlineTs: BN;
  donationCount: BN;
  isDeleted: boolean;
  bump: number;
};

export function useSalinaHive() {
  const provider = useAnchorProvider();

  const program = useMemo(() => new Program(idl as Idl, provider) as Program<SalinaHive>, [provider]);

  const requireWallet = (): PublicKey => {
    const pk = provider.wallet?.publicKey as PublicKey | undefined;
    if (!pk) throw new Error("Connect your wallet first");
    return pk;
  };

  const findPlatformPda = (): [PublicKey, number] => {
    return PublicKey.findProgramAddressSync([enc.encode("platform")], SALINA_HIVE_PROGRAM_ID);
  };

  const findCampaignPdaById = (id: number): [PublicKey, number] => {
    const le = new Uint8Array(8);
    new DataView(le.buffer).setBigUint64(0, BigInt(id), true);
    return PublicKey.findProgramAddressSync([enc.encode("campaign"), le], SALINA_HIVE_PROGRAM_ID);
  };

  async function initializePlatform(feeBps: number): Promise<void> {
    const payer = requireWallet();
    const sig = await program.methods
      .initializePlatform(feeBps, 0)
      .accounts({ payer })
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function createCampaign(input: { title: string; description: string; goalLamports: number; deadlineTs: number; imageUrl: string }): Promise<PublicKey> {
    const payer = requireWallet();
    const [platformPda] = findPlatformPda();
    const platform = (await program.account.platform.fetch(platformPda)) as unknown as PlatformAccount;
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const sig = await program.methods
      .createCampaign(input.title, input.description, new BN(input.goalLamports), new BN(input.deadlineTs), input.imageUrl)
      .accounts({ payer, campaign: campaignPda })
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");

    return campaignPda;
  }

  async function donate(campaign: PublicKey, amountLamports: number): Promise<void> {
    requireWallet();
    const [platformPda] = findPlatformPda();
    const sig = await program.methods
      .donate(new BN(amountLamports))
      .accounts({ campaign, treasury: platformPda })
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function withdraw(campaign: PublicKey): Promise<void> {
    requireWallet();
    const sig = await program.methods
      .withdraw()
      .accounts({ campaign })
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function fetchCampaign(campaign: PublicKey): Promise<CampaignAccount> {
    const data = await program.account.campaign.fetch(campaign);
    return data as unknown as CampaignAccount;
  }

  async function fetchPlatform(): Promise<PlatformAccount | null> {
    const [platformPda] = findPlatformPda();
    try {
      const data = await program.account.platform.fetch(platformPda);
      return data as unknown as PlatformAccount;
    } catch {
      return null;
    }
  }

  function chunkArray<T>(items: T[], chunkSize: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < items.length; i += chunkSize) {
      chunks.push(items.slice(i, i + chunkSize));
    }
    return chunks;
  }

  async function fetchCampaigns(existingPlatform?: PlatformAccount): Promise<{ pda: PublicKey; data: CampaignAccount }[]> {
    const platform = existingPlatform ?? (await fetchPlatform());
    if (!platform) return [];

    const count = Number(platform.campaignCount);
    if (count <= 0) return [];

    const ids: number[] = Array.from({ length: count }, (_, i) => i + 1);
    const pdas: PublicKey[] = ids.map((id) => findCampaignPdaById(id)[0]);

    // Batch requests to reduce RPC load
    const results: { pda: PublicKey; data: CampaignAccount }[] = [];
    const CHUNK_SIZE = 50;
    for (const batch of chunkArray(pdas, CHUNK_SIZE)) {
      const infos = await provider.connection.getMultipleAccountsInfo(batch, { commitment: "confirmed" });
      for (let i = 0; i < batch.length; i++) {
        const info = infos[i];
        if (!info?.data) continue;
        try {
          const decoded = program.coder.accounts.decode("campaign", info.data) as unknown as CampaignAccount;
          results.push({ pda: batch[i], data: decoded });
        } catch {
          // Skip undecodable entries (e.g., missing or wrong account)
        }
      }
    }

    return results;
  }

  return { program, findPlatformPda, findCampaignPdaById, initializePlatform, createCampaign, donate, withdraw, fetchCampaign, fetchPlatform, fetchCampaigns };
} 