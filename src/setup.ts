import puppeteer, { Page } from "puppeteer";
import utils from "./utils.js";
import { Context } from "./enums.js";

let logger: Function;

async function init() {
	logger("Launching the browser!");
	const browser = await puppeteer.launch({
		headless: false,
		args: [`--start-maximized`]
	});
	logger("Creating a new page!");
	const vtop = await browser.newPage();
	logger("Setting the viewport!");
	await vtop.setViewport({
		width: await vtop.evaluate(() => window.screen.width),
		height: await vtop.evaluate(() => window.screen.height)
	});
	return vtop;
}

async function navigateToLoginPage(vtop: Page) {
	logger("Navigating to VTop!");
	await vtop.goto("https://vtop.vit.ac.in/vtop/");
	await vtop.waitForNetworkIdle();
	logger("Navigating to Student Login!");
	await vtop.evaluate(`submitForm('stdForm');`); // String Literal as a workaround for the fact that the function is only available in the browser
}

async function login(vtop: Page, username: string, password: string) {
	logger("Entering login details!");
	await vtop.waitForNetworkIdle();
	await vtop.waitForSelector("#username");
	await vtop.type("#username", username);
	await utils.sleep(500);
	await vtop.waitForSelector("#password");
	await vtop.type("#password", password);
	await utils.sleep(500);
	await vtop.evaluate(() => {
		alert("Please solve the captcha and submit the login form. The script will continue once the login request is detected.");
	});
	logger("Waiting for the captcha to be solved!");
	await new Promise<void>((resolve) =>
		vtop.on("requestfinished", (request) => {
			if (/\/login/.test(request.url())) resolve();
		})
	);
	await vtop.waitForNetworkIdle();
}

async function navigateToDAPage(vtop: Page) {
	// await vtop.waitForSelector('button[data-bs-target="#expandedSideBar"');
	// await vtop.click('button[data-bs-target="#expandedSideBar"');
	logger("Navigating to the DA page!");
	await vtop.waitForSelector("i.fa-graduation-cap");
	await vtop.click("i.fa-graduation-cap");
	await vtop.waitForSelector('a[data-url="examinations/StudentDA"]');
	await utils.sleep(1000);
	await vtop.click('a[data-url="examinations/StudentDA"]');
	await vtop.waitForNetworkIdle();
}

export default {
	async main() {
		logger = utils.log.bind(null, Context.Setup);
		logger("Starting!");
		const vtop = await init();
		await navigateToLoginPage(vtop);
		await login(vtop, process.env.VTOP_USERNAME!, process.env.VTOP_PASSWORD!);
		await navigateToDAPage(vtop);
		logger("Done!");
		return vtop;
	}
};
