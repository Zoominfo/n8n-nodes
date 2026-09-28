import type { INodeProperties } from 'n8n-workflow';
import {
	attributesProperty,
	paginationProperties,
	sortProperties,
} from '../../shared/descriptions';

const showForContact = { resource: ['contact'] };
const showForSearch = { resource: ['contact'], operation: ['search'] };
const showForEnrich = { resource: ['contact'], operation: ['enrich'] };

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
];
