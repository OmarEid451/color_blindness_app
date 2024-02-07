//test to see if I can auto render an image from a browser function
function loadImage(event) {
    
     /* look at this link for reference https://developer.mozilla.org/en-US/docs/Web/API/File_API/Using_files_from_web_applications */
    // now we need to create a canvas using the loaded image: https://developer.mozilla.org/en-US/docs/Web/API/Canvas_API/Tutorial/Using_images
    image_space.innerHTML = "";
    image_element = document.createElement("img");
    image_element.src = URL.createObjectURL(event.target.files[0]);
    image_element.onload = function() {
        URL.revokeObjectURL(image_element.src);
    };
    image_space.appendChild(image_element);
    
}


// get both the input and div tags from the page.
file = document.getElementById("picture");
image_space = document.getElementById("current_image");

file.addEventListener("change", loadImage);


    
