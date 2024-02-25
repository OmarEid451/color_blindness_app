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
    const x = event.offsetX;
    const y = event.offsetY;
    const pixel = context.getImageData(x, y, 1, 1);
    const pixel_data = pixel.data;
    const red_value = pixel_data[0];
    const green_value = pixel_data[1];
    const blue_value = pixel_data[2];
    
    // set pre tag to contain the color name 
    current_color.textContent = findPixelColor(red_value, green_value, blue_value);
}


function findClosestColor(r1, g1, b1) {
    var closestColor = null;
    var closestDistance = Infinity;
    
    // loop and use Euclidian distance  to find the closest color in the database
    for (const color_name in color_db) {
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
canvas.addEventListener("mousemove", displayColor);

