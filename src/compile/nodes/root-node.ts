// import { IPattern, IObjectPattern, IFromPattern, ICompositePattern, composite_pattern, initial_fact_pattern } from '../../pattern';
// import Fact from '../../facts/fact';
// import { IRule } from '../rule';

// import { IConstraint, IObjectConstraint, IHashConstraint, IReferenceConstraint, is_instance_of_reference_constraint, is_instance_of_hash } from '../../constraint';

// import { INode } from './node';
// import { IAlphaNode } from './alpha-node';
// import { ITypeNode, create as create_type_node } from './type-node';
// import { ITerminalNode, create as create_terminal_node } from './terminal-node';
// import { IJoinNode, create as create_join_node } from './join-node';
// import { create as create_alias_node } from './alias-node';
// import { create as create_adapter_node } from './adapter-node';
// import { create as create_not_node } from './not-node';
// import { create as create_exists_node } from './exists-node';
// import { create as create_beta_node } from './beta-node';
// import { create as create_from_node } from './from-node';
// import { create as create_from_not_node } from './from-not-node';
// import { create as create_exists_from_node } from './exists-from-node';
// import { create as create_equality_node } from './equality-node';
// import { create as create_property_node } from './property-node';
// import { addConstraint } from './join-reference-node';

// function hasRefernceConstraints(pattern: IObjectPattern) {
// 	return (pattern.constraints || []).some((c) => {
// 		return is_instance_of_reference_constraint(c);
// 	});
// }

// export type Side = 'left' | 'right';

// export interface IBucket {
// 	counter: number;
// 	recency: number;
// }

// export interface IRootNode {
// 	nodes: INode[];
// 	terminalNodes: number[];
// 	joinNodes: number[];
// 	constraints: number[];
// 	typeNodes: number[];
// 	__ruleCount: number;
// 	bucket: IBucket;
// }

// export function create_root_node(): IRootNode {
// 	return {
// 		nodes: [],
// 		terminalNodes: [],
// 		joinNodes: [],
// 		constraints: [],
// 		typeNodes: [],
// 		__ruleCount: 0,
// 		bucket: {
// 			counter: 0,
// 			recency: 0
// 		}
// 	};
// }

// export function assertRule(root: IRootNode, rule: IRule) {
// 	const terminalNode = create_terminal_node(rule.name, rule, root.__ruleCount++);
// 	__addToNetwork(root, rule, rule.pattern, terminalNode);
// 	__mergeJoinNodes(root);
// 	root.terminalNodes.push(root.nodes.push(terminalNode) - 1);
// }

// function __mergeJoinNodes(root: IRootNode) {
// 	const joinNodes = root.joinNodes;
// 	const nodes = root.nodes;
// 	for (let i = 0; i < joinNodes.length; i++) {
// 		const j1 = nodes[joinNodes[i]] as IJoinNode;
// 		const j2 = nodes[joinNodes[i + 1]] as IJoinNode;
// 		if (j1 && j2 && (j1.constraint && j2.constraint && j1.constraint.constraint.equal(j2.constraint.constraint))) {
// 			merge(j1, j2);
// 			joinNodes.splice(i + 1, 1);
// 		}
// 	}
// }

// function __checkEqual<T extends IAlphaNode>(root: IRootNode, node: T): T {
// 	const constraints = root.constraints;
// 	let index = -1;

// 	if (constraints.some((id) => {
// 		const n = root.nodes[id] as IAlphaNode;
// 		const r = node.equal(n);
// 		r && (index = id);
// 		return r;
// 	})) {
// 		return root.nodes[index] as T;
// 	} else {
// 		constraints.push(root.nodes.push(node) - 1);
// 		return node;
// 	}
// }

// function __createTypeNode(root: IRootNode, rule: IRule, constraint: IConstraint) {
// 	const ret = create_type_node(constraint);
// 	const typeNodes = root.typeNodes;
// 	let index = -1;
// 	if (typeNodes.some((id) => {
// 		const typeNode = root.nodes[id] as IAlphaNode;
// 		const r = ret.constraint.equal(typeNode.constraint);
// 		r && (index = id);
// 		return r;
// 	})) {
// 		return root.nodes[index] as ITypeNode;
// 	} else {
// 		typeNodes.push(root.nodes.push(ret) - 1);
// 		return ret;
// 	}
// }

// function __createEqualityNode(root: IRootNode, rule: IRule, constraint: IObjectConstraint) {
// 	return addRule(__checkEqual(root, create_equality_node(constraint)), rule);
// }

// function __createPropertyNode(root: IRootNode, rule: IRule, constraint: IHashConstraint) {
// 	return addRule(__checkEqual(root, create_property_node(constraint)), rule);
// }

