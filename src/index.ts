import dotenv from "dotenv";
import setup from "./setup.js";
import semester from "./semester.js";
import directory from "./directory.js";
import utils from "./utils.js";

// Loading the environment variables
dotenv.config();

async function main() {
	await directory.init();
	await utils.log.init(await directory.getBasePath());
	const vtop = await setup.main();
	await semester.main(vtop);
}

await main();
