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
      myChicken: 0,
      myEggs: 0,
      eggToEth: 0,
      contractBalance: 0,
      ethToEgg: 0,
      moneyToBuy: 0.01,
      showAlert: false
    }
  }
  componentDidMount() {
    this.setState({ farmer: web3.eth.accounts[0] }, () => {
      // 偵測Metamask帳號更改
      var accountInterval = setInterval(() => {
        this.init();
      }, 3000);
    });
  }

  init() {
    if (web3.eth.accounts[0] !== this.state.farmer) {
      this.setState({ farmer: web3.eth.accounts[0] });
    }
    Contract.getMyChicken({ from: this.state.farmer }, (e, r) => {
      if (r) {
        this.setState({ myChicken: web3.toDecimal(r) })
        let productive = web3.toDecimal(r) * 60;
        this.setState({ productive })
      }
    })
    Contract.getMyEggs({ from: this.state.farmer }, (e, r) => {
      if (r) {
        let eggNum = web3.toDecimal(r);
        this.setState({ myEggs: eggNum })

        Contract.getBalance((e, r) => {
          if (r) this.setState({ contractBalance: web3.toDecimal(r) })
        })
      }
    })
    Contract.marketEggs((e, r) => {
      console.log(r)
    })

    let weitospend = web3.toWei(this.state.moneyToBuy, 'ether')
    Contract.calculateEggBuySimple(weitospend, (e, r) => {
      if (!r) return;
      let eggs = web3.toDecimal(r);
      Contract.devFee(eggs, (e, r) => {
        if (r) this.setState({ ethToEgg: eggs - web3.toDecimal(r) })
      });
    });

    Contract.calculateEggSell(this.state.myEggs, (e, r) => {
      if (!r) return;
      let wei = web3.toDecimal(r);
      Contract.devFee(wei, (e, r) => {
        if (r) {
          let fee = web3.toDecimal(r);
          this.setState({ eggToEth: web3.fromWei(wei - fee,'ether')})
        }
      });
    });
  }

  hatchEgg() {
    let referer = window.location.search.replace('?ref=', '').length === 42
      ? window.location.search.replace('?ref=', '')
      : web3.eth.accounts[0]

    Contract.hatchEggs(referer, {
      from: web3.eth.accounts[0],
      // gas: 511700,
      gasPrice: 1100000000
    }, (e, r) => {
      if (e) {
        console.log(e);
        return
      }
      this.showAlert('Success hatch egg!');
    })
  }
  sellEgg() {
    Contract.sellEggs({
      from: web3.eth.accounts[0],
      gasPrice: 1100000000
    }, (e, r) => {
      if (e) {
        console.log(e);
        return
      }
      this.showAlert('Success sell egg!');
    })
  }

  buyEgg() {
    Contract.buyEggs({
      value: parseFloat(this.state.moneyToBuy) * 10 ** 18,
      from: web3.eth.accounts[0],
      gasPrice: 1100000000
    }, (e, r) => {
      if (e) {
        console.log(e);
        return
      }
      this.showAlert('Success buy egg!');
    })
  }

  showAlert(text) {
    this.setState({ alertText: text, showAlert: true });
    setTimeout(() => {
      this.setState({ alertText: "", showAlert: false });
    }, 2000)
  }
  render() {
    return (
      <div className="App">
        <div className="background">
          <div style={{ color: 'white', fontSize: '25px', fontWeight: "bold", fontFamily: "monospace" }}>Ethereum Chicken Farm</div>
          <div>I have {this.state.myChicken} Chicken</div>
          <div>I have {this.state.myEggs} Eggs</div>

          <div>Producing {this.state.productive} eggs per Minute</div>
          <button onClick={() => this.getEgg()} type="button" className="btn btn-info">Get your First Free Chicken</button>

          <button onClick={() => this.hatchEgg()} type="button" className="btn btn-info">Hetch Egg</button>
          <div>You can hatch {Math.floor(this.state.myEggs / 86400)} chickens from {this.state.myEggs} eggs</div>
          <div>
            <button onClick={() => this.sellEgg()} type="button" className="btn btn-info">Sell Egg</button>
            <div>{this.state.myEggs} eggs would sell for {this.state.eggToEth} Ether</div>
          </div>
          <div>
            <button onClick={() => this.buyEgg()} type="button" className="btn btn-info">Buy Egg</button>
            <div>{this.state.ethToEgg} eggs  for <input onChange={(e) => this.setState({ moneyToBuy: e.target.value })} step="0.01" defaultValue="0.01" type="number" /> Ether</div>
          </div>
          <div style={{ position: 'absolute', bottom: '0px' }}>
            <a style={{ color: 'white' }} href="https://www.freepik.com/free-vector/frame-template-with-chickens-in-the-farm_1472180.htm">Designed by Freepik</a>
          </div>
        </div>




        {
          this.state.showAlert
            ?
            <div style={{ width: '30%', position: 'absolute', right: '0', top: '0' }}>
              <div className="alert alert-success" role="alert">
                {this.state.alertText}
              </div>
            </div>
            :
            ''
        }
      </div>
    );
  }
}

export default App;
