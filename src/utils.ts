import { Context } from "./enums";

export default {
	async sleep(ms: number) {
		return new Promise((resolve) => setTimeout(resolve, ms));
	},
	async log(context: Context, message: string) {
		console.log(`[${new Date().toLocaleString()}] - [${context}] - ${message}`);
	}
};
