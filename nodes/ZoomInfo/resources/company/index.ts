import type { INodeProperties } from 'n8n-workflow';
import {
	attributesProperty,
	paginationProperties,
	sortProperties,
} from '../../shared/descriptions';
import { mergeMultiOptionsAttribute } from '../../shared/utils';

const showForCompany = { resource: ['company'] };
const showForSearch = { resource: ['company'], operation: ['search'] };
const showForEnrich = { resource: ['company'], operation: ['enrich'] };
const showForEnrichOrgChart = { resource: ['company'], operation: ['enrichOrgChart'] };
const showForEnrichCorporateHierarchy = {
	resource: ['company'],
	operation: ['enrichCorporateHierarchy'],
};
const showForEnrichTechnologies = { resource: ['company'], operation: ['enrichTechnologies'] };
const showForEnrichHashtags = { resource: ['company'], operation: ['enrichHashtags'] };

const unwrapData = {
	postReceive: [
		{
			type: 'rootProperty' as const,
			properties: { property: 'data' },
		},
	],
};

export const companyDescription: INodeProperties[] = [
	{
		displayName: 'Operation',
		name: 'operation',
		type: 'options',
		noDataExpression: true,
		displayOptions: { show: showForCompany },
		options: [
			{
				name: 'Enrich',
				value: 'enrich',
				action: 'Enrich companies',
				description: 'Add ZoomInfo data to companies you already have',
				routing: {
					request: {
						method: 'POST',
						url: '/companies/enrich',
						body: { data: { type: 'CompanyEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich Corporate Hierarchy',
				value: 'enrichCorporateHierarchy',
				action: 'Enrich company corporate hierarchy',
				description: "Get a company's family tree and parentage chain",
				routing: {
					request: {
						method: 'POST',
						url: '/companies/corporate-hierarchy/enrich',
						body: { data: { type: 'CorporateHierarchyEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich Hashtags',
				value: 'enrichHashtags',
				action: 'Enrich company hashtags',
				description: "Get categorical hashtags describing a company's business",
				routing: {
					request: {
						method: 'POST',
						url: '/companies/hashtags/enrich',
						body: { data: { type: 'HashtagEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich Org Chart',
				value: 'enrichOrgChart',
				action: 'Enrich company org chart',
				description: 'Get contacts for a company organized by department and seniority',
				routing: {
					request: {
						method: 'POST',
						url: '/companies/org-chart/enrich',
						body: { data: { type: 'OrgChartEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Enrich Technologies',
				value: 'enrichTechnologies',
				action: 'Enrich company technologies',
				description: 'Get the technologies ZoomInfo associates with a company',
				routing: {
					request: {
						method: 'POST',
						url: '/companies/technologies/enrich',
						body: { data: { type: 'TechnologyEnrich' } },
					},
					output: unwrapData,
				},
			},
			{
				name: 'Search',
				value: 'search',
				action: 'Search companies',
				description: 'Find companies matching a set of criteria',
				routing: {
					request: {
						method: 'POST',
						url: '/companies/search',
						body: { data: { type: 'CompanySearch' } },
					},
					output: unwrapData,
				},
			},
		],
		default: 'search',
	},
	attributesProperty(
		showForSearch,
		'Example: {"companyName": "ZoomInfo"}. Use the Lookup resource\'s "Get Search Fields" ' +
			'operation (Entity: Company) to see all valid search fields.',
	),
	attributesProperty(
		showForEnrich,
		'Example: {"matchCompanyInput": [{"companyName": "ZoomInfo"}], "outputFields": ["id", "name", "website"]}. ' +
			'Use the Lookup resource\'s "Get Enrich Fields" operation (Entity: Company) to see all valid ' +
			'matchCompanyInput (Field Type: Input) and outputFields (Field Type: Output) values.',
	),
	attributesProperty(
		showForEnrichOrgChart,
		'Example: {"companyId": "344589814"}. Filter by department using the Department field below.',
	),
	{
		displayName: 'Department Names or IDs',
		name: 'department',
		type: 'multiOptions',
		typeOptions: {
			loadOptionsMethod: 'getDepartments',
		},
		default: [],
		description:
			'Departments to filter the org chart to. Leave empty to include all departments. Choose from the list, or specify IDs using an <a href="https://docs.n8n.io/code/expressions/">expression</a>.',
		displayOptions: { show: showForEnrichOrgChart },
		routing: {
			send: {
				preSend: [mergeMultiOptionsAttribute('department', 'department', 'csv')],
			},
		},
	},
	attributesProperty(
		showForEnrichCorporateHierarchy,
		'Example: {"matchCompanyInput": [{"companyId": "344589814"}], "outputFields": ["familyTree"]}. ' +
			'This endpoint has its own output field set — "id" and "name" (valid for Enrich) are not ' +
			'valid here. Use the Lookup resource\'s "Get Enrich Fields" operation (Entity: Corporate ' +
			'Hierarchy) to see what else is available.',
	),
	// Technologies and Hashtags both take just a companyId — no outputFields or
	// match-array shape like the other enrich operations.
	attributesProperty(showForEnrichTechnologies, 'Example: {"companyId": "344589814"}'),
	attributesProperty(showForEnrichHashtags, 'Example: {"companyId": "344589814"}'),
	...sortProperties(
		showForSearch,
		[
			{ name: 'Employee Count', value: 'employeeCount' },
			{ name: 'Name', value: 'name' },
			{ name: 'Revenue', value: 'revenue' },
		],
		'revenue',
	),
	...paginationProperties(showForSearch),
	...paginationProperties(showForEnrichOrgChart),
];
