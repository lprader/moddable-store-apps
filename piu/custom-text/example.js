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

const textStyle = new Style({
	font: "24px Open Sans"
});

const customText = new Text(null, { 
	style: textStyle,
	string: "CUSTOM_TEXT",
	top: 10, bottom: 10, left: 10, right: 10
});

application.add(customText);