"use client";

import { BN, Program, Idl } from "@coral-xyz/anchor";
import { PublicKey, SystemProgram } from "@solana/web3.js";
import idl from "@/idl/salina_hive.json";
import { useAnchorProvider } from "@/components/solana/solana-provider";

export const SALINA_HIVE_PROGRAM_ID = new PublicKey("Fg852CkXa5T6tXeA86FCEj6zKa48U2oqMXMmPouvEWnP");
const enc = new TextEncoder();

export function useSalinaHive() {
  const provider = useAnchorProvider();
  const getProgram = () => new Program(idl as Idl, provider) as Program<any>;
  const requireWallet = (): PublicKey => {
    const pk = (provider.wallet as any)?.publicKey as PublicKey | undefined;
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

  async function initializePlatform(feeBps: number) {
    const program = getProgram();
    const payer = requireWallet();
    const [platformPda] = findPlatformPda();
    const sig = await (program.methods as any)
      .initializePlatform(feeBps, 0)
      .accounts({ payer, platform: platformPda, systemProgram: SystemProgram.programId })
      .rpc();
    await provider.connection.confirmTransaction(sig, 'confirmed')
  }

  async function createCampaign(input: { title: string; description: string; goalLamports: number; deadlineTs: number; imageUrl: string }) {
    const program = getProgram();
    const payer = requireWallet();
    const [platformPda] = findPlatformPda();
    const platform = await (program.account as any).platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const sig = await (program.methods as any)
      .createCampaign(input.title, input.description, new BN(input.goalLamports), new BN(input.deadlineTs), input.imageUrl)
      .accounts({ payer, platform: platformPda, campaign: campaignPda, systemProgram: SystemProgram.programId })
      .rpc();
    await provider.connection.confirmTransaction(sig, 'confirmed')

    return campaignPda;
  }

  async function donate(campaign: PublicKey, amountLamports: number) {
    const program = getProgram();
    const donor = requireWallet();
    const [platformPda] = findPlatformPda();
    const sig = await (program.methods as any)
      .donate(new BN(amountLamports))
      .accounts({ donor, platform: platformPda, campaign, treasury: platformPda, systemProgram: SystemProgram.programId })
      .rpc();
    await provider.connection.confirmTransaction(sig, 'confirmed')
  }

  async function withdraw(campaign: PublicKey) {
    const program = getProgram();
    const creator = requireWallet();
    const sig = await (program.methods as any)
      .withdraw()
      .accounts({ creator, campaign })
      .rpc();
    await provider.connection.confirmTransaction(sig, 'confirmed')
  }

  async function fetchCampaign(campaign: PublicKey) {
    const program = getProgram();
    return (program.account as any).campaign.fetch(campaign);
  }

  async function fetchPlatform() {
    const program = getProgram();
    const [platformPda] = findPlatformPda();
    try {
      return await (program.account as any).platform.fetch(platformPda);
    } catch {
      return null;
    }
  }

  async function fetchCampaigns() {
    const platform = await fetchPlatform();
    if (!platform) return [] as any[];
    const program = getProgram();
    const items: any[] = [];
    for (let i = 1; i <= Number(platform.campaignCount); i++) {
      const [pda] = findCampaignPdaById(i);
      try {
        const c = await (program.account as any).campaign.fetch(pda);
        items.push({ pda, data: c });
      } catch {}
    }
    return items;
  }

  return { getProgram, findPlatformPda, findCampaignPdaById, initializePlatform, createCampaign, donate, withdraw, fetchCampaign, fetchPlatform, fetchCampaigns };
} 