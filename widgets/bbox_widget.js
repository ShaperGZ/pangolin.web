class BBoxWidget{
    constructor(viewer){
        this.viewer = viewer
        this.widget = new THREE.Group()
        this.segment_object = new THREE.BoundingBoxHelper()
        this.widget.add(this.segment_object)
        this.viewer.scene.add(this.widget)
    }

    set(obj){
        if(obj!= null){
            this.widget.visible = true
            this.segment_object.object = obj
            this.segment_object.update()
        }
        else{
            this.widget.visible = false
        }

    }
}