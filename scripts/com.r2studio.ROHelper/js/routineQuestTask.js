function RoutineQuestEvent(config) {
	this.POLLY_ICON_POINT = {
		x: 1560,
		y: 60,
	};
	this.ROUTIN_QUEST_BOARD_REF = {
		x: 690,
		y: 0,
		width: 540,
		height: 140
	};
	this.QUEST_BUTTON_REF = {
		x: 10,
		y: 340,
		width: 62,
		height: 155
	};
}

RoutineQuestEvent.prototype._getQuestButtonImg = function() {
	return getScreenshotModify(this.QUEST_BUTTON_REF.x, this.QUEST_BUTTON_REF.y, 
								this.QUEST_BUTTON_REF.width, this.QUEST_BUTTON_REF.height,
								this.QUEST_BUTTON_REF.width, this.QUEST_BUTTON_REF.height, 80);
}

RoutineQuestEvent.prototype._getRoutingQuestBoardImg = function() {
	return getScreenshotModify(this.ROUTIN_QUEST_BOARD_REF.x, this.ROUTIN_QUEST_BOARD_REF.y, 
								this.ROUTIN_QUEST_BOARD_REF.width, this.ROUTIN_QUEST_BOARD_REF.height,
								this.ROUTIN_QUEST_BOARD_REF.width, this.ROUTIN_QUEST_BOARD_REF.height, 80);
}

RoutineQuestEvent.prototype.isFocusQuestButton = function() {
	var questBtnImg = _getQuestButtonImg();


	return getScreenshotModify(this.QUEST_BUTTON_REF.x, this.QUEST_BUTTON_REF.y, 
								this.QUEST_BUTTON_REF.width, this.QUEST_BUTTON_REF.height,
								this.QUEST_BUTTON_REF.width, this.QUEST_BUTTON_REF.height, 80);
}

RoutineQuestEvent.prototype._freeImage = function() {
	if (this.carnivalImg) {
		releaseImage(this.carnivalImg);
		this.carnivalImg = null;
	}
	if (this.focusQuestBtnImg) {
		releaseImage(this.focusQuestBtnImg);
		this.focusQuestBtnImg = null;
	}
	if (this.unfocusQuestBtnImg) {
		releaseImage(this.unfocusQuestBtnImg);
		this.unfocusQuestBtnImg = null;
	}
}

RoutineQuestEvent.prototype.initRoutineQuestEvent = function() {
	this._freeImage();
	this.carnivalImg = openImage(getScriptPath() + 'assets/carnival.jpg');
	this.focusQuestBtnImg = openImage(getScriptPath() + 'assets/focusQuestButton.jpg');
	this.unfocusQuestBtnImg = openImage(getScriptPath() + 'assets/unfocusQuestButton.jpg');

	if (!this.carnivalImg || !this.focusQuestBtnImg || !this.unfocusQuestBtnImg) {
		throw 'Failed to load quest images.';
	}
}

RoutineQuestEvent.prototype.openEventButtons = function() {
	tap(this.POLLY_ICON_POINT.x, this.POLLY_ICON_POINT.y, 10);
}

RoutineQuestEvent.prototype.canFlyFishing = function(){
	var cropImg = this._getFlyFishingImg();
	var score = getIdentityScore(cropImg, this.flyFishingImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Fly score:', score);
	return score > 0.85;
}

RoutineQuestEvent.prototype.canReelFishing = function() {
	var cropImg = this._getFlyFishingImg();
	var score = getIdentityScore(cropImg, this.reelFishingImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Reel score:', score);
	return score > 0.96;
}

RoutineQuestEvent.prototype.isNormalBait = function() {
	var cropImg = this._getBaitImg();
	var score = getIdentityScore(cropImg, this.normalBaitImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Normal bait score:', score);
	return score > 0.92;
}

RoutineQuestEvent.prototype.startFishing = function() {
	DEBUG(1, 'Start fishing');

	var isWaitFish = false;
	this.initRoutineQuestEvent();
	
	while (!this.stopFishing) {
		if (isWaitFish === false && this.canFlyFishing()) {
			if (this.stopWhenNormalBait && this.isNormalBait()) {
				DEBUG(0, 'Stop fishing due to normal bait');
				break;
			}
			this.flyRealFishing();
			isWaitFish = true;
		} else if (isWaitFish === true && this.canReelFishing()) {
			this.flyRealFishing();
			isWaitFish = false;
			sleep(1000); // wait for fly fishing button show up
		}
		sleep(200); // sleep 200ms
	}
}

RoutineQuestEvent.prototype.stopFishing = function() {
	this.stopFishing = true;

	this._freeImage();
}

DEBUG(0, 'Load RoutineQuestEvent.js completed');