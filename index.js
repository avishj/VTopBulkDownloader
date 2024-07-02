import puppeteer from "puppeteer";
import dotenv from "dotenv";
// Loading the environment variables
dotenv.config();
// Launching the browser
const browser = await puppeteer.launch({
    headless: false,
    args: [`--start-maximized`]
});
// Setting up the page
const vtop = await browser.newPage();
vtop.setViewport({
    width: await vtop.evaluate(() => window.screen.width),
    height: await vtop.evaluate(() => window.screen.height)
});
// Navigating to VTop and navigating to the student login page
await vtop.goto("https://vtop.vit.ac.in/vtop/");
await vtop.waitForNetworkIdle();
await vtop.evaluate(`submitForm('stdForm');`);
// Logging in
await vtop.waitForNetworkIdle();
await vtop.type("#username", process.env.VTOP_USERNAME);
await vtop.type("#password", process.env.VTOP_PASSWORD);
await vtop.evaluate(() => {
    alert("Please solve the captcha and submit the login form. The script will continue once the login request is detected.");
});
await new Promise((resolve) => vtop.on("requestfinished", (request) => {
    if (/\/login/.test(request.url()))
        resolve();
}));
await vtop.waitForNetworkIdle();
// Navigate to the assignments page
await vtop.click('button[data-bs-target="#expandedSideBar"');
await vtop.click("i.fa-graduation-cap");
await vtop.click('a[data-url="examinations/StudentDA"]');
await vtop.waitForNetworkIdle();
await vtop.click('h5[id="expandedSideBarLabel"] + button[aria-label="Close"]');
