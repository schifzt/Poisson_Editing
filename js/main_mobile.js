// const max_canvas_size = 270;
const max_canvas_size = 235;
const select_color = [0, 255, 255, 255];

var fit_width = new Array();
var fit_height = new Array();
var loaded_img_count = 0;

var dest_canvas, src_canvas, result_canvas;
var dest_ctx, src_ctx, result_ctx;
var dest_img, src_img, result_img;
var dest_file, src_file;

var selected_pixels;


//-----------------------------------------
//STEP 1
//-----------------------------------------

function initCanvas(which_canvas) {

    var img = new Image();
    if (which_canvas == "dest") {
        var ctx = dest_ctx;
        var canvas = dest_canvas;
        img = dest_img;
    } else if (which_canvas == "src") {
        var ctx = src_ctx;
        var canvas = src_canvas;
        img = src_img;
    } else {
        return null;
    }

    //stop default event (like jump to link)
    var cancelEvent = function(e) {
        e.preventDefault();
        e.stopPropagation();
        return false;
    };

    var loadImage = function(e) {
        e.preventDefault();

        if (e.target.type == "file") {
            var file = e.target.files[0];
        } else {
            var file = e.dataTransfer.files[0];
        }

        //------------------
        //1 read image
        //2 load image
        //------------------

        //4 render
        img.onload = function() {
            console.log("load Image" + " " + which_canvas);

            //set canvas size
            var aspect_ratio = img.height / img.width;
            if (~~(aspect_ratio * max_canvas_size) >= max_canvas_size) {
                // vertically long
                fit_width.push(~~(max_canvas_size / aspect_ratio));
                fit_height.push(max_canvas_size);
            } else {
                //horizontally long
                fit_width.push(max_canvas_size);
                fit_height.push(~~(max_canvas_size * aspect_ratio));
            }

            var letsRender = true;

            //detect size-confrict between 1st and 2nd canvas
            if (loaded_img_count > 0) {
                if ((which_canvas === "src" && fit_width[1] > fit_width[0]) || (which_canvas === "dest" && fit_width[1] < fit_width[0])) {
                    alert("input vertically long image");
                    fit_width.pop();
                    fit_height.pop();
                    letsRender = false;
                } else if ((which_canvas === "src" && fit_height[1] > fit_height[0]) || (which_canvas === "dest" && fit_height[1] < fit_height[0])) {
                    alert("input horizontally long image");
                    fit_width.pop();
                    fit_height.pop();
                    letsRender = false;
                } else {
                    fit_width.shift();
                    fit_height.shift();
                    letsRender = true;
                }
            }

            //------------------
            //render
            //------------------
            if (letsRender) {
                canvas.width = fit_width[0];
                canvas.height = fit_height[0];
                ctx.imageSmoothingQuality = "high";
                ctx.drawImage(this, 0, 0, canvas.width, canvas.height);

                ++loaded_img_count;

                //copy "dest canvas" to "result canvas"
                if (which_canvas == "dest") {
                    result_canvas.width = canvas.width;
                    result_canvas.height = canvas.height;
                    result_img = img;
                    result_img.onload = new function() {
                        ctx.imageSmoothingQuality = "high";
                        result_ctx.drawImage(result_img, 0, 0, result_canvas.width, result_canvas.height);
                        ++loaded_img_count;
                    }
                }

                if (loaded_img_count === 3) {
                    //save current pixels for reset
                    pixels = src_ctx.getImageData(0, 0, src_canvas.width, src_canvas.height);
                    original_src_pixels = pixels;

                    dest_file.removeEventListener('change', loadImage, false);
                    src_file.removeEventListener('change', loadImage, false);

                    calSourceCanvasOffset();
                    src_canvas.addEventListener("touchmove", draw, true);
                    src_canvas.addEventListener("touchstart", startSelcting, true);
                    src_canvas.addEventListener("touchend", finishSelcting, true);
                    $("#src").hammer().on("swiperight", setSelectedArea);
                    $("#src").hammer().on("doubletap", setSelectedArea);
                    window.addEventListener("scroll", calSourceCanvasOffset);
                }
            }
        };

        //2 after read image
        var reader = new FileReader();
        reader.onload = function(e) {
            //3 load image
            img.src = e.target.result;
        };

        //1read image
        reader.readAsDataURL(file)

    };


    // file DOM select
    if (which_canvas == "dest") {
        dest_file.addEventListener('change', loadImage, false);
    } else if (which_canvas == "src") {
        src_file.addEventListener('change', loadImage, false);
    }

};



