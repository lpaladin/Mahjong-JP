interface ResultLogBase {
	verdict: string;
	time?: number;
	memory?: number;
}

interface JudgeResultLog extends ResultLogBase {
	output: {
		display: any;
		content: {
			[index: string]: any;
		}
		command: string;
	}
}

interface BrowserResultLog extends ResultLogBase {
	response: any;
	content: any;
}

interface BotResultLog extends ResultLogBase {
	response: any;
	debug?: any;
}

interface PlayerResultLog {
	[index: string]: BrowserResultLog | BotResultLog
}

declare type FullLogItem = JudgeResultLog | PlayerResultLog;

declare type FullLog = FullLogItem[];