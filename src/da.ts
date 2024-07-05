import { Page } from "puppeteer";

export default {
	semester: {
		async extractAllSemesters(vtop: Page) {
			return await vtop.evaluate(() => {
				return (Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]')) as HTMLOptionElement[]).map((e) => e.value);
			});
		},
		async selectSemester(vtop: Page, value: string) {
			await vtop.select('select[id="semesterSubId"]', value);
			await vtop.waitForNetworkIdle();
		},
		async hasAssignments(vtop: Page) {
			return await vtop.evaluate(() => {
				return document.querySelectorAll("#fixedTableContainer").length > 0;
			});
		},
		async extractAllAssignments(vtop: Page) {
			const assignments = new Map();
			(await vtop.$$("#fixedTableContainer tr.tableContent")).forEach(async (row) => {
				const tds = await row.$$("td");
				console.log(tds);
				console.log(await tds[0].getProperties());
				assignments.set((await tds[0].getProperty("innerText")).toString().trim(), {
					classNumber: (await tds[1].getProperty("innerText")).toString().trim(),
					courseCode: (await tds[2].getProperty("innerText")).toString().trim(),
					courseTitle: (await tds[3].getProperty("innerText")).toString().trim(),
					courseType: (await tds[4].getProperty("innerText")).toString().trim(),
					facultyName: (await tds[5].getProperty("innerText")).toString().trim()
				});
			});
			// const e = await vtop.evaluate(() => {
			// 	document.querySelectorAll("#fixedTableContainer tr.tableContent").forEach((row) => {
			// 		const tds = row.querySelectorAll("td");
			// 		assignments.set(tds[0].innerText.trim(), {
			// 			classNumber: tds[1].innerText.trim(),
			// 			courseCode: tds[2].innerText.trim(),
			// 			courseTitle: tds[3].innerText.trim(),
			// 			courseType: tds[4].innerText.trim(),
			// 			facultyName: tds[5].innerText.trim()
			// 		});
			// 	});
			// 	console.log(assignments);
			// 	return assignments;
			// });
			console.log(assignments);
			return assignments;
		}
	}
	// assignment: {
	// 	aysnc
	// }
};
