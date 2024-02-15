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


// TODO make logic for getting the pixel on hover
// https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Pixel_manipulation_with_canvas#a_color_picker

// TODO make function to compare pixel hex value to the one in the database
// ensure that there is some kind of fall through if the color is not in the database.

// get local json file and store it in an object
// json file is script that has a hard coded js Object loaded into memory 

const color_data = document.getElementById("colors");

// get  the input tag and add listener
inputFile = document.getElementById("picture");
inputFile.addEventListener("change", loadImage);


