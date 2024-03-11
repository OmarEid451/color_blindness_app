/* created by Omar Eid
 * 2024-01-27
 * Main functionality for application
 */

/*
Copyright (C) 2024  Omar Eid

This file is part of Color Descriptor Application.
Color Descriptor Application is free software: you can redistribute it and/or modify
it under the terms of the GNU General Public License as published by
the Free Software Foundation, either version 3 of the License, or
(at your option) any later version.

This program is distributed in the hope that it will be useful,
but WITHOUT ANY WARRANTY; without even the implied warranty of
MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE.  See the
GNU General Public License for more details.

You should have received a copy of the GNU General Public License
along with this program.  If not, see <http://www.gnu.org/licenses/>.
*/

// function to load user supplied image to the browser

function loadImage(event) {
    const file = event.target.files[0];

    const image_element = new Image();

    image_element.onload = function () {
        // get canvas element 
        const canvas_element = document.getElementById("current_image");
        const context = canvas_element.getContext("2d");
       
        // Set canvas dimensions to match image
        canvas_element.width = this.width;
        canvas_element.height = this.height;

        // draw image_onto canvas
        context.drawImage(this, 0, 0);
    };
    image_element.src = URL.createObjectURL(file);

}


//  logic for getting the pixel on hover
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas#a_color_picker
// check this page to see how to implement rolling scroll: https://developer.mozilla.org/en-US/docs/Web/API/Element/mousemove_event#examples

function displayColor(event) {
    var current_color = document.getElementById("descriptor");
    var context = event.target.getContext("2d");

    //setting up boundary for reading pixel data
    const bounding = event.target.getBoundingClientRect();
    const x = event.clientX - bounding.left;
    const y = event.clientY - bounding.top;
    const pixel = context.getImageData(x, y, 1, 1);
    const pixel_data = pixel.data;
    const red_value = pixel_data[0];
    const green_value = pixel_data[1];
    const blue_value = pixel_data[2];
    
    // set pre tag to contain the color name 
    current_color.textContent = findPixelColor(red_value, green_value, blue_value);
}

// TODO use https://www.easyrgb.com/en/math.php to create a set of functions to provide more accurate color distances
//  convert Standard-RGB → XYZ 
//  convert XYZ → CIE-L*ab
// use  Delta E* CIE for finding the smallest distance between colors 
// https://sensing.konicaminolta.us/us/blog/understanding-standard-observers-in-color-measurement/


function RGBtoXYZ(red, green, blue) {
    var new_red = red / 255;
    var new_green = green / 255;
    var new_blue = blue / 255;

    if (new_red > 0.04045) {
        new_red = ((new_red + 0.055) /1.055) ** 2.4;
    }
    else {
        new_red = new_red / 12.92;
    }


    if (new_green > 0.04045) {
        new_green = ((new_green + 0.055) /1.055) ** 2.4;
    }
    else {
        new_green = new_green / 12.92;
    }


    if (new_blue > 0.04045) {
        new_blue = ((new_blue + 0.055) /1.055) ** 2.4;
    }
    else {
        new_blue = new_blue / 12.92;
    }

    new_red = new_red * 100;
    new_blue = new_blue * 100;
    new_green = new_green * 100;

    var X = (new_red * 0.4124) + (new_green * 0.3576) + (new_blue * 0.1805);
    var Y = (new_red * 0.2126) + (new_green * 0.7152) + (new_blue * 0.0722);
    var Z = (new_red * 0.0193) + (new_green * 0.1192) + (new_blue * 0.9505);

    const XYZ_values = {"X": X, "Y": Y, "Z": Z};
    console.log(XYZ_values);
    return XYZ_values;
}



// convert XYZ to CIELab using a D65/2° illuminaugt observer
function XYZtoCIELAB(imageValues) {
    var new_x = imageValues["X"] / 95.047;
    var new_y = imageValues["Y"] / 100.000;
    var new_z = imageValues["Z"] / 108.883;

    if (new_x > 0.008856) {
        new_x = new_x ** (1/3);
    }
    else {
        new_x = (7.787 * new_x) + (16 / 116);
    }


    if (new_y > 0.008856) {
        new_y = new_y ** (1/3);
    }
    else {
        new_y = (7.787 * new_y) + (16 / 116);
    }

    if (new_z > 0.008856) {
        new_z = new_z ** (1/3);
    }
    else {
        new_z = (7.787 * new_z) + (16 / 116);
    }


    var CIE_L = (116 * new_y) - 16;
    var CIE_a = 500 * (new_x - new_y);
    var CIE_b = 200 * (new_y - new_z);

    const CIE_values = {"L": CIE_L, "a": CIE_a, "b": CIE_b};
    console.log(CIE_values);
    return CIE_values;
}


function deltaE_CIE(color_one_values, color_two_values) {

    const L1 = color_one_values["L"];
    const a1 = color_one_values["a"];
    const b1 = color_one_values["b"];

    const L2 = color_two_values["L"];
    const a2 = color_two_values["a"];
    const b2 = color_two_values["b"];

    const delta_e = Math.sqrt(
        ((L1 - L2) ** 2) + ((a1 - a2) ** 2) + ((b1 - b2) ** 2)
    );

    return delta_e;
}

    

function findClosestColor(r1, g1, b1) {
    var closest_color = null;
    var closest_distance = Infinity;
    // color data holds object of basic color names named safe_color_database

    var safe_color_data = document.getElementById("safe_colors");
    // convert both RGB to CIELAB values and then compares their Delta to find the distance

    for (const color_name in safe_color_database) {
        var rgb = color_database[color_name];
        const r2 = rgb[0];
        const g2 = rgb[1];
        const b2 = rgb[2];

        const image_XYZ_values = RGBtoXYZ(r1, g1, b1);
        const image_CIE_values = XYZtoCIELAB(image_XYZ_values);

        const database_XYZ_values = RGBtoXYZ(r2, g2, b2);
        const database_CIE_values = XYZtoCIELAB(database_XYZ_values);
        const distance = deltaE_CIE(database_CIE_values, image_CIE_values);
        
        
        if (distance < closest_distance) {
            closest_distance = distance;
            closest_color = color_name;
        }

    }
    return closest_color;

}

/* compares rgb values to values in the json data.
 * if we find an exact match we return the string key
 * otherwise we find the closest color
 * https://nesin.io/blog/find-closest-color-javascript
 */
function findPixelColor(red, green, blue) {
    for (const color_name in color_database) {
	var rgb = color_database[color_name];
	if (red == rgb[0] && green == rgb[1] && blue == rgb[2]) {
	    return color_name;
	}
    }
    // fallthrough to find closest color
    var closest_color = findClosestColor(red, green, blue);
    return closest_color;
}


// get local json file and store it in an object
// json file is script that has a hard coded js Object loaded into memory color_database is the name of the js object.

const color_data = document.getElementById("colors");

// get  the input tag and add listener
inputFile = document.getElementById("picture");
inputFile.addEventListener("change", loadImage);

canvas = document.getElementById("current_image");
canvas.addEventListener("click", displayColor);

//santity checking functions
const xyz = RGBtoXYZ(50, 60, 70);
const cielab = XYZtoCIELAB(xyz);
