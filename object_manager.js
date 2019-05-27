class ObjectManager {

    constructor(scene) {
        this.objects = {}
        this.selected_objects = []
        //this.id_by_threejs_object={}

        this.scene = scene;
        this.model_container = new THREE.Group()
        this.model_container.scale.set(1, 1, -1)
        this.scene.add(this.model_container)

        this.selection_bbox_lines = new THREE.Group()

        // var self=this;
    }

    clear() {
        // for(var i in this.objects){
        //     this.scene.remove(this.objects[i])
        // }
        for (var i in this.model_container.children) {
            this.model_container.remove(this.model_container[i])
        }

    }

    set_selected_objects(selected_objects) {
        this.selected_objects = selected_objects
        // on select callbacks goes here
    }

    get_selectable_objects() {
        console.log('getting selectables')
        var selectables = []
        var objects = this.objects
        for (var key in objects) {
            var obj = objects[key]
            if (Array.isArray(obj)) {
                // console.log(obj)
                selectables = selectables.concat(obj)
            }
            else {
                selectables.push(obj)
            }
        }
        return selectables
    }

    get_id_by_threejs_object(threejs_obj) {
        var objects = this.objects
        for (var key in objects) {
            var obj = objects[key]
            // console.log(obj)
            if (Array.isArray(obj)) {
                console.log(obj)
                for (var k in obj) {
                    var o = obj[k]
                    if (o == threejs_obj) {
                        return key
                    }
                }
            }
            else if (obj == threejs_obj) {
                return key
            }
        }
        return null
    }

    set_transform(data) {
        var id = data.id
        console.log('transform:', id)
        if (id in this.objects) {
            var obj = this.objects[id];
            if ('t' in data.transform) {
                var position = data.transform.t
                obj.position.set(position[0], position[2], position[1])
            }
            if ('s' in data.transform) {
                var scale = data.transform.s
                obj.scale.set(scale[0], scale[2], scale[1])
                // scale
            }
            if ('r' in data.transform) {
                var rotation = data.transform.r
            }
        } // end if id in this.objects

    }

    set_line(data) {
        var id = data['g']['id']
        var obj
        console.log('id=', id)
        if (id in this.objects) {
            console.log('id found in manager.objects')
            obj = this.objects[id]
        }
        else {
            console.log('id not found a creating new')
            obj = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial())
            this.scene.add(obj)
            this.objects[id] = obj
        }

        var pts = data['g']['p']
        this.set_geometry_vertices(obj.geometry, pts)
        if ('s' in data['g'] && 'color' in data['g']['s']) {
            obj.material = new THREE.LineBasicMaterial(data['s'])
        }
        return id
    }

    set_line_group(data, group = null) {
        var id = data['g']['id']
        var existings = []
        var style
        var item
        // group_object_reference will be added to mapper and indexed by id
        if (group == null) {
            group = new THREE.Group()
        }

        var position = data['transform']['t']

        if (id in this.objects) {
            existings = existings.concat(this.objects[id])
        }

        if ('s' in data) {
            style = data['s']
        }

        // var elements=data['g']['elements']
        var elements = data.g.elements
        var diff = existings.length - elements.length

        if (diff > 0) {
            // remove extra items
            for (var i = 0; i < diff; i++) {
                item = existings.pop()
                this.scene.remove(item)
            }
        }

        for (var i = 0; i < elements.length; i++) {
            var obj
            if (i < existings.length) {
                obj = existings[i]
            }
            else {
                obj = new THREE.Line(new THREE.Geometry(), new THREE.LineBasicMaterial())
                this.scene.add(obj)
            }
            var pts = elements[i]['p']
            this.set_geometry_vertices(obj.geometry, pts)
            if (style) {
                obj.material = new THREE.LineBasicMaterial(style)
            }
            obj.position.set(position[0], position[1], position[2])
            group.add(obj)
            this.model_container.add(group)
        }
        this.objects[id] = group_object_reference
    }

    set_polygon_mesh(data) {
        console.log('set_polygon_mesh')
        console.log(data)
        var id = data.id
        var pts = data.g.p
        var faces = data.g.f
        var holes = data.g.holes
        if (holes == null) holes = []
        var geometry, mat, obj
        var color = [1, 1, 1]
        var obj
        if ('s' in data && 'color' in data.s)
            color = data.s.color
        if (id in this.objects) {
            obj = this.objects[id];
            geometry = obj.geometry;
        }
        else {
            geometry = new THREE.Geometry()
            if ('fc' in data.g) mat = new THREE.MeshBasicMaterial({vertexColors: THREE.VertexColors});
            else if ('fc' in data.g) {
                mat = new THREE.MeshBasicMaterial({vertexColors: THREE.FaceColors});
                console.log('fc found', mat)
            }
            else mat = new THREE.MeshPhongMaterial({color: new THREE.Color(color), emissive: 0x000020});
            obj = new THREE.Mesh(geometry, mat)
            obj.name = id
            // this.scene.add(obj)
            // this.objects[id]=obj

            if ('parent' in data) {
                parent = this.objects[data.parent]
                parent.add(obj)
            }
            else {
                // this.scene.add(obj)
                this.model_container.add(obj)
            }
            this.objects[id] = obj

        }

        //make faces
        var nfaces = []

        for (var i = 0; i < faces.length; i++) {
            var f = faces[i]
            //console.log(f)
            //console.log(f.length)
            if (f.length == 3) {
                nfaces.push(f)
            }
            else if (f.length == 4) {
                nfaces.push([f[0], f[1], f[2]])
                nfaces.push([f[0], f[2], f[3]])
            }
            else if (f.length > 4) {
                //console.log(f.length+':'+f)
                var verts = []
                var mapper = {}
                var counter = 0
                for (var j = 0; j < f.length; j++) {
                    var index = f[j]
                    verts.push(new THREE.Vector3(pts[index][0], pts[index][1], pts[index][2]))
                    mapper[counter] = index
                    counter += 1
                }
                //console.log(verts)
                var triangles = THREE.ShapeUtils.triangulateShape(verts, [])
                for (var i = 0; i < triangles.length; i++) {
                    var tri = triangles[i]
                    var face = [mapper[tri[0]], mapper[tri[1]], mapper[tri[2]]]
                    face.reverse()
                    nfaces.push(face)
                }

            }
            else console.log('ERROR')

        }

        //console.log('nfaces:')
        //console.log(nfaces)
        this.set_geometry_vertices(geometry, pts)
        this.set_geometry_faces(geometry, nfaces)

        if ('fc' in data.g) {
            var nfc=[]
            for (var i = 0; i < faces.length; i++) {
                var f = faces[i]
                if (f.length == 3) {
                    nfc.push(data.g.fc[i])
                }
                else if (f.length ==4){
                    nfc.push(data.g.fc[i])
                    nfc.push(data.g.fc[i])
                }
            }
            this.set_geometry_face_color(geometry, nfc)
        }
        // if (data['transform']!=undefined && data['transform']['t']!=undefined) 
        // {
        //     var position = data['transform']['t']
        //     obj.position.set(position[0],position[2],-position[1])
        // }
        obj.scale.set(1, 1, -1);
        obj.castShadow = true;
        obj.receiveShadow = true;
        geometry.computeBoundingSphere();
        geometry.computeVertexNormals();
        // geometry.computeFaceNormals();
        return id
    }

    set_mesh(data) {
        var id = data.g.id
        var pts = data.g.p
        var faces = data.g.f
        var geometry, mat, obj
        var color = [255, 255, 255]
        if ('s' in data && 'color' in data.s)
            color = data.s.color
        if (id in this.objects) {
            obj = this.objects[id];
            geometry = obj.geometry;
        }
        else {
            geometry = new THREE.Geometry()
            mat = new THREE.MeshPhongMaterial({color: 'rgb(0,255,0)', emissive: 0x000020});
            obj = new THREE.Mesh(geometry, mat)
            this.scene.add(obj)
            this.objects[id] = obj

        }

        this.set_geometry_vertices(geometry, pts)
        this.set_geometry_faces(geometry, faces)

        if (data['transform'] != undefined && data['transform']['t'] != undefined) {
            var position = data['transform']['t']
            console.log('position=', position)
            obj.position.set(position[0], position[2], -position[1])
        }
        obj.scale.set(1, 1, -1)

        geometry.computeBoundingSphere()
        geometry.computeVertexNormals();
        return id
    }

    set_point_clouds(data) {
        // TODO: size is not working!
        var id = data['g']['id']
        var pts = data['g']['p']
        var scales = data['g']['r']
        var colors = data['g']['c']
        var positions, scales, parallel_scale, parallel_color, index

        if (scales.length != pts.length) parallel_scale = false
        else parallel_scale = true

        if (colors.length != pts.length) parallel_color = false
        else parallel_color = true

        // make points and scales
        positions = new Float32Array(pts.length * 3);
        scales = new Float32Array(pts.length)
        for (var i = 0; i < pts.length; i++) {
            index = i * 3
            positions[index] = pts[i][0]
            positions[index + 1] = pts[i][2]
            positions[index + 2] = pts[i][1]
            if (parallel_scale) scales[i] = scales[i]
            else scales[i] = scales[0]

        }

        if (id in this.objects) { //modification
            // do something
            var geometry = this.objects[id].geometry
            geometry.attributes['position'].setArray(positions)
            geometry.attributes['position'].needsUpdate = true
            geometry.attributes['scale'].setArray(scales)
            geometry.attributes['scale'].needsUpdate = true
            geometry.verticesNeedUpdate = true
        }
        else { //creation

            var geometry = new THREE.BufferGeometry();
            geometry.addAttribute('position', new THREE.BufferAttribute(positions, 3));
            geometry.addAttribute('scale', new THREE.BufferAttribute(scales, 1));

            var mat = MaterialLibrary.uniform(0xff0000)
            var point_cloud = new THREE.Points(geometry, mat);
            this.scene.add(point_cloud)
            this.objects[id] = point_cloud
        }

    }


    delete(id) {
        if (id in this.objects) {
            obj = this.objects[id]
            if (Array.isArray(obj)) {
                obj.forEach(function (o) {
                    this.scene.remove(o)
                })
            }
            else this.scene.remove(obj)
        }
    }

    set_geometry_face_color(geometry, fc) {
        console.log('in set_geometry_face_color')
        for (var i in geometry.faces) {
            var f = geometry.faces[i]
            var color=fc[i]
            for (var j = 0; j < 3; j++) {
                f.vertexColors[j] = new THREE.Color(color[0],color[1],color[2])
            }


        }
        geometry.colorsNeedUpdate = true
    }

    set_geometry_vertices(geometry, pts) {
        geometry.vertices = []
        pts.forEach(function (p) {
            geometry.vertices.push(new THREE.Vector3(p[0], p[2], p[1]))
        });
        geometry.verticesNeedUpdate = true
    }

    set_geometry_faces(geometry, faces) {
        geometry.faces = []
        faces.forEach(function (f) {
            if (f.length == 3) geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]))
            else if (f.length == 4) geometry.faces.push(new THREE.Face4(f[0], f[1], f[2], f[3]))
        });
        geometry.elementsNeedUpdate = true
    }

    make_buffer_array(data_array, second_dimension = 2) {
        var length = data_array.length * second_dimension
        var new_array = new Float32Array(length);
        for (var i; i < second_dimension.length; i++) {
            if (second_dimension > 1) {
                for (var j; j < second_dimension.length; j++) {
                    new_array.push(data_array[i][j])
                }
            }
            else {
                new_array.push(data_array[i])
            }
        }
    }

}