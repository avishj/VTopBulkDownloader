import dotenv from "dotenv";
import setup from "./setup.js";
import semester from "./da/semester.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const vtop = await setup.main();
	await semester.main(vtop);
}

await main();
