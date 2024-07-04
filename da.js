export default {
    semester: {
        async extractAll(vtop) {
            return await vtop.evaluate(() => {
                return Array.from(document.querySelectorAll('select[id="semesterSubId"] option[value*="VL"]')).map((e) => e.value);
            });
        },
        async select(vtop, value) {
            await vtop.select('select[id="semesterSubId"]', value);
            await vtop.waitForNetworkIdle();
        },
        async hasAssignments(vtop) { }
    }
};
