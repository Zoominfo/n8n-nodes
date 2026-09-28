import type { INodeProperties } from 'n8n-workflow';

const showForLookup = { resource: ['lookup'] };
const showForGet = { resource: ['lookup'], operation: ['get'] };
const showForSearchFields = { resource: ['lookup'], operation: ['getSearchFields'] };
const showForEnrichFields = { resource: ['lookup'], operation: ['getEnrichFields'] };

const unwrapData = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: { property: 'data' },
		},
	],
};

export const lookupDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForLookup },
		options: [
			{
				name: 'Get Data',
				value: 'get',
				action: 'Get lookup data',
				description:
					'Get the valid, standardized values for a reference field, such as industries or job titles',
				routing: {
					request: {
						method: 'GET',
						url: '=/lookup/{{$parameter.fieldName}}',
					},
					output: unwrapData,
				},
			},
			{
				name: 'Get Enrich Fields',
				value: 'getEnrichFields',
				action: 'Get lookup enrich fields',
				description: 'Get the fields that can be used as input or output for an Enrich operation',
				routing: {
					request: {
						method: 'GET',
						url: '/lookup/enrich',
					},
					output: unwrapData,
				},
			},
			{
				name: 'Get Search Fields',
				value: 'getSearchFields',
				action: 'Get lookup search fields',
				description: 'Get the fields that can be used as input or output for a Search operation',
				routing: {
					request: {
						method: 'GET',
						url: '/lookup/search',
					},
					output: unwrapData,
				},
			},
		],
		default: 'get',
	},
	{
		displayName: 'Field Name',
		name: 'fieldName',
		type: 'string',
		default: '',
		required: true,
		hint: 'Examples: industries, countries, job-titles, departments, company-rankings, tech-vendors, tech-categories, intent-topics, hashtag-categories',
		description: 'The reference field to look up values for',
		displayOptions: { show: showForGet },
	},
	{
		displayName: 'Category',
		name: 'filterCategory',
		type: 'string',
		default: '',
		description: 'Only applies to technology and hashtag lookups. Leave blank otherwise.',
		displayOptions: { show: showForGet },
		routing: {
			send: {
				type: 'query',
				property: 'filter[category]',
			},
		},
	},
	{
		displayName: 'Parent Category',
		name: 'filterParentCategory',
		type: 'string',
		default: '',
		description: 'Only applies to technology and hashtag lookups. Leave blank otherwise.',
		displayOptions: { show: showForGet },
		routing: {
			send: {
				type: 'query',
				property: 'filter[parentCategory]',
			},
		},
	},
	{
		displayName: 'Sub Category',
		name: 'filterSubCategory',
		type: 'string',
		default: '',
		description: 'Only applies to technology and hashtag lookups. Leave blank otherwise.',
		displayOptions: { show: showForGet },
		routing: {
			send: {
				type: 'query',
				property: 'filter[subCategory]',
			},
		},
	},
	{
		displayName: 'Vendor',
		name: 'filterVendor',
		type: 'string',
		default: '',
		description: 'Only applies to technology lookups, e.g. "microsoft corporation". Leave blank otherwise.',
		displayOptions: { show: showForGet },
		routing: {
			send: {
				type: 'query',
				property: 'filter[vendor]',
			},
		},
	},
	{
		displayName: 'Entity',
		name: 'filterEntity',
		type: 'options',
		default: 'company',
		required: true,
		description: 'The data type to get fields for',
		options: [
			{ name: 'Company', value: 'company' },
			{ name: 'Contact', value: 'contact' },
			{ name: 'Intent', value: 'intent' },
			{ name: 'News', value: 'news' },
			{ name: 'Scoop', value: 'scoop' },
		],
		displayOptions: { show: showForSearchFields },
		routing: {
			send: {
				type: 'query',
				property: 'filter[entity]',
			},
		},
	},
	{
		displayName: 'Field Type',
		name: 'filterFieldType',
		type: 'options',
		default: 'input',
		required: true,
		description: 'Whether to return fields usable as search input or search output',
		options: [
			{ name: 'Input', value: 'input' },
			{ name: 'Output', value: 'output' },
		],
		displayOptions: { show: showForSearchFields },
		routing: {
			send: {
				type: 'query',
				property: 'filter[fieldType]',
			},
		},
	},
	{
		displayName: 'Entity',
		name: 'filterEntity',
		type: 'options',
		default: 'company',
		required: true,
		description: 'The data type to get fields for',
		options: [
			{ name: 'Company', value: 'company' },
			{ name: 'Contact', value: 'contact' },
			{ name: 'Corporate Hierarchy', value: 'corporate-hierarchy' },
			{ name: 'Hashtag', value: 'hashtag' },
			{ name: 'Intent', value: 'intent' },
			{ name: 'News', value: 'news' },
			{ name: 'Org Chart', value: 'orgChart' },
			{ name: 'Scoop', value: 'scoop' },
			{ name: 'Technology', value: 'technology' },
		],
		displayOptions: { show: showForEnrichFields },
		routing: {
			send: {
				type: 'query',
				property: 'filter[entity]',
			},
		},
	},
	{
		displayName: 'Field Type',
		name: 'filterFieldType',
		type: 'options',
		default: 'input',
		required: true,
		description: 'Whether to return fields usable as enrich input or enrich output',
		options: [
			{ name: 'Input', value: 'input' },
			{ name: 'Output', value: 'output' },
		],
		displayOptions: { show: showForEnrichFields },
		routing: {
			send: {
				type: 'query',
				property: 'filter[fieldType]',
			},
		},
	},
];