// function __createAliasNode(root: IRootNode, rule: IRule, pattern: IObjectPattern) {
// 	// return __checkEqual(new AliasNode(pattern)).addRule(rule);
// 	return addRule(__checkEqual(root, create_alias_node(pattern)), rule);
// }

// function __createAdapterNode(root: IRootNode, rule: IRule, side: Side = 'right') {
// 	return addRule(create_adapter_node(side === "left"), rule);
// }

// function __createJoinNode(root: IRootNode, rule: IRule, pattern: ICompositePattern, outNode: INode, side: Side) {
// 	let joinNode: INode;
// 	const right_type = pattern.rightPattern.type;
// 	if (right_type === 'not') {
// 		joinNode = create_not_node();
// 	} else if (right_type === 'from_exists') {
// 		joinNode = create_exists_from_node(pattern.rightPattern as IFromPattern);
// 	} else if (right_type === 'exists') {
// 		joinNode = create_exists_node();
// 	} else if (right_type === 'from_not') {
// 		joinNode = create_from_not_node(pattern.rightPattern as IFromPattern);
// 	} else if (right_type === 'from') {
// 		joinNode = create_from_node(pattern.rightPattern as IFromPattern);
// 	} else if (pattern.type === 'composite' && !hasRefernceConstraints(pattern.leftPattern as IObjectPattern) && !hasRefernceConstraints(pattern.rightPattern as IObjectPattern)) {
// 		const bn = joinNode = create_beta_node();
// 		root.joinNodes.push(root.nodes.push(bn) - 1);
// 	} else {
// 		const jn = joinNode = create_join_node();
// 		root.joinNodes.push(root.nodes.push(jn) - 1);
// 	}
// 	let parentNode = joinNode;
// 	if (is_instance_of_beta_node(outNode)) {
// 		const adapterNode = __createAdapterNode(root, rule, side);
// 		addOutNode(parentNode, adapterNode, pattern as any);	// todo:: type of pattern should be 'ObjectPattern'
// 		parentNode = adapterNode;
// 	}
// 	addOutNode(parentNode, outNode, pattern as any);
// 	return addRule(joinNode, rule);
// }

// function __addToNetwork(root: IRootNode, rule: IRule, pattern: IPattern, outNode: INode, side: Side = 'left') {
// 	const type = pattern.type;
// 	if (type === 'composite') {
// 		__createBetaNode(root, rule, pattern as ICompositePattern, outNode, side);
// 	} else if (type !== 'initial_fact' && side === 'left') {
// 		__createBetaNode(root, rule, composite_pattern(initial_fact_pattern(), pattern), outNode, side);
// 	} else {
// 		__createAlphaNode(root, rule, pattern as IObjectPattern, outNode, side);
// 	}
// }

// function __createBetaNode(root: IRootNode, rule: IRule, pattern: ICompositePattern, outNode: INode, side: Side) {
// 	const joinNode = __createJoinNode(root, rule, pattern, outNode, side);
// 	__addToNetwork(root, rule, pattern.rightPattern, joinNode, "right");
// 	__addToNetwork(root, rule, pattern.leftPattern, joinNode, "left");
// 	addParentNode(outNode, joinNode);
// 	return joinNode;
// }


// function __createAlphaNode(root: IRootNode, rule: IRule, pattern: IObjectPattern, outNode: INode, side: Side) {
// 	const type = pattern.type;
// 	if (type !== 'from' && type !== 'from_exists' && type !== 'from_not') {
// 		const constraints = pattern.constraints;
// 		const typeNode = __createTypeNode(root, rule, constraints[0]);
// 		const aliasNode = __createAliasNode(root, rule, pattern);
// 		addOutNode(typeNode, aliasNode, pattern);
// 		addParentNode(aliasNode, typeNode);
// 		let parentNode = aliasNode as INode;
// 		constraints.filter((constraint, idx) => {
// 			return idx > 0;
// 		}).forEach((constraint) => {
// 			let node: INode;
// 			if (is_instance_of_hash(constraint)) {
// 				node = __createPropertyNode(root, rule, constraint);
// 			} else if (is_instance_of_reference_constraint(constraint)) {
// 				addConstraint((outNode as IJoinNode).constraint, constraint as IReferenceConstraint);
// 				return;
// 			} else {
// 				node = __createEqualityNode(root, rule, constraint as IObjectConstraint);
// 			}
// 			addOutNode(parentNode, node, pattern);
// 			addParentNode(node, parentNode);
// 			parentNode = node;
// 		});

// 		if (is_instance_of_beta_node(outNode)) {
// 			const adapterNode = __createAdapterNode(root, rule, side);
// 			addParentNode(adapterNode, parentNode);
// 			addOutNode(parentNode, adapterNode, pattern);
// 			parentNode = adapterNode;
// 		}
// 		addParentNode(outNode, parentNode);
// 		addOutNode(parentNode, outNode, pattern);
// 		return typeNode;
// 	}
// }