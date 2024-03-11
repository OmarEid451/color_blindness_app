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
    const x = event.clientX;
    const y = event.clientY;
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
    var newRed = red / 255;
    var newGreen = green / 255;
    var newBlue = blue / 255;

    if (newRed > 0.04045) {
        newRed = ((newRed + 0.055) /1.055) ** 2.4;
    }
    else {
        newRed = newRed / 12.92;
    }


    if (newGreen > 0.04045) {
        newGreen = ((newGreen + 0.055) /1.055) ** 2.4;
    }
    else {
        newGreen = newGreen / 12.92;
    }


    if (newBlue > 0.04045) {
        newBlue = ((newBlue + 0.055) /1.055) ** 2.4;
    }
    else {
        newBlue = newBlue / 12.92;
    }

    newRed = newRed * 100;
    newBlue = newBlue * 100;
    newGreen = newGreen * 100;

    var X = (newRed * 0.4124) + (newGreen * 0.3576) + (newBlue * 0.1805);
    var Y = (newRed * 0.2126) + (newGreen * 0.7152) + (newBlue * 0.0722);
    var Z = (newRed * 0.0193) + (newGreen * 0.1192) + (newBlue * 0.9505);

    const XYZ_values = {"X": X, "Y": Y, "Z": Z};
    console.log(XYZ_values);
    return XYZ_values;
}



// convert XYZ to CIELab using a D65/2° illuminaugt observer
function XYZtoCIELAB(X, Y, Z) {
    var newX = X / 95.047;
    var newY = Y / 100.000;
    var newZ = Z / 108.883;

    if (newX > 0.008856) {
        newX = newX ** (1/3);
    }
    else {
        newX = (7.787 * newX) + (16 / 116);
    }


    if (newY > 0.008856) {
        newY = newY ** (1/3);
    }
    else {
        newY = (7.787 * newY) + (16 / 116);
    }

    if (newZ > 0.008856) {
        newZ = newZ ** (1/3);
    }
    else {
        newZ = (7.787 * newZ) + (16 / 116);
    }


    var CIE_L = (116 * newY) - 16;
    var CIE_a = 500 * (newX - newY);
    var CIE_b = 200 * (newY - newZ);

    const CIE_values = {"L": CIE_L, "a": CIE_a, "b": CIE_b};
    console.log(CIE_values);
    return CIE_values;
}



function findClosestColor(r1, g1, b1) {
    var closestColor = null;
    var closestDistance = Infinity;
    // color data holds object of basic color names named safe_color_db

    var safe_color_data = document.getElementById("safe_colors.js");
    // loop and use Euclidian distance  to find the closest color in the database

    for (const color_name in safe_color_db) {
        var rgb = color_db[color_name];
        const r2 = rgb[0];
        const g2 = rgb[1];
        const b2 = rgb[2];

        const distance = Math.sqrt(
            (r1 - r2) ** 2 +
            (g1 - g2) ** 2 +
            (b1 - b2) ** 2 
        );

        if (distance < closestDistance) {
            closestDistance = distance;
            closestColor = color_name;
        }

    }
    return closestColor;

}

/* compares rgb values to values in the json data.
 * if we find an exact match we return the string key
 * otherwise we find the closest color
 * https://nesin.io/blog/find-closest-color-javascript
 */
function findPixelColor(red, green, blue) {
    for (const color_name in color_db) {
	var rgb = color_db[color_name];
	if (red == rgb[0] && green == rgb[1] && blue == rgb[2]) {
	    return color_name;
	}
    }
    // fallthrough to find closest color
    var closestColor = findClosestColor(red, green, blue);
    return closestColor;
}


// get local json file and store it in an object
// json file is script that has a hard coded js Object loaded into memory color_db is the name of the js object.

const color_data = document.getElementById("colors");

// get  the input tag and add listener
inputFile = document.getElementById("picture");
inputFile.addEventListener("change", loadImage);

canvas = document.getElementById("current_image");
canvas.addEventListener("click", displayColor);

//santity checking functions
const xyz = RGBtoXYZ(50, 60, 70);
const cielab = XYZtoCIELAB(xyz["X"], xyz["Y"], xyz["Z"]);
