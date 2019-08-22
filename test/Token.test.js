const { BN } = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const ERC20 = artifacts.require('Token');

contract('Token', ([sender, receiver]) => {
  const _name = 'bitToken';
  const _symbol = 'BTT';
  const _decimals = new BN(18);

  before(async () => {});

  beforeEach(async () => {
    this.token = await ERC20.new();
  });

  describe('🔥 테스트 케이스 1: 토큰이 정확히 생성되었는가?', () => {
    it('1.1. 토큰의 이름이 올바르게 생성되었는가?', async () => {
      const tokenName = await this.token.name();
      console.log(`tokenName = ${tokenName}`);
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
});
