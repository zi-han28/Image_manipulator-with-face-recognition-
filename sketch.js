var capture;
var button;
var isCaptured = false;
var capturedImage;
var grayscaleImage;
var redImage;
var blueImage;
var greenImage;
var redThresholdImage, greenThresholdImage, blueThresholdImage;
var redSlider, greenSlider, blueSlider;
var hsbImage;
var hueSlider;
var hueThresholdImage;
var cmyImage;
var cyanSlider;
var cyanThresholdImage;
var detector;
var classifier = objectdetect.frontalface;
var img;
var faces;
var faceAPI;
var blurredImage;
var blurredFace;
var blurMatrix = [
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100],
    [1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100, 1/100]
];
var matrixSize = 10;
var mode = 0;
var pixelBlock = 10;
var cmyFace;
var zoomedFace;
var pixelatedImage = null;  
var posterizedImage;

function setup() {
    createCanvas(800, 640);
    pixelDensity(1);
    capture = createCapture(VIDEO);
    capture.size(320, 240);
    button = createButton('take');
    button.mousePressed(capturedImg);
    
    // Create sliders for each channel
    redSlider = createSlider(0, 255, 128);
    redSlider.position(700, 100);
    
    greenSlider = createSlider(0, 255, 128);
    greenSlider.position(700, 130);
    
    blueSlider = createSlider(0, 255, 128);
    blueSlider.position(700, 160);
    
    cyanSlider = createSlider(0,255,128);
    cyanSlider.position(700, 190);
    
    hueSlider = createSlider(0,255,128);
    hueSlider.position(700, 220);
    
    //set up face detection
    faceAPI = createCapture(VIDEO);
    faceAPI.size(160, 120);
    faceAPI.hide();
    
    var scaleFactor = 1.2;
    detector = new objectdetect.detector(160, 120, scaleFactor, classifier);
    faceImg = createImage(160, 120);
    grayfaceImg = createImage(160, 120);
    

}

