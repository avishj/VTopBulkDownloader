import dotenv from "dotenv";
import setup from "./setup.js";
import semester from "./semester.js";
import directory from "./directory.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const basePath = await directory.init();
	const vtop = await setup.main();
	await semester.main(vtop);
}

await main();
