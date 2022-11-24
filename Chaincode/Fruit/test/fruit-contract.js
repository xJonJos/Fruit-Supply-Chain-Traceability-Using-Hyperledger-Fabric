'use strict';

const { ChaincodeStub, ClientIdentity } = require('fabric-shim');
const { FruitContract } = require('..');
const winston = require('winston');

const chai = require('chai');
const chaiAsPromised = require('chai-as-promised');
const sinon = require('sinon');
const sinonChai = require('sinon-chai');

chai.should();
chai.use(chaiAsPromised);
chai.use(sinonChai);

class TestContext {

    constructor() {
        this.stub = sinon.createStubInstance(ChaincodeStub);
        this.clientIdentity = sinon.createStubInstance(ClientIdentity);
        this.logger = {
            getLogger: sinon.stub().returns(sinon.createStubInstance(winston.createLogger().constructor)),
            setLevel: sinon.stub(),
        };
    }

}

describe('FruitContract', () => {

    let contract;
    let ctx;

    beforeEach(() => {
        contract = new FruitContract();
        ctx = new TestContext();
        ctx.stub.getState.withArgs('1001').resolves(Buffer.from('{"value":"fruit 1001 value"}'));
        ctx.stub.getState.withArgs('1002').resolves(Buffer.from('{"value":"fruit 1002 value"}'));
    });

    describe('#fruitExists', () => {

        it('should return true for a fruit', async () => {
            await contract.fruitExists(ctx, '1001').should.eventually.be.true;
        });

        it('should return false for a fruit that does not exist', async () => {
            await contract.fruitExists(ctx, '1003').should.eventually.be.false;
        });

    });

    describe('#createFruit', () => {

        it('should create a fruit', async () => {
            await contract.createFruit(ctx, '1003', 'fruit 1003 value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1003', Buffer.from('{"value":"fruit 1003 value"}'));
        });

        it('should throw an error for a fruit that already exists', async () => {
            await contract.createFruit(ctx, '1001', 'myvalue').should.be.rejectedWith(/The fruit 1001 already exists/);
        });

    });

    describe('#readFruit', () => {

        it('should return a fruit', async () => {
            await contract.readFruit(ctx, '1001').should.eventually.deep.equal({ value: 'fruit 1001 value' });
        });

        it('should throw an error for a fruit that does not exist', async () => {
            await contract.readFruit(ctx, '1003').should.be.rejectedWith(/The fruit 1003 does not exist/);
        });

    });

    describe('#updateFruit', () => {

        it('should update a fruit', async () => {
            await contract.updateFruit(ctx, '1001', 'fruit 1001 new value');
            ctx.stub.putState.should.have.been.calledOnceWithExactly('1001', Buffer.from('{"value":"fruit 1001 new value"}'));
        });

        it('should throw an error for a fruit that does not exist', async () => {
            await contract.updateFruit(ctx, '1003', 'fruit 1003 new value').should.be.rejectedWith(/The fruit 1003 does not exist/);
        });

    });

    describe('#deleteFruit', () => {

        it('should delete a fruit', async () => {
            await contract.deleteFruit(ctx, '1001');
            ctx.stub.deleteState.should.have.been.calledOnceWithExactly('1001');
        });

        it('should throw an error for a fruit that does not exist', async () => {
            await contract.deleteFruit(ctx, '1003').should.be.rejectedWith(/The fruit 1003 does not exist/);
        });

    });

});
