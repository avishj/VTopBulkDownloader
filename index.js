import puppeteer from "puppeteer";
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
// Navigating to the page and performing login
await vtop.goto("https://vtop.vit.ac.in/vtop/");
await vtop.evaluate(`submitForm('stdForm');`);
