import type {
	IDataObject,
	IExecuteSingleFunctions,
	IHttpRequestOptions,
	ILoadOptionsFunctions,
	INodePropertyOptions,
} from 'n8n-workflow';
import { NodeOperationError, jsonParse } from 'n8n-workflow';

/** Single source of truth for the GTM data API base URL. */
export const BASE_URL = 'https://api.zoominfo.com/gtm/data/v1';

/**
 * Populates a `loadOptionsMethod` dropdown from `GET /lookup/{fieldName}`.
 *
 * Every lookup type returns the same JSON:API shape —
 * `{ id, type, attributes: { name, ... } }` — where `id` is the canonical
 * value the search/enrich endpoints accept back and `name` is display-only.
 * This node's own `scripts/live.mjs` already relies on that for intent
 * topics (`firstIntentTopicId = first?.id`); every other lookup field
 * (departments, industries, ...) follows the same convention.
 */
export async function getLookupOptions(
	this: ILoadOptionsFunctions,
	fieldName: string,
): Promise<INodePropertyOptions[]> {
	const response = (await this.helpers.httpRequestWithAuthentication.call(
		this,
		'zoomInfoPkceOAuth2Api',
		{
			method: 'GET',
			baseURL: BASE_URL,
			url: `/lookup/${fieldName}`,
			headers: { Accept: 'application/vnd.api+json' },
		},
	)) as IDataObject;

	const data = (response.data ?? []) as IDataObject[];

	return data
		.map((item) => {
			const attributes = (item.attributes ?? {}) as IDataObject;
			return {
				name: (attributes.name as string | undefined) ?? String(item.id),
				value: String(item.id),
			};
		})
		.sort((a, b) => a.name.localeCompare(b.name));
}

/**
 * Merges a dedicated dropdown parameter's selected values into
 * `data.attributes[attributeName]`, run as a `preSend` on that parameter
 * (not on the `attributes` JSON property itself).
 *
 * Left a no-op when nothing is selected, so a value still supplied inside the
 * `attributes` JSON blob — the only option before this parameter existed —
 * keeps working. Relies on the router running each parameter's own `preSend`
 * in property-declaration order (see the "Return All" vs "Limit" note on
 * `paginationProperties` below for the precedent), so this must be declared
 * after its resource's `attributes` property.
 */
export function mergeMultiOptionsAttribute(
	paramName: string,
	attributeName: string,
	format: 'array' | 'csv',
) {
	return async function (
		this: IExecuteSingleFunctions,
		requestOptions: IHttpRequestOptions,
	): Promise<IHttpRequestOptions> {
		const values = this.getNodeParameter(paramName, []) as string[];
		if (!Array.isArray(values) || values.length === 0) return requestOptions;

		const body = (requestOptions.body ?? {}) as IDataObject;
		const data = (body.data ?? {}) as IDataObject;
		const attributes = (data.attributes ?? {}) as IDataObject;

		attributes[attributeName] = format === 'csv' ? values.join(',') : values;

		data.attributes = attributes;
		body.data = data;
		requestOptions.body = body;

		return requestOptions;
	};
}

/**
 * Wraps the user-supplied attributes in the JSON:API envelope the GTM API
 * expects: `{ "data": { "type": "<ResourceType>", "attributes": { ... } } }`.
 *
 * The `data.type` value is set per-operation in that operation's
 * `routing.request.body`, so this only has to fill in `attributes`.
 */
export async function applyAttributes(
	this: IExecuteSingleFunctions,
	requestOptions: IHttpRequestOptions,
): Promise<IHttpRequestOptions> {
	const raw = this.getNodeParameter('attributes', '{}') as string | IDataObject | undefined;

	let parsed: IDataObject;

	// Trimmed before the empty check so a field holding only whitespace behaves
	// the same as one left blank, rather than failing as invalid JSON.
	const trimmed = typeof raw === 'string' ? raw.trim() : raw;

	if (trimmed === undefined || trimmed === null || trimmed === '') {
		parsed = {};
	} else if (typeof trimmed === 'string') {
		try {
			parsed = jsonParse<IDataObject>(trimmed);
		} catch {
			throw new NodeOperationError(this.getNode(), 'Attributes is not valid JSON', {
				description: 'Provide a JSON object, for example {"companyName":"ZoomInfo"}',
			});
		}
	} else {
		parsed = trimmed;
	}

	// `parsed === null` is checked explicitly: `typeof null` is 'object', so a
	// literal `null` would otherwise pass and be sent as `"attributes": null`.
	if (parsed === null || typeof parsed !== 'object' || Array.isArray(parsed)) {
		throw new NodeOperationError(this.getNode(), 'Attributes must be a JSON object', {
			description: 'Send the attributes only. The node adds the surrounding data/type envelope.',
		});
	}

	const body = (requestOptions.body ?? {}) as IDataObject;
	const data = (body.data ?? {}) as IDataObject;

	data.attributes = parsed;
	body.data = data;
	requestOptions.body = body;

	return requestOptions;
}
