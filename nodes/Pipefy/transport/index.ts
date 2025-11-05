"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.graphQlRequest = graphQlRequest;
exports.uploadFile = uploadFile;

const n8n_workflow_1 = require("n8n-workflow");

// Sanitiza recursivamente os valores vindos do resourceMapper:
// transforma "" e "null" (string) em null real
function deepNullify(x) {
	if (Array.isArray(x)) return x.map(deepNullify);
	if (x && typeof x === 'object') {
		const out = {};
		for (const k of Object.keys(x)) out[k] = deepNullify(x[k]);
		return out;
	}
	return (x === '' || x === 'null') ? null : x;
}

async function graphQlRequest({ ctx, query, variables, }) {
	const cleanedVariables = deepNullify(variables);

	const options = {
		method: 'POST',
		baseURL: 'https://api.pipefy.com',
		url: '/graphql',
		json: true,
		body: {
			query,
			variables: cleanedVariables,
		},
	};

	const authenticationMethod = ctx.getNodeParameter('authentication', 0);

	let response;
	try {
		response = await ctx.helpers.httpRequestWithAuthentication.call(
			ctx,
			authenticationMethod,
			options,
		);
	} catch (error) {
		throw new n8n_workflow_1.NodeApiError(ctx.getNode(), error);
	}

	if ('errors' in response) {
		const {
			message,
			extensions: { code: description },
		} = response.errors[0];
		throw new n8n_workflow_1.NodeApiError(ctx.getNode(), { message, description });
	}

	return response.data;
}

async function uploadFile({ ctx, presignedUrl, buffer, mimeType, }) {
	const options = {
		url: presignedUrl,
		method: 'PUT',
		headers: {
			'Content-Type': mimeType,
		},
		body: buffer,
	};

	try {
		await ctx.helpers.httpRequest(options);
	} catch (error) {
		throw new n8n_workflow_1.NodeApiError(ctx.getNode(), error);
	}
}
//# sourceMappingURL=index.js.map