function capturedImg() {
    // Draw the captured image
    capturedImage = createImage(capture.width, capture.height);
    capturedImage.copy(capture, 0, 0, capture.width, capture.height, 0, 0, capture.width, capture.height);
    capturedImage.loadPixels();
    // Remove the video and button elements
    capture.remove();
    button.remove();
    isCaptured = true;

    // Grayscale version of the captured image
    grayscaleImage = createImage(capturedImage.width, capturedImage.height);
    grayscaleImage.loadPixels();
    
    for (var y = 0; y < grayscaleImage.height; y++) {
        for (var x = 0; x < grayscaleImage.width; x++) {
            var pixelIndex = ((grayscaleImage.width * y) + x) * 4;
            var pixelRed = capturedImage.pixels[pixelIndex + 0];
            var pixelGreen = capturedImage.pixels[pixelIndex + 1];
            var pixelBlue = capturedImage.pixels[pixelIndex + 2];
            var pixelAlpha = capturedImage.pixels[pixelIndex + 3];
            
            // Calculate the average to convert to grayscale
            var ave = (pixelRed + pixelGreen + pixelBlue) / 3;
            // make grayscale 20% brighter, and make sure do not exceed 255
            ave = min(ave*1.2, 255);
            
            // Set the RGB to the average value (grayscale)
            grayscaleImage.pixels[pixelIndex + 0] = ave;
            grayscaleImage.pixels[pixelIndex + 1] = ave;
            grayscaleImage.pixels[pixelIndex + 2] = ave;
            grayscaleImage.pixels[pixelIndex + 3] = pixelAlpha; // Preserve the alpha value
        }
    }
    grayscaleImage.updatePixels();
        
    // Red channel version of the captured image
    redImage = createImage(capturedImage.width, capturedImage.height);
    redImage.loadPixels();
    for (var y = 0; y < capturedImage.height; y++) {
        for (var x = 0; x < capturedImage.width; x++) {
            var pixelIndex = ((capturedImage.width * y) + x) * 4;
            var pixelRed = capturedImage.pixels[pixelIndex + 0];
            // Set only the red channel, set green and blue to zero
            redImage.pixels[pixelIndex + 0] = pixelRed;
            redImage.pixels[pixelIndex + 1] = 0;
            redImage.pixels[pixelIndex + 2] = 0; 
            redImage.pixels[pixelIndex + 3] = capturedImage.pixels[pixelIndex + 3]; // Preserve the alpha value
        }
    }
    redImage.updatePixels();
    
    // Green channel version of the captured image
    greenImage = createImage(capturedImage.width, capturedImage.height);
    greenImage.loadPixels();
    
        for (var y = 0; y < capturedImage.height; y++) {
            for (var x = 0; x < capturedImage.width; x++) {
                var pixelIndex = ((capturedImage.width * y) + x) * 4;
                var pixelGreen = capturedImage.pixels[pixelIndex + 1];

                // Set only the green channel, set red and blue to zero
                greenImage.pixels[pixelIndex + 0] = 0;
                greenImage.pixels[pixelIndex + 1] = pixelGreen;
                greenImage.pixels[pixelIndex + 2] = 0;
                greenImage.pixels[pixelIndex + 3] = capturedImage.pixels[pixelIndex + 3]; // Preserve the alpha value
        }
    }
    greenImage.updatePixels();
    
    // Blue channel version of the captured image
    blueImage = createImage(capturedImage.width, capturedImage.height);
    blueImage.loadPixels();
    
        for (var y = 0; y < capturedImage.height; y++) {
            for (var x = 0; x < capturedImage.width; x++) {
                var pixelIndex = ((capturedImage.width * y) + x) * 4;
                var pixelBlue = capturedImage.pixels[pixelIndex + 2];

                // Set only the blue channel, set red and green to zero
                blueImage.pixels[pixelIndex + 0] = 0;
                blueImage.pixels[pixelIndex + 1] = 0;
                blueImage.pixels[pixelIndex + 2] = pixelBlue;
                blueImage.pixels[pixelIndex + 3] = capturedImage.pixels[pixelIndex + 3]; // Preserve the alpha value
        }
    }
    blueImage.updatePixels();
    
    // Initialize images for each threshold channel
    redThresholdImage = createImage(capturedImage.width, capturedImage.height);
    greenThresholdImage = createImage(capturedImage.width, capturedImage.height);
    blueThresholdImage = createImage(capturedImage.width, capturedImage.height);
    
    //converting rgb to hsb
    hsbImage = createImage(capturedImage.width, capturedImage.height);
    hsbImage.loadPixels();
    
    for (let y = 0; y < capturedImage.height; y++) {
        for (let x = 0; x < capturedImage.width; x++) {
            let pixelIndex = ((capturedImage.width * y) + x) * 4;
            let pixelRed = capturedImage.pixels[pixelIndex + 0];
            let pixelGreen = capturedImage.pixels[pixelIndex + 1];
            let pixelBlue = capturedImage.pixels[pixelIndex + 2];

            // Convert RGB to HSB
            let hsb = rgbToHsv(pixelRed, pixelGreen, pixelBlue);

            // Display hue as red, saturation as green, brightness as blue 
            hsbImage.pixels[pixelIndex + 0] = hsb.h;// Hue 
            hsbImage.pixels[pixelIndex + 1] = hsb.s; // Saturation
            hsbImage.pixels[pixelIndex + 2] = hsb.v;// Brightness
            hsbImage.pixels[pixelIndex + 3] = 255; // Alpha channel 
        }
    }
    hsbImage.updatePixels();
    // Initialize threshold images for each hue channel
    hueThresholdImage = createImage(hsbImage.width, hsbImage.height);
    
    //converting rgb to cmy
    cmyImage = createImage(capturedImage.width, capturedImage.height);
    cmyImage.loadPixels();
    for (let y = 0; y < capturedImage.height; y++){
        for (let x = 0; x < capturedImage.width; x++){
            let pixelIndex = ((capturedImage.width * y) + x) * 4;
            let pixelRed = capturedImage.pixels[pixelIndex + 0];
            let pixelGreen = capturedImage.pixels[pixelIndex + 1];
            let pixelBlue = capturedImage.pixels[pixelIndex + 2];
            // Convert RGB to CMYK
            let cmyk = rgbToCmy(pixelRed, pixelGreen, pixelBlue);
            
            // Display hue as red, saturation as green, brightness as blue cmyk[0];// cyan
            cmyImage.pixels[pixelIndex + 0] = cmyk.c ; // C as Red
            cmyImage.pixels[pixelIndex + 1] = cmyk.m ; // M as Green
            cmyImage.pixels[pixelIndex + 2] = cmyk.y ; // Y as Blue
            cmyImage.pixels[pixelIndex + 3] = 255; // Alpha channel 
            
        }
    }
    cmyImage.updatePixels();
    // Initialize threshold images for each Cyan channel
    cyanThresholdImage = createImage(cmyImage.width, cmyImage.height);
    
    //detect and zoom on face in image for CMY effect
    zoomedFace = detectAndZoomFace(capturedImage);
    // Load pixels from the zoomed image
    zoomedFace.loadPixels();
    cmyFace = createImage(zoomedFace.width, zoomedFace.height);
    cmyFace.loadPixels();
    for (let y = 0; y < zoomedFace.height; y++) {
        for (let x = 0; x < zoomedFace.width; x++) {
            let pixelIndex = ((zoomedFace.width * y) + x) * 4;
            let pixelRed = zoomedFace.pixels[pixelIndex + 0];
            let pixelGreen = zoomedFace.pixels[pixelIndex + 1];
            let pixelBlue = zoomedFace.pixels[pixelIndex + 2];

            // Convert RGB to CMY
            let cmyk = rgbToCmy(pixelRed, pixelGreen, pixelBlue);

            // Assign CMY values to the RGB channels of the CMY image
            cmyFace.pixels[pixelIndex + 0] = cmyk.c; // C as Red
            cmyFace.pixels[pixelIndex + 1] = cmyk.m; // M as Green
            cmyFace.pixels[pixelIndex + 2] = cmyk.y; // Y as Blue
            cmyFace.pixels[pixelIndex + 3] = 255;    // Alpha channel
        }
    }
    cmyFace.updatePixels();
    // zoom in on the face detected in the image for blur effect
    blurredImage = detectAndZoomFace(capturedImage);
    blurredImage.loadPixels();
    // Initialise blur filter
    blurredFace = createImage(blurredImage.width, blurredImage.height);
    blurredFace.loadPixels();
    for (let x = 0; x < blurredImage.width; x++) {
        for (let y = 0; y < blurredImage.height; y++) {
            let c = convolution(x, y, blurMatrix, matrixSize, blurredImage);
            let index = (x + y * blurredImage.width) * 4;
            blurredFace.pixels[index + 0] = c[0];
            blurredFace.pixels[index + 1] = c[1];
            blurredFace.pixels[index + 2] = c[2];
            blurredFace.pixels[index + 3] = 255; // alpha channel
        }
    }

    blurredFace.updatePixels();
}

