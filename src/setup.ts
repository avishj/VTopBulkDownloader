import puppeteer, { Page } from "puppeteer";
import utils from "./utils.js";

async function init() {
	// Launching the browser
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--start-maximized`]
	});

	// Setting up the page
	const vtop = await browser.newPage();
	await vtop.setViewport({
		width: await vtop.evaluate(() => window.screen.width),
		height: await vtop.evaluate(() => window.screen.height)
	});

	return vtop;
}
// Opening VTop and navigating to the student login page
async function navigateToLoginPage(vtop: Page) {
	await vtop.goto("https://vtop.vit.ac.in/vtop/");
	await vtop.waitForNetworkIdle();
	await vtop.evaluate(`submitForm('stdForm');`); // String Literal as a workaround for the fact that the function is only available in the browser
}
// Logging in
async function login(vtop: Page, username: string, password: string) {
	await vtop.waitForNetworkIdle();
	await vtop.waitForSelector("#username");
	await vtop.type("#username", username);
	await vtop.waitForSelector("#password");
	await vtop.type("#password", password);
	await vtop.evaluate(() => {
		alert("Please solve the captcha and submit the login form. The script will continue once the login request is detected.");
	});
	await new Promise<void>((resolve) =>
		vtop.on("requestfinished", (request) => {
			if (/\/login/.test(request.url())) resolve();
		})
	);
	await vtop.waitForNetworkIdle();
}
// Navigate to the assignments page
async function navigateToAssignmentsPage(vtop: Page) {
	await vtop.waitForSelector('button[data-bs-target="#expandedSideBar"');
	await vtop.click('button[data-bs-target="#expandedSideBar"');
	await vtop.waitForSelector("i.fa-graduation-cap");
	await vtop.click("i.fa-graduation-cap");
	await vtop.waitForSelector('a[data-url="examinations/StudentDA"]');
	await utils.sleep(1000);
	await vtop.click('a[data-url="examinations/StudentDA"]');
	await vtop.waitForNetworkIdle();
}

export default {
	async main() {
		const vtop = await init();
		await navigateToLoginPage(vtop);
		await login(vtop, process.env.VTOP_USERNAME!, process.env.VTOP_PASSWORD!);
		await navigateToAssignmentsPage(vtop);
		return vtop;
	}
};
