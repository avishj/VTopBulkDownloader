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

	const semesters = await da.semester.extractAllSemesters(vtop);
	console.log(semesters);

	await da.semester.selectSemester(vtop, semesters[3]);

	if (await da.semester.hasAssignments(vtop)) {
		console.log("has assignments");
		const assignments = await da.semester.extractAllAssignments(vtop);
		console.log(assignments);
	}
}

await main();
