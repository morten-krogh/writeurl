const pino = require('pino');

function make_logger(config) {
	
	return pino({
		name: 'writeurl',
		level: config.logger.level,
		serializers: {
			req: pino.stdSerializers.req,
			res: pino.stdSerializers.res,
			err: pino.stdSerializers.err
		}
	});
}

module.exports = make_logger;
