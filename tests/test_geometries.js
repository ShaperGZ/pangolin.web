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