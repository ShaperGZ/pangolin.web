// import {Vector3} from "../three.module";

function next_power_of_2(number){
    return Math.pow(2, Math.ceil(Math.log(number)/Math.log(2)));
}


function setTextSprite( spriteContainer, msg, parameters )
{
	if ( parameters === undefined ) parameters = {};

	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 40;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 1;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:0, g:0, b:0, a:1.0 };

	var textColor = parameters.hasOwnProperty("textColor") ?
        parameters["textColor"] : { r:1, g:1, b:1, a:1.0 };

    var canvas = document.createElement('canvas');

    var width_factor=0.55
    if ('isChinese' in parameters && parameters.isChinese == true){
        width_factor=1
    }

    var ctx = canvas.getContext('2d');
    var text_width = msg.length * fontsize * width_factor
    var text_height = fontsize  * 1.3

    canvas.width= next_power_of_2(text_width)
    canvas.height = next_power_of_2(text_height)
    canvas.style.width = text_width*2+'px'
    canvas.style.height = text_height*2+'px'


    ctx.font = " " + fontsize + "px consolas";
    // ctx.fillStyle = "rgba(255,0,0,0.95)";

    // background color
    ctx.fillStyle   = "rgba(" + backgroundColor.r*255 + "," + backgroundColor.g*255 + ","
        + backgroundColor.b*255 + "," + backgroundColor.a + ")";
    // border color
    ctx.strokeStyle = "rgba(" + borderColor.r*255 + "," + borderColor.g*255 + ","
        + borderColor.b*255 + "," + borderColor.a + ")";




    sharpRect(ctx, 0, 0, text_width, text_height, 10)

    ctx.fillStyle   = "rgba(" + textColor.r*255 + "," + textColor.g*255 + ","
        + textColor.b*255 + "," + textColor.a*255 + ")";
    ctx.fillText(msg, 0, fontsize);



    // canvas contents will be used for a texture
    var texture = new THREE.Texture(canvas)
    texture.needsUpdate = true;






	spriteContainer.sprite.material.map = texture
    spriteContainer.sprite.scale.set(canvas.width/10,canvas.height/10,1.0);
	spriteContainer.sprite.center.set(0,(canvas.height-text_height)/canvas.height)


}

function setChineseTextSprite(msg,sprite,parameters){
    parameters.isChinese=true
    setTextSprite(msg,sprite,parameters)
}


function makeTextSprite(){
    var container = new THREE.Object3D()
    var mat = new THREE.SpriteMaterial();
    var sprite = new THREE.Sprite( mat );
    // sprite.center.set(0,0)
    container.add(sprite)
    container.sprite = sprite
    return container
}


function makeFlagLabel(){
    var label = new THREE.Object3D()
    var sprite = makeTextSprite()
    var mat = new THREE.LineBasicMaterial()
    var dash_mat = new THREE.LineDashedMaterial({color:0x000000,scale:1,dashSize:1,gapSize:0.3})
    var line = new THREE.Line(new THREE.Geometry(),mat)
    var circle = new THREE.Line(new THREE.Geometry(),dash_mat)
    circle.rotation.set(3.14/2,0,0)
    circle.position.set(0,0.5,0)
    label.spriteContainer = sprite
    label.add(sprite)
    label.add(line)
    label.add(circle)


    label.line = line
    label.circle = circle
    return label
}

function setFlagLabel(label, msg, height=10, radius=2, parameters={}){
    sprite = label.spriteContainer
    sprite.position.set(0,height,0)
    var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
        parameters["backgroundColor"] : { r:0, g:0, b:0, a:1.0 };

    var color = new THREE.Color(backgroundColor.r,backgroundColor.g,backgroundColor.b)

    setTextSprite(sprite,msg,parameters)
    label.line.geometry.vertices=[new THREE.Vector3(0,0,0), new THREE.Vector3(0,height,0)]
    label.line.geometry.verticesNeedUpdate = true
    label.line.material.color = color
    label.circle.material.color = color

    if(radius >0){
        label.circle.geometry = new THREE.CircleGeometry(radius,36)
    }
    else{
        label.circle.geometry = new THREE.Geometry()
    }


}


function sharpRect(ctx,x,y,w,h){
    ctx.beginPath();
    ctx.moveTo(x, y);
    ctx.lineTo(x+w, y);
    ctx.lineTo(x+w, y+h);
    ctx.lineTo(x, y+h);
    ctx.closePath();
    ctx.fill();
    ctx.stroke();
}

// function for drawing rounded rectangles
function roundRect(ctx, x, y, w, h, r) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}


// function for drawing rounded rectangles with arrow tip at bottom
function roundRectWArrow(ctx, x, y, w, h, r, tipw) 
{
    ctx.beginPath();
    ctx.moveTo(x+r, y);
    ctx.lineTo(x+w-r, y);
    ctx.quadraticCurveTo(x+w, y, x+w, y+r);
    ctx.lineTo(x+w, y+h-r);
    ctx.quadraticCurveTo(x+w, y+h, x+w-r, y+h);
    ctx.lineTo((x+r)/2 - (tipw/2), y+h);
    ctx.lineTo((x+r)/2, y+h+(tipw*2));
    ctx.lineTo((x+r)/2 + (tipw/2), y+h);
    ctx.lineTo(x+r, y+h);
    ctx.quadraticCurveTo(x, y+h, x, y+h-r);
    ctx.lineTo(x, y+r);
    ctx.quadraticCurveTo(x, y, x+r, y);
    ctx.closePath();
    ctx.fill();
	ctx.stroke();   
}