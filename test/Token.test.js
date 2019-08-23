const { BN, ether } = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const ERC20 = artifacts.require('Token');
const TokenCrowdSale = artifacts.require('TokenCrowdSale');

contract('TokenCrowdSale', function([_, wallet, investor1, investor2]) {
  const _name = 'bitToken';
  const _symbol = 'BTT';
  const _decimals = new BN(18);

  const _rate = new BN(100);

  beforeEach(async () => {
    this.token = await ERC20.new();
    this.wallet = wallet;

    this.crowdSale = await TokenCrowdSale.new(this.wallet, this.token.address);
  });

  describe('🔥 테스트 케이스 1: 토큰이 정확히 생성되었는가?', () => {
    it('1.1. 토큰의 이름이 올바르게 생성되었는가?', async () => {
      const tokenName = await this.token.name();
      expect(tokenName).to.equal(_name);
    });

    it('1.2. 토큰의 심볼이 올바르게 생성되었는가?', async () => {
      const tokenSymbol = await this.token.symbol();
      expect(tokenSymbol).to.equal(_symbol);
    });

    it('1.3. 토큰의 소수점이 올바르게 생성되었는가?', async () => {
      const toKenDecimals = await this.token.decimals();
      expect(toKenDecimals).to.be.bignumber.equal(_decimals);
    });
  });

  describe('🔥 테스트 케이스 2: Crowd 컨트랙트가 올바르게 생성되었는가?', () => {
    it('2.1. 토큰과 이더 교환 비율은 올바른가?', async () => {
      const tokenRate = await this.crowdSale.rate();
      expect(tokenRate).to.be.bignumber.equal(_rate);
    });

    it('2.2. 토큰의 wallet이 올바르게 생성되었는가?', async () => {
      const tokenWallet = await this.crowdSale.wallet();
      expect(tokenWallet).to.equal(this.wallet);
    });

    it('2.3. ICO 토큰이 올바르게 생성 되었는가?', async () => {
      const token = await this.crowdSale.token();
      expect(token).to.equal(token);
    });
  });

  describe('🔥 테스트 케이스 3: Mited crowd 컨트랙트가 올바르게 생성되었는가?', () => {
    // it('3.1. 구매후에 올바르게 mint되는가?', async () => {
    //   const originalTotalSupply = await this.token.totalSupply();
    //   await this.crowdSale
    //     .sendTransaction({
    //       value: new BN(10 ** 18),
    //       from: investor1,
    //     })
    //     .then((err, res) => {
    //       console.log('transaction');
    //       if (!err) console.log(res);
    //       else console.log(err);
    //     });

    //   const newTotalSupply = await this.token.totalSupply();
    //   assert.isTrue(newTotalSupply > originalTotalSupply);
    // });
    it('3.3. asdasd?', async () => {
      await token.addMinter(this.crowdSale.address);
      const result = await this.crowdSale.buyTokens(investor1, {
        value: new BN(1),
        from: investor1,
      });
      expect(result).to.be.fulfilled;
    });
  });
});