window.onload = new function() {
    dest_canvas = document.getElementById("dest");
    src_canvas = document.getElementById("src");
    result_canvas = document.getElementById("result");

    dest_ctx = dest_canvas.getContext("2d");
    src_ctx = src_canvas.getContext("2d");
    result_ctx = result_canvas.getContext("2d");

    dest_file = document.getElementById('dest_file');
    src_file = document.getElementById('src_file');

    //Initialize canvas
    dest_img = new Image();
    src_img = new Image();
    result_img = new Image();
    initCanvas("dest");
    initCanvas("src");

}

//-----------------------------------------
//STEP 2
//-----------------------------------------
var isSelecting = false;
prev_point = {
    x: 0,
    y: 0
};

var src_canvas_offset = {
    y: 0
};

var pixels;
var original_src_pixels;

function calSourceCanvasOffset() {
    console.log("calSourceCanvasOffset");
    var bounds = src_canvas.getBoundingClientRect();
    src_canvas_offset.x = bounds.left;
    src_canvas_offset.y = bounds.top;
}

function draw(e) {
    e.preventDefault();
    if (isSelecting) {
        console.log("draw");

        var x = e.touches[0].clientX - src_canvas_offset.x;
        var y = e.touches[0].clientY - src_canvas_offset.y;
        var i = ~~(4 * (x + src_canvas.width * y));

        //line property
        src_ctx.strokeStyle = "rgba(" + select_color[0] + "," + select_color[1] + "," + select_color[2] + "," + 1 + ")";
        src_ctx.lineWidth = 30;
        src_ctx.lineJoin = "round"; //line connection style
        src_ctx.lineCap = "round"; //end of the line

        //draw strait line
        src_ctx.beginPath();
        src_ctx.moveTo(prev_point.x, prev_point.y);
        src_ctx.lineTo(x, y);
        src_ctx.stroke();
        src_ctx.closePath();

        prev_point.x = x;
        prev_point.y = y;

    }
}

//mouse down
function startSelcting(e) {
    console.log("startSelcting");
    isSelecting = true;
    prev_point.x = e.touches[0].clientX - src_canvas_offset.x;
    prev_point.y = e.touches[0].clientY - src_canvas_offset.y;
}
//mouse up
function finishSelcting(e) {
    console.log("finishSelcting");
    isSelecting = false;
}

var selected_position_moved = {
    x: 0,
    y: 0
};


//put selected area on destination(just put)
function setSelectedArea(e) {
    console.log("setSelectedArea");
    isSelecting = false;

    var dest_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);
    var src_pixels = src_ctx.getImageData(0, 0, src_canvas.width, src_canvas.height);
    var result_pixels = result_ctx.getImageData(0, 0, result_canvas.width, result_canvas.height);
    selected_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);

    for (var x = 1; x < src_canvas.width - 1; x++) {
        for (var y = 1; y < src_canvas.height - 1; y++) {
            var p = 4 * (x + y * src_canvas.width);
            if (src_pixels.data[p + 0] == select_color[0] &&
                src_pixels.data[p + 1] == select_color[1] &&
                src_pixels.data[p + 2] == select_color[2]) {

                //selected_position_moved tells how far did you drag.
                var p_moved = p + 4 * (selected_position_moved.x + selected_position_moved.y * src_canvas.width);
                for (var rgb = 0; rgb < 3; rgb++) {
                    result_pixels.data[p_moved + rgb] = original_src_pixels.data[p + rgb];
                    selected_pixels.data[p + rgb] = src_pixels.data[p + rgb];
                }
            }
        }
    }
    result_ctx.putImageData(result_pixels, 0, 0);

    //deactivate src canvas.prohibit from selecting
    src_canvas.removeEventListener("touchmove", draw, true);
    src_canvas.removeEventListener("touchstart", startSelcting, true);
    src_canvas.removeEventListener("touchend", finishSelcting, true);
    $("#src").hammer().off("swiperight", setSelectedArea);
    $("#src").hammer().off("doubletap", setSelectedArea);

    //activate result canvas
    calResultCanvasOffset();
    result_canvas.addEventListener("touchmove", moveingBlendPos, false);
    result_canvas.addEventListener("touchstart", startMovingBlendPos, false);
    result_canvas.addEventListener("touchend", finishMovingBlendPos, false);

    window.addEventListener("scroll", calResultCanvasOffset);

}

