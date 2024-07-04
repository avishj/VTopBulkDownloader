export default {
	async pause(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	}
};
