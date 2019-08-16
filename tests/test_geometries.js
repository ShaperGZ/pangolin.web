

// import {Material} from "../three.module";

function test_tween_camera(campos=null, trgpos=null){
    var control = viewer.controls
    
    // var campos = control.object.position
    
    
    if(campos !=null){
        campos={x:campos[0],y:campos[2],z:campos[1] }
        var org_campos = control.object.position.clone()
        // var trgpos = {x:control.target.x,y:control.target.y,z:control.target.z}
        var tween = new TWEEN.Tween(org_campos).to(campos,1000)
        tween.onUpdate(function(){
            console.log(this.x,this.y,this.z)
            control.object.position.set(this.x,this.y,this.z);
        })
        tween.start()
    }

    if(trgpos !=null){
        trgpos={x:trgpos[0],y:trgpos[2],z:trgpos[1] }
        var org_trgpos = control.target
        // var trgpos = {x:control.target.x,y:control.target.y,z:control.target.z}
        var tween = new TWEEN.Tween(org_trgpos).to(trgpos,1000)
        tween.onUpdate(function(){
            // control.target.set(this.x,this.y,this.z)
            control.update()
        })
        tween.start()
    }
   
}

function test_lines(manager){
    console.log('testing lines')

    var data = {
        "cmd":"set_line",
        "g":{
            "p":[[0, 0, 0], [10, 0, 0], [10, 10, 5], [0, 0, 0]],
            "id":125546
            },
        "s": {"color": [1, 0, 0]}
    }//data

    manager.set_line(data)

    var data = {
        "cmd":"set_line",
        "g":{
            "p":[[0, 0, 0], [10, 0, 0], [10, 10, 5], [0, 10, 0]],
            "id":125546
            },
        "s": {"color": [1, 0, 0]}
    }//data
    manager.set_line(data)
}

function test_line_group(manager,u=10,v=10, w=1){
    var elements=[]
    for(var i=0;i<u;i++){
        for(var j=0;j<v;j++){
            
            var pl = [
                [i*w, j*w, 0 ],
                [i*w + w, j*w, 0 ],
                [i*w + w, j*w + w, 0 ],
                [i*w, j*w + w, 0 ]
            ]
            elements.push({'p':pl})
        }
    }
    var data = {
        "cmd":"set_line_group",
        "g":{
            'id':332,
            'elements':elements
        },
        "s": {"color": [1, 0, 0]}
    }//data

    manager.set_line_group(data)
}

function test_point_clouds(manager,u=10,v=10, w=1){
    var pts=[]
    var r=[]
    for(var i=0;i<u;i++){
        for(var j=0;j<v;j++){
            pts.push([i*w*-1, j*w, 0 ])
            //r = Math.sin(i*j)
            r.push(100)
        }// for j
    }// for i

    data = {
        'cmd':'set_point_cloud',
        'g':{
            'id':412,
            'p':pts,
            'r':r,
            'c':[0xaaff00]
        }
    }
    manager.set_point_clouds(data)
}

function test_polygon_mesh(manager){
    var pts = [
        [0,0,0],
        [0,10,0],
        [10,10,0],
        [10,5,0],
        [5,0,0]
    ]
    // pts.reverse()
    var faces =[ [0,1,2,3,4] ]
    data = {
        'cmd':'set_polygon_mesh',
        'g':{
            'id':413,
            'p':pts,
            'f':faces,
            'c':[0xaaff00]
        }
    }
    id = manager.set_polygon_mesh(data)
    return id
}

function test_mesh(manager,u=10,v=10,w=1){
    var pts=[]
    var faces=[]
    var r=[]
    var sw=w*0.8
    for(var i=0;i<u;i++){
        for(var j=0;j<v;j++){
            sw = 0.01 + (w * (j/v) )
            pl = [
                [i*w, j*w, 0 ],
                [i*w + sw, j*w, 0 ],
                [i*w + sw, j*w + sw, 0 ],
                [i*w, j*w + sw, 0 ]
            ]
            pts = pts.concat(pl)
            var index= pts.length-4
            f = [index,index+3, index+2]
            f2 = [index,index+2, index+1]
            faces.push(f)
            faces.push(f2)
        }
    }
    data = {
        'cmd':'set_mesh',
        'g':{
            'id':415,
            'p':pts,
            'f':faces,
            'r':r,
            'c':[0xaaff00]
        }
    }
    id = manager.set_mesh(data)
    return id
}

function test_mesh_faceColored(manager,u=10,v=10,w=1){
    var pts=[]
    var faces=[]
    var r=[]
    var fc=[]
    var sw=w*0.8
    for(var i=0;i<u;i++){
        for(var j=0;j<v;j++){
            sw = 0.01 + (w * (j/v) )
            pl = [
                [i*w, j*w, 0 ],
                [i*w + sw, j*w, 0 ],
                [i*w + sw, j*w + sw, 0 ],
                [i*w, j*w + sw, 0 ]
            ]
            pts = pts.concat(pl)
            var index= pts.length-4
            f = [index,index+3, index+2]
            f2 = [index,index+2, index+1]
            faces.push(f)
            faces.push(f2)

            fc.push([i/u,j/v,0])
            fc.push([i/u,j/v,0])


        }
        // console.log(fc)
    }
    data = {
        'cmd':'set_mesh',
        'id':415,
        'g':{
            'p':pts,
            'f':faces,
            'fc':fc,
            'r':r,
            'c':[0xaaff00]
        }
    }
    id = manager.set_polygon_mesh(data)
    return id
}


