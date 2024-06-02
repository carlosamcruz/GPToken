import React, { useRef, FC, useState} from 'react';

import './App.css';

import { DefaultProvider, sha256, toHex, PubKey, bsv, TestWallet, buildPublicKeyHashScript,
   findSig, SignatureResponse, PubKeyHash, PandaSigner} from "scrypt-ts";

import { GeneralTokenV2 } from "./contracts/generaltokenV2";

import {homepvtKey, homenetwork, feeService, utxoFeeAdd1, browserWallet, compState} from './Page02Access';
import { getSpentOutput} from './mProviders';
import { sleep, scriptUxtoSize, hexToLittleEndian } from "./myUtils";

const provider = new DefaultProvider({network: homenetwork});
let Alice: TestWallet
let signerPanda: PandaSigner

let txlink2 = ""

interface props1 {
  passedData: string;
}

const PageSC09GPTokenSplit: FC<props1> = (props) => {  

  const [deployedtxid, setdeptxid] = useState("");
  const [linkUrl, setLinkUrl] = useState("");
  const txid = useRef<any>(null);
  const txidPrvStt = useRef<any>(null);
  const tokenIndex = useRef<any>(null);
  const nTokenSend = useRef<any>('0');
  const receiverPBK = useRef<any>(null);

  const interact = async (amount: any) => {
    setdeptxid("Wait!!!")

    //Para evitar o problema:  Should connect to a livenet provider
    //Bypassar o provider externo e const
    let provider = new DefaultProvider({network: homenetwork});

    if((txid.current.value.length === 64 || txidPrvStt.current.value.length === 64) 
      && ((parseInt(nTokenSend.current.value, 10) > 0) || props.passedData === 'Transfer' )
      &&((receiverPBK.current.value).length > 10)
      )
    {
  
      try {

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
  
        //const message = toByteString('hello world', true)
        let tx = new bsv.Transaction

        //////////////////////////////////////////////////////
        //Jesus is the Lord
        //////////////////////////////////////////////////////
          
        if(txid.current.value.length === 64)
        {
            tx = await provider.getTransaction(txid.current.value)
        }
        else if(txidPrvStt.current.value.length === 64)
        {
            let currentStateTXID = txidPrvStt.current.value
            let stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
      
            while(stxos[0].inputIndex !== -1)
            {
              currentStateTXID = stxos[0].txId;
      
              await sleep(500);
      
              stxos = await getSpentOutput(currentStateTXID, 0, homenetwork)
              //console.log("TX Output ", i, " spent on:", stxos[0].txId)
              console.log("Input:", stxos[0].inputIndex)
            }
      
            tx = await provider.getTransaction(currentStateTXID)
      
        }
    
        //////////////////////////////////////////////////////
        //////////////////////////////////////////////////////
  
    
        console.log('Current State TXID: ', tx.id)
  
        //const instance = Helloworld02.fromTx(tx, 0)

        let finish = false
        let newData = '';

        let posNew1 = 0 // Output Index of the Contract in the Current State TX

        if(tokenIndex.current.value === '1')
        {
          posNew1 = 1
        }

        //let instance2 = GeneralToken.fromTx(tx, posNew1)
        let instance2 = GeneralTokenV2.fromTx(tx, posNew1)
        //Inform to the system the right output index of the contract and its sequence
        tx.pvTxIdx(tx.id, posNew1, sha256(tx.outputs[posNew1].script.toHex()))
    
        //let pbkey = bsv.PublicKey.fromPrivateKey(privateKey)

        let numberOfSendTokens = instance2.thisSupply;

        if(props.passedData === 'Split')
        {
          numberOfSendTokens = BigInt(parseInt(nTokenSend.current.value, 10))
        }

        let toNewOwner = PubKeyHash(toHex(bsv.Address.fromString(receiverPBK.current.value).hashBuffer))

        ////////////////////////////////////////////////////////
        //Para o calculo da Taxa de Serviço
        ////////////////////////////////////////////////////////
        let utxoFeeFlag = false;

        if(feeService > 0)
          utxoFeeFlag = true

        let utxoFee =  new bsv.Transaction().addOutput(new bsv.Transaction.Output({
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

        const balance = instance2.balance
        const nextInstance = instance2.next()
       
        await instance2.connect(signer)

        instance2.bindTxBuilder('split', async function () {

          //const changeAddress = bsv.Address.fromPrivateKey(privateKey)

          //Alert Address

          const alertAddress = bsv.Address.fromString(receiverPBK.current.value)
     
          const unsignedTx: bsv.Transaction = new bsv.Transaction()
          .addInputFromPrevTx(tx, posNew1)

          if(utxoFeeFlag)
          {
            if(nextInstance.thisSupply === numberOfSendTokens)
            {
                nextInstance.alice = toNewOwner
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: balance,
                }))
  
                //Alert Address
                unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                  satoshis: 1,
                }))
                
                unsignedTx.addOutput(utxoFee.outputs[0])

                .change(changeAddress)
            }
            else
            {                               
                nextInstance.thisSupply = nextInstance.thisSupply - numberOfSendTokens
  
                let prvLockingScript = nextInstance.lockingScript;
                 
                nextInstance.alice = toNewOwner
                nextInstance.thisSupply = numberOfSendTokens
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: balance,
                }))
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: prvLockingScript,
                    satoshis: balance,
                }))
  
                //Alert Address
                unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                  satoshis: 1,
                }))
                
                unsignedTx.addOutput(utxoFee.outputs[0])

                .change(changeAddress)
            }            
          }
          else
          {
            if(nextInstance.thisSupply === numberOfSendTokens)
            {
                nextInstance.alice = toNewOwner
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: balance,
                }))
  
                //Alert Address
                unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                  satoshis: 1,
                })).change(changeAddress)
            }
            else
            {                               
                nextInstance.thisSupply = nextInstance.thisSupply - numberOfSendTokens
  
                let prvLockingScript = nextInstance.lockingScript;
                 
                nextInstance.alice = toNewOwner
                nextInstance.thisSupply = numberOfSendTokens
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: nextInstance.lockingScript,
                    satoshis: balance,
                }))
  
                unsignedTx.addOutput(new bsv.Transaction.Output({
                    script: prvLockingScript,
                    satoshis: balance,
                }))
  
                //Alert Address
                unsignedTx.addOutput(new bsv.Transaction.Output({
                  script: bsv.Script.buildPublicKeyHashOut(alertAddress),
                  satoshis: 1,
                })).change(changeAddress)
            }            
          }
                        
          return Promise.resolve({
              tx: unsignedTx,
              atInputIndex: 0,
              nexts: [
              ]
          });              
        });
        
        const { tx: callTx } = await instance2.methods.split(
            // the first argument `sig` is replaced by a callback function which will return the needed signature
            (sigResps: SignatureResponse[]) => findSig(sigResps, pbkey), PubKey(toHex(pbkey)),
            numberOfSendTokens,
            toNewOwner, utxo2Fee//PubKey(toHex(pbkeyBob))
        )
        console.log( 'TXID: ', callTx.id)
                
        if(homenetwork === bsv.Networks.mainnet )
        {
          txlink2 = "https://whatsonchain.com/tx/" + callTx.id;
        }
        else if (homenetwork === bsv.Networks.testnet )
        {
          txlink2 = "https://test.whatsonchain.com/tx/" + callTx.id;
        }
        setLinkUrl(txlink2);
  
        setdeptxid(callTx.id)
    
      } catch (e) {
        console.error(props.passedData + ' fails', e)
        alert(props.passedData + ' fails')
        setdeptxid("")
      }
    }
    else
    {
      alert('Wrong TXID Format / or Number to Split / of SEC Format')
      setdeptxid("Try Again!!!")
    }
  };

  return (
    <div className="App">
        <header className="App-header">

        <h2 style={{ fontSize: '34px', paddingBottom: '5px', paddingTop: '5px'}}>

          <meta name="viewport" content="width=device-width, initial-scale=1.0"></meta>   
          General Purpose Token - {props.passedData}
          
        </h2>
       
        <div>

          <div style={{ textAlign: 'center' , paddingBottom: '20px' }}>
                
                <label style={{ fontSize: '14px', paddingBottom: '2px' }}
                  >Inform Current or Previous State TXID:  
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txid} type="hex" name="PVTKEY1" min="1" placeholder="current state" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={txidPrvStt} type="hex" name="PVTKEY1" min="1" placeholder="pevious state (optional)" />
                </label>     
          </div>

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={tokenIndex} type="number" name="PVTKEY1" min="1" placeholder="0 or 1 (0 default)" />
                </label>     
          </div>

          {
            props.passedData === 'Split'?

            <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                  <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                  > 
                      <input ref={nTokenSend} type="number" name="PVTKEY1" min="1" placeholder="n token to split (min 1)" />
                  </label>     
            </div>
            :
            ''
          }

          <div style={{ textAlign: 'center', paddingBottom: '20px' }}>
                <label style={{ fontSize: '14px', paddingBottom: '5px' }}  
                > 
                    <input ref={receiverPBK} type="hex" name="PVTKEY1" min="1" placeholder="Receiver Address" />
                </label>     
          </div>


          <div style={{ textAlign: 'center' }}>     
                <button className="insert" onClick={interact}
                    style={{ fontSize: '14px', paddingBottom: '2px', marginLeft: '0px'}}
                >{props.passedData} </button>
          </div>

        </div>


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

export default PageSC09GPTokenSplit;
