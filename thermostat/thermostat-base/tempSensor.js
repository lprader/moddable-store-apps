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

 import Timer from "timer";

function simulateTemperatureChange(sensor) {
	Timer.repeat(() => {
		if (sensor.current < sensor.target) {
			sensor.current++;
		} else {
			sensor.current--;
		}
	}, 1000);
}

class TempSensor {
	constructor() {
		this.current = 65;
		this.target = 70;
		simulateTemperatureChange(this);
	}
	updateTarget(value) {
		value = Math.round(Number(value));
		if (value < 30) value = 30;
		else if (value > 100) value = 100;
		this.target = value;
	}
	read() {
		return this.current;
	}

}

export default TempSensor;