import React, { useRef, FC, useState } from 'react';
//import { BrowserRouter as Router, Route, Link } from 'react-router-dom';

import './App.css';

import Page01Home from './Page01Home';
import Page02Access from './Page02Access';

import Page03Read from './Page03Read';

import PageSC07GPTokenCreate from "./PageSC07GPTokenCreate"
import PageSC08GPTDataSet from "./PageSC08GPTDataSet"
import PageSC14GPTokenMelt from "./PageSC14GPTokenMelt"
import PageSC09GPTokenSplit from "./PageSC09GPTokenSplit"
import PageSC10GPTokenMerge from "./PageSC10GPTokenMerge"
import PageSC11GPTokenOrdLock from "./PageSC11GPTokenOrdLock"
import PageSC12GPTokenCancelOrd from "./PageSC12GPTokenCancelOrd"
import PageSC13GPTokenBuy from "./PageSC13GPTokenBuy"


function App() {

  const [currentPage, setCurrentPage] = useState<string>('home00WeBSVmenu');
  const [showHomeDropdown, setShowHomeDropdown] = useState<boolean>(false);
  const [showSCDropdown, setShowSCDropdown] = useState<boolean>(false);
  const [showGPTDropdown, setShowGPTDropdown] = useState<boolean>(false);

  const handlePageChange = (page: string) => {
    setCurrentPage(page);
    setShowHomeDropdown(false);
    setShowSCDropdown(false);
    setShowGPTDropdown(false);
  };

  return (

        <div className="App">

            <nav className="navbar">
              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowHomeDropdown(!showHomeDropdown); 
                                    setShowSCDropdown(false); setShowGPTDropdown(false); 
                                    }}>
                  Home
                </button>
                {showHomeDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" onClick={() => handlePageChange('home')}>
                      Access
                    </button>

                    <button className="dropdown-button" onClick={() => handlePageChange('home00WeBSVmenu')}>
                      Reception
                    </button>

                  </div>
                )}
              </div>

              <div className="dropdown">
                <button className="button" 
                    onClick={() => {setShowSCDropdown(!showSCDropdown); setShowHomeDropdown(false); 
                                    setShowGPTDropdown(false); 
                                   }}>
                  Smart Contracts
                </button>
                {showSCDropdown && (
                  <div className="dropdown-content">

                    <button className="dropdown-button" 
                          onClick={() => {setShowGPTDropdown(!showGPTDropdown);}}>
                        GPToken
                    </button>
                    {showGPTDropdown && (
                        <div className="button">
                          
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto',  marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken01')}>
                            Create
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken02')}>
                            Set Data
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken10')}>
                            Transfer
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken03')}>
                            Split
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken04')}>
                            Merge
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken05')}>
                            O-Lock
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken06')}>
                            O-Cancel
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken07')}>
                            O-Buy
                          </button>
                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken09')}>
                            Details
                          </button>

                          <button className="dropdown-button-right" style={{ border: '1px solid #fff', marginLeft: 'auto', marginRight: '0', 
                          fontSize: '12px',color: 'white', background: '#323a3c', width: '50%'}} onClick={() => handlePageChange('GPToken08')}>
                            Extinguish
                          </button>

                        </div>
                    )}
                  </div>
                )}  
              </div>
            </nav>

            {currentPage === 'home' && <Page02Access passedData={''}/>}            
            {currentPage === 'home00WeBSVmenu' && <Page01Home />}
        
            {currentPage === 'GPToken01' && <PageSC07GPTokenCreate/>}
            {currentPage === 'GPToken02' && <PageSC08GPTDataSet passedData={'GPT'}/>}
            {currentPage === 'GPToken03' && <PageSC09GPTokenSplit passedData={'Split'}/>}
            {currentPage === 'GPToken04' && <PageSC10GPTokenMerge/>}
            {currentPage === 'GPToken05' && <PageSC11GPTokenOrdLock/>}
            {currentPage === 'GPToken06' && <PageSC12GPTokenCancelOrd/>}
            {currentPage === 'GPToken07' && <PageSC13GPTokenBuy/>}
            {currentPage === 'GPToken08' && <PageSC14GPTokenMelt/>}
            {currentPage === 'GPToken09' && <Page03Read passedData={'GPToken'}/>}
            {currentPage === 'GPToken10' && <PageSC09GPTokenSplit passedData={'Transfer'}/>}

        </div>
  );
}

export default App;
