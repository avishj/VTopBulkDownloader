import dotenv from "dotenv";
import setup from "./setup.js";
import da from "./da.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const vtop = await setup.init();
	await setup.navigateToLoginPage(vtop);
	await setup.login(vtop, process.env.VTOP_USERNAME!, process.env.VTOP_PASSWORD!);
	await setup.navigateToAssignmentsPage(vtop);

	const semesters = await da.semester.extractAll(vtop);
	console.log(semesters);
}

await main();
