import isString from 'lodash-ts/isString';
import { IContext, ICompileOptions } from '../interfaces';
import { IRootNode } from '../nodes';
import compile from './compile';
import FlowContainer from '../flow-container';
import tokens from './parser/tokens';
import parse from './parser/parse';
import build from './nodes';

export default function parse_rules(src: string, options: ICompileOptions) {
	if (!isString(src)) {
		return null;
	}
	const context = { define: [], rules: [], scope: [] } as IContext;
	parse(src, tokens, context);
	const r = compile(context, options);
	const root = build(r.rules, r.cs);
	return root;
}
