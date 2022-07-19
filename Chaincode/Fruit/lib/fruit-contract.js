/*
 * SPDX-License-Identifier: Apache-2.0
 */

'use strict';

const { Contract } = require('fabric-contract-api');

class FruitContract extends Contract {
    async fruitExists(ctx, fruitId) {
        const buffer = await ctx.stub.getState(fruitId);
        return !!buffer && buffer.length > 0;
    }

    async createFruit(ctx, fruitId, batchNumber, producer, quantity, price) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (exists) {
            throw new Error(`The fruit ${fruitId} already exists`);
        }
        const asset = {
            ID: fruitId,
            BatchNumber: batchNumber,
            Producer: producer,
            OwnedBy: producer,
            Quantity: quantity,
            Price: price,
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }

    async readFruit(ctx, fruitId) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const buffer = await ctx.stub.getState(fruitId);
        const asset = JSON.parse(buffer.toString());
        return asset;
    }

    async updateFruit(ctx, fruitId, batchNumber, producer, owner, quantity, price) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        const asset = {
            BatchNumber: batchNumber,
            Producer: producer,
            OwnedBy: owner,
            Quantity: quantity,
            Price: price,
        };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }

    async deleteFruit(ctx, fruitId) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit ${fruitId} does not exist`);
        }
        await ctx.stub.deleteState(fruitId);
    }

    async sellFruits(ctx, fruitId, ownerName) {
        const exists = await this.fruitExists(ctx, fruitId);
        if (!exists) {
            throw new Error(`The fruit with ID ${fruitId} does not exist`);
        }
        const asset = { currentOwner: ownerName };
        const buffer = Buffer.from(JSON.stringify(asset));
        await ctx.stub.putState(fruitId, buffer);
    }
}

module.exports = FruitContract;
