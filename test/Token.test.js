const {
  BN,
  expectRevert,
  expectEvent,
  constants,
  ether,
} = require('openzeppelin-test-helpers');
const { expect } = require('chai');

const ERC20 = artifacts.require('Token');

contract('Token', function([sender, receiver]) {
  const _name = 'bitToken';
  const _symbol = 'BTT';
  const _decimals = new BN(18);
  const _totalSupply = ether('50000');

  beforeEach(async () => {
    this.token = await ERC20.new();
    this.value = ether('1');
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
      const tokenDecimals = await this.token.decimals();
      expect(tokenDecimals).to.be.bignumber.equal(_decimals);
    });

    it('1.4. 토큰의 총 발행량에 해당하는 만큼 생성되었는가?', async () => {
      const totalSupply = (await this.token.totalSupply()).toString();
      expect(totalSupply).to.equal(_totalSupply.toString());
    });
  });

  describe('🔥 테스트 케이스 2: 토큰의 트랜잭션이 정상적으로 발생되는가?', () => {
    it('2.1. 토큰이 정상적이지 않은 0 주소로 보냈을때 반환되는가?', async () => {
      await expectRevert(
        this.token.transfer(constants.ZERO_ADDRESS, this.value, {
          from: sender,
        }),
        'ERC20: transfer to the zero address'
      );
    });

    it('2.2. 토큰 전송을 한 경우 transfer 이벤트가 발생하는가?', async () => {
      const { logs } = await this.token.transfer(receiver, this.value, {
        from: sender,
      });
      expectEvent.inLogs(logs, 'Transfer', {
        from: sender,
        to: receiver,
        value: this.value,
      });
    });

    it('2.3. 토큰 전송을 한 후 잔고가 정상적으로 반영이 되는가?', async () => {
      await this.token.transfer(receiver, this.value, { from: sender });
      expect(await this.token.balanceOf(receiver)).to.be.bignumber.equal(
        this.value
      );
    });
  });
});
