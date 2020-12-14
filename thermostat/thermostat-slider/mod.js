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

const PLUS = false;

const OpenSans18 = new Style({ font: "open-sans-reg-18", color: ["black", "transparent"]  });
const OpenSans26 = new Style({ font: "open-sans-reg-26", color: ["black", "transparent"], vertical: "middle", horizontal: "center" });
const OpenSans100 = new Style({ font: "open-sans-light-num-100", color: ["black", "transparent"] });

const WhiteSkin = Skin.template({ fill: ["white", "transparent"] });
const GraySkin = Skin.template({ fill: ["#979797", "transparent"] });

const gradientTexture = new Texture("rainbow-grad.png");
const gradientSkin = new Skin({ 
	texture: gradientTexture,
	x:0, y:0, width:240, height:30
});
const outlineTexture = new Texture("slider.png");
const outlineSkin = new Skin({ 
	texture: outlineTexture,
	x:0, y:0, width:60, height:50
});
const heatTexture = new Texture("sm-flame.png");
const heatSkin = new Skin({ 
	texture: heatTexture,
	x:0, y:0, width:22, height:28
});
const fanTexture = new Texture("sm-fan.png");
const fanSkin = new Skin({ 
	texture: fanTexture,
	x:0, y:0, width:28, height:28
});
const sunTexture = new Texture("sm-sun.png");
const sunSkin = new Skin({ 
	texture: sunTexture,
	x:0, y:0, width:34, height:45
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

class DragBehavior extends Behavior {
	onCreate(content, data) {
		this.data = data;
		this.data.tempSensor.updateTarget(60);
	}
	onFinished(content) {
		content.state = 0;
	}
	onTimeChanged(content) {
		content.state = 1 - Math.quadEaseOut(content.fraction);
	}
	onTouchBegan(content, id, x, y, ticks) {
		let anchor = this.anchor = content.position;
		anchor.x -= x;
		content.state = 1;
	}
	onTouchMoved(content, id, x, y, ticks) {
		let anchor = this.anchor;
		let newX = anchor.x + x;
		if (newX < 0) newX = 0;
		else if (newX > application.width-content.width) newX = application.width-content.width; 
		content.position = { x: newX, y: anchor.y  };
		let fraction = newX/(application.width-content.width);
		let val = Math.floor(fraction * 40 + 60); // min = 60, max = 40+60 = 100
		let data = this.data;
		data["TARGET"].string = val+"°";
		this.data.tempSensor.updateTarget(val);
		if (val > data.tempSensor.current) data["HEAT_OR_FAN"].skin = heatSkin;
		else data["HEAT_OR_FAN"].skin = fanSkin;
	}
	onTouchEnded(content, id, x, y, ticks) {
		content.duration = 250;
		content.time = 0;
		content.start();
	}
}

const Divider = Content.template($ => ({
	Skin: GraySkin, left: 0, right: 0, height: 2, state: 1
}));

const Header = Container.template($ => ({
	anchor: "HEADER", top: 0, height: 50, left: 0, right: 0,
	contents: [
		Label($, {
			top: 0, bottom: 0, left: 10,
			style: OpenSans26, string: "Outside",
		}),
		Label($, {
			top: 0, bottom: 0, right: 10,
			style: OpenSans26, string: "82°",
		}),
	]
}));

const Footer = Container.template($ => ({
	anchor: "FOOTER", left: 0, right: 0, bottom: 0, height: 50,
	contents: [
		Label($, {
			top: 0, bottom: 0, left: 10,
			style: OpenSans26, string: "54° | 81°",
		}),
		Content($, { right: 0, skin: sunSkin }),
	]
}));

class HomeScreenBehavior extends Behavior {
	onCreate(container, data) {
		this.data = data;
	}
	onDisplaying(container) {
		let data = this.data;
		let timeline = this.timeline = new Timeline();
		timeline.from(data["SLIDER"], { y: application.height }, 400, Math.quadEaseOut, 0);
		timeline.to(data["TEMP"], { state: 0 }, 300, Math.quadEaseOut, -400);
		if (PLUS == true) {
			timeline.to(container.first.next, { state: 0 }, 250, Math.quadEaseOut, 100);
			timeline.to(container.last.previous, { state: 0 }, 250, Math.quadEaseOut, -250);
			timeline.from(data["HEADER"].first, { state: 1, x: -data["HEADER"].first.width }, 250, Math.quadEaseOut, -250);
			timeline.from(data["HEADER"].last, { state: 1, x: application.width }, 250, Math.quadEaseOut, -250);
			timeline.from(data["FOOTER"].first, { state: 1, x: -data["FOOTER"].first.width }, 250, Math.quadEaseOut, -250);
			timeline.from(data["FOOTER"].last, { x: application.width }, 250, Math.quadEaseOut, -250);
		}
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

const CustomHomeScreen = Column.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, 
	Skin: WhiteSkin,
	contents: [
		(PLUS == true)? new Header($) : null,
		(PLUS == true)? new Divider($) : null,
		Label($, {
			anchor: "TEMP", top: 10, bottom: 0, left: 0, right: 0,
			style: OpenSans100, state: 1,
			Behavior: ActualTemperatureBehavior
		}),
		Container($, {
			anchor: "SLIDER", left: 0, right: 0,
			contents: [
				Content($, { skin: gradientSkin, left: 0, right: 0, bottom: 23, }),
				Column($, {
					active: true, bottom: 10, left: 0, width: 60,
					contents: [
						Content($, {anchor: "HEAT_OR_FAN", bottom: 9, skin: fanSkin }),
						Label($, { 
							anchor: "TARGET", bottom: 5, left: 0, width: 60, height: 50,
							skin: outlineSkin, style: OpenSans26, string: "60°"
						})
					],
					Behavior: DragBehavior
				}),
			]
		}),
		(PLUS == true)? new Divider($) : null,
		(PLUS == true)? new Footer($) : null,
	],
	Behavior: HomeScreenBehavior
}));

export default CustomHomeScreen;