function draw() {
    background(255);
    // Labels for sliders
    fill(0);
    textSize(16);
    text('Red image:', 600, 108);
    text('Green image:', 585, 136);
    text('Blue image:', 597, 165);
    text('CMY image:', 594, 195);
    text('Hue image:', 594, 225);
    

    
    if (!isCaptured) {
    image(capture, 0, 0, 160, 120);   

    } else {
        // Display the captured image
        image(capturedImage, 0, 0, 160, 120);
        image(capturedImage, 0, 390, 160, 120);
        // Display the grayscale image next to the original
        image(grayscaleImage, 180, 0, 160, 120);
        // Display the red channel image 
        image(redImage, 0, 130, 160, 120 );
        // Display the green channel image 
        image(greenImage, 180, 130, 160, 120);
        //Display the blue channel image
        image(blueImage, 360,130, 160, 120);
        //Display the hsb image
        image(hsbImage, 180,390,160,120);
        //Display the cmyk image
        image(cmyImage, 360, 390,160,120);

                 
        // Get the slider values for each channel
        let redThreshold = redSlider.value();
        let greenThreshold = greenSlider.value();
        let blueThreshold = blueSlider.value();
        let cyanThreshold = cyanSlider.value();
        let hueThreshold = hueSlider.value();
        // Apply thresholding for the red channel
        applyThreshold(redImage, redThresholdImage, redThreshold, 0);
        image(redThresholdImage, 0, 260, 160, 120);

        // Apply thresholding for the green channel
        applyThreshold(greenImage, greenThresholdImage, greenThreshold, 1);
        image(greenThresholdImage, 180, 260, 160, 120);

        // Apply thresholding for the blue channel
        applyThreshold(blueImage, blueThresholdImage, blueThreshold, 2);
        image(blueThresholdImage, 360, 260, 160, 120);
        
        // Apply thresholding for the Cyan channel
        applyThreshold(cmyImage, cyanThresholdImage, cyanThreshold, 0);
        image(cyanThresholdImage, 360, 520, 160, 120);
        
        // Apply thresholding for the hue channel
        applyThreshold(hsbImage, hueThresholdImage, hueThreshold, 0);
        image(hueThresholdImage, 180, 520, 160, 120);
        
//        Initialise the face application
        image(faceAPI, 0, 520, 160, 120);
        faceImg.copy(faceAPI, 0, 0, faceAPI.width, faceAPI.height, 0, 0, faceAPI.width, faceAPI.height);
        faces = detector.detect(faceImg.canvas);
        strokeWeight(2);
        stroke(255);
        noFill();
        
        for (var i=0; i<faces.length; i++){
            var face = faces[i];
            if (face[4] > 4){
               // Scale the detected face coordinates to match the video size
                let x = face[0] * (160 / faceImg.width);
                let y = face[1] * (120 / faceImg.height);
                let w = face[2] * (160 / faceImg.width);
                let h = face[3] * (120 / faceImg.height);
                rect(x, y + 520, w, h);  // Adjusted for the video position on the canvas

                switch (mode) {
                    case 1:
                        // zoom in on the face detected in the image
                        let grayFace = detectAndZoomFace(grayscaleImage);
                        if (grayFace !== null) {
                            // Display the detected face
                            image(grayFace, x, y + 520, w, h);
                        } else {
                            // if no faces detected, it will display the grayscale image instead
                            image(grayscaleImage, x, y + 520, w, h)
                        }
                        break;
                    case 2:
                        if (blurredFace !== null) {
                            // Display the detected face
                            image(blurredFace, x, y + 520, w, h);
                        } else {
                            // if no faces detected, it will display the blurred image instead
                            image(blurredImage, x, y + 520, w, h)
                        }
                        break;
                    case 3:
                        // zoom in on the face detected in the image
                        if (cmyFace !== null) {
                            // Display the detected face
                            image(cmyFace, x, y + 520, w, h);
                        } else {
                            // if no faces detected, it will display the CMY image instead
                            image(cmyImage, x, y + 520, w, h)
                        }
                        break;
                    case 4:
                        // zoom in on the face detected in the image
                        if (pixelatedImage !== null) {
                            image(pixelatedImage, x, y + 520, w, h);
                        }else{
                            // if no faces detected, it will display the pixelated image instead
                            image(capturedImage, x, y + 520, w, h)
                        }
                        break;
                    case 5:
                        // zoom in on the face detected in the image
                        if (posterizedImage !== null) {
                            image(posterizedImage, x, y + 520, w, h);
                        }else{
                            // if no faces detected, it will display the pixelated image instead
                            image(capturedImage, x, y + 520, w, h)
                        }
                        break;
                        
                }
            }

        }

                
        
    }
}


