import React, { useRef, FC, useState} from 'react';

import './App.css';

import { DefaultProvider, toHex, bsv, TestWallet, PubKeyHash, hash160, PandaSigner } from "scrypt-ts";

import { GeneralTokenV2 } from "./contracts/generaltokenV2";
import { dataFormatScryptSC, stringToHex} from "./myUtils";

import {homepvtKey, homenetwork, browserWallet} from './Page02Access';

//const provider = new DefaultProvider({network: bsv.Networks.testnet});
const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerPanda: PandaSigner

function PageSC07GPTokenCreate() {

  const [deployedtxid, setdeptxid] = useState("");
  const labelRef = useRef<HTMLLabelElement | null>(null);
  const [linkUrl, setLinkUrl] = useState("");
  let txlink2 = ""
  const nTokens = useRef<any>(null);
  const value = useRef<any>(null);
  const idData = useRef<any>(null);

  const deploy = async (amount: any) => {

    if((homepvtKey.length != 64 && browserWallet == false) || value.current.value < 1 || nTokens.current.value < 1)
    {
      alert('No PVT KEY or wrong data!!!')
    }
    else
    {
      setdeptxid("Wait!!!")

      //Para evitar o problema:  Should connect to a livenet provider
      //Bypassar o provider externo e const
      let provider = new DefaultProvider({network: homenetwork});

      //let privateKey //= bsv.PrivateKey.fromHex(homepvtKey, homenetwork)
      
      //let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)
      //Alice = new TestWallet(privateKey, provider)

      try {

        const amount = value.current.value

        let signer
        let pubKey //= bsv.PublicKey.fromPrivateKey(privateKey)

        if(!browserWallet)
        {
          let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork)
          Alice = new TestWallet(privateKey, provider)
          signer = Alice
          await signer.connect(provider)
          pubKey = bsv.PublicKey.fromPrivateKey(privateKey)
        }
        else
        {
          signerPanda = new PandaSigner(provider)
          signer = signerPanda          
        
          const { isAuthenticated, error } = await signer.requestAuth()
          if (!isAuthenticated) {
            alert(`Buyer's Yours wallet is not connected: ${error}`)
          }
          pubKey = await signer.getDefaultPubKey()
        }

        //let pubKey = bsv.PublicKey.fromPrivateKey(privateKey)

        //Description of the token
        //idData Deve ser enviado em HEX format, a menos que já esteja no formato Hex
        let description = dataFormatScryptSC(stringToHex(idData.current.value), '') 

        //const instance = new GeneralToken(PubKey(toHex(pubKey)), BigInt(nTokens.current.value), description)
        const instance = new GeneralTokenV2(PubKeyHash(hash160(toHex(pubKey))), BigInt(nTokens.current.value), description)
        
        await instance.connect(signer);

        console.log('Até aqui: ')
        const deployTx = await instance.deploy(amount)
        console.log('GP Token contract deployed: ', deployTx.id)
        //alert('deployed: ' + deployTx.id)
        
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + deployTx.id;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + deployTx.id;
        }
        setLinkUrl(txlink2);
  
        setdeptxid(deployTx.id)

      } catch (e) {
        console.error('deploy GPToken failes', e)
        alert('deploy GPToken failes')
      }
    }
  };

  return (
    <div className="App">

        <header className="App-header">
          

        <h2 style={{ fontSize: '34px', paddingBottom: '20px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>
          General Purpose Token - Create
        
        </h2>

        <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                  
                  <label style={{ fontSize: '14px', paddingBottom: '5px' }}
                    >Inform Tetherd Satoshis and Units of Token then Press Deploy:  
                  </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={value} type="number" name="PVTKEY1" min="1" placeholder="satoshis (min 1 sat)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={nTokens} type="number" name="PVTKEY1" min="1" placeholder="units of token (min 1)" />
                </label>     
        </div>

        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
            <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
                > 
                    <input ref={idData} type="text" name="PVTKEY1" min="1" placeholder="description (optional)" />
                </label>     
        </div>

        <button className="insert" onClick={deploy}
                style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '5px'}}
        >Deploy</button>
                              
        {
          deployedtxid.length === 64?
          
         /* <button onClick={handleCopyClick}>Copy to ClipBoard</button> */

          <div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '0px', paddingTop: '20px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {deployedtxid} </p>
            </div>
            <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                  <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                  {linkUrl}</a></p>
            </div>
          </div>
          
          :

          <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '20px' }}>
            <p className="responsive-label" style={{ fontSize: '12px' }}>{deployedtxid} </p>
          </div>
          
      }

      </header>
    </div>
  );
}

export default PageSC07GPTokenCreate;
