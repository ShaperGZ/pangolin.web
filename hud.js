class HUD{
    constructor(viewer){
        this.viewer = viewer
        this.canvas = document.createElement('canvas')
        
        this.ctx = this.canvas.getContext('2d')
        this.ctx.font = "Normal 16px Arial";
        this.ctx.textAlign = 'left'
        this.ctx.fillStyle = "rgba(245,245,245,0.75)";
        
        var w = this.viewer.canvasW
        var h = this.viewer.canvasH

        this.scene = new THREE.Scene();
        this.texture = new THREE.Texture(this.canvas)
        this.texture.needsUpdate = true
        this.material = new THREE.MeshBasicMaterial( {map: this.texture} );
        this.material.transparent = true;

        this.camera = new THREE.OrthographicCamera(-w/2, w/2, h/2, -h/2, 0, 30 );
        this.planeGeometry = new THREE.PlaneGeometry( w, h );
        this.plane = new THREE.Mesh( this.planeGeometry, this.material );
        this.scene.add(this.plane)
        
        // objects to draw on the HUD
        // lines formated as :
        // {'type':'line','p':[x1,y1,x2,y2,x3,y3],'color':0xffffff,'width':2}
        // single line text formatted as :
        // {'type':'text','text':'text content','p':[posx,posy],'color':0xffffff,'font':arial }
        // multiline text formatted as :
        // {'type':mltext','text':'txt content','p':[posx,posy,diagonalx,diagonaly],'color':0xffffff,'font':arial }
        this.objects=[]
        this.resize()
        this.enable = true
    }
    redraw(){
        //this.clear()
        for(var i=0; i<this.objects.length; i++){
            var o = this.objects[i]
            if(o.type == 'text'){
                var txt = o['text']
                var pos = o['p']
                // var txtWidth = this.ctx.measureText(txt)
                this.ctx.textAlign = 'left'
                this.ctx.fillText('Test String',pos[0],pos[1])
            }
            else if(o.type == 'line'){

            }
        }
        this.texture.needsUpdate = true
    }
    add(draw_object){
        this.objects.push(draw_object)
        this.redraw()
    }
    remove(draw_object){
        var index = -1
        objects = this.objects
        for( var i = 0; i < this.objects.length; i++){ 
            if (objects[i] == draw_object){
                index =i
                break
            }
        }
        if(index>=0){
            this.objects.splice(index,1)
        }
        this.redraw()
    }

    resize(){
        var w = this.viewer.canvasW
        var h = this.viewer.canvasH
        this.canvas.width = w
        this.canvas.height = h
        this.camera.width = w
        this.camera.height = h
        this.planeGeometry = new THREE.PlaneGeometry( w, h);
        this.plane.geometry = this.planeGeometry
    
        this.redraw()
    }

    clear(){
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
    }

    render(renderer){
        if (this.enable) renderer.render(this.scene, this.camera)
    }
}