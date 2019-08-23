App = {
  web3: null,
  contracts: {},

  initWeb3: async function() {
    if (window.ethereum) {
      App.web3 = window.ethereum;
      try {
        // Metamask랑 연동
        await window.ethereum.enable();
      } catch (error) {
        alert('Metamask와 연동에 실패했습니다.');
        console.error(error);
      }
    }
    // 예전 Browser
    else if (window.web3) {
      App.web3 = window.web3.currentProvider;
    }
    // 지원하지 않는 Browser
    else {
      console.log('Connected Ganache server');
      App.web3Provider = new Web3.providers.HttpProvider(
        'http://localhost:7545'
      );
    }

    web3 = new Web3(App.web3);

    return App.initContract();
  },

  initContract: async function() {
    try {
      await $.getJSON('Token.json', data => {
        App.contracts.Token = TruffleContract(data);
        App.contracts.Token.setProvider(App.web3);
      });

      await $.getJSON('TokenCrowdSale.json', data => {
        App.contracts.TokenCrowdSale = TruffleContract(data);
        App.contracts.TokenCrowdSale.setProvider(App.web3);
      });
      debugger;

      return App.tokenInfo();
    } catch (error) {
      alert('Contract를 불러오는데 실패했습니다.');
      console.error(error);
    }
  },

  tokenInfo: async function() {
    const tokenInstance = await App.contracts.Token.deployed();
    const crowdInstance = await App.contracts.TokenCrowdSale.deployed();

    const checkMinter = await tokenInstance.isMinter(crowdInstance.address);
    if (!checkMinter) await tokenInstance.addMinter(crowdInstance.address);
    debugger;

    return App.init(tokenInstance, crowdInstance);
  },

  init: async function(tokenInstance, crowdInstance) {
    /* 현재 계좌 */
    const defaultAccount = await web3.eth.defaultAccount;
    $('#my_account').text(defaultAccount);

    /* 토큰 이름 */
    const name = await tokenInstance.name();
    $('#token_name').text(name);

    /* 토큰 심볼 */
    const symbol = await tokenInstance.symbol();
    $('#token_symbol').text(symbol);

    /* 총 발행량 */
    const total = await tokenInstance.totalSupply().then(res => {
      return web3.fromWei(res.toNumber(), 'ether');
    });
    $('#token_total').text(`${total} ${symbol}`);

    /* now */
    setInterval(() => {
      $('#now').text(moment().format('YYYY. MMM. do a h:mm:ss'));
    }, 1000);

    /* ICO start date */
    const start = await crowdInstance.openingTime();
    $('#start').text(moment(start * 1000).format('YYYY. MMM. do a h:mm '));

    /* ICO deadline darte */
    const deadline = await crowdInstance.closingTime();
    $('#deadline').text(moment(deadline * 1000).format('YYYY. MMM. do a h:mm'));

    /* 총 판매량 */
    const saleStatus = await crowdInstance.weiRaised().then(res => {
      return web3.fromWei(res.toNumber(), 'ether');
    });
    $('#saleStatus').text(`${saleStatus} ${symbol}`);

    /* 남은 수량 */
    const cap = await crowdInstance.cap().then(res => {
      return web3.fromWei(res.toNumber());
    });

    $('#restStatus').text(`${cap - saleStatus} ${symbol}`);

    $('#invest').click(async () => {
      const value = web3.toWei($('#eth').val());
      crowdInstance.buyTokens(defaultAccount, { value: value });
    });
  },
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
