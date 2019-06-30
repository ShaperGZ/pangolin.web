function makeTextSprite( message, parameters )
{
	if ( parameters === undefined ) parameters = {};
	
	var fontface = parameters.hasOwnProperty("fontface") ? 
		parameters["fontface"] : "Arial";
	
	var fontsize = parameters.hasOwnProperty("fontsize") ? 
		parameters["fontsize"] : 24;
	
	var borderThickness = parameters.hasOwnProperty("borderThickness") ? 
		parameters["borderThickness"] : 1;
	
	var borderColor = parameters.hasOwnProperty("borderColor") ?
		parameters["borderColor"] : { r:0, g:0, b:0, a:1.0 };
	
	var backgroundColor = parameters.hasOwnProperty("backgroundColor") ?
		parameters["backgroundColor"] : { r:255, g:255, b:255, a:1.0 };

		
	var canvas = document.createElement('canvas');
	console.log('1 canvas.size:',canvas.width)
    console.log('  canvas.height:',canvas.height)
	canvas.width=400
	canvas.height=200


	var context = canvas.getContext('2d');
	context.font = "Bold " + fontsize + "px " + fontface;
    
	// get size data (height depends only on font size)
	var metrics = context.measureText( message );
	var textWidth = metrics.width;
	
	// background color
	context.fillStyle   = "rgba(" + backgroundColor.r + "," + backgroundColor.g + ","
								  + backgroundColor.b + "," + backgroundColor.a + ")";
	// border color
	context.strokeStyle = "rgba(" + borderColor.r + "," + borderColor.g + ","
								  + borderColor.b + "," + borderColor.a + ")";

    context.lineWidth = borderThickness;
    var label_width=textWidth + borderThickness
    var label_height=fontsize * 1.4 + borderThickness


	// roundRectWArrow(context, borderThickness/2, borderThickness/2, label_width, label_height, 6);
	roundRect(context, borderThickness/2, borderThickness/2, label_width, label_height, 6);
	// 1.4 is extra height factor for text below baseline: g,j,p,q.
	
	// text color
	context.fillStyle = "rgba(0, 0, 0, 1.0)";

	context.fillText( message, borderThickness, fontsize + borderThickness);
	drawsqr(context)

    console.log('2 canvas.size:',canvas.width)
    console.log('  canvas.height:',canvas.height)

	// canvas contents will be used for a texture
	var texture = new THREE.Texture(canvas) 
	texture.needsUpdate = true;

	var spriteMaterial = new THREE.SpriteMaterial( 
		{ map: texture, transparent:true} );
	var sprite = new THREE.Sprite( spriteMaterial );
	sprite.scale.set(label_width/10,label_height/10,1.0);
	return sprite;	
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

function drawsqr(ctx){
    ctx.strokeStyle = "rgba(1,0,0,1)"

    var x,y,l;
	x=5;
	y=5;
	l=20;
    ctx.beginPath();
    ctx.moveTo(x,y)
	ctx.lineTo(x,y+l)
	ctx.lineTo(x+l,y+l)
	ctx.lineTo(x+l,y)
	ctx.lineTo(x,y)
	ctx.closePath()
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