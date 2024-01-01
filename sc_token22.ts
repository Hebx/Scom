
import { createV1, updateV1 ,Collection, CreateMetadataAccountV3InstructionAccounts, CreateMetadataAccountV3InstructionDataArgs, Creator, MPL_TOKEN_METADATA_PROGRAM_ID, UpdateMetadataAccountV2InstructionAccounts, UpdateMetadataAccountV2InstructionData, Uses, createMetadataAccountV3, updateMetadataAccountV2, findMetadataPda, CreateV1InstructionAccounts, CreateV1InstructionData, TokenStandard, CollectionDetails, PrintSupply, UpdateV1InstructionData, UpdateV1InstructionAccounts, Data, printSupply} from "@metaplex-foundation/mpl-token-metadata";
import * as web3 from "@solana/web3.js";
import { PublicKey, createSignerFromKeypair, none, percentAmount, publicKey, signerIdentity, some } from "@metaplex-foundation/umi";
import { createUmi } from '@metaplex-foundation/umi-bundle-defaults';
import { fromWeb3JsKeypair, fromWeb3JsPublicKey} from '@metaplex-foundation/umi-web3js-adapters';
import * as bs58 from "bs58";

const SPL_TOKEN_2022_PROGRAM_ID: PublicKey = publicKey(
    'TokenzQdBNbLqP5VEhdkAS6EPFLC1PHnBqCXEpPxuEb'
  );

  
export function loadWalletKey(keypairFile:string): web3.Keypair {
    const fs = require("fs");
    const loaded = web3.Keypair.fromSecretKey(
      new Uint8Array(JSON.parse(fs.readFileSync(keypairFile).toString())),
    );
    return loaded;
  }

const INITIALIZE = true;

async function main(){
    console.log("Scom Coin token-22 Init");
    const myKeypair = loadWalletKey("HebJzEetvddrxDXWAjEr542tWXD494bsTxWRf2x8aVUh.json"); // TO CHANGE
    const mint = new web3.PublicKey("SCM1xJgXeJRYQMVUMyNF7zavNXZ34WEyGViY5ZxFAYj"); // TO CHANGE

    const umi = createUmi("https://api.devnet.solana.com");
    const signer = createSignerFromKeypair(umi, fromWeb3JsKeypair(myKeypair))
    umi.use(signerIdentity(signer, true))

    const ourMetadata = { // TODO change those values!
        name: "Scom Coin", 
        symbol: "SCM",
        uri: "https://raw.githubusercontent.com/Hebx/Scom/main/metadata.json",
    }
    if(INITIALIZE){
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: percentAmount(4,2),
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: CreateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
            splTokenProgram: SPL_TOKEN_2022_PROGRAM_ID
        }
        const data: CreateV1InstructionData = {
            ...onChainData,
            isMutable: true,
            discriminator: 0,
            tokenStandard: TokenStandard.Fungible,
            collectionDetails: none<CollectionDetails>(),
            ruleSet: none<PublicKey>(),
            createV1Discriminator: 0,
            primarySaleHappened: true,
            decimals: none<number>(),
            printSupply: some({ __kind: "Limited", fields: [BigInt(10000000000)] }), // Set printSupply to 10 billion
        }
        const txid = await createV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    } else {
        const onChainData = {
            ...ourMetadata,
            sellerFeeBasisPoints: 0,
            creators: none<Creator[]>(),
            collection: none<Collection>(),
            uses: none<Uses>(),
        }
        const accounts: UpdateV1InstructionAccounts = {
            mint: fromWeb3JsPublicKey(mint),
        }
        const data = {
            discriminator: 0,
            data: some<Data>(onChainData),
            updateV1Discriminator: 0,
        }
        const txid = await updateV1(umi, {...accounts, ...data}).sendAndConfirm(umi);
        console.log(bs58.encode(txid.signature))
    }


}

main();