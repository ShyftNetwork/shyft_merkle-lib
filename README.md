# Shyft Merkle Tree Library

Basic libary for Shyft-specific merkle tree operations.

## API:

## Functions

<dl>
<dt><a href="#hashAB">hashAB(a, b)</a> ⇒ <code>string</code></dt>
<dd><p>Hashes two values together.</p>
</dd>
<dt><a href="#hashHeader">hashHeader()</a> ⇒ <code>string</code></dt>
<dd><p>Hashes a block header: {previousHeader, timestamp, blockNumber, transactionRoot}</p>
</dd>
<dt><a href="#isPowerOfTwo">isPowerOfTwo(n)</a> ⇒ <code>boolean</code></dt>
<dd><p>Checks if a number is a power of two (ie. valid leaf array size)</p>
</dd>
<dt><a href="#setupleafs">setupleafs(leafs)</a> ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Creates first two layers of a tree, ie. the leafs and their hashes</p>
</dd>
<dt><a href="#treePad">treePad(tree)</a> ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code></dt>
<dd><p>Pads the leaves of a tree with null to ensure its length is a power of two</p>
</dd>
<dt><a href="#buildTree">buildTree(height)</a> ⇒ <code>Tree</code></dt>
<dd><p>Constructs a merkle tree recursively as a 2d array.</p>
</dd>
<dt><a href="#getProof">getProof(tree, leaf)</a> ⇒ <code>Array.&lt;any&gt;</code></dt>
<dd><p>Assembles a proof from a given tree for a given leaf. This produces a proof of the format [boolean, leaf, boolean, leaf ...]</p>
</dd>
<dt><a href="#verifyProof">verifyProof(proof, leaf, root)</a> ⇒ <code>boolean</code></dt>
<dd><p>Verifies that the leaf and the proof do in fact hash to the root</p>
</dd>
<dt><a href="#stringifyProof">stringifyProof(proof)</a> ⇒ <code>string</code></dt>
<dd><p>Stringifies the proof by assmbling a bit array of the path indicators and appending it to the path segments.</p>
</dd>
</dl>

<a name="hashAB"></a>

## hashAB(a, b) ⇒ <code>string</code>
Hashes two values together.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| a | <code>number</code> | a bytes32 appropriate value |
| b | <code>number</code> | a bytes32 appropriate value |

<a name="hashHeader"></a>

## hashHeader() ⇒ <code>string</code>
Hashes a block header: {previousHeader, timestamp, blockNumber, transactionRoot}

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
| obj.previousHeader | <code>string</code> | previous block header |
| obj.timestamp | <code>number</code> | block timestamp |
| obj.blockNumber | <code>number</code> | current block number |
| obj.transactionRoot | <code>string</code> | current transaction root |

<a name="isPowerOfTwo"></a>

## isPowerOfTwo(n) ⇒ <code>boolean</code>
Checks if a number is a power of two (ie. valid leaf array size)

**Kind**: global function  

| Param | Type |
| --- | --- |
| n | <code>number</code> | 

<a name="setupleafs"></a>

## setupleafs(leafs) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
Creates first two layers of a tree, ie. the leafs and their hashes

**Kind**: global function  

| Param | Type |
| --- | --- |
| leafs | <code>Array.&lt;string&gt;</code> | 

<a name="treePad"></a>

## treePad(tree) ⇒ <code>Array.&lt;Array.&lt;string&gt;&gt;</code>
Pads the leaves of a tree with null to ensure its length is a power of two

**Kind**: global function  

| Param | Type |
| --- | --- |
| tree | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | 

<a name="buildTree"></a>

## buildTree(height) ⇒ <code>Tree</code>
Constructs a merkle tree recursively as a 2d array.

**Kind**: global function  

| Param | Type | Description |
| --- | --- | --- |
|  | <code>Array.&lt;string&gt;</code> \| <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | the current tree. Initially a single dimensional array of leaves |
| height |  | current height of the tree (starts at 0) |

<a name="getProof"></a>

## getProof(tree, leaf) ⇒ <code>Array.&lt;any&gt;</code>
Assembles a proof from a given tree for a given leaf. This produces a proof of the format [boolean, leaf, boolean, leaf ...]

**Kind**: global function  

| Param | Type |
| --- | --- |
| tree | <code>Array.&lt;Array.&lt;string&gt;&gt;</code> | 
| leaf | <code>string</code> | 

<a name="verifyProof"></a>

## verifyProof(proof, leaf, root) ⇒ <code>boolean</code>
Verifies that the leaf and the proof do in fact hash to the root

**Kind**: global function  

| Param | Type |
| --- | --- |
| proof | <code>Array.&lt;any&gt;</code> | 
| leaf | <code>string</code> | 
| root | <code>string</code> | 

<a name="stringifyProof"></a>

## stringifyProof(proof) ⇒ <code>string</code>
Stringifies the proof by assmbling a bit array of the path indicators and appending it to the path segments.

**Kind**: global function  

| Param | Type |
| --- | --- |
| proof | <code>Array.&lt;any&gt;</code> | 


## Generating Docs

```
npm i -g jsdoc2md
jsdoc2md index.js
```