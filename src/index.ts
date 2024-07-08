import dotenv from "dotenv";
import setup from "./setup.js";
import log from "./utils/log.js";
import output from "./output.js";
import directory from "./directory.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const timestamp = new Date().toISOString();
	log.init(timestamp);
	directory.init();
	const vtop = await setup.main();
	await output.main(timestamp, vtop);
	await setup.destroy();
}

await main();
