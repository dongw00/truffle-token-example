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

  initContract: function() {
    $.getJSON('Token.json', data => {
      App.contracts.Token = TruffleContract(data);
      App.contracts.Token.setProvider(App.web3);

      return App.tokenInfo();
    });
  },

  tokenInfo: async function() {
    const tokenInstance = await App.contracts.Token.deployed();

    return App.init(tokenInstance);
  },

  init: async function(instance) {
    const defaultAccount = await web3.eth.defaultAccount;
    $('#my_account').text(defaultAccount);

    /* 토큰 이름 */
    const name = await instance.name();
    $('#token_name').text(name);

    /* 토큰 심볼 */
    const symbol = await instance.symbol();
    $('#token_symbol').text(symbol);

    /* 총 발행량 */
    const total = await instance
      .balanceOf(defaultAccount)
      .then(res => web3.fromWei(res.toNumber(), 'ether'));

    $('#token_total').text(`${total} ${symbol}`);

    /* now */
    setInterval(() => {
      $('#now').text(moment().format('YYYY Do dd a h:mm:ss'));
    }, 1000);

    /* ICO start date */
    const start = await instance.start();
    $('#start').text(moment(start * 1000).format('YYYY Do dd a h:mm '));

    /* ICO deadline darte */
    const deadline = await instance.deadline();
    $('#deadline').text(moment(deadline * 1000).format('YYYY Do dd a h:mm'));
  },
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
