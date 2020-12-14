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

const BLACK = "black";
const WHITE = "white";

const OpenSans26 = new Style({ font: "open-sans-reg-26", color: [WHITE, BLACK], horizontal: "left" });
const OpenSans18 = new Style({ font: "open-sans-reg-18", color: [WHITE, BLACK], horizontal: "left" });
const OpenSans100 = new Style({ font: "open-sans-light-num-100", color: "black" });

const orangeSkin = new Skin({ fill: "#f59923" });
const outlineTexture = new Texture("sm-circle-highlight.png");
const outlineSkin = new Skin({ 
	texture: outlineTexture, color: ["#f59923", WHITE],
	x:0, y:0, width:46, height:46
});
const fanTexture = new Texture("sm-fan.png");
const fanSkin = new Skin({ 
	texture: fanTexture, color: WHITE,
	x:0, y:0, width:28, height:28
});
const flameTexture = new Texture("sm-flame.png");
const flameSkin = new Skin({ 
	texture: flameTexture, color: WHITE,
	x:0, y:0, width:22, height:28
});
const currentTexture = new Texture("sm-temp-disc.png");
const currentSkin = new Skin({ 
	texture: currentTexture,
	x:0, y:0, width:198, height:198
});
const setTexture = new Texture("set-disc.png");
const setSkin = new Skin({ 
	texture: setTexture,
	x:0, y:0, width:110, height:110
}); 

const downTexture = new Texture("sm-down-curve.png");
const downSkin = new Skin({ 
	texture: downTexture,
	x:0, y:0, width:90, height:21
});
const upTexture = new Texture("sm-up-curve.png");
const upSkin = new Skin({ 
	texture: upTexture,
	x:0, y:0, width:90, height:21
});
const sunTexture = new Texture("sm-sun.png");
const sunSkin = new Skin({ 
	texture: sunTexture,
	x:0, y:0, width:33, height:45
});
const treeTexture = new Texture("tree.png");
const treeSkin = new Skin({ 
	texture: treeTexture,
	x:0, y:0, width:57, height:63
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
		this.update(arrow, this.data.tempSensor.target);
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
	update(content, target) {
		let data = this.data;
		let tempSensor = data.tempSensor;
		data["TARGET"].string = String(target)+"°";
		if (tempSensor.read() > target) {
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

const months = ["January", "February", "March", "April", "May", "June", "July", "August", "September", "October", "November", "December"];

class DateBehavior extends Behavior {
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
		timeline.from(data["SET"], { x: application.width }, 300, Math.quadEaseOut, 0);
		timeline.from(data["HEADER"], { y: -data["HEADER"].height }, 300, Math.quadEaseOut, -200);
		timeline.from(data["FOOTER"], { y: application.height }, 300, Math.quadEaseOut, -300);
		timeline.from(data["ICONS"], { x: application.width }, 300, Math.quadEaseOut, -300);
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
}));

const CustomHomeScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, 
	skin: orangeSkin,
	contents: [
		Row($, {
			anchor: "HEADER", top: 4, left: 0,
			contents: [
				Content($, { skin: sunSkin }),
				Column($, {
					left: 8,
					contents: [
						Label($, {
							anchor: "DATE", left: 0, top: 0, style: OpenSans26, state: 1,
							Behavior: DateBehavior
						}),
						Label($, {
							left: 0, top: 0,string: "54° | 81°", style: OpenSans18, state: 1
						}),					
					]
				})
			]
		}),
		Container($, {
			top: 50, bottom: 0, left: 0, right: 0,
			contents: [
				Column($, {
					anchor: "ACTUAL", right: 60, top: 20, width: 198, height:198,
					skin: currentSkin,
					contents: [
						Content($, {
							active: true, top: 14, skin: upSkin,
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
							active: true, bottom: 24, skin: downSkin,
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
					anchor: "SET", left: 145, top: 0, width: 110, height:110,
					skin: setSkin,
					contents: [
						Label($, {
							top: 20, string: "Set", style: OpenSans18,
						}),
						Label($, {
							anchor: "TARGET", style: OpenSans26,
						}),
					]
				}),
			]
		}),
		Column($, {
			anchor: "ICONS", top: 200, right: 20,
			contents: [
				new Icon($, { 
					right:0, anchor: "HEAT", 
					contents: [
						new Content($, { skin: flameSkin })
					]
				}),
				new Icon($, { 
					top: 0, right:0, anchor: "FAN", 
					contents: [
						new Content($, { skin: fanSkin })
					]
				}),
			]
		}),
		Row($, {
			anchor: "FOOTER", bottom: 0, left: 0,
			contents: [
				Content($, { skin: treeSkin }),
				Column($, {
					left: 8,
					contents: [
						Label($, {
							top: 10, left: 0, string: "Outdoor", style: OpenSans18, state: 0
						}),	
						Label($, {
							top: -4, left: 0, string: "81°", style: OpenSans26, state: 0
						}),					
					]
				})
			]
		}),
	],
	Behavior: HomeScreenBehavior
}));

export default CustomHomeScreen;