// Extension function to posterise the colour of image pixels
function posterizeColor(i) {
    if (i < 64) {
        return 31;
    } else if (i >= 64 && i < 128) {
        return 95;
    } else if (i >= 128 && i < 192) {
        return 159;
    } else if (i >= 192 && i < 256) {
        return 223;
    }
}
// Extension function to posterise the image
function posterizeImage(img) {
    let w = img.width;
    let h = img.height;
    let posterizedImg = createImage(w, h);
    posterizedImg.loadPixels();
    img.loadPixels();

    for (let x = 0; x < w; x++) {
        for (let y = 0; y < h; y++) {
            let index = (x + y * w) * 4;
            let r = img.pixels[index + 0];
            let g = img.pixels[index + 1];
            let b = img.pixels[index + 2];

            // Apply the posterize color function to each RGB component
            r = posterizeColor(r);
            g = posterizeColor(g);
            b = posterizeColor(b);

            // Set the new color to the pixel in the new image
            posterizedImg.pixels[index + 0] = r;
            posterizedImg.pixels[index + 1] = g;
            posterizedImg.pixels[index + 2] = b;
            posterizedImg.pixels[index + 3] = 255; // Alpha channel
        }
    }
    
    posterizedImg.updatePixels();
    return posterizedImg;
}

