/*
 * Copyright (c) 2016-2020 Moddable Tech, Inc.
 *
 *   This file is part of the Moddable SDK.
 * 
 *   This work is licensed under the
 *       Creative Commons Attribution 4.0 International License.
 *   To view a copy of this license, visit
 *       <http://creativecommons.org/licenses/by/4.0>
 *   or send a letter to Creative Commons, PO Box 1866,
 *   Mountain View, CA 94042, USA.
 *
 */
 
import {} from "piu/MC";
import LoadMod from "loadmod";
import Timer from "timer";
import Timeline from "piu/Timeline";
import TempSensor from "tempSensor";

const OpenSans26 = new Style({ font: "open-sans-reg-26", color: ["white", "transparent"] });
const OpenSans18 = new Style({ font: "open-sans-reg-18", color: ["white", "transparent"] });
const OpenSans100 = new Style({ font: "open-sans-light-num-100", color: ["white", "transparent"] });

const blueSkin = new Skin({ fill: "#243e82" });
const blackSkin = new Skin({ fill: "black" });
const whiteSkin = new Skin({ fill: "white" });

const heatTexture = new Texture("flame.png");
const heatSkin = new Skin({ 
	texture: heatTexture,
	x:0, y:0, width:30, height:38
});
const fanTexture = new Texture("fan.png");
const fanSkin = new Skin({ 
	texture: fanTexture,
	x:0, y:0, width:38, height:38
});
const upTexture = new Texture("up-arrow.png");
const upSkin = new Skin({ 
	texture: upTexture,
	x:0, y:0, width:90, height:18
});
const downTexture = new Texture("down-arrow.png");
const downSkin = new Skin({ 
	texture: downTexture,
	x:0, y:0, width:90, height:18
});

class ActualTemperatureBehavior extends Behavior {
	onCreate(label, data) {
		this.data = data;
		this.update(label);
		label.interval = 500;
		label.start();
	}
	onTimeChanged(label) {
		this.update(label);
	}
	update(label) {
		label.string = String(this.data.tempSensor.read())+"°";
	}
}

class ArrowBehavior extends Behavior {
	onCreate(arrow, data) {
		this.data = data;
	}
	onTouchBegan(content) {
		this.increment(content);
		content.interval = 400;
		content.time = 0;
		content.start();
	}
	onTouchEnded(content) {
		content.stop();
	}
	onTimeChanged(content) {
		if ( content.time > 2000 ) content.interval = 100;
		else if ( content.time > 1000 ) content.interval = 200;
		this.increment(content);
	}
	increment(content) {
		let data = this.data;
		let tempSensor = data.tempSensor;
		let target = tempSensor.target + this.delta;
		tempSensor.updateTarget(target);
		data["UNDERLINE"].delegate("update", target);
	}
}

class UnderlineBehavior extends Behavior {
	onCreate(underline, data) {
		this.data = data;
	}
	onDisplaying(underline) {
		this.coolX = underline.x;
		let heatX = this.heatX = underline.previous.x;
		let timeline = this.timeline = new Timeline();
		timeline.to(underline, { x: heatX }, 200, Math.quadEaseOut, 0);
		underline.duration = timeline.duration;
		this.update(underline, this.data.tempSensor.target);
	}
	update(underline, target) {
		let data = this.data;
		data["TARGET"].string = String(target)+"°";
		if (this.data.tempSensor.read() > target) {
			data["HEAT_OR_COOL"].string = "Cool to ";
			if (underline.x != this.heatX) return;
			this.reverse = true;
		} else {
			data["HEAT_OR_COOL"].string = "Heat to ";
			if (underline.x != this.coolX) return;
			this.reverse = false;
		}
		underline.time = 0;
		underline.start();
	}
	onTimeChanged(underline) {
		let time = underline.time;
		if (this.reverse) time = underline.duration - time;
		this.timeline.seekTo(time);
	}
}

const DefaultHomeScreen = Column.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	contents: [
		Row($, {
			left: 0, right: 0, height: 48, skin: blackSkin,
			contents: [
				Content($, {left: 0, right: 0}),
				Label($, {
					anchor: "HEAT_OR_COOL", right: 0, height: 40,
					style: OpenSans26
				}),
				Label($, {
					anchor: "TARGET", left: 0, height: 40,
					style: OpenSans26
				}),
				Content($, {left: 0, right: 0}),
			]
		}),
		Column($, {
			top: 0, bottom: 0, left: 0, right: 0, skin: blueSkin,
			contents: [
				Content($, {
					active: true, top: 20, skin: upSkin,
					Behavior: class extends ArrowBehavior {
						onCreate(arrow, data) {
							this.delta = 1;
							super.onCreate(arrow, data);
						}
					}
				}),
				Label($, {
					top: 0, bottom: 0, style: OpenSans100,
					Behavior: ActualTemperatureBehavior
				}),
				Content($, {
					active: true, bottom: 20, skin: downSkin,
					Behavior: class extends ArrowBehavior {
						onCreate(arrow, data) {
							this.delta = -1;
							super.onCreate(arrow, data);
						}
					}
				}),
			]
		}),
		Container($, {
			left: 0, right: 0, height: 62, skin: blackSkin,
			contents: [
				Content($, { skin: fanSkin, left: 50, top: 8, width: 40, height: 40,}),
				Content($, { skin: heatSkin, right: 50, top: 8, width: 40, height: 40,}),
				Content($, { 
					anchor: "UNDERLINE", width: 48, height: 6, bottom: 5, left: 45, 
					skin: whiteSkin, Behavior: UnderlineBehavior
				})
			]
		})
	],
}));


const ThermostatApplication = Application.template($ => ({
	displayListLength: 4096, touchCount: 1,
	contents: [ $.homeScreen ]
}));

export default function () {
	let homeScreen, tempSensor = new TempSensor();
	try {
		if (LoadMod.has("check")) {
			let check = LoadMod.load("check");
			check();
		}
		if (LoadMod.has("mod")) {
			let mod = LoadMod.load("mod");
			homeScreen = new mod({ tempSensor });
		} else {
			homeScreen = new DefaultHomeScreen({ tempSensor });
		}
		return new ThermostatApplication({ homeScreen });

	}
	catch(e) {
		homeScreen = new DefaultHomeScreen({ tempSensor });
		return new ThermostatApplication({ homeScreen });
	}
}
