module.exports = (options) => {
	bundleWorkspacePackages(options);
	enableTranspileOnly(options);
	return options;
};

function bundleWorkspacePackages(options) {
	const original = options.externals;

	options.externals = [
		(ctx, callback) => {
			const request = ctx.request ?? ctx;

			if (typeof request === 'string' && request.startsWith('@dab/')) {
				return callback();
			}

			if (Array.isArray(original)) {
				for (const ext of original) {
					if (typeof ext === 'function') return ext(ctx, callback);
				}
			} else if (typeof original === 'function') {
				return original(ctx, callback);
			}

			return callback();
		},
	];
}

function enableTranspileOnly(options) {
	const tsRule = options.module?.rules?.find((r) => r.loader === 'ts-loader');
	if (tsRule) tsRule.options = { ...tsRule.options, transpileOnly: true };
}
