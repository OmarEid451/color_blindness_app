//test to see if I can auto render an image from a browser function
function loadImage(event) {
    
    // TODO fix rendering problem in code
     /* look at this link for reference https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications */
    // now we need to create a canvas using the loaded image: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
    image_element = document.createElement("img");
    image_element.src = URL.createObjectURL(event.target.files[0]);

    var canvas_wdith = image_element.width;
    var canvas_height = image_element.height;

    canvas_element.width = canvas_wdith;
    canvas_element.height = canvas_height;
    context = canvas_element.getContext("2d");


    context.drawImage(image_element, 0, 0);
    URL.revokeObjectURL(image_element.src);
}

// get both the input and div tags from the page.
file = document.getElementById("picture");
canvas_element = document.getElementById("current_image");

file.addEventListener("change", loadImage);


    
