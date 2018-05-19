import React, { Component } from 'react';
import Web3 from 'web3';
import Token from './Contract/interface'
import './App.css'
import { Modal } from 'react-pure-css-modal';
var web3 = window.web3;

if (typeof web3 !== 'undefined') {
  var web3 = new Web3(web3.currentProvider);
} else {
  alert('Please install Metamask plugin first.')
  window.location = "https://chrome.google.com/webstore/detail/metamask/nkbihfbeogaeaoehlefnkodbefgpgknn"
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
      console.log(web3.eth.accounts[0])
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
          this.setState({ eggToEth: web3.fromWei(wei - fee, 'ether') })
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

  getFreeChicken() {
    Contract.getFreeCHICKEN({
      from: web3.eth.accounts[0],
      gasPrice: 1100000000
    }, (e, r) => {
      if (e) {
        console.log(e);
        return
      }
      this.showAlert('Success get free chicken!');
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
        <div style={{padding: '25px'}} className="background">
          <div style={{ position: 'absolute', top: '5px', left: '5px' }}>Address: {web3.eth.accounts[0]}</div>
          <button onClick={() => document.getElementById('howToPlayModal').click()} style={{ position: 'absolute', right: 0, top: 0 }} type="button" className="btn btn-outline-secondary">How to Play</button>

          <div style={{ color: 'white', fontSize: '25px', fontWeight: "bold", fontFamily: "monospace" }}>Ethereum Chicken</div>

          <div style={{ marginTop: '130px' }}>
            <div>I have {this.state.myChicken} Chicken</div>
            <div>I have {this.state.myEggs} Eggs</div>

            <div>Producing {this.state.productive} eggs per Minute</div>


            <br />
            {this.state.myChicken === 0
              ? <button style={{ marginRight: '20px' }} onClick={() => this.getFreeChicken()} type="button" className="btn btn-info">Get your First Free Chicken</button>
              : ''
            }
            <button onClick={() => this.hatchEgg()} type="button" className="btn btn-info">Hetch Egg</button>
            <div>You can hatch {Math.floor(this.state.myEggs / 86400)} chickens from {this.state.myEggs} eggs</div>
            <br />
            <div>
              <button onClick={() => this.sellEgg()} type="button" className="btn btn-info">Sell Egg</button>
              <div>{this.state.myEggs} eggs would sell for {parseFloat(this.state.eggToEth).toFixed(7)} Ether</div>
            </div>
            <br />

            <div>
              <button onClick={() => this.buyEgg()} type="button" className="btn btn-info">Buy Egg</button>
              <div style={{ marginTop: '5px' }}>{this.state.ethToEgg} eggs  for <input style={{ width: '70px' }} onChange={(e) => this.setState({ moneyToBuy: e.target.value })} step="0.01" defaultValue="0.01" type="number" /> Ether</div>
            </div>
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
        <Modal style={{ width: '80%', left: '10%', height: '400px', padding: '10px' }} id="howToPlayModal" onClose={() => { console.log("Modal close") }} >
          <div>
            <div style={{ fontWeight: "bold" }}>
              Ethereum Chicken
            </div>
            <br />
            Ether Chicken is the #1 chicken farming simulator and idle game on the blockchain. The more chicken you have, the more eggs they lay <br />(each chicken lays at a rate of 1 per second). Hatch more chicken with your eggs to multiply your production, or cash them out for Ethereum!
        </div><br />
          <div>
            <div style={{ fontWeight: "bold" }}>Automated Market</div>
            <br />
            Ether Chicken features a high tech automated market that lets you instantly buy or sell chicken eggs with a single transaction. <br />Driven by supply and demand, the price automatically adjusts as players trade.
        </div><br />
          <div>
            <div style={{ fontWeight: "bold" }}>Referrals</div>
            <br />
            Earn 20% the number of all eggs hatched by anyone who starts playing using your link:<br /> <a href={`https://etherchicken.com?ref=${web3.eth.accounts[0]}`}>{`https://etherchicken.com?ref=${web3.eth.accounts[0]}`}</a>
          </div>
        </Modal>
      </div>
    );
  }
}

export default App;
