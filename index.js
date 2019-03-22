const ethers = require('ethers')
const utils = ethers.utils
const hash = ethers.utils.solidityKeccak256

/**
 * Hashes two values together.
 * @param {string} a - a bytes32 appropriate value
 * @param {string} b - a bytes32 appropriate value
 * @returns {string}
 */
const hashAB = (a, b) => {
	return hash(["bytes32", "bytes32"], [a, b]).toString(16)
}

/**
 * Hashes a block header: {previousHeader, timestamp, blockNumber, transactionRoot}
 * @param {string} obj.previousHeader - previous block header
 * @param {number} obj.timestamp - block timestamp
 * @param {number} obj.blockNumber - current block number
 * @param {string} obj.transactionsRoot - current transaction root
 * @returns {string}
 */
const hashHeader = (obj) => {
	if(obj === null) return hash(0)
	return hash(["bytes32", "uint256", "uint256", "bytes32"],
		[obj.prevHeader, utils.bigNumberify(obj.timestamp), utils.bigNumberify(obj.number), obj.transactionsRoot]).toString(16)
}

/**
 * Checks if a number is a power of two (ie. valid leaf array size)
 * @param {number} n
 * @returns {boolean}
 */

const isPowerOfTwo = (n) => {
	if(n === 0) return false
	while(n % 2 === 0){
		n = n / 2
	}
	return n === 1
}

/**
 * Creates first two layers of a tree, ie. the leafs and their hashes
 * @param {string[]} leafs
 * @returns {string[][]}
 */
const setupleafs = (leafs) => {
	let hashes = leafs.map((leaf) => hashHeader(leaf))
	return [leafs, hashes]
}

/**
 * Pads the leaves of a tree with null to ensure its length is a power of two
 * @param {string[][]} tree
 * @returns {string[][]}
 */
const treePad = (tree) => {
	let i = tree.length
	let guess = 1
	while(guess < i){
		guess *= 2
	}
	for(let j = 0; j < guess - i; j ++){
		tree.push(null)
	}
	return tree
}

/**
 * Constructs a merkle tree recursively as a 2d array.
 * @param {string[] | string[][] } - the current tree. Initially a single dimensional array of leaves
 * @param height - current height of the tree (starts at 0)
 * @returns {Tree}
 */
const buildTree = (tree, height=0) => {
	// Create leaf hashes
	if(height === 0) {
		if(!isPowerOfTwo(tree.length)){
			tree = treePad(tree)
		}
		return buildTree(setupleafs(tree), 1)
	}
	// Reached root

	else if(tree[height].length === 1) {
		return tree
	}
	else {
		let layer = []
		// Setup new layer
		for(let i = 0; i < tree[height].length - 1; i+=2){
			layer.push(hashAB(tree[height][i], tree[height][i+1]))
		}
		// Add new layer to tree
		tree[height+1] = layer
		return buildTree(tree, height + 1)
	}
}

/**
 * Assembles a proof from a given tree for a given leaf. This produces a proof of the format [boolean, leaf, boolean, leaf ...]
 * @param {string[][]} tree
 * @param {string} leaf
 * @returns {any[]}
 */
const getProof = (tree, leaf) => {
	let i = -1
	// find index of leaf in tree
	for(let j = 0; j < tree[0].length; j++) {
		if (JSON.stringify(tree[0][j]) === JSON.stringify(leaf)) {
			i = j
			break // if there are multiple leaves with the same value, break at the first one
		}
	}
	// if leaf is not in tree, return null
	if(i === -1) return null

	let proof = []
	let currHash

	// find partner at each height h, starting at height 1 and ending at level below root
	for(let h = 1; h < tree.length - 1; h++) {
		// true if this index is on the left
		let partnerIsRight = i % 2 === 0
		proof.push(partnerIsRight)
		let partner
		if(partnerIsRight) {
			partner = tree[h][i+1]
			currHash = hashAB(tree[h][i], partner)
		} else {
			partner = tree[h][i-1]
			currHash = hashAB(partner, tree[h][i])
		}
		proof.push(partner)
		// update index; index of currHash next level up should be floor(i/2)
		i = Math.floor(i/2)
		// check that calculated hash is in fact the same as parent hash in the tree
		if(currHash !== tree[h+1][i]) return null
	}
	return proof
}

/**
 * Verifies that the leaf and the proof do in fact hash to the root
 * @param {any[]} proof
 * @param {string} leaf
 * @param {string} root
 * @returns {boolean}
 */
const verifyProof = (proof, leaf, root) => {
	let currHash = hashHeader(leaf)
	for(let i = 0; i < proof.length-1; i += 2) {
		// if partner is on the right side
		if(proof[i]) {
			currHash = hashAB(currHash, proof[i+1])
		} else {
			currHash = hashAB(proof[i+1], currHash)
		}
	}
	return (currHash === root)
}

/**
 * Stringifies the proof by assmbling a bit array of the path indicators and appending it to the path segments.
 * @param {any[]} proof
 * @returns {string}
 */
const stringifyProof = (proof) => {
	let pathStr = "" 
	let indicators = 0

	for(let i = proof.length - 2; i >= 0; i -= 2) {
		indicators <<= 1
		indicators = proof[i] ? (indicators | 1) : (indicators | 0) 
		pathStr = `${proof[i+1].substr(2)}${pathStr}`
	}

	let indicatorStr = indicators.toString(16)
	while (indicatorStr.length !== 64) {
		indicatorStr = '0' + indicatorStr
	}
	return '0x' + indicatorStr + pathStr
}

/**
 * Returns root element of tree.
 * @param tree
 * @returns {string}
 */
const getRoot = (tree) => {
	return tree[tree.length -1][0]
}

/**
 * Checks if the leaf exists in the tree.
 * @param {string} leaf.prevHeader - previous block header
 * @param {number} leaf.timestamp - block timestamp
 * @param {number} leaf.number - current block number
 * @param {string} leaf.transactionsRoot - current transaction root
 * @param tree Valid merkle tree
 * @returns {boolean}
 */
const isValidLeaf = (tree, leaf) => {
	for(let i = 0; i < tree[0].length; i++) {
		let treeLeaf = tree[0][i]
		if(treeLeaf.prevHeader === leaf.prevHeader &&
			treeLeaf.number === leaf.number &&
			treeLeaf.timestamp === leaf.timestamp &&
			treeLeaf.transactionsRoot === leaf.transactionsRoot) {
				return true
		}
	}
	return false
}

module.exports = { buildTree, hash, hashAB, hashHeader, isPowerOfTwo, treePad, getProof, verifyProof, stringifyProof, getRoot, isValidLeaf }
