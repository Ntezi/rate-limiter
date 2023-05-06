import morgan, {StreamOptions} from "morgan";
import Logger from "../utils/Logger";
import {IncomingMessage} from 'http'


interface Request extends IncomingMessage {
	body: {
		query: String;
	};
}

const stream: StreamOptions = {
	write: (message) => Logger.http(message.substring(0, message.lastIndexOf("\n"))),
};
const env = process.env.NODE_ENV || "development";

const skip = () => {
	return env !== "development";
};

const registerGraphQLToken = () => {
	morgan.token("graphql-query", (req: Request) => `GraphQL ${req.body.query}`);
};

registerGraphQLToken();

const CommonLoggerMiddleware = morgan(
	":method :url :status :res[content-length] - :response-time ms\n:graphql-query",
	{ stream, skip }
);

export default CommonLoggerMiddleware;
