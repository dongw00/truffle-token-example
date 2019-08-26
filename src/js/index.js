App = {
  web3: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 0,

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
    try {
      $.getJSON('TokenCrowdSale.json', crowdSale => {
        App.contracts.TokenCrowdSale = TruffleContract(crowdSale);
        App.contracts.TokenCrowdSale.setProvider(App.web3);
        App.contracts.TokenCrowdSale.deployed().then(instance => {
          console.log(`Token sale address: ${instance.address}`);
        });
      }).done(() => {
        $.getJSON('Token.json', token => {
          App.contracts.Token = TruffleContract(token);
          App.contracts.Token.setProvider(App.web3);
          App.contracts.Token.deployed().then(instance => {
            console.log(`Token address: ${instance.address}`);
          });

          App.listenForEvents();
          return App.render();
        });
      });
    } catch (error) {
      alert('Contract를 불러오는데 실패했습니다.');
      console.error(error);
    }
  },

  listenForEvents: function() {
    App.contracts.TokenCrowdSale.deployed().then(instance => {
      instance
        .TokensPurchased(
          {},
          {
            fromBlock: 0,
            toBlock: 'latest',
          }
        )
        .watch((err, evt) => {
          console.log(`😎 Event triggered`);
          console.dir(evt);
          App.render();
        });
    });
  },

  render: async function() {
    if (App.loading) return;
    App.loading = true;

    $('#loader').show();
    $('#content').hide();

    /* Load account data */
    web3.eth.getCoinbase((err, account) => {
      if (!err) {
        App.account = account;
        $('#accountAddress').html(`Your account: ${account}`);
      }
    });

    const tokenInstance = await App.contracts.Token.deployed();
    const crowdSaleInstance = await App.contracts.TokenCrowdSale.deployed();

    /* Token price */
    const rate = (await crowdSaleInstance.rate()).toNumber();
    const tokenPrice = (1 / rate) * web3.toWei(1, 'ether');
    $('#token-price').html(web3.fromWei(tokenPrice, 'ether'));

    /* My token balance */
    const symbol = await tokenInstance.symbol();
    const balance = (await tokenInstance.balanceOf(App.account)).toString();
    $('#dapp-balance').html(`${web3.fromWei(balance, 'ether')} ${symbol}`);

    /* Token sold */
    const tokenSold = (await crowdSaleInstance.weiRaised()).toString();
    const cap = (await crowdSaleInstance.cap()).toString();
    $('#tokens-sold').html(web3.fromWei(tokenSold, 'ether'));
    $('#tokens-available').html(web3.fromWei(cap, 'ether'));

    /* ICO progress status */
    const progressPercent = (Math.ceil(tokenSold) / cap) * 100;
    $('#progress').css('width', `${progressPercent}%`);

    App.loading = false;
    $('#loader').hide();
    $('#content').show();
  },

  buyTokens: async function() {
    $('#loader').show();
    $('#content').hide();

    const tokenValue = $('#numberOfTokens').val();

    App.contracts.TokenCrowdSale.deployed().then(instance => {
      return instance
        .buyTokens(App.account, {
          from: App.account,
          value: web3.toWei(tokenValue, 'ether'),
        })
        .then(res => {
          alert('토큰을 구매하였습니다.');
          $('form').trigger('reset');
        });
    });
  },
};

$(function() {
  $(window).load(function() {
    App.initWeb3();
  });
});
