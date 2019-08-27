const {
  BN,
  ether,
  expectRevert,
  balance,
} = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const ERC20 = artifacts.require('Token');
const TokenCrowdSale = artifacts.require('TokenCrowdSale');

contract('TokenCrowdSale', function([deployer, wallet, investor1, investor2]) {
  const cap = ether('1000');
  const rate = new BN(100);
  const tokenSupply = ether('50000');

  beforeEach(async () => {
    this.token = await ERC20.new({ from: deployer });
    this.crowdSale = await TokenCrowdSale.new(wallet, this.token.address);

    await this.token.addMinter(this.crowdSale.address, { from: deployer });
    await this.token.renounceMinter({ from: deployer });
  });

  describe('🔥 테스트 케이스 1: Crowd 컨트랙트가 올바르게 생성되었는가?', () => {
    it('1.1. Crowd 컨트랙트에서 토큰의 교환비율이 올바르게 설정되어있는가?', async () => {
      const tokenRate = (await this.crowdSale.rate()).toString();
      expect(new BN(tokenRate)).to.be.bignumber.equal(rate);
    });

    it('1.2. 토큰의 wallet이 올바르게 생성되었는가?', async () => {
      const tokenWallet = await this.crowdSale.wallet();
      expect(tokenWallet).to.equal(wallet);
    });

    it('1.3. Crowd 컨트랙트의 토큰 Contract Address가 올바르게 생성 되었는가?', async () => {
      const tokenAddress = await this.crowdSale.token();
      expect(tokenAddress).to.equal(this.token.address);
    });

    it('1.4. Crowd 컨트랙트의 토큰 cap 범위가 올바르게 생성 되었는가?', async () => {
      const tokenCap = (await this.crowdSale.cap()).toString();
      expect(new BN(tokenCap)).to.be.bignumber.equal(cap);
    });

    it('1.5. Crowd 컨트랙트가 minter 권한을 가지고 있는가?', async () => {
      const isMinter = await this.token.isMinter(this.crowdSale.address);
      expect(isMinter).to.be.true;
    });
  });

  describe('🔥 테스트 케이스 2: Crowd 컨트랙트가 올바르게 동작되는가?', () => {
    it('2.1. Crowd 컨트랙트에서 토큰 구입이 정상적으로 동작되는가?', async () => {
      const investmentAmount = ether('0.01');
      const expectedTokenAmount = rate.mul(investmentAmount);

      await this.crowdSale.send(investmentAmount);
      await this.crowdSale.buyTokens(investor1, {
        value: investmentAmount,
        from: investor1,
      });

      const expectedBalance = await this.token.balanceOf(investor1);
      expect(expectedBalance).to.be.bignumber.equal(expectedTokenAmount);
    });

    it('2.2. Crowd 컨트랙트에서 토큰 cap 범위에서만 구입이 되는가?', async () => {
      await this.crowdSale.buyTokens(investor2, {
        from: investor2,
        value: cap,
      });
      await expectRevert(
        this.crowdSale.buyTokens(investor2, {
          from: investor2,
          value: new BN(1),
        }),
        'CappedCrowdsale: cap exceeded'
      );
    });  
  });
});