//-----------------------------------------
//STEP 3
//-----------------------------------------
prev_point2 = {
    x: 0,
    y: 0
}
var result_canvas_offset = {
    x: 0,
    y: 0
};
var moving = false;

function moveingBlendPos(e) {
    var dest_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);

    if (moving) {
        console.log("moving");

        var x = e.touches[0].clientX - result_canvas_offset.x;
        var y = e.touches[0].clientY - result_canvas_offset.y;

        selected_position_moved.x = ~~(x - prev_point2.x);
        selected_position_moved.y = ~~(y - prev_point2.y);

        result_ctx.putImageData(dest_pixels, 0, 0);
        setSelectedArea();
    }

}

function calResultCanvasOffset(e) {
    console.log("calResultCanvasOffset");
    var bounds = result_canvas.getBoundingClientRect();
    result_canvas_offset.x = bounds.left;
    result_canvas_offset.y = bounds.top;

}
//mouse down
function startMovingBlendPos(e) {
    console.log("startMovingBlendPos");
    moving = true;
    prev_point2.x = e.touches[0].clientX - result_canvas_offset.x;
    prev_point2.y = e.touches[0].clientY - result_canvas_offset.y;

}
//mouse up
function finishMovingBlendPos(e) {
    console.log("finishMovingBlendPos");
    moving = false;
}

//-----------------------------------------
//STEP 4
//-----------------------------------------

/*-----------------------------------------
 Blend Images
 f*: dest_pixels
 g : original_src_pixels (Note that "src_pixels" is affected with select_color)
 f : result_pixels ---> put blended result into result_pixels
 S : result_canvas
 Omega : selected area in S
-----------------------------------------*/
function poissonImporting(mode) {
    var dest_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);
    var src_pixels = src_ctx.getImageData(0, 0, src_canvas.width, src_canvas.height);
    var result_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height); //dest, not result

    const height = result_canvas.height;
    const width = result_canvas.width;

    var error, total_fp, new_f;
    var prev_relative_error = 1.0;

    var itr = 0;

    while (true) {
        error = 0;
        total_fp = 0;

        //for all pixels in S
        for (var y = 1; y < height - 1; y++) {
            for (var x = 1; x < width - 1; x++) {

                var p = (y * width + x) * 4;

                // p in Omega
                if (selected_pixels.data[p + 0] === select_color[0] &&
                    selected_pixels.data[p + 1] === select_color[1] &&
                    selected_pixels.data[p + 2] === select_color[2] &&
                    selected_pixels.data[p + 3] === select_color[3]) {

                    var p_moved = p + ~~4 * (selected_position_moved.x + selected_position_moved.y * width);

                    // q in Np(neighbor of p)
                    var q = [
                        ((y - 1) * width + x) * 4,
                        ((y + 1) * width + x) * 4,
                        (y * width + (x - 1)) * 4,
                        (y * width + (x + 1)) * 4
                    ];
                    var card_Np = q.length;

                    for (var rgb = 0; rgb < 3; rgb++) {
                        var sum_fq = 0; //q in Np and Omega
                        var sum_boundary = 0; //q in Np and Boundary of Omega
                        var sum_vpq = 0; //q in Np

                        //p's neighbor
                        for (var i = 0; i < card_Np; i++) {
                            var q_moved = q[i] + 4 * (selected_position_moved.x + selected_position_moved.y * width);

                            var fq = result_pixels.data[q_moved + rgb];
                            var fp_ast = dest_pixels.data[p_moved + rgb];
                            var fq_ast = dest_pixels.data[q_moved + rgb];
                            var gp = original_src_pixels.data[p + rgb];
                            var gq = original_src_pixels.data[q[i] + rgb];

                            //p in Omega + its neighbor in Omega or Not
                            if (selected_pixels.data[q[i] + 0] === select_color[0] &&
                                selected_pixels.data[q[i] + 1] === select_color[1] &&
                                selected_pixels.data[q[i] + 2] === select_color[2] &&
                                selected_pixels.data[q[i] + 3] === select_color[3]) {
                                sum_fq += fq;
                            } else {
                                sum_boundary += fq_ast;
                            }

                            if (mode === 1) {
                                //mix
                                sum_vpq +=
                                    (Math.abs(gp - gq) > Math.abs(fp_ast - fq_ast)) ? gp - gq : fp_ast - fq_ast;
                            } else {
                                //import
                                sum_vpq += (gp - gq);
                            }

                        }
                        new_fp = (sum_fq + sum_vpq + sum_boundary) / card_Np;

                        error += Math.abs(new_fp - dest_pixels.data[p_moved + rgb]);
                        total_fp += Math.abs(new_fp);
                        result_pixels.data[p_moved + rgb] = new_fp;

                    }
                }
            }
        }

        var relative_error = (1000 * error) / total_fp;
        relative_error *= 0.001;

        if (prev_relative_error === relative_error) {
            break;
        }

        itr++;
        if (itr > 150) {
            itr = 0;
            break;
        }
        prev_relative_error = relative_error;
        console.log(error, relative_error);
    };

    result_ctx.putImageData(result_pixels, 0, 0);

}

