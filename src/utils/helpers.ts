export default {
	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},
	sanitize(filename: string) {
		const illegalChars = /[\/\\?%*:|"<>.]/g;
		return filename.replace(illegalChars, "_");
	}
};
