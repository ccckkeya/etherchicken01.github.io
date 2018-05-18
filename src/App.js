import React, { Component } from 'react';
import Web3 from 'web3';
import Token from './Contract/interface'
import './App.css'
var web3 = window.web3;

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  alert('Please install Metamask plugin first.')
  // window.location.href = 'https://metamask.io/';
}

const Contract = web3.eth.contract(Token.ABI).at(Token.address);
window.Contract = Contract;

class App extends Component {
  constructor() {
    super()
    this.state = {
      farmer: '',
      ownChicken: 0
    }
  }
  componentDidMount() {
    this.setState({ farmer: web3.eth.accounts[0] }, () => {
      // 偵測Metamask帳號更改
      var accountInterval = setInterval(() => {
        if (web3.eth.accounts[0] !== this.state.farmer) {
          this.setState({ farmer: web3.eth.accounts[0] });
        }
        Contract.getMyShrimp({from: this.state.farmer},(e, r) => {
          console.log(r.c[0])
        })
        Contract.getMyEggs({from: this.state.farmer}, (e, r) => {
          console.log(r.c[0])
        })
        Contract.marketEggs((e, r) => {
          console.log(r)
        })
      }, 1000);
    });
  }
  render() {
    return (
      <div className="App">
        <div className="background">
          <div style={{color: 'white', fontSize: '25px', fontWeight: "bold", fontFamily: "monospace"}}>Ethereum Chicken Farm</div>
          <div>{this.state.ownChicken} Chicken</div>

          <div style={{ position: 'absolute', bottom: '0px' }}>
            <a style={{color: 'white'}} href="https://www.freepik.com/free-vector/frame-template-with-chickens-in-the-farm_1472180.htm">Designed by Freepik</a>
          </div>
        </div>
      </div>
    );
  }
}

export default App;
