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

import Timeline from "piu/Timeline";

const OpenSans26 = new Style({ font: "open-sans-reg-26", color: ["white", "transparent"] });
const OpenSans18 = new Style({ font: "open-sans-reg-18", color: ["white", "transparent"] });
const OpenSans100 = new Style({ font: "open-sans-light-num-100", horizontal: "right", color: ["white", "transparent"] });

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
const upTexture = new Texture("sm-up-arrow.png");
const upSkin = new Skin({ 
	texture: upTexture,
	x:0, y:0, width:44, height:15
});
const downTexture = new Texture("sm-down-arrow.png");
const downSkin = new Skin({ 
	texture: downTexture,
	x:0, y:0, width:44, height:15
});
const sunTexture = new Texture("sun.png");
const sunSkin = new Skin({ 
	texture: sunTexture,
	x:0, y:0, width:61, height:84
});

class ActualTemperatureBehavior extends Behavior {
	onCreate(label, data) {
		this.data = data;
		this.update(label);
		label.interval = 500;
		label.start();
	}
	onTimeChanged(label) {
		this.update(label)
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

function getTimeString(hour, min) {
	let string = "";
	let ampm = (hour >= 12)? " pm" : " am";
	if (hour == 0) hour = 12;
	else if (hour > 12) hour -= 12;
	string += String(hour);
	string += ":";
	min = min.toString().padStart(2, "0");
	string += min;
	string += ampm;
	return string;
}

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class DateTimeForecastBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
		this.update(container);
		container.interval = 25000;
		container.start();
	}
	onTimeChanged(container) {
		this.update(container);
	}
	update(container) {
		let data = this.data;
		let d = new Date();
		data["TIME"].string = getTimeString(d.getHours(), d.getMinutes());
		data["DATE"].string = months[d.getMonth()] + " " + d.getDate();
	}
}

class HomeScreenBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(container) {
		let data = this.data;
		let timeline = this.timeline = new Timeline();
		timeline.from(data["HEADER"], { y: -100 }, 300, Math.quadEaseOut, 0);
		timeline.from(data["FOOTER"], { y: 320 }, 300, Math.quadEaseOut, -300);
		timeline.seekTo(0);
		container.duration = timeline.duration;
		container.time = 0;
		container.start();
	}
	onTimeChanged(container) {
		let time = container.time;
		this.timeline.seekTo(time);
	}
}

const CustomHomeScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, skin: blueSkin,
	contents: [
		Container($, {
			anchor: "HEADER", left: 0, right: 0, top: 0, height: 100, skin: blackSkin,
			contents: [
				Content($, { top: 6, right: 0, skin: sunSkin }),
				Label($, {
					anchor: "FORECAST", top: 66, right: 56, 
					string: "54° | 81°", style: OpenSans18,
				}),
				Label($, {
					anchor: "DATE", top: 6, left: 17, 
					string: "May 19", style: OpenSans18,
				}),
				Label($, {
					anchor: "TIME", top: 26, left: 17, 
					string: "2:28 pm", style: OpenSans26,
				}),
			],
			Behavior: DateTimeForecastBehavior
		}),
		Column($, {
			top: 100, height: 162, left: 0, right: 0, skin: blueSkin,
			contents: [
				Row($, {
					left: 20, right: 13, top: 25, bottom: 0,
					contents: [
						Column($, {
							top: 0, bottom: 0,
							contents: [
								Content($, {
									active: true, top: 12, skin: upSkin,
									Behavior: class extends ArrowBehavior {
										onCreate(arrow, data) {
											this.delta = 1;
											super.onCreate(arrow, data);
										}
									}
								}),
								Content($, {top: 0, bottom:0}),
								Content($, {
									active: true, bottom: 12, skin: downSkin,
									Behavior: class extends ArrowBehavior {
										onCreate(arrow, data) {
											this.delta = -1;
											super.onCreate(arrow, data);
										}
									}
								}),
							]
						}),
						Content($, {right: 0, left:0}),
						Label($, {
							top: 0, bottom: 0, right: 0, 
							style: OpenSans100,
							Behavior: ActualTemperatureBehavior
						}),
					]
				}),
				Row($, {
					left: 0, right: 0, bottom: 10,
					contents: [
						Content($, {left: 0, right: 0}),
						Label($, {
							anchor: "HEAT_OR_COOL", right: 0, height: 40,
							style: OpenSans26, string: "Heat to "
						}),
						Label($, {
							anchor: "TARGET", left: 0, height: 40,
							style: OpenSans26
						}),
						Content($, {left: 0, right: 0}),
					]
				})
			]
		}),
		Container($, {
			anchor: "FOOTER", left: 0, right: 0, bottom: 0, height: 62, skin: blackSkin,
			contents: [
				Content($, { skin: fanSkin, left: 50, top: 8, width: 40, height: 40, }),
				Content($, { skin: heatSkin, right: 50, top: 8, width: 40, height: 40, }),
				Content($, { 
					anchor: "UNDERLINE", width: 48, height: 6, bottom: 5, left: 45, 
					skin: whiteSkin, Behavior: UnderlineBehavior
				})
			]
		})
	],
	Behavior: HomeScreenBehavior
}));

export default CustomHomeScreen;