App = {
  web3: null,
  contracts: {},
  account: '0x0',
  loading: false,
  tokenPrice: 0,
  tokenAvailable: 750000,

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
          console.log(`😎 Event triggered ${event}`);
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
    const rate = await crowdSaleInstance.rate();
    $('#token-price').html(web3.fromWei(rate.toNumber(), 'ether'));

    /* Token sold */
    const tokenSold = await crowdSaleInstance.weiRaised();
    const cap = await crowdSaleInstance.cap();
    $('#tokens-sold').html(tokenSold.toNumber());
    $('#tokens-available').html(web3.fromWei(cap.toNumber(), 'ether'));
    const progressPercent = (Math.ceil(tokenSold) / cap) * 100;
    $('#progress').css('width', `${progressPercent}%`);

    $('#loader').hide();
    $('#content').show();
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
