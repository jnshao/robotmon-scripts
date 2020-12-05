var DEBUG_LEVEL = 0;

function printScreenSize() {
	var screen = getScreenSize();
	DEBUG(0, 'Screen', screen.width, screen.height);
}

function getScriptPath() {
	return getStoragePath() + '/scripts/com.r2studio.ROHelper/';
}

function Bot() {
}

function DEBUG() {
	if (typeof arguments[0] !== 'number') {
		throw 'DEBUG funciont error';
	}
	if (arguments[0] <= this.DEBUG_LEVEL) {
		console.log.apply(undefined, Array.prototype.slice.call(arguments, 1));
	}
}

Bot.prototype.init = function(settings) {
	var FILES = ['fishingTask'];
	var path = getScriptPath() + 'js/';

	for (var index = 0; index < FILES.length; index++) {
		var filePath = path + FILES[index] + '.js';
		var f = readFile(filePath);
		if (f == undefined || f.length == 0){
			throw 'Load file [' + filePath + '] failed';
		}
		runScript(f);
	}

	if (settings.debugLog && settings.debugLog === 'on') {
		DEBUG_LEVEL = 1;
	} else {
		DEBUG_LEVEL = 0;
	}

	switch(settings.task) {
		case "fishingTask":
			this.currentTask = new FishingTask({stopWhenNormalBait: true});
			break;
		default:
			throw "Unknown task [" + settings.task.value + "]";
	}


	DEBUG(1, 'Succeed to initialize Bot.');
}

function startBot(settings) {
	this.bot = new Bot();
	DEBUG(0, "Start Bot");

	try {
		this.bot.init(settings);
	} catch (msg) {
		DEBUG(0, 'Failed to init bot: ', msg);
		return;
	}

	this.bot.currentTask.startTask();
}

function stopBot() {
	DEBUG(0, "Stop Bot");

	if (this.bot.currentTask && this.bot.currentTask.stopTask) {
		this.bot.currentTask.stopTask();
	}
}