function test_bounding_widgets(viewer,w=10,d=10,h=4){
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


function test_textured_plane(){
    var g = {}
    g['p']=[[0,0,0],[0,10,0],[10,10,0],[10,0,0]]
    g['f']=[[0,1,2],[0,2,3]]
    g['fuv']=[[[0,0],[0,1],[1,1]],[[0,0],[1,1],[1,0]]]
    g['type']='mesh'

    var data={}
    data['id']=456432342
    data['cmd']='set_geometry'
    data['g']=g
    id = manager.set_polygon_mesh(data)
    return id
}

function test_segments(){
    var g = new THREE.BufferGeometry()
    var mat = new THREE.LineBasicMaterial(
        {color:0xffffff,
        vertexColors: THREE.VertexColors,
            transparent: true
        })
    var o = new THREE.LineSegments(g,mat)


    var pts=[]
    var colors=[]

    pts.push(0,0,0,100,0,100)
    pts.push(100,0,100,100,0,0)

    colors.push(1,0,0,1,1,0,0,0.6)
    colors.push(1,0,0,0.4,1,1,0,0.2)

    g.addAttribute('position',new THREE.Float32BufferAttribute(pts,3))
    g.addAttribute('color',new THREE.Float32BufferAttribute(colors,4))

    return o

}

function test_mesh_line(camera){
    var data={}
    data['p']=[[0,0,0]]
    var g = new THREE.Geometry()
    var material = new MeshLineMaterial({color: new THREE.Color('red')})
    var pts = []
//    pts.push(new THREE.Vector3(0,0,0))
//    pts.push(new THREE.Vector3(10,0,5))
//    pts.push(new THREE.Vector3(20,0,-5))
    pts.push(new THREE.Vector3(0,0,0))
    pts.push(new THREE.Vector3(1,0,0.5))
    pts.push(new THREE.Vector3(1,0,-0.5))
    
    g.vertices=pts;
    // var obj = new THREE.Mesh(g,material)
    var line = new MeshLine()
    line.setGeometry(g,function( p ) { return 2; } )
    console.log('test geometries.line.geometry:',line.geometry)
    console.log('pts=',pts)
    
    var obj = new THREE.Mesh(line.geometry,material)
    obj.scale.set(10,10,10)
    return obj
}

function test_mesh_line2(camera){
    var g = new THREE.Geometry()
    var material = new MeshLineMaterial({color: new THREE.Color('red')})
    var pts = []
    pts.push(new THREE.Vector3(0,0,0))
    pts.push(new THREE.Vector3(10,0,5))
    pts.push(new THREE.Vector3(20,0,-5))
    g.vertices=pts;
    // var obj = new THREE.Mesh(g,material)
    var line = new MeshLine()
    line.setGeometry(g,function( p ) { return 2; } )
    console.log('test geometries.line.geometry:',line.geometry)
    console.log('pts=',pts)
    var obj = new THREE.Mesh(line.geometry,material)
    return obj
}

function test_offset(){
    // var pts = [
    //     new THREE.Vector3(0,0,0),
    //     new THREE.Vector3(20,0,20),
    //     new THREE.Vector3(50,0,-50),
    //     new THREE.Vector3(0,0,0),
    // ]

    pts = [
        new THREE.Vector3(0,4,0),
        new THREE.Vector3(10,4,0),
        new THREE.Vector3(12,4,17),
        new THREE.Vector3(20,4,25),
        new THREE.Vector3(30,4,30),
    ]
    var line_width = 1

    var hv1,hv2,concavity
    const up=new THREE.Vector3(0,1,0)
    var vertices=[]
    var faces = []
    var vcount=0
    var last_hv2=null

    for(var i=0;i<pts.length-1;i++){
        var j = i+1;
        var radians = Math.PI / 2 //90 degree

        var p0 = pts[i]
        var p1 = pts[j]
        var dir = p1.clone().sub(p0)
        if(last_hv2==null)
            hv1 = dir.clone().normalize().cross(up)
        else
            hv1=last_hv2
        var cordlength = line_width

        if (i<pts.length-2){
            console.log('cal angle i=',i)
            var k = j+1
            // angle betwen vects
            v1 = pts[i].clone().sub(pts[j]).normalize()
            v2 = pts[k].clone().sub(pts[j]).normalize()


            radians = v1.angleTo(v2) / 2


            console.log('['+i+']v2=',v2)
             //get half angle

            if (radians!=0)
            {
                cordlength = line_width/Math.sin(radians)
                hv2 = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(cordlength)
            }
            else{
                hv2 = hv1;
            }
            if(v1.clone().cross(v2).y<0) {
                hv2.multiplyScalar(-1)
            }
            console.log('['+i+']radians=',radians)
            console.log('['+i+']half angle=',radians*(180/Math.PI))
            console.log('['+i+']concavity=',v1.clone().cross(v2).y>0)

        }
        else{
            hv2 = dir.clone().normalize().cross(up)
        }


        vertices.push(p0.clone().add(hv1))
        vertices.push(p0.clone().sub(hv1))
        vertices.push(p1.clone().add(hv2))
        vertices.push(p1.clone().sub(hv2))


        last_hv2 = hv2


        faces.push(new THREE.Face3(vcount,vcount+2,vcount+1))
        faces.push(new THREE.Face3(vcount+1,vcount+2,vcount+3))
        vcount = vertices.length
    }
    console.log(vertices)
    var g = new THREE.Geometry()
    g.vertices = vertices
    g.faces = faces
    g.verticesNeedUpdate = true
    var o = new THREE.Mesh(g,new THREE.MeshBasicMaterial())
    return o
}

