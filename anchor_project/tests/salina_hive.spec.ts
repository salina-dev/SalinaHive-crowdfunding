import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import { Keypair, SystemProgram, PublicKey, LAMPORTS_PER_SOL } from "@solana/web3.js";
import assert from "assert";

// Using any to avoid depending on generated types
type AnyProgram = Program<any>;

const utf8 = anchor.utils.bytes.utf8;

describe("salina_hive", () => {
  // Configure the client to use the local cluster.
  const provider = anchor.AnchorProvider.local();
  anchor.setProvider(provider);

  const program = anchor.workspace.SalinaHive as AnyProgram;

  const findPlatformPda = async (): Promise<[PublicKey, number]> => {
    return PublicKey.findProgramAddressSync([utf8.encode("platform")], program.programId);
  };

  const findCampaignPdaById = (id: number): [PublicKey, number] => {
    const le = Buffer.alloc(8);
    le.writeBigUInt64LE(BigInt(id));
    return PublicKey.findProgramAddressSync([utf8.encode("campaign"), le], program.programId);
  };

  let campaignPda1: PublicKey;

  it("Initialize platform", async () => {
    const [platformPda] = await findPlatformPda();

    await program.methods
      .initializePlatform(250, 0) // 2.5%
      .accounts({
        payer: provider.wallet.publicKey,
        platform: platformPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const platform = await program.account.platform.fetch(platformPda);
    assert.equal(platform.authority.toBase58(), provider.wallet.publicKey.toBase58());
    assert.equal(platform.feeBps, 250);
  });

  it("Create campaign (happy)", async () => {
    const [platformPda] = await findPlatformPda();
    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const now = Math.floor(Date.now() / 1000);

    await program.methods
      .createCampaign(
        "Open Source Toolkit",
        "Building a modular toolkit for Solana devs",
        new anchor.BN(1 * LAMPORTS_PER_SOL),
        new anchor.BN(now + 3600),
        "https://example.com/image.png"
      )
      .accounts({
        payer: provider.wallet.publicKey,
        platform: platformPda,
        campaign: campaignPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    const campaign = await program.account.campaign.fetch(campaignPda);
    assert.equal(campaign.title, "Open Source Toolkit");
    assert.equal(campaign.raisedLamports.toNumber(), 0);

    campaignPda1 = campaignPda;
  });

  it("Donate (happy) and fee split", async () => {
    const [platformPda] = await findPlatformPda();

    const donor = Keypair.generate();
    // airdrop donor
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(donor.publicKey, 2 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    const beforeTreasury = await provider.connection.getBalance(platformPda);

    await program.methods
      .donate(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        donor: donor.publicKey,
        platform: platformPda,
        campaign: campaignPda1,
        treasury: platformPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor])
      .rpc();

    const afterTreasury = await provider.connection.getBalance(platformPda);
    const campaignLamports = await provider.connection.getBalance(campaignPda1);

    // 2.5% fee -> 0.025 SOL to treasury, 0.975 SOL to campaign (approx; account rent may affect absolute)
    assert(afterTreasury > beforeTreasury);
    assert(campaignLamports > 0);
  });

  it("Withdraw (allowed when deadline passed or goal reached)", async () => {
    // Donate additional amount to exceed goal after fees
    const [platformPda] = await findPlatformPda();
    const donor2 = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(donor2.publicKey, 2 * LAMPORTS_PER_SOL),
      "confirmed"
    );
    await program.methods
      .donate(new anchor.BN(1 * LAMPORTS_PER_SOL))
      .accounts({
        donor: donor2.publicKey,
        platform: platformPda,
        campaign: campaignPda1,
        treasury: platformPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor2])
      .rpc();

    const creatorBefore = await provider.connection.getBalance(provider.wallet.publicKey);

    await program.methods
      .withdraw()
      .accounts({
        creator: provider.wallet.publicKey,
        campaign: campaignPda1,
      })
      .rpc();

    const creatorAfter = await provider.connection.getBalance(provider.wallet.publicKey);
    assert(creatorAfter >= creatorBefore);
  });

  it("Update campaign (happy)", async () => {
    await program.methods
      .updateCampaign("Toolkit v2", "New description", "https://img")
      .accounts({
        creator: provider.wallet.publicKey,
        campaign: campaignPda1,
      })
      .rpc();

    const c = await program.account.campaign.fetch(campaignPda1);
    assert.equal(c.title, "Toolkit v2");
  });

  it("Update platform settings (happy)", async () => {
    const [platformPda] = await findPlatformPda();

    await program.methods
      .updatePlatformSettings(100)
      .accounts({
        authority: provider.wallet.publicKey,
        platform: platformPda,
      })
      .rpc();

    const platform = await program.account.platform.fetch(platformPda);
    assert.equal(platform.feeBps, 100);
  });

  it("Create campaign (unhappy: title too long)", async () => {
    const [platformPda] = await findPlatformPda();
    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const longTitle = "x".repeat(100);
    const now = Math.floor(Date.now() / 1000);

    await assert.rejects(
      program.methods
        .createCampaign(longTitle, "desc", new anchor.BN(1), new anchor.BN(now + 60), "u")
        .accounts({
          payer: provider.wallet.publicKey,
          platform: platformPda,
          campaign: campaignPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    );
  });

  it("Donate (unhappy: zero amount)", async () => {
    const [platformPda] = await findPlatformPda();

    await assert.rejects(
      program.methods
        .donate(new anchor.BN(0))
        .accounts({
          donor: provider.wallet.publicKey,
          platform: platformPda,
          campaign: campaignPda1,
          treasury: platformPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    );
  });

  it("Withdraw (unhappy: before condition)", async () => {
    // Create a fresh campaign with future deadline and goal big enough
    const [platformPda] = await findPlatformPda();
    const creator = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(creator.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);
    const now = Math.floor(Date.now() / 1000);

    await program.methods
      .createCampaign("NoWithdraw", "", new anchor.BN(10 * LAMPORTS_PER_SOL), new anchor.BN(now + 3600), "")
      .accounts({
        payer: creator.publicKey,
        platform: platformPda,
        campaign: campaignPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([creator])
      .rpc();

    await assert.rejects(
      program.methods
        .withdraw()
        .accounts({ creator: creator.publicKey, campaign: campaignPda })
        .signers([creator])
        .rpc()
    );
  });

  it("Delete campaign (happy when zero raised)", async () => {
    const [platformPda] = await findPlatformPda();
    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);
    const now = Math.floor(Date.now() / 1000);

    await program.methods
      .createCampaign("DeleteMe", "", new anchor.BN(1), new anchor.BN(now + 60), "")
      .accounts({
        payer: provider.wallet.publicKey,
        platform: platformPda,
        campaign: campaignPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    await program.methods
      .deleteCampaign()
      .accounts({ creator: provider.wallet.publicKey, campaign: campaignPda })
      .rpc();
  });

  it("Delete campaign (unhappy when raised > 0)", async () => {
    const [platformPda] = await findPlatformPda();
    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);
    const now = Math.floor(Date.now() / 1000);

    await program.methods
      .createCampaign("CantDelete", "", new anchor.BN(1), new anchor.BN(now + 60), "")
      .accounts({
        payer: provider.wallet.publicKey,
        platform: platformPda,
        campaign: campaignPda,
        systemProgram: SystemProgram.programId,
      })
      .rpc();

    // Donate small amount to set raised > 0
    const donor = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(donor.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    await program.methods
      .donate(new anchor.BN(1_000))
      .accounts({
        donor: donor.publicKey,
        platform: platformPda,
        campaign: campaignPda,
        treasury: platformPda,
        systemProgram: SystemProgram.programId,
      })
      .signers([donor])
      .rpc();

    await assert.rejects(
      program.methods
        .deleteCampaign()
        .accounts({ creator: provider.wallet.publicKey, campaign: campaignPda })
        .rpc()
    );
  });

  it("Initialize platform (unhappy: already initialized)", async () => {
    const [platformPda] = await findPlatformPda();

    await assert.rejects(
      program.methods
        .initializePlatform(250, 0)
        .accounts({
          payer: provider.wallet.publicKey,
          platform: platformPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    );
  });

  it("Update platform settings (unhappy: unauthorized)", async () => {
    const [platformPda] = await findPlatformPda();
    const notAuthority = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(notAuthority.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    await assert.rejects(
      program.methods
        .updatePlatformSettings(500)
        .accounts({
          authority: notAuthority.publicKey,
          platform: platformPda,
        })
        .signers([notAuthority])
        .rpc()
    );
  });

  it("Update campaign (unhappy: unauthorized)", async () => {
    const stranger = Keypair.generate();
    await provider.connection.confirmTransaction(
      await provider.connection.requestAirdrop(stranger.publicKey, 1 * LAMPORTS_PER_SOL),
      "confirmed"
    );

    await assert.rejects(
      program.methods
        .updateCampaign("X", "Y", "Z")
        .accounts({
          creator: stranger.publicKey,
          campaign: campaignPda1,
        })
        .signers([stranger])
        .rpc()
    );
  });

  it("Create campaign (unhappy: deadline in past)", async () => {
    const [platformPda] = await findPlatformPda();
    const platform = await program.account.platform.fetch(platformPda);
    const nextId = Number(platform.campaignCount) + 1;
    const [campaignPda] = findCampaignPdaById(nextId);

    const now = Math.floor(Date.now() / 1000);

    await assert.rejects(
      program.methods
        .createCampaign(
          "PastDeadline",
          "",
          new anchor.BN(1),
          new anchor.BN(1),
          ""
        )
        .accounts({
          payer: provider.wallet.publicKey,
          platform: platformPda,
          campaign: campaignPda,
          systemProgram: SystemProgram.programId,
        })
        .rpc()
    );
  });
}); 