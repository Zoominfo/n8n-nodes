import type { INodeProperties } from 'n8n-workflow';
import {
	attributesProperty,
	limitProperty,
	paginationProperties,
	sortProperties,
} from '../../shared/descriptions';
import { copilotGet } from '../../shared/utils';

const showForContact = { resource: ['contact'] };
const showForSearch = { resource: ['contact'], operation: ['search'] };
const showForEnrich = { resource: ['contact'], operation: ['enrich'] };
const showForLookalikes = { resource: ['contact'], operation: ['getLookalikes'] };
const showForRecommendations = { resource: ['contact'], operation: ['getRecommendations'] };

const unwrapData = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: { property: 'data' },
		},
	],
};

export const contactDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForContact },
		options: [
			{
				name: 'Enrich',
				value: 'enrich',
				action: 'Enrich contacts',
				description: 'Add ZoomInfo data to contacts you already have',
				routing: {
					request: {
						method: 'POST',
						url: '/contacts/enrich',
						body: { data: { type: 'ContactEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Get Lookalikes',
				value: 'getLookalikes',
				action: 'Get contact lookalikes',
				description: 'Find contacts similar to a reference contact',
				routing: {
					request: copilotGet('/contacts/lookalikes'),
					output: unwrapData,
				},
			},
			{
				name: 'Get Recommendations',
				value: 'getRecommendations',
				action: 'Get contact recommendations',
				description: 'Get the contacts ZoomInfo recommends engaging at a company',
				routing: {
					request: copilotGet('/contacts/recommendations'),
					output: unwrapData,
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search contacts',
				description: 'Find contacts matching a set of criteria',
				routing: {
					request: {
						method: 'POST',
						url: '/contacts/search',
						body: { data: { type: 'ContactSearch' } },
					},
					output: unwrapData,
				},
			},
		],
		default: 'search',
	},
	attributesProperty(
		showForSearch,
		'Example: {"companyName": "ZoomInfo", "jobTitle": "engineer"}. Use the Lookup resource\'s ' +
			'"Get Search Fields" operation (Entity: Contact) to see all valid search fields.',
	),
	// matchPersonInput and outputFields are both required by the enrich endpoint.
	attributesProperty(
		showForEnrich,
		'Example: {"matchPersonInput": [{"firstName": "Jane", "lastName": "Doe", "companyName": "ZoomInfo"}], "outputFields": ["id", "email", "jobTitle"]}. ' +
			'Use the Lookup resource\'s "Get Enrich Fields" operation (Entity: Contact) to see all valid ' +
			'matchPersonInput (Field Type: Input) and outputFields (Field Type: Output) values.',
	),
	...sortProperties(
		showForSearch,
		[
			{ name: 'Company Name', value: 'companyName' },
			{ name: 'Contact Accuracy Score', value: 'contactAccuracyScore' },
			{ name: 'Hierarchy', value: 'hierarchy' },
			{ name: 'Last Mentioned', value: 'lastMentioned' },
			{ name: 'Last Name', value: 'lastName' },
			{ name: 'Relevance', value: 'relevance' },
			{ name: 'Source Count', value: 'sourceCount' },
		],
		'relevance',
	),
	...paginationProperties(showForSearch),
	{
		displayName: 'Reference Person ID',
		name: 'referencePersonId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ZoomInfo person ID of the contact to find lookalikes of',
		displayOptions: { show: showForLookalikes },
		routing: {
			send: {
				type: 'query',
				property: 'filter[referencePersonId]',
			},
		},
	},
	{
		displayName: 'Options',
		name: 'options',
		type: 'collection',
		placeholder: 'Add Option',
		default: {},
		description: 'Optional settings that narrow the lookalike search',
		displayOptions: { show: showForLookalikes },
		options: [
			{
				displayName: 'Target Company ID',
				name: 'targetCompanyId',
				type: 'string',
				default: '',
				description:
					'Only look for lookalikes at this ZoomInfo company ID. Leave unset to search across all companies.',
				routing: {
					send: {
						type: 'query',
						property: 'filter[targetCompanyId]',
					},
				},
			},
		],
	},
	limitProperty(showForLookalikes),
	{
		displayName: 'Company ID',
		name: 'companyId',
		type: 'string',
		default: '',
		required: true,
		description: 'The ZoomInfo company ID to get contact recommendations for',
		displayOptions: { show: showForRecommendations },
		routing: {
			send: {
				type: 'query',
				property: 'filter[ziCompanyId]',
			},
		},
	},
	{
		displayName: 'Use Case',
		name: 'useCaseType',
		type: 'options',
		default: 'PROSPECTING',
		required: true,
		description: 'The sales motion to recommend contacts for',
		options: [
			{ name: 'Deal Acceleration', value: 'DEAL_ACCELERATION' },
			{ name: 'Prospecting', value: 'PROSPECTING' },
			{ name: 'Renewal and Growth', value: 'RENEWAL_AND_GROWTH' },
		],
		displayOptions: { show: showForRecommendations },
		routing: {
			send: {
				type: 'query',
				property: 'filter[useCaseType]',
			},
		},
	},
	limitProperty(showForRecommendations),
];