// face detection and zoom
function detectAndZoomFace(image) {
    // Load pixels from the image
    image.loadPixels();

    // Detect faces in the image using the face detector
    let faces = detector.detect(image.canvas);

    // If faces are detected
    if (faces.length > 0) {
        for (let i = 0; i < faces.length; i++) {
            let face = faces[i];
            if (face[4] > 4) { //filter out weak detections

                // Calculate scaling factors based on the image size
                let scaleX = image.width / faceImg.width;
                let scaleY = image.height / faceImg.height;

                // Scale the detected face coordinates to match the image size
                let x = face[0] * scaleX;
                let y = face[1] * scaleY;
                let w = face[2] * scaleX;
                let h = face[3] * scaleY;

                // Cut out the detected face and return it as a new image
                return image.get(x, y, w, h);
            }
        }
    }

//    // Return null if no face is detected
    return null;
}

function pixelation(image, pixelBlock) {
    let pixelatedImg = createImage(image.width, image.height);
    pixelatedImg.loadPixels();
    //outer loop iterate over image
    for (let i = 0; i < image.width; i += pixelBlock) {
        for (let j = 0; j < image.height; j += pixelBlock) {
            let totalIntensity = 0;
            let count = 0;

            // inner loop iterate over each pixel in a block
            for (let bx = 0; bx < pixelBlock; bx++) {
                for (let by = 0; by < pixelBlock; by++) {
                  //calculate the coordinates of each pixel within the block
                    let pixelX = i + bx;
                    let pixelY = j + by;
                    
                    if (pixelX < image.width && pixelY < image.height) {
                        let pixelColor = image.get(pixelX, pixelY); //retrieves the color of each pixel
                        let intensity = brightness(pixelColor); //calculate the brightness of each pixel's colour.
                        totalIntensity += intensity;
                        count++;
                    }
                }
            }

            let avgIntensity = totalIntensity / count; //calculate average intensity
            let avgColor = color(avgIntensity); //calculate average colour

            // Paint each block with average intensity
            for (let bx = 0; bx < pixelBlock; bx++) {
                for (let by = 0; by < pixelBlock; by++) {
                    let pixelX = i + bx;
                    let pixelY = j + by;
                    // each block is set to average colour
                    if (pixelX < image.width && pixelY < image.height) {
                        pixelatedImg.set(pixelX, pixelY, avgColor);
                    }
                }
            }
        }
    }
    // update the new pixelated image and return
    pixelatedImg.updatePixels();
    return pixelatedImg;
}


