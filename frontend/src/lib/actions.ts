"use client";

import { BN, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";
import type { SalinaHive } from "@/idl/salina_hive";
import { useAnchorProvider } from "@/components/solana/solana-provider";

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
  const getProgram = (): Program<SalinaHive> => new Program(idl as Idl, provider) as Program<SalinaHive>;

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
    const program = getProgram();
    const payer = requireWallet();
    const [platformPda] = findPlatformPda();
    const sig = await program.methods
      .initializePlatform(feeBps, 0)
      .accounts({ payer, platform: platformPda, systemProgram: SystemProgram.programId } as never)
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function createCampaign(input: { title: string; description: string; goalLamports: number; deadlineTs: number; imageUrl: string }): Promise<PublicKey> {
    const program = getProgram();
    const payer = requireWallet();
    const [platformPda] = findPlatformPda();
    const platform = (await program.account.platform.fetch(platformPda)) as unknown as PlatformAccount;
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const sig = await program.methods
      .createCampaign(input.title, input.description, new BN(input.goalLamports), new BN(input.deadlineTs), input.imageUrl)
      .accounts({ payer, platform: platformPda, campaign: campaignPda, systemProgram: SystemProgram.programId } as never)
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");

    return campaignPda;
  }

  async function donate(campaign: PublicKey, amountLamports: number): Promise<void> {
    const program = getProgram();
    const donor = requireWallet();
    const [platformPda] = findPlatformPda();
    const sig = await program.methods
      .donate(new BN(amountLamports))
      .accounts({ donor, platform: platformPda, campaign, treasury: platformPda, systemProgram: SystemProgram.programId } as never)
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function withdraw(campaign: PublicKey): Promise<void> {
    const program = getProgram();
    const creator = requireWallet();
    const sig = await program.methods
      .withdraw()
      .accounts({ creator, campaign } as never)
      .rpc();
    await provider.connection.confirmTransaction(sig, "confirmed");
  }

  async function fetchCampaign(campaign: PublicKey): Promise<CampaignAccount> {
    const program = getProgram();
    const data = await program.account.campaign.fetch(campaign);
    return data as unknown as CampaignAccount;
  }

  async function fetchPlatform(): Promise<PlatformAccount | null> {
    const program = getProgram();
    const [platformPda] = findPlatformPda();
    try {
      const data = await program.account.platform.fetch(platformPda);
      return data as unknown as PlatformAccount;
    } catch {
      return null;
    }
  }

  async function fetchCampaigns(): Promise<{ pda: PublicKey; data: CampaignAccount }[]> {
    const platform = await fetchPlatform();
    if (!platform) return [];
    const program = getProgram();
    const items: { pda: PublicKey; data: CampaignAccount }[] = [];
    for (let i = 1; i <= Number(platform.campaignCount); i++) {
      const [pda] = findCampaignPdaById(i);
      try {
        const data = await program.account.campaign.fetch(pda);
        items.push({ pda, data: data as unknown as CampaignAccount });
      } catch {
        // ignore missing campaigns
      }
    }
    return items;
  }

  return { getProgram, findPlatformPda, findCampaignPdaById, initializePlatform, createCampaign, donate, withdraw, fetchCampaign, fetchPlatform, fetchCampaigns };
} 