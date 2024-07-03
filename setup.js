import puppeteer from "puppeteer";
export default {
    async init() {
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
    },
    // Opening VTop and navigating to the student login page
    async navigateToLoginPage(vtop) {
        await vtop.goto("https://vtop.vit.ac.in/vtop/");
        await vtop.waitForNetworkIdle();
        await vtop.evaluate(`submitForm('stdForm');`); // String Literal as a workaround for the fact that the function is only available in the browser
    },
    // Logging in
    async login(vtop, username, password) {
        await vtop.waitForNetworkIdle();
        await vtop.type("#username", username);
        await vtop.type("#password", password);
        await vtop.evaluate(() => {
            alert("Please solve the captcha and submit the login form. The script will continue once the login request is detected.");
        });
        await new Promise((resolve) => vtop.on("requestfinished", (request) => {
            if (/\/login/.test(request.url()))
                resolve();
        }));
        await vtop.waitForNetworkIdle();
    },
    // Navigate to the assignments page
    async navigateToAssignmentsPage(vtop) {
        await vtop.click('button[data-bs-target="#expandedSideBar"');
        await vtop.click("i.fa-graduation-cap");
        await vtop.click('a[data-url="examinations/StudentDA"]');
        await vtop.waitForNetworkIdle();
        await vtop.click('h5[id="expandedSideBarLabel"] + button[aria-label="Close"]');
    }
};