//// Function to switch modes when pressing 1 or 2 
function keyPressed() {
    switch (key) {
        case '1':
            mode = 1;  //grayscale image
            break;
        case '2':
            mode = 2;  // blurred image
            break;
        case '3':
            mode = 3 // CMY image
            break;
        case '4':
            mode = 4 // Pixelated image
            if (mode == 4 && pixelatedImage == null) {
                let detectedFace = detectAndZoomFace(grayscaleImage);
                if (detectedFace) {
                    pixelatedImage = pixelation(detectedFace, pixelBlock);
                }
            }
            break;
        case '5':
            mode = 5;  // Apply posterize filter
            if (mode == 5 && posterizedImage == null) {
                let posterizeFace = detectAndZoomFace(capturedImage);  // Detect and zoom in on the face
                if (posterizeFace) {
                    posterizedImage = posterizeImage(posterizeFace);  // Apply posterize filter
                }
            }
            break;
        default:
            mode = 0;  // defualt rectangle
            break;
    }
}
    
// Threshold
function applyThreshold(inputImage, outputImage, threshold, channel) {
    outputImage.loadPixels();
    for (var y = 0; y < inputImage.height; y++) {
        for (var x = 0; x < inputImage.width; x++) {
            var pixelIndex = ((inputImage.width * y) + x) * 4;
            var pixelValue = inputImage.pixels[pixelIndex + channel];
            
            // Apply threshold value to the pixel value
            if (pixelValue > threshold) {//when pixel value is more than threshold, assign the respective colour channel
                outputImage.pixels[pixelIndex + 0] = (channel == 0) ? pixelValue : 0; // red pixels
                outputImage.pixels[pixelIndex + 1] = (channel == 1) ? pixelValue : 0; // Green pixels
                outputImage.pixels[pixelIndex + 2] = (channel == 2) ? pixelValue : 0; // Blue pixels
                outputImage.pixels[pixelIndex + 3] = inputImage.pixels[pixelIndex + 3]; // Alpha
            } else {
                outputImage.pixels[pixelIndex + 0] = 0;
                outputImage.pixels[pixelIndex + 1] = 0; 
                outputImage.pixels[pixelIndex + 2] = 0; 
                outputImage.pixels[pixelIndex + 3] = inputImage.pixels[pixelIndex + 3]; // Alpha
            }
        }
    }
    outputImage.updatePixels();
}
// To convert rgb to hsb
function rgbToHsv(r, g, b) {
    // Normalize the RGB values to the range [0, 1]
    r /= 255;
    g /= 255;
    b /= 255;

    // Find the minimum and maximum values among R, G, B
    let max = Math.max(r, g, b);
    let min = Math.min(r, g, b);

    // Calculate the Lightness
    let v = max;
    // Calculate the Saturation
    let delta = (max-min);
    let s = (delta / max);
    let h;

    if (s == 0) {
        //monochrome
        h = 0; 
    } else {
        
        let hueR = (max - r)/ delta;
        let hueG = (max - g)/ delta;
        let hueB = (max - b)/ delta;
        // Calculate the Hue
        if (max == r && min == g) {
            h = 5 + hueB;
        } else if (max == r && min !== g) {
            h = 1 - hueG;
        } else if(max == g && min == b){
            h = 1 + hueR;
        }else if(max == g && min !== b){
            h = 3 - hueB;
        }else if(max == r){
            h = 3 + hueG;
        }else{
            h = 5 - hueR;
        }
        // convert hue to degrees
        h *= 60; 
        if (h < 0) h += 360;// ensure hue is within the range of 0 to 360
    }
    // take the percentage of saturation and value
    s = Math.round( s * 100 );
    v = Math.round( v * 100 );
    
    // Return the HSB values
    return {h: h, s: s , v: v };
}