function debug() {
    var dest_pixels = dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height);
    var src_pixels = src_ctx.getImageData(0, 0, src_canvas.width, src_canvas.height);
    var result_pixels = result_ctx.getImageData(0, 0, result_canvas.width, result_canvas.height); //dest+selected

    // result_ctx.putImageData(result_pixels, 0, 0);
    // result_ctx.putImageData(result_pixels, 0, 0);
    result_ctx.putImageData(dest_pixels, 0, 0);

}

function save() {
    console.log("save");
    document.getElementById("save").href = result_canvas.toDataURL();
}

function reset() {
    //reset offset
    prev_point2.x = prev_point2.y = 0;
    selected_position_moved.x = selected_position_moved.y = 0;

    //clean canvases
    result_ctx.putImageData(dest_ctx.getImageData(0, 0, dest_canvas.width, dest_canvas.height), 0, 0);
    src_ctx.putImageData(original_src_pixels, 0, 0);

    //deactivate result canvas
    result_canvas.removeEventListener("touchmove", moveingBlendPos, false);
    result_canvas.removeEventListener("touchstart", startMovingBlendPos, false);
    result_canvas.removeEventListener("touchend", finishMovingBlendPos, false);

    //activate src canvas
    calSourceCanvasOffset();
    src_canvas.addEventListener("touchmove", draw, true);
    src_canvas.addEventListener("touchstart", startSelcting, true);
    src_canvas.addEventListener("touchend", finishSelcting, true);

    $("#src").hammer().on("swiperight", setSelectedArea);
    $("#src").hammer().on("doubletap", setSelectedArea);

}

function inverseRGB() {
    console.log("inverseRGB");

    var result_pixels = result_ctx.getImageData(0, 0, result_canvas.width, result_canvas.height);

    var len = result_pixels.width * result_pixels.height * 4;
    for (var i = 0; i < len; i += 4) {
        var r = result_pixels.data[i + 0];
        var g = result_pixels.data[i + 1];
        var b = result_pixels.data[i + 2];
        //
        result_pixels.data[i + 0] = 255 - r;
        result_pixels.data[i + 1] = 255 - g;
        result_pixels.data[i + 2] = 255 - b;
    }
    result_ctx.putImageData(result_pixels, 0, 0);


}
