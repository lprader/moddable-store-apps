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

const WHITE = "white";
const ORANGE = "#f59923";

const OpenSans26 = new Style({ font: "open-sans-reg-26", color: WHITE });
const OpenSans18 = new Style({ font: "open-sans-reg-18", color: WHITE  });
const OpenSans100 = new Style({ font: "open-sans-light-num-100", color: "black" });

const orangeSkin = new Skin({ fill: ORANGE });
const outlineTexture = new Texture("circle-highlight.png");
const outlineSkin = new Skin({ 
	texture: outlineTexture, color: [ORANGE, WHITE],
	x:0, y:0, width:62, height:62
});
const fanTexture = new Texture("fan.png");
const fanSkin = new Skin({ 
	texture: fanTexture, color: [ORANGE, WHITE],
	x:0, y:0, width:38, height:38
});
const flameTexture = new Texture("flame.png");
const flameSkin = new Skin({ 
	texture: flameTexture, color: [ORANGE, WHITE],
	x:0, y:0, width:30, height:38
});
const currentTexture = new Texture("temp-disc.png");
const currentSkin = new Skin({ 
	texture: currentTexture,
	x:0, y:0, width:221, height:221
});
const setTexture = new Texture("set-disc.png");
const setSkin = new Skin({ 
	texture: setTexture,
	x:0, y:0, width:110, height:110
});
const downTexture = new Texture("down-curve.png");
const downSkin = new Skin({ 
	texture: downTexture,
	x:0, y:0, width:101, height:24
});
const upTexture = new Texture("up-curve.png");
const upSkin = new Skin({ 
	texture: upTexture,
	x:0, y:0, width:101, height:24
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
	onDisplaying(arrow) {
		this.update(arrow, this.data.tempSensor.target, true);
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
		let target = Number(tempSensor.target) + this.delta;
		tempSensor.updateTarget(target);
		this.update(content, target);
	}
	update(content, target, first = false) {
		let data = this.data;
		data["TARGET"].string = String(target)+"°";
		if (first) return;
		if (data.tempSensor.read() > target) {
			data["FAN"].delegate("fadeIn");
			data["HEAT"].delegate("fadeOut");
		} else {
			data["FAN"].delegate("fadeOut");
			data["HEAT"].delegate("fadeIn");
		}
	}
}

class OutlineBehavior extends Behavior {
	fadeIn(content) {
		if (content.state != 0) return;
		let timeline = this.timeline = new Timeline();
		timeline.to(content, { state: 1 }, 300, Math.quadEaseOut, 0);
		timeline.seekTo(0);
		content.duration = timeline.duration;
		content.time = 0;
		content.start();
	}
	fadeOut(content) {
		if (content.state != 1) return;
		let timeline = this.timeline = new Timeline();
		timeline.to(content, { state: 0 }, 300, Math.quadEaseOut, 0);
		timeline.seekTo(0);
		content.duration = timeline.duration;
		content.time = 0;
		content.start();
	}
	onTimeChanged(content) {
		let time = content.time;
		this.timeline.seekTo(time);
	}
	onFinished(content) {
		delete this.timeline;
	}
}

class HomeScreenBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(container) {
		let data = this.data;
		let timeline = this.timeline = new Timeline();
		// timeline.on(data["ACTUAL"], { x: [-35, -25, -32, -28], y: [200, 27] }, 2000, Math.quadEaseOut, 0);
		// timeline.on(data["SET"], { x: [139, 128, 142, 139], y: [200, 0] }, 1500, Math.quadEaseOut, 0);//-2000);
		timeline.from(data["FAN"], { visible: false }, 5, Math.quadEaseOut, -750);
		timeline.from(data["HEAT"], { visible: false }, 5, Math.quadEaseOut, -750);
		timeline.to(data["FAN"].first, { state: 1 }, 700, Math.quadEaseOut, -700);
		timeline.to(data["HEAT"].first, { state: 1 }, 700, Math.quadEaseOut, -700);
		let on, off;
		if (data.tempSensor.read() > data.tempSensor.target) {
			on = data["FAN"];
			off = data["HEAT"];
		} else {
			off = data["FAN"];
			on = data["HEAT"];
		}
		timeline.to(on, { state: 1 }, 700, Math.quadEaseOut, -700);
		timeline.to(off, { state: 0 }, 700, Math.quadEaseOut, -700);
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

const Icon = Container.template($ => ({
	state: 0, skin: outlineSkin, Behavior: OutlineBehavior
}))

const CustomHomeScreen = Column.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, 
	skin: orangeSkin,
	contents: [
		Container($, {
			top: 0, bottom: 0, left: 0, right: 0,
			contents: [
				Column($, {
					anchor: "ACTUAL", left: -28, top: 27, width: 221, height:221,
					skin: currentSkin,
					contents: [
						Content($, {
							active: true, top: 16, skin: upSkin,
							Behavior: class extends ArrowBehavior {
								onCreate(arrow, data) {
									this.delta = 1;
									super.onCreate(arrow, data);
								}
							}
						}),
						Label($, {
							left: 20, right: 0, top: 0, bottom: 0, style: OpenSans100,
							Behavior: ActualTemperatureBehavior
						}),
						Content($, {
							active: true, bottom: 26, skin: downSkin,
							Behavior: class extends ArrowBehavior {
								onCreate(arrow, data) {
									this.delta = -1;
									super.onCreate(arrow, data);
								}
							}
						}),
					]
				}),
				Column($, {
					anchor: "SET", right: -9, top: 0, width: 110, height:110,
					skin: setSkin,
					contents: [
						Label($, {
							top: 22, left: 0, right: 8, string: "Set", style: OpenSans18,
						}),
						Label($, {
							anchor: "TARGET", left: 0, right: 6, style: OpenSans26,
						}),
					]
				}),
			]
		}),
		Container($, {
			height: 74, bottom: 0, left: 0, right: 0,
			contents: [
				new Icon($, { 
					left: 31, anchor: "FAN", 
					contents: [
						new Content($, { skin: fanSkin })
					]
				}),
				// new Content($, {left: 0, right: 0,}),
				new Icon($, { 
					right: 31, anchor: "HEAT", 
					contents: [
						new Content($, { skin: flameSkin })
					]
				}),
			]
		}),
	],
	Behavior: HomeScreenBehavior
}));

export default CustomHomeScreen;