function rgbToCmy (r, g, b){

    var c = 1 - (r / 255);
    var m = 1 - (g / 255);
    var y = 1 - (b / 255);

    // take the percentage of each value
    c = Math.round( c * 255 );
    m = Math.round( m * 255 );
    y = Math.round( y * 255 );
    
    return {
        c: c,
        m: m,
        y: y
    }
}

function convolution(x, y, matrix, matrixSize, img) {
    let redPixels = 0.0;
    let greenPixels = 0.0;
    let bluePixels = 0.0;
    let offset = floor(matrixSize / 2);

    // Convolution matrix loop
    for (let i = 0; i < matrixSize; i++) {
        for (let j = 0; j < matrixSize; j++) {
            // Get pixel location within convolution matrix
            let xConvo = x + i - offset;
            let yConvo = y + j - offset;

            // Ensure we don't address a pixel that doesn't exist 
            xConvo = constrain(xConvo, 0, img.width - 1);
            yConvo = constrain(yConvo, 0, img.height - 1);
            let index = (xConvo + yConvo * img.width) * 4;

            // Multiply all values with the mask and sum up 
            redPixels += img.pixels[index + 0] * matrix[i][j];
            greenPixels += img.pixels[index + 1] * matrix[i][j];
            bluePixels += img.pixels[index + 2] * matrix[i][j];
        }
    }

    // Return color as array
    return [redPixels, greenPixels, bluePixels];
}




//Commentary

//Based on the images of each channel, they each have different results while having the same threshold value. The red channel shows a high intensity of red in the areas like the skin tones, while green and blue have lower intensity in those areas. The cause of this difference is likely due to the different colour distribution of the image. The human skin tends to have more red content, resulting in higher intensity in the red image after thresholding. 
//
//The thresholding of Hue Saturation Brightness (HSB) converted image appears to have more noise, especially in the dark areas. In the image, there is more speckling in areas where there are fewer distinct details compared to the RGB channel. However, in the thresholding of RGB channel and Cyan Magenta Yellow (CMY) images, they show clearer and more defined edges.
//The thresholding of the HSB image has a lower contrast between the background and the subject compared to the results in step 7. To improve thresholding results, I would consider using lab colour space for my images, where lightness and colour channels are separated. This would allow the thresholding to focus purely on brightness without being influenced by colour variations.
//
//During this project, I remained largely on target. Using time management, I was able to complete the key objectives. However, I did encounter challenges during the process, particularly in code debugging and ensuring smooth-video processing. These issues were systematically addressed by researching and looking through the console logs to analyse bottlenecks. If faced with similar challenges in the future, I would allocate more time for performance testing during the development phase and consider alternative algorithms to ensure smoother execution.
//
//The extension I introduced to my project is the posterising filter, as it enhances the artistic possibilities of the software. The filter reduces the number of colours in an image, creating a more stylized and abstract appearance by allocating the colour values into distinct levels. This extension is particularly unique because unlike traditional image filters that simply alter brightness, contrast, or apply predefined effects, the posterize filter allows users to transform their images into unique and simplified colour patterns, reminiscent of graphic art posters.
//
//One problem that I faced was when I attempted to apply face detection to an image that had already been converted into the CMY colour model,  which resulted in no face being detected. To solve this problem, I first detect and zoom in on the face using the RGB image, then convert it into the CMY colour model. This approach ensured successful face detection and had a CMY image replacing it.
    //Another challenge I faced was the significant lag in the video feed when replacing the detected face with a pixelation image. The lag was possible because the pixelation process involved manipulation of large blocks of pixels in real time, which was computationally intensive. To address this, I applied the pixelation effect once key 4 is pressed, the pixelated image is then stored and displayed repeatedly.

