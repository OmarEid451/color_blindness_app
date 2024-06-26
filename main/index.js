/* created by Omar Eid
 * 2024-01-27
 * Main functionality for application
 */

/*
Copyright (C) 2024 Omar Eid 

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

//  use https://www.easyrgb.com/en/math.php to create a set of functions to provide more accurate color distances
//  convert Standard-RGB → XYZ 
//  convert XYZ → CIE-L*ab
// use  Delta E* 2000 for finding the smallest distance between colors 
// https://sensing.konicaminolta.us/us/blog/understanding-standard-observers-in-color-measurement/

//TODO check the math and color spacing on conversion functions.

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

    var X = (new_red * 0.4124564) + (new_green * 0.3575761) + (new_blue * 0.1804375);
    var Y = (new_red * 0.2126729) + (new_green * 0.7151522) + (new_blue * 0.0721750);
    var Z = (new_red * 0.0193339) + (new_green * 0.1191920) + (new_blue * 0.9503041);

    const XYZ_values = {"X": X, "Y": Y, "Z": Z};
    console.log(XYZ_values);
    return XYZ_values;
}



const x_illum = 94.811;
const y_illum = 100.000;
const z_illum = 107.304;
// convert XYZ to CIELab using a D65/2° illuminaugt observer
function XYZtoCIELAB(imageValues) {
    var new_x = imageValues["X"] / x_illum;
    var new_y = imageValues["Y"] / y_illum;
    var new_z = imageValues["Z"] / z_illum;

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


// http://www.brucelindbloom.com/index.html?ColorDifferenceCalc.html

function calculateHPrime(a, b) {
    var bias = 0;

    if (a >= 0 && b == 0) {
        return 0;
    }
    if (a < 0 && b == 0) {
        return 180;
    }
    if (a == 0 && b > 0) {
        return 90;
    }
    if (a == 0 && b < 0) {
        return 270;
    }
    if (a > 0 && b > 0) {
        bias = 0;
    }
    if (a < 0 ) {
        bias = 180;
    }
    if (a > 0 && b < 0 ) {
        bias = 360;
    }

    var arc_tan = Math.atan(b / a);
    const result = (arc_tan + bias) * (Math.PI / 180);
    return result;
}

function calculateDeltaHPrime(h1, h2) {
    var delta_prime = null;
    const h_prime_distance = Math.abs(h2 - h1);

    if (h_prime_distance <= 180) {
        delta_prime = h2 - h1;
    }
    else if (h_prime_distance > 180 && h2 <= h1) {
        delta_prime = h2 - h1 + 360;
    }
    else {
        delta_prime = h2 - h1 - 360;
    }

    if (isNaN(delta_prime)) {
        alert("NaN is in delta_prime");
    }

    return delta_prime;
}


function deltaE_2000(reference_color, sample_color) {

    const L1 = reference_color["L"];
    const a1 = reference_color["a"];
    const b1 = reference_color["b"];

    const L2 = sample_color["L"];
    const a2 = sample_color["a"];
    const b2 = sample_color["b"];

    // setting up variables for solving deltaE
    const L_prime = (L1 + L2) / 2;
    const C1 = Math.sqrt(((a1 ** 2) + (b1 ** 2)));
    const C2 = Math.sqrt(((a2 ** 2) + (b2 ** 2)));
    //viniculum means this in math notation Ã 
    const C_viniculum = (C1 + C2) / 2;
    const G = 0.5 * (1 - Math.sqrt(
        (C_viniculum ** 7) / ((C_viniculum ** 7) + (25 ** 7))));
    const a1_prime = a1 * (1 + G);
    const a2_prime = a2 * (1 + G);

    const C1_prime = Math.sqrt(((a1_prime ** 2) + (b2 ** 2)));
    const C2_prime = Math.sqrt(((a2_prime ** 2) + (b2 ** 2)));

    const C_viniculum_prime = (C1_prime + C2_prime) / 2;
    const h1_prime = calculateHPrime(a1_prime, b1);
    const h2_prime = calculateHPrime(a2_prime, b2);
    
    var h_viniculum_prime = null;

    if (Math.abs(h1_prime - h2_prime) > 180) {
        h_viniculum_prime = (h1_prime + h2_prime + 360) / 2;
    }
    else {
        h_viniculum_prime = (h1_prime + h2_prime) / 2;
    }

    // To calculate T we use cosine functions which take radians as an argument we need to convert all terms which are in degrees to radians

    const cosine_term_one = Math.cos((Math.PI / 180) * (h_viniculum_prime - 30));
    const cosine_term_two = Math.cos((Math.PI / 180) * (2 * h_viniculum_prime));
    const cosine_term_three = Math.cos((Math.PI / 180) * ((3 * h_viniculum_prime) + 6));
    const cosine_term_four = Math.cos((Math.PI / 180) * ((4 * h_viniculum_prime) - 63));

    T = 1 - (0.17 * cosine_term_one) + (0.24 * cosine_term_two) + (0.32 * cosine_term_three) - (0.20 * cosine_term_four);

    const delta_h_prime = calculateDeltaHPrime(h1_prime, h2_prime);
    const delta_l_prime = L2 - L1;
    const delta_c_prime = C2_prime - C1_prime;
    // same as before we use a sin function so we need to convert delta_h_prime to degrees
    const delta_H_prime = 2 * Math.sqrt(C1_prime * C2_prime) * Math.sin((Math.PI / 180) * (delta_h_prime / 2));

    const S_subL = 1 + (
        (0.015 * ((L_prime - 50) ** 2)) / (Math.sqrt(20 + ((L_prime - 50) ** 2)))
    );
    const S_subC = 1 + (0.045 * C_viniculum_prime);
    const S_subH = 1 + (0.015 * (C_viniculum_prime * T));
    const delta_theta = 30 * Math.exp(
        -1 * (((h_viniculum_prime - 275) / 25) ** 2)
    );
    const R_subC = 2 * (Math.sqrt(
        (C_viniculum_prime ** 7) /((C_viniculum_prime ** 7) + (25 ** 7)))
    );
    const R_subT = -1 * (Math.sin((Math.PI / 180) * (2 * delta_theta)) * R_subC);

    // simplify the terms of the delta e equation 

    const term_1 = (delta_l_prime / S_subL) ** 2;
    const term_2 = (delta_c_prime / S_subC) ** 2;
    const term_3 = (delta_H_prime / S_subH) ** 2;
    const term_4 = R_subT + ( (delta_c_prime / S_subC) * (delta_H_prime / S_subH) );


    // now we finally solve delta e

    const delta_e = Math.sqrt(term_1 + term_2 + term_3 + term_4);

    if (isNaN(delta_e)) {
        alert("NaN is in delta_e");
    }

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
        const distance = deltaE_2000(database_CIE_values, image_CIE_values);
        
        
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
