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

const backgroundSkin = new Skin({ fill:"silver" });

const bordersSkin = new Skin({ stroke:"black", left:2, right:2, top:2, bottom:2 });

const buttonTexture = new Texture("button.png");
const buttonSkin = new Skin({ texture:buttonTexture, color:["white", "#002f87"], x:0, y:0, width:60, height:40, tiles:{ left:20, right:20 } });
const buttonStyle = new Style({ font:"semibold 16px Open Sans", color:["black", "white"], });

class DragBehavior extends Behavior {
	onFinished(content) {
		content.state = 0;
	}
	onTimeChanged(content) {
		content.state = 1 - Math.quadEaseOut(content.fraction);
	}
	onTouchBegan(content, id, x, y, ticks) {
		let anchor = this.anchor = content.position;
		anchor.x -= x;
		anchor.y -= y;
		content.state = 1;
	}
	onTouchMoved(content, id, x, y, ticks) {
		let anchor = this.anchor;
		content.position = { x:anchor.x + x, y:anchor.y + y };
	}
	onTouchEnded(content, id, x, y, ticks) {
		content.duration = 250;
		content.time = 0;
		content.start();
	}
}

let DragApplication = Application.template($ => ({
	skin:backgroundSkin, style:buttonStyle,
	contents: [
		Container($, {
			left:18, right:18, top:18, bottom:18, skin:bordersSkin,
			contents: [
				Container($, {
					left:2, right:2, top:2, bottom:2, clip:true,
					contents: [
						Label($, { width:320, height:40, string:new Date().toDateString() }),
						Label($, { left:10, top:10, width:120, height:40, skin:buttonSkin, string:"BUTTON_1", active:true, Behavior:DragBehavior }),
						Label($, { right:10, top:10, width:120, height:40, skin:buttonSkin, string:"BUTTON_2", active:true, Behavior:DragBehavior }),
						Label($, { right:10, bottom:10, width:120, height:40, skin:buttonSkin, string:"BUTTON_3", active:true, Behavior:DragBehavior }),
						Label($, { left:10, bottom:10, width:120, height:40, skin:buttonSkin, string:"BUTTON_4", active:true, Behavior:DragBehavior }),
					],
				}),
			],
		}),
	]
}));

export default new DragApplication(null, { commandListLength:4096, displayListLength:4096, touchCount:1 });
