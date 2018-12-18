const merkle = require('../index.js')
const chai = require('chai');
const expect = chai.expect;
const assert = chai.assert;
const utils = require('ethereumjs-util')
//const logger = require('../lib/logger')
const chalk = require('chalk')
const BN = utils.BN
const hash = require('web3').utils.soliditySha3

const hashAB = merkle.hashAB
const hashHeader = merkle.hashHeader
const figures = require('figures')

const logger = {}
const DESCRIPTION = chalk.cyan.bold;
logger.Info = function Info(str) {
	if(process.env.DEBUG !== 'DEBUG') {
		console.log("\x1b[92minfo:\x1b[0m", str)
	}
}
logger.Warn = function Warn(str) {
	console.log("\x1b[93mwarn:\x1b[0m", str)
}

logger.Error = function Error(str, e) {
	if(process.env.DEBUG !== 'DEBUG') {
		console.log("\x1b[91merror:\x1b[0m", str, e)
	}
}
logger.Context = function Context(str) {
	console.log("\t", "\x1b[33m", figures.info, "\x1b[0m", str)
}



// Example leafs
const a = {prevHeader: '0x5c5df0f94d5e6699553c83008f79f9de18476f0fb987f4dc4b84e82c6bd46796', timestamp: 1234, number: 1, transactionsRoot: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f'}
const b = {prevHeader: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f', timestamp: 5678, number: 2, transactionsRoot: '0x3e3ade60c3e30ba7ea7fb6144776373e7ba4ad1e647184e776fa26f3afe3c280'}
const c = {prevHeader: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f', timestamp: 1234, number: 3, transactionsRoot: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f'}
const d = {prevHeader: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f', timestamp: 1234, number: 4, transactionsRoot: '0x3e3ade60c3e30ba7ea7fb6144776373e7ba4ad1e647184e776fa26f3afe3c280'}
const e = {prevHeader: '0x5c8217dae1fb65281371b85fc2ad9bb8c361fcc8f6f7267969649f5328fe9ae2', timestamp: 1234, number: 5, transactionsRoot: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f'}
const f = {prevHeader: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f', timestamp: 1234, number: 6, transactionsRoot: '0x6fdc7790270a8e60349cd11e86247a28de70afdc54ae41b59cfc82ff9c74f1fb'}
const g = {prevHeader: '0x8decd7b22b6929b3be4a51e4b1907dd0fdf3aa6f046c54e179b89b68420b7c36', timestamp: 1234, number: 7, transactionsRoot: '0x5c8217dae1fb65281371b85fc2ad9bb8c361fcc8f6f7267969649f5328fe9ae2'}
const h = {prevHeader: '0x3c33834e258cc87b6e461c02a3f7e368eea7d571f9823a6435bea8a57c085db9', timestamp: 1234, number: 8, transactionsRoot: '0xa4d5b01561b15ada293a3f0697720e81f1ed3e2dfc981ce89d88de285f310b6f'}

// Exmaple trees
const SMALL_TREE = [
	[a, b],
	[hashHeader(a), hashHeader(b)],
	[hashAB(hashHeader(a), hashHeader(b))]
]

const LARGE_TREE = [
	[a, b, c, d, e, f, g, h],
	[hashHeader(a), hashHeader(b), hashHeader(c), hashHeader(d), hashHeader(e), hashHeader(f), hashHeader(g), hashHeader(h)],
	[hashAB(hashHeader(a), hashHeader(b)), hashAB(hashHeader(c), hashHeader(d)), hashAB(hashHeader(e), hashHeader(f)), hashAB(hashHeader(g), hashHeader(h))],
	[hashAB(hashAB(hashHeader(a), hashHeader(b)), hashAB(hashHeader(c), hashHeader(d))), hashAB(hashAB(hashHeader(e), hashHeader(f)), hashAB(hashHeader(g), hashHeader(h)))],
	[hashAB(hashAB(hashAB(hashHeader(a), hashHeader(b)), hashAB(hashHeader(c), hashHeader(d))), hashAB(hashAB(hashHeader(e), hashHeader(f)), hashAB(hashHeader(g), hashHeader(h))))],
]

// Uses the correct comparison to assert the difference between a and b (object or bignumber)
// 	it("should deploy an instance of the bridge", async () => {
const checkTrees = (a, b) => {
	for (let i = 0; i < Math.max(a.length, b.length); i++) {
		for (let j = 0; j < Math.max(a[i].length, b[i].length); j++) {
			// Use special comparison for objects (leafs)
			if (i === 0) {
				logger.Context(`i: ${i} j: ${j} A: ${a[i][j]} type: ${typeof a[i][j]}, B: ${b[i][j]} type: ${typeof b[i][j]} `)
				Object.keys(a[i][j]).map((key) => assert.equal(a[i][j][key], (b[i][j][key])), 'leaf does not match')
			}
			// BN comparison
			else {
				logger.Context(`i: ${i} j: ${j} A: ${a[i][j].toString('hex')} type: ${typeof a[i][j]}, B: ${b[i][j].toString('hex')} type: ${typeof b[i][j]} `)
				assert.equal(a[i][j], (b[i][j]), `invalid hash:\ngot: ${a}\nexpected: ${b}`)
			}
		}
	}
}


const checkPadding = (a, b) => {
	for(let i = 0; i < Math.max(a.length, b.length); i++){
		logger.Context(`Got :: ${a[i]} Expected :: toEqual ${b[i]}`)
		assert.equal(a[i], b[i], 'Padding does not match')
	}
}

describe(DESCRIPTION("Merkle Tree"), () => {
	it("should confirm 64 is a power of two", () => {
		logger.Context(`Got :: ${merkle.isPowerOfTwo(64)} Expected :: ${true}`)
		assert(merkle.isPowerOfTwo(64), `64 is a power of two`)
	})
	it("should confirm 127 is not a power of two", () => {
		logger.Context(`Got :: ${merkle.isPowerOfTwo(127)} Expected :: ${false}`)
		assert(!merkle.isPowerOfTwo(127), `127 is not a power of two`)
	})
	it("should pad a tree to a power of 2", () => {
		let paddedTree = merkle.treePad([1, 2 ,3])
		checkPadding(paddedTree, [1,2,3,null])
	})
	it("should pad a tree to a power of 2", () => {
		let paddedTree = merkle.treePad([1, 2 ,3, 4, 5])
		checkPadding(paddedTree, [1, 2, 3, 4, 5,null, null, null])
	})
	it("should create a merkle tree from 2 leafs", () => {
		let tree = merkle.buildTree([a, b])
		checkTrees(tree, SMALL_TREE)
	})

	it("should create a merkle tree from 8 leafs", () => {
		let tree = merkle.buildTree([a, b, c, d, e, f, g, h])
		checkTrees(tree, LARGE_TREE)
	})

	it("should create a proof from a given leaf in a tree", () => {
		let tree = merkle.buildTree([a, b, c, d, e, f, g, h])
		let leaf = c
		let proof = merkle.getProof(tree, leaf)
		logger.Context(`Got :: ${proof[1]} Expected :: toEqual ${hashHeader(d)}`)
		logger.Context(`Got :: ${proof[3]} Expected :: toEqual ${tree[2][0]}`)
		logger.Context(`Got :: ${proof[proof.length-1]} Expected :: toEqual ${tree[tree.length-2][1]}`)
		assert.equal(proof[1], hashHeader(d))
		assert.equal(proof[3], tree[2][0])
		assert.equal(proof[proof.length-1], tree[tree.length-2][1])
	})
})