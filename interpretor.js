
class Interpretor {
    constructor(viewer, manager) {
        this.viewer = viewer
        this.manager = manager
        this.unclaimed_parent={}
    }

    parse(jsonMessage, parse = true) {
        var msg = jsonMessage;
        if (parse) {
            msg = JSON.parse(jsonMessage);
        }
        if (msg == null) return
        // console.log(msg)

        switch (msg.cmd) {
            case 'tween_camera':
                this.viewer.tween_camera(msg.to_campos,msg.to_trgpos)
                break;
            case 'set_flag':
                this.set_flag(this.viewer, msg)
                break;
            case 'set_scene_info':
                this.set_scene_info(this.viewer, msg)
                break;
            case 'set_camera':
                this.set_camera(this.viewer, msg)
                break;
            case 'remove':
                this.remove(this.manager, msg);
                break;
            case 'hud':
                this.set_hud(msg);
                break;
            case 'set_object':
                // console.log(msg)
                this.set_object(this.viewer, this.manager, msg);
                break;
            case 'set_lib_component':
                console.log(msg)
                this.set_object(this.viewer, this.viewer.component_lib, msg)
                break;
            case 'inspect_inplace':
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
            case 'set_skybox':
                this.viewer.set_scene_background(msg.textures)
                break;
            default:
                // console.log('msg:',msg)
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


    set_scene_info(viewer, msg) {
        var dom_txt = document.getElementById('txt_reloader')
        dom_txt.value = msg.module

        var dom_bt = document.getElementById('bt_reloader')
        dom_bt.onclick = function () {
            var dom_txt = document.getElementById('txt_reloader')
            viewer.clear_scene()
            var component_panel = document.getElementById('component_browser')
            component_panel.style.display = 'none';
            socket.send("load_scene('" + dom_txt.value + "')")
        }
    }

    set_camera(viewer, msg) {
        // viewer.camera.position.set(msg.position[0],msg.position[2],-msg.position[1] )
        // viewer.camera.lookAt(msg.target[0],msg.target[2],-msg.target[1])
        if (msg.name == 'main') {
            pos = msg['position']
            viewer.camera.position.set(pos[0], pos[2], -pos[1])

            if ('target' in msg) {
                trg = msg['target']
                self.camera.lookAt(new THREE.Vector3(trg[0], trg[2], -trg[1]))
                if (self.controls!=undefined)
                    self.controls.target.set(trg[0], trg[2], -trg[1])
            }

            viewer.camera.fov = msg.fov
            viewer.camera.frustumCulled = msg.frustumCulled
            viewer.camera.near = msg.near
            viewer.camera.far = msg.far

            viewer.camera.updateProjectionMatrix()
        }

    }

    remove(manager, msg) {
        if(msg.id in manager.objects){
            var obj= manager.objects[msg.id]
            obj.parent.remove(obj)
            delete manager.objects[msg.id]
        }
    }

    set_flag(viewer, data) {
        var obj = viewer.manager.get_flag_object(data.id, true)

        setFlagLabel(obj, data.text, data.height, data.radius, data.style)

        var parent = data.parent
        if (parent in manager.objects && parent != obj.parent) {
            parent = manager.objects[parent]
            parent.add(obj)
        }

        obj.position.set(data.position[0], data.position[2], data.position[1])

    }

    set_object(viewer, manager, data) {
        // console.log('setting object id=', data.id, 'msg=', data)

        //如果是個構建，那麽就不顯示，所以需要鼠標選擇，所以不用計算bounding sphere
        var compute_bounding_sphere = true
        if ('ref_key' in data)compute_bounding_sphere = false

        var obj= manager.get_object_by_type(data.id,data.type)
        if(obj==null)return

        if ('parent' in data) {
            this.set_object_parent(manager, obj, data.parent)
        }

        if ('transform' in data) {
            this.set_object_transform(obj, data.transform)
        }


        if ('ref' in data) {
            this.set_mesh_component_object_reference(manager, obj, data.ref)
        }
        else {
            if ('geometry' in data) {
                var geo_data = data.geometry
                switch (data.type) {
                    case 'mesh':
                        this.set_mesh_object_geometry(obj, geo_data, compute_bounding_sphere)
                        break;
                    case 'polyline':
                        this.set_line_object_geometry(obj, geo_data)
                        break;
                    case 'segments':
                        this.set_segment_object_geometry(obj, geo_data)
                        break;
                    case 'mesh_line':
                        this.set_mesh_line_object_geometry(obj,geo_data, data.line_style)
                        break;
                    default:
                        break;
                }
            }
            if ('material' in data) {
                this.set_object_material(viewer,obj, data.material)
            }
            if ('line_style' in data) {
                this.set_object_line_style(obj, data.line_style)
            }
            if('visible' in data){
                this.set_object_visible(obj,data)
            }
        }



        if ('ref_key' in data) {
            // 證明這是一個component
            // console.log('data with ref_key')
            // console.log(data)
            manager.objects[data.id].ref_key = data.ref_key
            // 這個update是儅component有子物體時使用，因爲 component裏如果有子物體時，服務器不管理這些子物體
            this._update_associated_objects(manager,data.ref_key,manager.objects[data.id])
        }


    }

    set_object_line_style(obj, style_data) {
        if (style_data == null) {
            console.log('style_data is null');
            return;
        }
//        console.log('style data= ',style_data)
        obj.material.color = style_data.color
        obj.material.needsUpdate = true

    }

    _update_associated_objects(manager, ref_key, comp){
        // 這個update是儅component有子物體時使用，因爲 component裏如果有子物體時，服務器不管理這些子物體
        var refs = this._find_associated_object(manager, ref_key)
        if(refs != undefined && refs.length>0){
            for(var i in refs){
                var ref = refs[i]
                this._create_ref_sub_ojects(manager,ref,comp)
            }
        }
    }
    _find_associated_object(manager, component_key){
        // finds all objects that referenced the given coponent_key
        var data={pool:[]}
        var get_all=function(o,data){
            if(o.component_key != undefined && o.component_key==component_key) data.pool.push(o)
            if (o.children.length>0){
                for(var i in o.children){
                    get_all(o.children[i],data)
                }
            }
        }
        get_all(manager.model_container,data)
        return data.pool
    }

    _create_ref_sub_ojects(manager, obj, comp) {
        // delete extract objects
        // console.log('comp=',comp,comp.length)

        var diff = obj.children.length - comp.children.length
        if (diff > 0) {
            for(var i=0;i<diff;i++){
                obj.children.pop()
            }
        }
        for (var i = 0; i < comp.children.length; i++) {

            if (i >= obj.children.length) {
                var sub;
                switch(comp.children[i].type){
                    case "Mesh":
                        sub = new THREE.Mesh(new THREE.Geometry(),new THREE.MeshBasicMaterial())
                        // console.log('create mesh got:',sub)
                        break;
                    case "Line":
                        sub = new THREE.Line(new THREE.Geometry(),new THREE.LineBasicMaterial())
                        break;
                    case "LineSegments":
                        sub = new THREE.LineSegments(new THREE.BufferGeometry(),new THREE.LineBasicMaterial())
                        break
                    default:
                        console.log('experience unknown type')
                        sub = null
                        break
                }
                obj.add(sub)
            }

            if(true)
            {
                sub = obj.children[i]
                sub.scale.copy(comp.children[i].scale)
                sub.position.copy(comp.children[i].position)
                sub.rotation.copy(comp.children[i].rotation)
                sub.geometry = comp.children[i].geometry
                sub.material = comp.children[i].material

                if(comp.children[i].children.length>0){
                    var sub_comp = comp.children[i]
                    this._create_ref_sub_ojects(manager,sub,sub_comp)
                }
            }
            else{
                // console.log('unable to create sub object, comp.child type=',comp.children[i].type)

            }

        }
    }

    set_mesh_component_object_reference(manager, obj, ref) {
        var found = false;
        var lib = manager.get_mesh_object('component_library',false)
        if (lib == undefined){
            console.log('! ! ! component_library in undefined')

        }

        var found = false
        for (var key in  lib.children) {
            if ( ref == lib.children[key].ref_key){
                var component = lib.children[key];
                obj.geometry = component.geometry
                obj.material = component.material
                if (component.children.length>0){
                    // console.log('creating sub object count=:', component.children.length, obj.children.length)
                    this._create_ref_sub_ojects(manager, obj, component)
                }

                found = true
                obj.component_key = ref
            }
        }


        if (!found) {
            console.log('ERROR! component not found for ' + ref)
            obj.geometry = new THREE.CubeGeometry(1, 1, 1)
            obj.material = new THREE.MeshBasicMaterial({'color': 'darkred'})
            obj.component_key = null
            return;
        }
    }

    set_line_object_geometry(obj, geo_data) {
        this._set_geometry_vertices(obj.geometry, geo_data.p)
        obj.geometry.computeBoundingSphere();
    }

    set_segment_object_geometry(obj, geo_data){
        this._set_buffergeometry_vertices(obj.geometry,geo_data.p)
        this._set_segment_colors(obj.geometry,geo_data.sc)
        obj.geometry.computeBoundingSphere();
    }
    set_mesh_line_object_geometry(obj,geo_data, line_style){
//        console.log('setting mesh_line obj:',geo_data)
////        return;
        var pts=[]
        for(var i in geo_data.p){
            var point = geo_data.p[i]
            pts.push( new THREE.Vector3(point[0],point[2],point[1]) )
        }

        var ml = new MeshLine2d()
        var line_width = line_style.line_width
        ml.set_geometry(pts,line_width,obj)

            
    }

    set_object_visible(obj, data){
        obj.visible = data.visible

    }

    set_mesh_object_geometry(obj, geo_data, compute_bounding_sphere) {
        var faces = geo_data.f

        faces = this._convert_face_index_to_face3(faces)
        this._set_geometry_vertices(obj.geometry, geo_data.p)
        this._set_geometry_faces(obj.geometry, faces)

        if ('fuv' in geo_data) this._set_geometry_face_uv(obj.geometry, geo_data.fuv)
        if ('fc' in geo_data) {
            obj.material.vertexColors = THREE.VertexColors
            var fc = this._convert_fc_to_fc3(geo_data)
            this._set_geometry_face_color(obj.geometry, fc)
            obj.material.needsUpdate = true
        }
        else {
            obj.material.vertexColors = 0
            obj.material.needsUpdate = true
        }
        if(compute_bounding_sphere) obj.geometry.computeBoundingSphere();
        obj.geometry.computeVertexNormals();
    }

    set_object_parent(manager, obj, parent) {
        if (parent in manager.objects) {
            parent = manager.objects[parent]
            parent.add(obj)
        }
        else {
            if(! (parent in this.unclaimed_parent)){
                this.unclaimed_parent[parent]=[]
            }
            this.unclaimed_parent[parent].push(obj)
            console.warn('parent not exist:', parent,'manager=',manager)

        }
    }

    set_object_transform(obj, transform_data) {
        var position = transform_data.t
        obj.position.set(position[0], position[2], position[1])

        var scale = transform_data.s
        obj.scale.set(scale[0], scale[2], scale[1])

        var rot = transform_data.r
        var factor = 0.017
        obj.rotation.set(rot[0] * factor, rot[2] * factor, rot[1] * factor)
    }

    set_object_material(viewer, obj, mat_data) {
        var mat_type = obj.material.type;
        switch (mat_data.type) {
            case 'lambert':
                if (mat_type != 'MeshLambertMaterial') {
                    console.log('recreating MeshLamberMaterial')
                    obj.material = new THREE.MeshLambertMaterial({transparent: true, blending: THREE.NormalBlending})
                }
                break;
            case 'phong':
                if (mat_type != 'MeshPhongMaterial') {
                    console.log('recreating MeshPhongMaterial')
                    obj.material = new THREE.MeshPhongMaterial({transparent: true, blending: THREE.NormalBlending})
                }
                break;
            case 'basic':
                if (mat_type != 'MeshBasicMaterial') {
                    console.log('recreating MeshBasicMaterial')
                    obj.material = new THREE.MeshBasicMaterial({transparent: true, blending: THREE.NormalBlending})

                }
                break;
            case 'linevertexcolor':
                if (mat_type != 'LineBasicMaterial') {
                    obj.material = new THREE.LineBasicMaterial({color:0xffffff, vertexColors: THREE.VertexColors})
                }
                break;
            case 'linebasic':
                if (true) {
                    obj.material = new THREE.LineBasicMaterial({color:0xffffff})
                }
                break;
        }
        //console.log('mat=',obj.material)
        if (mat_data.color != undefined){
            var c = mat_data.color
            obj.material.color=new THREE.Color(c[0],c[1],c[2]);
            obj.material.colorsNeedUpdate = true;
        }


        if (mat_data.textures.diffuse != null && mat_data.textures.diffuse != '') {

            viewer.texture_lib.assign(mat_data.textures.diffuse, function(){
                console.log('flag4 executing assigment:',viewer.texture_lib.data[mat_data.textures.diffuse])
                obj.material.map = viewer.texture_lib.data[mat_data.textures.diffuse]
                obj.material.needsUpdate = true
            });
            // console.log(viewer.texture_lib.data[mat_data.textures.diffuse])
            // obj.material.map = viewer.texture_lib.data[mat_data.textures.diffuse]
            // obj.material.needsUpdate = true
        }
        obj.material.needsUpdate = true
    }

    _set_geometry_vertices(geometry, vertices) {
        geometry.vertices = [];
        vertices.forEach(function (p) {
            geometry.vertices.push(new THREE.Vector3(p[0], p[2], p[1]))
        });
        geometry.verticesNeedUpdate = true

    }

    _set_buffergeometry_vertices(geometry, vertices) {
        var buffered_vertices = [];
        vertices.forEach(function (p) {
            buffered_vertices.push(p[0], p[2], p[1])
        });
        // console.log('vertices=',buffered_vertices)
        geometry.addAttribute('position', new THREE.Float32BufferAttribute( buffered_vertices, 3 ))
    }

    _set_segment_colors(geometry, segment_colors){
        var colors=[],c
        for(var i in segment_colors){
            c = segment_colors[i]
            colors.push(c[0],c[1],c[2]) // one for start point
            colors.push(c[0],c[1],c[2]) // one for end point
        }
        // console.log('colors=',colors)
        // console.log('geometry=',geometry)
        geometry.addAttribute('color',new THREE.Float32BufferAttribute(colors, 3 ))
    }

    _set_geometry_faces(geometry, faces) {
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

    _set_geometry_face_uv(geometry, fuv) {
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

    _set_geometry_face_color(geometry, face_color) {
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

    _convert_fc_to_fc3(data) {
        var fc = data.fc
        var faces = data.f
        var nfc = []
        for (var i = 0; i < faces.length; i++) {
            var f = faces[i]
            // console.log(f.length)
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

    _convert_face_index_to_face3(faces) {
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

    set_hud(data) {
        var hud = document.getElementById('hud01_content')
        var contents = data['contents']
        var innerhtml = ''
        for (var k in contents) {
            innerhtml += k + ' : ' + contents[k]['value'] + '<br>'
        }
        hud.innerHTML = innerhtml
    }

    set_sky() {
    }




}



 