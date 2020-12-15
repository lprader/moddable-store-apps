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
import Timeline from "piu/Timeline";

const BLACK = "black";
const WHITE = "white";

const backgroundSkin = new Skin({ fill:[WHITE, BLACK, WHITE, BLACK, WHITE, BLACK, WHITE, BLACK, WHITE, BLACK, "transparent"] });

const textStyle = new Style({ font: "open-sans-18-reg", color: WHITE });

const moddableTexture = new Texture("moddable.png");
const moddableSkin = new Skin({ texture:moddableTexture, color:[BLACK, WHITE], x:0, y:0, width:210, height:60 });

class BaseBehavior extends Behavior {
	onCreate(container) {
		container.interval = 150;
		container.start();
	}
	onTimeChanged(container) {
		let solidBox = container.last;
		solidBox.state = solidBox.state+1;
		if (solidBox.state == 10) {
			container.stop();
			container.remove(solidBox);
		}
	}
}

class AnimatedBehavior extends Behavior {
	onCreate(container, anchors) {
		this.anchors = anchors;
		this.index = 3;
		this.startAnimation(container);
	}
	startAnimation(container) {
		container.interval = 300;
		container.start();
	}
	onTimeChanged(container) {
		let count = steps.length;
		let index = this.index + 1;
		if (index == count) {
			this.index = 0;
			container.add(new Tagline(tagline));
			container.stop();
		} else {
			this.index = index;
			let step = steps[index];
			let anchors = this.anchors;
			let backgrounds = anchors.backgrounds;
			step.backgrounds.forEach((state, i) => {
				backgrounds[i].state = state;
			});
		}
	}
}

let steps = [
	{ backgrounds: [ 1, 1, 1, 1 ] },
	{ backgrounds: [ 0, 1, 1, 1 ] },
	{ backgrounds: [ 0, 0, 1, 1 ] },
	{ backgrounds: [ 0, 0, 0, 1 ] },

	{ backgrounds: [ 0, 0, 0, 0 ] },
	{ backgrounds: [ 0, 0, 0, 0 ] },
	{ backgrounds: [ 0, 0, 0, 0 ] },
	{ backgrounds: [ 0, 0, 0, 0 ] },

	{ backgrounds: [ 0, 0, 0, 1 ] },
	{ backgrounds: [ 0, 0, 1, 1 ] },
	{ backgrounds: [ 0, 1, 1, 1 ] },
	{ backgrounds: [ 1, 1, 1, 1 ] },
	
	{ backgrounds: [ 1, 1, 1, 1 ] },
];

let tagline = "Tools for developers to create truly open IoT products using standard JavaScript on low cost microcontrollers.";

let Tagline = Text.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0, state: 1,
	skin: backgroundSkin, style: textStyle, string: $,
	Behavior: class extends Behavior {
		onCreate(text) {
			text.duration = 4000;
			text.start();
		}
		onFinished(text) {
			let con = text.container;
			con.delegate("startAnimation");
			con.remove(text);
		}
	}
}));

const DefaultHomeScreen = Container.template($ => ({
	top: 0, bottom: 0, left: 0, right: 0,
	contents: [
		Row($, { top: 0, bottom: 0, left: 0, right: 0,contents:[
			Content($.backgrounds, { anchor:0, width:65, top: 0, bottom: 0, skin:backgroundSkin } ),
			Content($.backgrounds, { anchor:1, width:60, top: 0, bottom: 0, skin:backgroundSkin } ),
			Content($.backgrounds, { anchor:2, width:60, top: 0, bottom: 0, skin:backgroundSkin } ),
			Content($.backgrounds, { anchor:3, width:65, top: 0, bottom: 0, skin:backgroundSkin } ),
		]}),
 		Content($, { anchor:"moddable", skin:moddableSkin } ),
	],
	Behavior: AnimatedBehavior, 
}));	

const BaseApplication = Application.template($ => ({
	skin:backgroundSkin, state:1,
	contents: [
		Container($, { width:250, height:122, clip:true, contents:[
			$.homeScreen,
			Content($, {top: 0, bottom: 0, left: 0, right: 0, skin: backgroundSkin}),
		], 	Behavior: BaseBehavior }),
	],
}));

export default function () {
	let homeScreen;
	try {
		if (LoadMod.has("check")) {
			let check = LoadMod.load("check");
			check();
		}
		if (LoadMod.has("mod")) {
			homeScreen = LoadMod.load("mod");
		} else {
			homeScreen = new DefaultHomeScreen({ backgrounds:[] });
		}

	}
	catch(e) {
		homeScreen = new DefaultHomeScreen({ backgrounds:[] });
	}
	return new BaseApplication({ homeScreen }, { displayListLength:4096, touchCount:0 });
}