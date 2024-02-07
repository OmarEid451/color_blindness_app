//test to see if I can auto render an image from a browser function
function loadImage(image_element) {
    // TODO fix urlobject_failure
    image_element.src = URL.createObjectURL(this.files);
    image_element.onload = function() {
        URL.revokeObjectURL(image_element.src);
    };
}


// get both the input and image tags from the page.
file = document.getElementById("picture");
image_tag = document.getElementById("current_image");

file.addEventListener("change", loadImage(image_tag));


    
