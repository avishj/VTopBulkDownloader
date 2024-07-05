import dotenv from "dotenv";
import setup from "./setup.js";
import da from "./da.js";
import utils from "./utils.js";

// Loading the environment variables
dotenv.config();

async function main() {
	const vtop = await setup.init();
	await setup.navigateToLoginPage(vtop);
	await setup.login(vtop, process.env.VTOP_USERNAME!, process.env.VTOP_PASSWORD!);
	await setup.navigateToAssignmentsPage(vtop);

	const semesters = await da.semester.extractAllSemesters(vtop);
	console.log(semesters);

	for (const semester of semesters) {
		await da.semester.selectSemester(vtop, semester);
		if (await da.semester.hasAssignments(vtop)) {
			console.log(semester + " has assignments");
			await vtop.waitForNetworkIdle();
			await utils.sleep(1000);
			const assignments = await da.semester.extractAllAssignments(vtop);
			console.log(assignments);
		} else {
			console.log(semester + " has no assignments");
		}
		await utils.sleep(3000);
	}
}

await main();
