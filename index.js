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
await vtop.evaluate(`submitForm('stdForm');`);
// Logging in
// await vtop.type("#stdUsername", process.env.VTOP_USERNAME!);
// await vtop.type("#stdPassword", process.env.VTOP_PASSWORD!);
// await vtop.click("#stdSubmit");
