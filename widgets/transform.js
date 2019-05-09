class TransformWidget{
    constructor(manager, camera, dom){
        this.camera = camera
        this.dom=dom
        this.manager = manager

        var widget_color = 0xdddd00
        this.lineMat = new THREE.LineBasicMaterial({color:widget_color, linewidth:3})
        var geo = new THREE.Geometry()
        geo.vertices=this.make_segment_points([1,1,1])
        this.segment_object = new THREE.LineSegments(geo, this.lineMat)
        this.widget = new THREE.Group()
        this.widget.add(this.segment_object)
        // this.model_container.add(this.widget)
        //this.scene.add(this.segment_object)
    }

    create(data=null, id){
        console.log('@creat transform widget data=',data)
        if(data==null){
            this._remove()
        }

        var inspecting_object = this.manager.model_container.getObjectByName(id)
        var parent = inspecting_object.parent

        var position = data['translation'].value
        var size = data['scale'].value
        var rotation = data['rotation'].value
        var center = this.make_centers(size)
        
        this.set_segment_object(size)
        this.segment_object.visible = true
        this.segment_object.position.set(position[0],position[2],position[1])

        
        parent.add(this.widget)
    }

    _remove(){
        this.segment_object.visible = false
    }
    make_vects(size, rotation){

    }
    make_corners(size){
        var w,h,d
        w=size[0]
        d=size[1]
        h=size[2]

        var pts = [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(w,0,0),
            new THREE.Vector3(w,h,0),
            new THREE.Vector3(0,h,0),
            new THREE.Vector3(0,0,d),
            new THREE.Vector3(w,0,d),
            new THREE.Vector3(w,h,d),
            new THREE.Vector3(0,h,d)
        ]
        return pts
    }
    make_centers(size){
        var w,h,d,hw,hd,hh
        w=size[0]
        d=size[1]
        h=size[2]

        hw = w/2
        hd = d/2
        hh = h/2

        var corners = [
            new THREE.Vector3(hw,hh,0),
            new THREE.Vector3(w,hh,hd),
            new THREE.Vector3(hw,hh,d),
            new THREE.Vector3(0,hh,hd),
            new THREE.Vector3(hw,h,hd),
            new THREE.Vector3(hw,0,hd),
        ]
    }
    make_segment_points(size){
        var pts = this.make_corners(size)
        var segment_pts=[
            pts[0],pts[1],
            pts[1],pts[2],
            pts[2],pts[3],
            pts[3],pts[0],
            pts[4],pts[5],
            pts[5],pts[6],
            pts[6],pts[7],
            pts[7],pts[4],
            pts[0],pts[4],
            pts[1],pts[5],
            pts[2],pts[6],
            pts[3],pts[7]
        ]
        return segment_pts
    }

    set_segment_object(size){
        var segment_pts=this.make_segment_points(size)
        this.segment_object.geometry.vertices = segment_pts
        this.segment_object.geometry.verticesNeedUpdate = true
    }
    
    test_bounding_widgets(viewer,w=10,d=10,h=4){
        var pts = [
            new THREE.Vector3(0,0,0),
            new THREE.Vector3(w,0,0),
            new THREE.Vector3(w,h,0),
            new THREE.Vector3(0,h,0),
            new THREE.Vector3(0,0,d),
            new THREE.Vector3(w,0,d),
            new THREE.Vector3(w,h,d),
            new THREE.Vector3(0,h,d)
        ]
        var segment_pts=[
            pts[0],pts[1],
            pts[1],pts[2],
            pts[2],pts[3],
            pts[3],pts[0],
            pts[4],pts[5],
            pts[5],pts[6],
            pts[6],pts[7],
            pts[7],pts[4],
            pts[0],pts[4],
            pts[1],pts[5],
            pts[2],pts[6],
            pts[3],pts[7]
        ]
        
        var line_geometry = new THREE.Geometry()
        line_geometry.vertices = segment_pts
        var widget = new THREE.Group()
    
        var widget_color = 0xdddd00
        //var basicMaterial = new THREE.BasicMaterial({color:widget_color})
        var lines = new THREE.LineSegments(line_geometry, new THREE.LineBasicMaterial({color:widget_color, linewidth:3}))
    
        var centers=[
            pts[0]
        ]
    
    
        widget.add(lines)
        viewer.scene.add(widget)
    }

}