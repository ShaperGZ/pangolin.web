class Interpretor {
    constructor(viewer, manager) {
        this.viewer = viewer
        this.manager = manager
    }

    parse(jsonMessage, parse = true) {
        var msg = jsonMessage;
        if (parse) {
            msg = JSON.parse(jsonMessage);
        }
        if (msg == null) return
        // console.log(msg)

        switch (msg.cmd) {
            case 'set_scene_info':
                Interpretor.set_scene_info(this.viewer, msg)
                break;
            case 'set_camera':
                Interpretor.set_camera(this.viewer, msg)
                break;
            case 'remove':
                Interpretor.remove(this.manager, msg);
                break;
            case 'hud':
                Interpretor.set_hud(msg);
                break;
            case 'set_object':
                // console.log(msg)
                Interpretor.set_object(this.viewer, this.manager, msg);
                break;
            case 'set_lib_component':
                // console.log(msg)
                Interpretor.set_object(this.viewer, this.viewer.component_lib, msg)
                break;
            case 'inspect_inplace':
                // console.log(msg)
                set_gui(msg['parameters'])
                break;
            case 'set_lib_textures':
                for (var name in msg['textures']) {
                    // console.log('interpretor setting texture:',name)
                    this.viewer.texture_lib.set(name, msg['textures'][name])
                }
                break;
            case 'set_lib_component':
                for (var key in msg.content) {
                    this.viewer.component_lib.set(key, msg.content[key])
                }
                break;
            default:
                break
        }
    }


    parse_multiple(jsonMessage) {
        //console.log(jsonMessage)
        var messages = JSON.parse(jsonMessage)
        var ids = []
        //console.log(messages)
        //console.log(messages.length)
        //console.log('message0=',messages[0])
        var self = this
        messages.forEach(function (msg) {
            var objid = self.parse(msg, false);
            ids.push(objid);
        });
        return ids;
    }

    static set_scene_info(viewer, msg){

        var dom_txt = document.getElementById('txt_reloader')
        dom_txt.value = msg.module

        var dom_bt = document.getElementById('bt_reloader')
        dom_bt.onclick = function(){
            var dom_txt = document.getElementById('txt_reloader')
            viewer.clear_scene()
            socket.send("load_scene('"+dom_txt.value+"')")
        }
    }

    static set_camera(viewer, msg) {
        // viewer.camera.position.set(msg.position[0],msg.position[2],-msg.position[1] )
        // viewer.camera.lookAt(msg.target[0],msg.target[2],-msg.target[1])
        if (msg.name == 'main') {
            pos = msg['position']
            viewer.camera.position.set(pos[0], pos[2], -pos[1])

            if ('target' in msg) {
                trg = msg['target']
                self.camera.lookAt(new THREE.Vector3(trg[0], trg[2], -trg[1]))
            }

            viewer.camera.fov = msg.fov
            viewer.camera.frustumCulled = msg.frustumCulled
            viewer.camera.near = msg.near
            viewer.camera.far = msg.far

            viewer.camera.updateProjectionMatrix()
        }

    }

    static remove(manager, msg) {
        // console.log('remove msg:',msg)
        if ('parent' in msg) {
            var parent = manager.get_mesh_object(msg.parent)
            var subject = manager.get_mesh_object(msg.id)
            console.log('parent =', parent)
            console.log('pre remove subject =', subject, 'parent=', subject.parent)
            parent.remove(subject)
            console.log('post remove subject =', subject, 'parent=', subject.parent)
        }
        else {
            manager.delete(msg['id'])
        }
    }

    static set_object(viewer, manager, data) {
        // console.log('setting object id=', data.id, 'msg=', data)


        if ('ref' in data) {
            Interpretor.set_mesh_component_object_reference(manager, data.id, data.ref)
        }
        else {
            if ('geometry' in data) {
                var geo_data = data.geometry
                switch (geo_data.type) {
                    case 'mesh':
                        Interpretor.set_mesh_object_geometry(manager, data.id, geo_data)
                        break;
                    case 'polyline':
                        Interpretor.set_line_object_geometry(manager,data.id,geo_data)
                    default:
                        break;
                }
            }
            if ('material' in data) {
                Interpretor.set_object_material(viewer, manager, data.id, data.material)
            }
            if ('line_style' in data) {
                Interpretor.set_object_line_style(viewer, manager, data.id, data.line_style)
            }
            if ('segments' in data) {

            }

            if('ref_key' in data){
                manager.objects[data.id].ref_key = data.ref_key
            }

        }

        if ('transform' in data) {
            Interpretor.set_object_transform(manager, data.id, data.transform)
        }

        if ('parent' in data) {
            Interpretor.set_object_parent(manager, data.id, data.parent)
        }


    }

    static set_object_line_style(viewer, manager, id, style_data) {
        if(style_data == null){
            console.log('style_data is null');
            return;
        }
        var obj = manager.get_line_object(id, true)
        obj.material.color = style_data.color

    }

    static set_mesh_component_object_reference(manager, id, ref) {
        var obj = manager.get_mesh_object(id, true)
        var found = false;
        console.log('looking for ',ref)
        for(var key in  viewer.component_lib.objects){
            if (ref ==  viewer.component_lib.objects[key].ref_key){
                var component = viewer.component_lib.objects[key];
                obj.geometry = component.geometry
                obj.material = component.material
                found = true
                console.log('ref found')
            }
        }

        // if (ref in viewer.component_lib.objects) {
        //     var component = viewer.component_lib.objects[ref];
        //     obj.geometry = component.geometry
        //     obj.material = component.material
        // }
        if (! found) {
            console.log('ERROR! component for found for ' + ref)
            obj.geometry = new THREE.CubeGeometry(1,1,1)
            obj.material = new THREE.MeshBasicMaterial({'color':'darkred'})
            return;
        }
    }

    static set_line_object_geometry(manager, id ,geo_data){
        var obj = manager.get_line_object(id, true)
        Interpretor._set_geometry_vertices(obj.geometry, geo_data.p)
        obj.geometry.computeBoundingSphere();
    }

    static set_mesh_object_geometry(manager, id, geo_data) {
        // console.log('manager=', manager)
        var obj = manager.get_mesh_object(id, true)
        var faces = geo_data.f

        faces = Interpretor._convert_face_index_to_face3(faces)
        Interpretor._set_geometry_vertices(obj.geometry, geo_data.p)
        Interpretor._set_geometry_faces(obj.geometry, faces)

        if ('fuv' in geo_data) Interpretor._set_geometry_face_uv(obj.geometry, geo_data.fuv)
        if ('fc' in geo_data) {
            obj.material.vertexColors = THREE.VertexColors
            var fc = Interpretor._convert_fc_to_fc3(geo_data)
            Interpretor._set_geometry_face_color(obj.geometry, fc)
            obj.material.needsUpdate = true
        }
        else {
            obj.material.vertexColors = 0
            obj.material.needsUpdate = true
        }
        obj.geometry.computeBoundingSphere();
        obj.geometry.computeVertexNormals();
    }

    static set_object_parent(manager, id, parent) {
        // var obj = manager.get_mesh_object(id, false)
        var obj = manager.get_mesh_object(id, true)
        // console.log('parent = ', parent)
        if (parent in manager.objects) {
            parent = manager.objects[parent]
            parent.add(obj)
        }
        else{
            console.warn('parent not exist:', parent)
        }
    }

    static set_object_transform(manager, id, transform_data) {
        if(true){
        // if (id in manager.objects) {
            var obj = manager.get_mesh_object(id, true)
            // console.log('created obj:',id)
            // var obj = manager.objects[id]

            var position = transform_data.t
            obj.position.set(position[0], position[2], position[1])

            var scale = transform_data.s
            obj.scale.set(scale[0], scale[2], scale[1])
        }

    }

    static set_object_material(viewer, manager, id, mat_data) {
        var obj = manager.objects[id];
        if (obj == undefined) return

        var mat_type = obj.material.type;
        switch (mat_data.type) {
            case 'lambert':
                if (mat_type != 'MeshLambertMaterial') {
                    obj.material = new THREE.MeshLambertMaterial()
                }
                break;
            case 'phong':
                if (mat_type != 'MeshPhongMaterial') {
                    obj.material = new THREE.MeshPhongMaterial()
                }
                break;
            case 'basic':
                if (mat_type != 'MeshBasicMaterial') {
                    obj.material = new THREE.MeshBasicMaterial()
                }
                break;

        }

        if (mat_data.textures.diffuse != null && mat_data.textures.diffuse != '') {
            obj.material.map = viewer.texture_lib.data[mat_data.textures.diffuse]
            obj.material.needsUpdate = true
        }
    }

    static _set_geometry_vertices(geometry, vertices) {
        geometry.vertices = [];
        vertices.forEach(function (p) {
            geometry.vertices.push(new THREE.Vector3(p[0], p[2], p[1]))
        });
        geometry.verticesNeedUpdate = true
    }

    static _set_geometry_faces(geometry, faces) {
        // set vertices for a given geometry
        geometry.faces = []
        faces.forEach(function (f) {
            geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]))

            // confirmed this version of THREE.js doesnt support displaying Face4
            // if (f.length == 3) geometry.faces.push(new THREE.Face3(f[0], f[1], f[2]))
            // else if (f.length == 4) geometry.faces.push(new THREE.Face4(f[0], f[1], f[2], f[3]))
        });
        geometry.elementsNeedUpdate = true
    }

    static _set_geometry_face_uv(geometry, fuv) {
        // set texture face uv for a given geometry
        geometry.faceVertexUvs[0] = []
        for (var i = 0; i < geometry.faces.length; i++) {
            // var face = geometry.faces[i]
            var ifuv = [];

            for (var j = 0; j < fuv[i].length; j++) {
                ifuv.push(new THREE.Vector2(fuv[i][j][0], fuv[i][j][1]));
                // ifuv.push(fuv[i][j]);
                // ifuv.push({'x':fuv[i][j][0],'y':fuv[i][j][1]});
            }
            geometry.faceVertexUvs[0].push(ifuv)
        }
        geometry.uvsNeedUpdate = true;
    }

    static _set_geometry_face_color(geometry, face_color) {
        for (var i in geometry.faces) {
            var f = geometry.faces[i]
            var color = face_color[i]
            if (color != undefined) {
                for (var j = 0; j < 3; j++) {
                    f.vertexColors[j] = new THREE.Color(color[0], color[1], color[2])
                }
            }

        }
        geometry.colorsNeedUpdate = true
    }

    static _convert_fc_to_fc3(data) {
        var fc = data.fc
        var faces = data.f
        var nfc = []
        for (var i = 0; i < faces.length; i++) {
            var f = faces[i]
            console.log(f.length)
            if (f.length == 3) {
                nfc.push(fc[i])
            }
            else if (f.length == 4) {
                nfc.push(fc[i])
                nfc.push(fc[i])
            }
        }
        return nfc
    }

    static _convert_face_index_to_face3(faces) {
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
        return nfaces
    }

    static set_hud(data) {
        var hud = document.getElementById('hud01_content')
        var contents = data['contents']
        var innerhtml = ''
        for (var k in contents) {
            innerhtml += k + ' : ' + contents[k]['value'] + '<br>'
        }
        hud.innerHTML = innerhtml
    }

    static set_sky() {
    }


}



 