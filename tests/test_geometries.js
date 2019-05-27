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