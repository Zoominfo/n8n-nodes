import type { INodeProperties } from 'n8n-workflow';
import { attributesProperty, paginationProperties } from '../../shared/descriptions';
import { mergeMultiOptionsAttribute } from '../../shared/utils';

const showForSignal = { resource: ['signal'] };
const showForIntent = { resource: ['signal'], operation: ['searchIntent'] };
const showForScoops = { resource: ['signal'], operation: ['searchScoops'] };
const showForNews = { resource: ['signal'], operation: ['searchNews'] };
const showForEnrichIntent = { resource: ['signal'], operation: ['enrichIntent'] };
const showForEnrichScoops = { resource: ['signal'], operation: ['enrichScoops'] };
const showForEnrichNews = { resource: ['signal'], operation: ['enrichNews'] };
const showForTopics = { resource: ['signal'], operation: ['searchIntent', 'enrichIntent'] };

const unwrapData = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: { property: 'data' },
		},
	],
};

export const signalDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForSignal },
		options: [
			{
				name: 'Enrich Intent',
				value: 'enrichIntent',
				action: 'Enrich intent signals',
				description: 'Add buying-intent signals to a company you already have',
				routing: {
					request: {
						method: 'POST',
						url: '/intent/enrich',
						body: { data: { type: 'IntentEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich News',
				value: 'enrichNews',
				action: 'Enrich news',
				description: 'Get news articles for a company you already have',
				routing: {
					request: {
						method: 'POST',
						url: '/news/enrich',
						body: { data: { type: 'NewsEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich Scoops',
				value: 'enrichScoops',
				action: 'Enrich scoops',
				description: 'Get scoops for a company you already have',
				routing: {
					request: {
						method: 'POST',
						url: '/scoops/enrich',
						body: { data: { type: 'ScoopEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Search Intent',
				value: 'searchIntent',
				action: 'Search intent signals',
				description: 'Find companies researching given topics',
				routing: {
					request: {
						method: 'POST',
						url: '/intent/search',
						body: { data: { type: 'IntentSearch' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Search News',
				value: 'searchNews',
				action: 'Search news',
				description: 'Find news articles about companies',
				routing: {
					request: {
						method: 'POST',
						url: '/news/search',
						body: { data: { type: 'NewsSearch' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Search Scoops',
				value: 'searchScoops',
				action: 'Search scoops',
				description: 'Find scoops, such as projects and org changes',
				routing: {
					request: {
						method: 'POST',
						url: '/scoops/search',
						body: { data: { type: 'ScoopSearch' } },
					},
					output: unwrapData,
				},
			},
		],
		default: 'searchIntent',
	},
	// Intent requires between 1 and 50 topics, picked from the Topic field
	// below rather than typed as JSON — topics are account-specific, and even
	// ZoomInfo's own documented sample topics can 400 for a given subscription.
	attributesProperty(
		showForIntent,
		'Example: {"signalScoreMin": 80, "metroRegion": "usa.california.sanfrancisco"}. ' +
			'Select topics using the Topic field below.',
	),
	attributesProperty(
		showForScoops,
		'Example: {"companyName": "ZoomInfo"}. Use the Lookup resource\'s "Get Search Fields" ' +
			'operation (Entity: Scoop) to see all valid search fields.',
	),
	// News search takes a small, distinct field set — url, pageDateMin/Max,
	// categories — not the companyName/jobTitle-style fields the other search
	// endpoints take. Categories are a closed vocabulary from the Lookup
	// resource's Get Data operation (Field Name: news-categories), not free text.
	attributesProperty(
		showForNews,
		'Example: {"categories": ["FUNDING"]}. Use the Lookup resource\'s "Get Search Fields" ' +
			'operation (Entity: News) to see all valid search fields, and its "Get Data" operation ' +
			'(Field Name: news-categories) for valid category values.',
	),
	attributesProperty(
		showForEnrichIntent,
		'Example: {"companyId": "344589814"}. Select topics using the Topic field below.',
	),
	{
		displayName: 'Topic Names or IDs',
		name: 'topics',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getIntentTopics',
		},
		default: [],
		description:
			'Intent topics to search or enrich for. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showForTopics },
		routing: {
			send: {
				preSend: [mergeMultiOptionsAttribute('topics', 'topics', 'array')],
			},
		},
	},
	attributesProperty(
		showForEnrichNews,
		'Example: {"companyId": "344589814"}. Use the Lookup resource\'s "Get Enrich Fields" ' +
			'operation (Entity: News, Field Type: Output) to see if you can customize the returned fields.',
	),
	attributesProperty(
		showForEnrichScoops,
		'Example: {"companyId": "344589814"}. Use the Lookup resource\'s "Get Enrich Fields" ' +
			'operation (Entity: Scoop, Field Type: Output) to see if you can customize the returned fields.',
	),
	...paginationProperties({
		resource: ['signal'],
		operation: [
			'searchIntent',
			'searchNews',
			'searchScoops',
			'enrichIntent',
			'enrichNews',
			'enrichScoops',
		],
	}),
];
