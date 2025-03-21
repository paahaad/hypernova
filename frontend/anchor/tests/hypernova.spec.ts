import * as anchor from "@coral-xyz/anchor";
import { Program } from "@coral-xyz/anchor";
import {
  PublicKey,
} from "@solana/web3.js";
import { Hypernova } from "../target/types/hypernova";
import { BankrunProvider, startAnchor } from "anchor-bankrun";



const IDL = require("../target/idl/hypernova.json");

const hypernovaAddress = new PublicKey(
  "9YE8AZ2MReBge5sXGAXCosjK5pAMX3vqmEVddJQPiTjL"
);

describe("Hypernova", () => {
  let ctx;
  let provider: BankrunProvider;
  let hypernova: anchor.Program<Hypernova>;
  let tokenMint: PublicKey;
  let tokenId: number;

  beforeAll(async () => {
    ctx = await startAnchor(
      "",
      [
        {
          name: "hypernova",
          programId: hypernovaAddress,
        },
      ],
      []
    );

    provider = new BankrunProvider(ctx);

    hypernova = new Program<Hypernova>(IDL, provider);

  });

  it("should create a token and mint it successfully", async () => {
    try {
      // Arrange
      const id = Math.floor(10 + Math.random() * 90);
      const startTime = new anchor.BN(Date.now() / 1000);
      const endTime = new anchor.BN(startTime.toNumber() + 86400); // 1 day later
      const values = {
        name: "Test Token",
        symbol: "TTK",
        uri: "https://example.com/token.json",
        totalSupply: new anchor.BN(1000000),
        tokenPrice: new anchor.BN(100),
        minPurchase: new anchor.BN(10),
        maxPurchase: new anchor.BN(1000),
        ticker: new anchor.BN(1),
        presalePercentage: 50,
        startTime,
        endTime,
      };
  
      const [mintPDA] = PublicKey.findProgramAddressSync(
        [
          Buffer.from("mint"),
          provider.wallet.publicKey.toBuffer(),
          new anchor.BN(id).toArrayLike(Buffer, "le", 8),
        ],
        hypernova.programId
      );
      tokenMint = mintPDA;
      tokenId = id;
  
      const [presalePDA] = PublicKey.findProgramAddressSync(
        [Buffer.from("presale"), mintPDA.toBuffer()],
        hypernova.programId
      );
  
      // Act
      const tx1 = await hypernova.methods
        .createToken(
          new anchor.BN(id),
          startTime,
          endTime,
          values.ticker,
          values.name,
          values.symbol,
          values.uri,
          values.totalSupply,
          values.tokenPrice,
          values.minPurchase,
          values.maxPurchase,
          values.presalePercentage
        )
        .accounts({
          payer: provider.wallet.publicKey,
        })
        .rpc();
  
      console.log("Token creation success:", tx1);
  
      // Assert: Fetch the presale account and verify values
      const presaleAccount = await hypernova.account.presaleInfo.fetch(presalePDA);

      // Mint Token
      const tx2 = await hypernova.methods
        .mintToken(new anchor.BN(tokenId))
        .accounts({
          payer: provider.wallet.publicKey,
        })
        .rpc();
  
      console.log("Minting success:", tx2);
  
      // // Assert: Check token balance
      // const associatedTokenPresale = await getAssociatedTokenAddress(
      //   mintPDA,
      //   mintPDA,
      //   true
      // );
  
      // const balance = await getTokenAccountBalance(
      //   associatedTokenPresale,
      //   provider.connection
      // );
  
  
    } catch (err) {
      console.error("Test failed:", err);
    }
  });
  

  it("Buy from Presale Pool", async () => {
    const mintAddress = new PublicKey("FWymbeEBoKAUz4MW7EwPocNnc1tBuJFo2gfAac4KiFfK");
    const amount = 1;
    const [presalePDA, bump] = PublicKey.findProgramAddressSync(
      [Buffer.from("presale"), mintAddress.toBuffer()],
      hypernova.programId
    );
    
    console.log("equivelent PDA", presalePDA.toBase58(), amount)

    let tx =  await hypernova.methods.purchase(
      new anchor.BN(50),
      new anchor.BN(amount)
    ).accounts({
      user: provider.wallet.payer.publicKey,
      mintAccount: mintAddress,
    })
    .signers([provider.wallet.payer])
    .rpc()
  })
})
