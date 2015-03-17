"use strict"

function extract_colors(canvas)
{
	var colors = {"swatch_locations": [], "swatch_values": []};
	var width = canvas.getAttribute('width');
	var height = canvas.getAttribute('height');

	for (var i = 0; i<7; i++) {
		colors.swatch_locations.push([
			width*(0.15 + i*0.1),
			height*(0.7),
			width*(0.08),
			height*(0.08)
			]);
	}

	colors.sample_location = [
		width*(0.46),
		height*(0.5),
		width*(0.08),
		height*(0.08)
		];

	colors.values = [5.0, 5.3, 5.5, 5.8, 6.1, 6.5, 7.0];
	colors.swatches = [];

	for (var i in colors.swatch_locations) {
		var swatch = {};
		swatch.color = median_color(canvas.getContext("2d"), 
			colors.swatch_locations[i]);
		swatch.ph = colors.values[i];
		colors.swatches.push(swatch);
	}

	return colors;
}

function median_color(context, rect)
{
	var image_data = context.getImageData(rect[0], rect[1], rect[2], rect[3]);
	var data = image_data.data;

	var reds = [];
	var greens = [];
	var blues = [];
	for(var i = 0, n = data.length; i < n; i += 4) {
		reds.push(data[i]);
		greens.push(data[i+1]);
		blues.push(data[i+2]);
	}
	reds.sort(function(a,b) {return a-b});
	greens.sort(function(a,b) {return a-b});
	blues.sort(function(a,b) {return a-b});

	return [reds[reds.length/2],
			greens[greens.length/2],
			blues[blues.length/2]];
}


function estimate_value(color, swatches)
{
	var points = closest_points(color, swatches);
	var A = points[0].color;
	var B = points[1].color;
	var value = projection_value(A,B, color);
	var ph = (points[1].ph - points[0].ph) * value + points[0].ph;
	return ph;
}


function closest_points(color, colors)
{
	return colors.sort(function(a, b)
	{
		return color_distance(color, a.color) - color_distance(color, b.color);
	});
	return colors;
}


function color_distance(a, b)
{
	var diff = numeric.sub(a,b)
	return Math.sqrt(numeric.dot(diff, diff));
}


function projection_value(a, b, sample)
{
	var sample_v = numeric.sub(sample, a);
	var b_v = numeric.sub(b, a);
	var proj = numeric.dot(sample_v, b_v) / numeric.dot(b_v,b_v);
	return proj;
}


