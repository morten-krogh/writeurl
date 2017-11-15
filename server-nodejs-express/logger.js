const winston = require('winston');

function make_logger(config) {
	
	let transports = [];

	if (config.log_console) {
		transports.push(new winston.transports.Console());
	}

	if (config.log_path) {
		transports.push(new winston.transports.File({
			filename: config.log_path
		}));
	}

	if (config.log_error_path) {
		transports.push(new winston.transports.File({
			level: 'error',
			filename: config.log_error_path
		}));

	}

	return winston.createLogger({
		level: config.log_level,
		transports: transports
	});
}

module.exports = make_logger;
