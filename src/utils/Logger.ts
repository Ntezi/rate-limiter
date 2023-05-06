import winston from "winston";
import {getNamespace} from "cls-hooked";

const logDir = 'data/logs';
const env = process.env.NODE_ENV || 'development'

const levels = {
	error: 0,
	warn: 1,
	info: 2,
	http: 3,
	debug: 4,
}
const level = () => {
	const isDevelopment = env === 'development'
	return isDevelopment ? 'debug' : 'warn'
}

const colors = {
	error: 'red',
	warn: 'yellow',
	info: 'green',
	http: 'magenta',
	debug: 'white',
}

winston.addColors(colors)

//TODO - Add label to logger
const format = winston.format.combine(
	winston.format.colorize({all: true}),
	winston.format.timestamp({format: 'YYYY-MM-DD HH:mm:ss:ms'}),
	// winston.format.label({ label }),
	winston.format.align(),
	winston.format.splat(),
	winston.format.simple(),
	winston.format.printf((info) => {
		const {timestamp, level, message} = info;
		const appNamespace = getNamespace('app');
		const ipAddress = (appNamespace && appNamespace.get('ipAddress')) || 'NO_IP';
		const requestId = (appNamespace && appNamespace.get('requestId')) || 'GLOBAL';
		const path = (appNamespace && appNamespace.get('path')) || 'NO_PATH';
		const method = (appNamespace && appNamespace.get('method')) || 'NO_METHOD';
		return `[${timestamp}] [${requestId}] [${ipAddress}] [${method}] [${path}] [${level}: ${message}]`;
	}),
);

const transports = [
	new winston.transports.Console({format: format,}),
	new winston.transports.File({filename: `${logDir}/error.log`, level: 'error',}),
	new winston.transports.File({filename: `${logDir}/http.log`, level: 'http',}),
	new winston.transports.File({filename: `${logDir}/info.log`, level: 'info',}),
	new winston.transports.File({filename: `${logDir}/debug.log`, level: 'debug',}),
	new winston.transports.File({filename: `${logDir}/all.log`}),
];

const Logger = winston.createLogger({
	level: level(),
	levels,
	format,
	transports,
})

export default Logger
