class RingWidget{
    constructor(position){

        this.ring1 = create_ring_object(10,1,new THREE.Color(0xffffaa),false)
        this.ring2 = create_ring_object(13,0.5,new THREE.Color(0xaaffff),false)

        this.widget = new THREE.Group()
        this.widget.add(this.ring1)
        this.widget.add(this.ring2)
    }

    getWidget(){
        return this.widget
    }
}

function create_ring_object(radius,width,color=null,sizeAttenuation=true,dashArray=[0]){
    // if sizeAttenuation is True, use screen unit otherwise world unit
    if (color == null) color = new THREE.Color(0xffffff)
    let circle = new THREE.CircleGeometry( radius, 30 );
        circle.vertices.shift()
        circle.vertices.push(circle.vertices[0])
    let mat = new MeshLineMaterial({
                'lineWidth':width,
//                'sizeAttenuation': sizeAttenuation,
                'dashArray':dashArray,
                'color':color
                })
    let line = new MeshLine()
    line.setGeometry(circle)
    let m = new THREE.Mesh(line.geometry,mat)
    m.rotateOnAxis(new THREE.Vector3(1,0,0), 1.5708)
    return m
}

function ring_test(scene){
    let ringWidget = new RingWidget(new THREE.Vector3(2,1,0))
    scene.add(ringWidget.widget)
}