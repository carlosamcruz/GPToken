// src/components/Home.tsx
import React, {FC} from 'react';
import { useState, useRef, useEffect } from "react";
import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, ByteString, 
  buildPublicKeyHashScript, findSig, SignatureResponse, PubKeyHash, PandaSigner} from "scrypt-ts";
import './App.css';

import { getTransaction } from './mProviders';

import { GeneralTokenV2 } from "./contracts/generaltokenV2";

import {homepvtKey, homenetwork, compState, utxoFeeAdd1, feeService, browserWallet} from './Page02Access';
import { dataFormatScryptSC, convertBinaryToHexString, stringToHex, scriptUxtoSize, hexToLittleEndian } from "./myUtils";

//const provider = new DefaultProvider({network: homenetwork});
let signer: TestWallet;
let signerPanda: PandaSigner

interface props1 {
  passedData: string;
}

const PageSC08GPTDataSet: FC<props1> = (props) => {

  //const [linkUrl, setLinkUrl] = useState('https://whatsonchain.com/');
  const [linkUrl, setLinkUrl] = useState("");
  const [txid, setTXID] = useState("");
  
  const [waitAlert, setwaitAlert] = useState("Inform Text of File then Press Set Data");

  const [txb, settxb] = useState(true);

  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  
  const [hexStrFileData, setHexString] = useState('');
  const [sendButton, setsendButton] = useState(true);

  const handleFileChange = (event: React.ChangeEvent<HTMLInputElement>) => {

    setwaitAlert("Press Set Data");
    settxb(true)

    const file = event.target.files && event.target.files[0];
    //setSelectedFile(file);

    if (file) {
      setSelectedFile(file);
      // Create a FileReader
      const reader = new FileReader();

      // Define a callback function for when the file is loaded
      reader.onload = (e) => {
        if(e.target)
        {
          const binaryString = e.target.result; // The file data as a binary string
          const hexString = convertBinaryToHexString(binaryString);

          console.log("Data hexString: ", hexString)

          setHexString(hexString);
        }
      };

      // Read the file as an ArrayBuffer
      //reader.readAsArrayBuffer(file);
      reader.readAsBinaryString(file);
    }
  };

  let txtData = useRef<any>(null);
  let cStateTxid = useRef<any>(null);
  let txlink2 = ""
  const tokenIndex = useRef<any>(null);

  const handleSendButton = () => {
    if (sendButton) {
      setsendButton(false)
      writeToChain(0)
    }
  };

  const writeToChain = async (amount: any) => {

    //homepvtKey = localPvtKey.current.value;

    if((homepvtKey.length !== 64 && browserWallet === false))
    {
      alert("Wrong PVT Key");
      settxb(false);
      setLinkUrl("");
      setTXID("")
      setsendButton(true)
      
    }
    
    else if((txtData.current.value === "" && hexStrFileData === "" ) || cStateTxid.current.value.length !== 64)
    {
      alert("Missing Data");
      setsendButton(true)
      setwaitAlert("Inform Text of File then Press Set Data")
    }
    
    else
    {
      setLinkUrl('');
      setTXID('')
      setwaitAlert("Wait!!!");

      console.log('Current State: ', cStateTxid.current.value)

      //////////////////////////////////////////////////////////
      //Data Input
      //////////////////////////////////////////////////////////
      let dataToChain: ByteString = '00'

      let newData = dataToChain;

      newData = hexStrFileData;
      if(hexStrFileData === "")
      {
        newData = stringToHex(txtData.current.value);
      }


      let fileName2 = ''
      if(selectedFile !== null)
      {
        fileName2 = selectedFile.name
      }

      newData = dataFormatScryptSC(newData, fileName2)


      ////////////////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////////////////

      //newData = newData + newDataInfo

      console.log("Data Size: ", newData.length)
      console.log("Data: ", newData)
  
      let provider = new DefaultProvider({network: homenetwork});

      await provider.connect()

      let pbkey: bsv.PublicKey //= bsv.PublicKey.fromPrivateKey(privateKey)
      let signer
      let changeAddress: bsv.Address // = bsv.Address.fromPrivateKey(pvtkey)

      if(!browserWallet)
      {
        let privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);
        //let privateKey = bsv.PrivateKey.fromHexAddComp(homepvtKey, homenetwork, compState);
        privateKey.compAdd(compState); 
        privateKey = bsv.PrivateKey.fromHex(homepvtKey, homenetwork);

        signer = new TestWallet(privateKey, provider)
        await signer.connect(provider)

        pbkey = bsv.PublicKey.fromPrivateKey(privateKey)
        changeAddress = bsv.Address.fromPrivateKey(privateKey)
      }
      else
      {
        signerPanda = new PandaSigner(provider)
        signer = signerPanda          
      
        const { isAuthenticated, error } = await signer.requestAuth()
        if (!isAuthenticated) {
          alert(`Buyer's Yours wallet is not connected: ${error}`)
        }
        pbkey = await signer.getDefaultPubKey()
        changeAddress = await signer.getDefaultAddress()
      }

      let tx3 = new bsv.Transaction      
      tx3 = new bsv.Transaction (await getTransaction(cStateTxid.current.value, homenetwork))
      let finish = false

      console.log('TXID Current State: ', tx3.id)

      let posNew1 = 0 // Output Index of the Contract in the Current State TX

      if(tokenIndex.current.value === '1' )
      {
        posNew1 = 1
      }

      //let instance2 = GeneralToken.fromTx(tx3, posNew1)
      let instance2 = GeneralTokenV2.fromTx(tx3, posNew1)
      //Inform to the system the right output index of the contract and its sequence
      tx3.pvTxIdx(tx3.id, posNew1, sha256(tx3.outputs[posNew1].script.toHex()))
  
      
      //https://scrypt.io/docs/how-to-deploy-and-call-a-contract/#method-with-signatures
  
      const balance = instance2.balance
      const nextInstance = instance2.next()
      //finish = true
  
      if(!finish)
      {
          nextInstance.data = newData;
      }

      //let toNewOwner = PubKeyHash(toHex(bsv.Address.fromString(receiverPBK.current.value).hashBuffer))

      ////////////////////////////////////////////////////////
      //Para o calculo da Taxa de Serviço
      ////////////////////////////////////////////////////////
      let utxoFeeFlag = false;

      if(feeService > 0)
        utxoFeeFlag = true

      let utxoFee =  new bsv.Transaction().addOutput(new bsv.Transaction.Output({
        //script: buildPublicKeyHashScript(hash160(instance2.alice)),
        //script: buildPublicKeyHashScript(instance2.alice),
        script: buildPublicKeyHashScript(PubKeyHash(toHex(bsv.Address.fromString(utxoFeeAdd1).hashBuffer))),
        satoshis: feeService
      }))

      //Tamanho do script formatado
      let out1size = scriptUxtoSize(utxoFee.outputs[0].script.toHex()) 
      let tokenSats = (utxoFee.outputs[0].satoshis).toString(16);
      //console.log("Sat STR 0: ", tokenSats)
      while(tokenSats.length < 16)
      {
        tokenSats = '0' + tokenSats
      }

      //console.log("Token Sat: ", hexToLittleEndian(tokenSats))

      let utxo2Fee = hexToLittleEndian(tokenSats) + out1size + utxoFee.outputs[0].script.toHex()

      if(!utxoFeeFlag)
      {
        utxo2Fee = '';
      }

      //console.log("UTXO Fee: ", utxo2Fee)
      
      ////////////////////////////////////////////////////////
      ////////////////////////////////////////////////////////
              
      await instance2.connect(signer)

      instance2.bindTxBuilder('setupToken', async function () {

        //const changeAddress = bsv.Address.fromPrivateKey(pvtkey)
   
        const unsignedTx: bsv.Transaction = new bsv.Transaction()
        .addInputFromPrevTx(tx3, posNew1)

        if (finish) 
        {
          
          if(utxoFeeFlag)
          {
            unsignedTx.addOutput(new bsv.Transaction.Output({
              //script: buildPublicKeyHashScript(hash160(instance2.alice)),
              script: buildPublicKeyHashScript(instance2.alice),
              satoshis: balance
            }))

            unsignedTx.addOutput(utxoFee.outputs[0])

            .change(changeAddress)

          }
          else
          {
            unsignedTx.addOutput(new bsv.Transaction.Output({
              //script: buildPublicKeyHashScript(hash160(instance2.alice)),
              script: buildPublicKeyHashScript(instance2.alice),
              satoshis: balance
            }))
            .change(changeAddress)
          }

        }
        else
        {
          if(utxoFeeFlag)
          {
            unsignedTx.addOutput(new bsv.Transaction.Output({
                script: nextInstance.lockingScript,
                satoshis: balance,
            }))

            unsignedTx.addOutput(utxoFee.outputs[0])

            .change(changeAddress)

          }
          else
          {
            unsignedTx.addOutput(new bsv.Transaction.Output({
                script: nextInstance.lockingScript,
                satoshis: balance,
            }))
            .change(changeAddress)
          }
        }            

        //console.log('Unsig TX Out: ', toHex(unsignedTx.outputs[0].script))
        return Promise.resolve({
            tx: unsignedTx,
            atInputIndex: 0,
            nexts: [
            ]
        });              
      });


      console.log("Alice PKHASH: ", instance2.alice)
      console.log("Alice PK: ", toHex(pbkey))



      const { tx: callTx } = await instance2.methods.setupToken(

        // the first argument `sig` is replaced by a callback function which will return the needed signature
        (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
        finish,
        newData, utxo2Fee
      )

      console.log('TXID New State: ', callTx.id)     


//////////////////////////////////////////////////////////////


      settxb(true);

      
      
      //const txId = await provider.sendRawTransaction(rawTX)

      //const txId = await broadcast(rawTX, homenetwork)
      const txId = callTx.id

      if(txId.length === 64)
      {

        console.log('\nTXID: ', txId)

        //let txid = "bde9bf800372a80b5896653e7f9828b518516690f6a41f51c2b4552e4de4d26d";
  
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + txId;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + txId;
        }

        setwaitAlert('');

        //setbalance02(0)
        setLinkUrl(txlink2);

        setTXID(txId)
        
        setHexString('')

        setSelectedFile(null);

      }
      else      
      {
        setwaitAlert('');
        setHexString('')
        setLinkUrl('');
        setTXID('')
        alert("Fail to Broadcast!!!");
      }
      setsendButton(true)

    }

  };

  const labelStyle = {
    backgroundColor: 'black',
    color: 'white',
    padding: '5px 5px',
    cursor: 'pointer',
    borderRadius: '5px',
    fontSize: '14px', 
    paddingBottom: '5px'
  };

  return (

    <div className="App-header">
      <h2 style={{ fontSize: '34px', paddingBottom: '0px', paddingTop: '0px'}}>

        <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>

        Genral Purpose Token - Set Data
        {
         /*
        Create {props.passedData} Token
        */
        }
        
      </h2>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={cStateTxid} type="hex" name="PVTKEY1" min="1" placeholder="current state txid" />
              </label>     
          </div>
      </div>

      <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="0 or 1 (0 default)" />
                </label>     
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
              > 
                 {/* <input ref={localPvtKey} type="hex" name="PVTKEY1" min="1" defaultValue={'PVT KEY'} placeholder="hex" />*/}
                 <input ref={txtData} type="text" name="PVTKEY1" min="1" placeholder="text (or file)" />
              </label>     
          </div>
      </div>

      {/*
      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
       
                 <input ref={utxoList} type="text" name="PVTKEY1" min="1" placeholder="UTXO List (optional)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '0px' }}  
              > 
       
                 <input ref={addToSend} type="text" name="PVTKEY1" min="1" placeholder="other owner add (optional)" />
              </label>     
          </div>
      </div>

      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
          <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
              > 
       
                 <input ref={changeAddEx} type="text" name="PVTKEY1" min="1" placeholder="Chage Add (optional)" />
              </label>     
          </div>
      </div>

      */}


      <div>
        <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
            <label  style={labelStyle}>
              Select File
              <input type="file" onChange={handleFileChange} />
            </label>
            {/*selectedFile && (
                    <div>
                        <p style={{ fontSize: '12px', paddingBottom: '0px' }} >
                          {selectedFile.name}</p>
                    </div>
            )
            */}
        </div>
      </div>
      <div>
        <div >
          
            {selectedFile && (
                    <div style={{ display: 'inline-block', textAlign: 'center', justifyContent: 'right', paddingBottom: '20px'}}>
                        <p style={{ fontSize: '12px', paddingBottom: '0px' }} >
                          {selectedFile.name}</p>
                    </div>
            )}
        </div>
      </div>


      <div>
        {
          sendButton?
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
              <button className="insert" onClick={handleSendButton}
                  style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
              >Set Data</button>

          </div>
          :
          <div style={{ display: 'inline-block', textAlign: 'center', paddingBottom: '20px' }}>
              
          <button className="insert" onClick={handleSendButton}
              style={{ fontSize: '14px', paddingBottom: '0px', marginLeft: '0px'}}
          >Set Data</button>
          </div>
        }
      </div>

      {/*
      <div>
        <input type="file" onChange={handleFileChange} />
        {selectedFile && (
          <div>
            <p>Selected File: {"name"}</p>
            
          </div>
        )}
      </div>
      */}

      {
          txb?
          waitAlert ===''?
              <div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TXID: {txid} </p>
                </div>
                <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
                  <p className="responsive-label" style={{ fontSize: '12px' }}>TX link: {' '} 
                      <a href={linkUrl} target="_blank" style={{ fontSize: '12px', color: 'cyan'}}>
                      {linkUrl}</a></p>
                </div>
              </div>
              :
              <div className="label-container" style={{ fontSize: '12px', paddingBottom: '20px', paddingTop: '0px' }}>
              <p className="responsive-label" style={{ fontSize: '12px' }}>{waitAlert} </p>
              </div>  
          :
          ""
      }           

    </div>
  );
};

export default PageSC08GPTDataSet;