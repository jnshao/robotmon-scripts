function FishingTask(config) {
	this.FISHING_BUTTON = {
		x: 1540,
		y: 700,
		width: 185,
		height: 200,
		tapPoint: {
			x: 1630,
			y: 785
		}
	};
	this.BAIT_IMAGE = {
		x: 1280,
		y: 950,
		width: 95,
		height: 95
	};

	this.stopWhenNormalBait = config.stopWhenNormalBait || false;

	// use -1 to represent infinite
	if (Number(config.fishingTimes) === Number(config.fishingTimes)) {
		this.fishingTimes = (Number(config.fishingTimes) <= 0) ? -1 : Number(config.fishingTimes);
	} else {
		this.fishingTimes = -1;
	}
}

FishingTask.prototype._getFlyFishingImg = function() {
	return getScreenshotModify(this.FISHING_BUTTON.x, this.FISHING_BUTTON.y, 
								this.FISHING_BUTTON.width, this.FISHING_BUTTON.height,
								this.FISHING_BUTTON.width, this.FISHING_BUTTON.height, 80);
}

FishingTask.prototype._getBaitImg = function() {
	return getScreenshotModify(this.BAIT_IMAGE.x, this.BAIT_IMAGE.y, 
								this.BAIT_IMAGE.width, this.BAIT_IMAGE.height,
								this.BAIT_IMAGE.width, this.BAIT_IMAGE.height, 80);
}

FishingTask.prototype._freeImage = function() {
	if (this.flyFishingImg) {
		releaseImage(this.flyFishingImg);
		this.flyFishingImg = null;
	}
	if (this.reelFishingImg) {
		releaseImage(this.reelFishingImg);
		this.reelFishingImg = null;
	}
	if (this.normalBaitImg) {
		releaseImage(this.normalBaitImg);
		this.normalBaitImg = null;
	}
}

FishingTask.prototype.initFishingTask = function() {
	this.isStopFishing = false;

	this._freeImage();
	this.flyFishingImg = this._getFlyFishingImg();
	this.reelFishingImg = openImage(getScriptPath() + 'assets/reelFishing.jpg');
	this.normalBaitImg = openImage(getScriptPath() + 'assets/normalBait.jpg');

	if (!this.reelFishingImg || !this.normalBaitImg) {
		throw 'Failed to load fishing images.';
	}
}

FishingTask.prototype.flyRealFishing = function() {
	var tapPoint = this.FISHING_BUTTON.tapPoint;
	tap(tapPoint.x, tapPoint.y, 30);
}

FishingTask.prototype.canFlyFishing = function(){
	var cropImg = this._getFlyFishingImg();
	var score = getIdentityScore(cropImg, this.flyFishingImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Fly score:', score);
	return score > 0.85;
}

FishingTask.prototype.canReelFishing = function() {
	var cropImg = this._getFlyFishingImg();
	var score = getIdentityScore(cropImg, this.reelFishingImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Reel score:', score);
	return score > 0.97;
}

FishingTask.prototype.isNormalBait = function() {
	var cropImg = this._getBaitImg();
	var score = getIdentityScore(cropImg, this.normalBaitImg);
	
	releaseImage(cropImg);

	DEBUG(1, 'Normal bait score:', score);
	return score > 0.90;
}

FishingTask.prototype.startTask = function() {
	DEBUG(1, 'Start fishing');

	var isWaitFish = false;
	var timeout = 0;
	this.initFishingTask();
	
	while (!this.isStopFishing) {
		DEBUG(1, 'Fishing times: ', this.fishingTimes);
		if (isWaitFish === false && this.canFlyFishing()) {
			if (this.stopWhenNormalBait && this.isNormalBait()) {
				DEBUG(0, 'Stop fishing due to normal bait');
				break;
			}
			this.flyRealFishing();
			isWaitFish = true;
			timeout = 0;
		} else if (isWaitFish === true && this.canReelFishing()) {
			this.flyRealFishing();
			this.fishingTimes--;
			isWaitFish = false;
			timeout = 0;
			sleep(4000); // wait for fly fishing button show up
		} else {
			// cannot fly fishing or real fishing for 20 seconds, reset status
			if (timeout > 200) {
				DEBUG(0, 'Fishing timeout! Reset status.');
				isWaitFish = !isWaitFish;
			}

			timeout++;
			sleep(100);
		}
		if (this.fishingTimes === 0) {
			this.isStopFishing = true;
		}
	}
}

FishingTask.prototype.stopTask = function() {
	this.isStopFishing = true;

	this._freeImage();
}

DEBUG(0, 'Load fishingEvent.js completed');