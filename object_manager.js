class ObjectManager {

    constructor(scene) {
        this.objects = {}
        this.selected_objects = []
        //this.id_by_threejs_object={}

        this.scene = scene;
        this.model_container = new THREE.Group()
        this.model_container.name='model_container'
        this.model_container.scale.set(1, 1, -1)
        this.scene.add(this.model_container)

        this.selection_bbox_lines = new THREE.Group()

        // var self=this;
    }

    clear() {
        for(var i in this.objects){
            this.model_container.remove(this.objects[i])
        }
        this.selected_objects = []
        this.objects = {}
    }

    set_selected_objects(selected_objects) {
        this.selected_objects = selected_objects
        // on select callbacks goes here
    }

    get_selectable_objects() {
        // console.log('getting selectables')
        var selectables = []
        // selectables = this.get_all_descending_children(this.model_container)

        for (var key in this.objects) {
            var obj = this.objects[key]
            selectables.push(obj)
        }
        return selectables
    }

    get_id_by_threejs_object(threejs_obj) {
        var objects = this.objects
        for (var key in objects) {
            var obj = objects[key]
            // // console.log(obj)
            // if (Array.isArray(obj)) {
            //     console.log(obj)
            //     for (var k in obj) {
            //         var o = obj[k]
            //         if (o == threejs_obj) {
            //             return key
            //         }
            //     }
            // }
            if (obj == threejs_obj) {
                return key
            }
        }
        return null
    }

    get_flag_object(id, create_if_not_exist=false){
        var obj;
        if (id in this.objects) {
            return this.objects[id];
        }
        else if(create_if_not_exist){
            obj = makeFlagLabel()
            this.objects[id] = obj
            this.model_container.add(obj)
            return obj;
        }
        return null
    }

    get_object_by_type(id,obj_type){
        // console.log('trying to get:',obj_type)
        var obj
        switch (obj_type){
            case 'mesh':
                obj = this.get_mesh_object(id,true)
                break;
            case 'polyline':
                obj = this.get_line_object(id,true)
                break;
            case 'segments':
                obj = this.get_segment_object(id,true)
                break
            default:
                obj = null;
        }
        // console.log('got obj:',obj)
        return obj
    }

    get_mesh_object(id, create_if_not_exist=false){
        var obj;
        if (id in this.objects) {
            return this.objects[id];
        }
        else if(create_if_not_exist){
            var geometry = new THREE.Geometry()
            var mat = new THREE.MeshLambertMaterial();
            obj = new THREE.Mesh(geometry, mat)
            obj.name = id
            this.objects[id] = obj
            this.model_container.add(obj)
            obj.castShadow = true;
            obj.receiveShadow = true;
            return obj
        }
        return null
    }

    get_line_object(id, create_if_not_exist=false){
        var obj;
        if (id in this.objects) {
            return this.objects[id];
        }
        else if(create_if_not_exist){
            var geometry = new THREE.Geometry()
            var mat = new THREE.LineBasicMaterial({color: 0xffffff});
            obj = new THREE.Line(geometry, mat)
            obj.name = id
            this.objects[id] = obj
            this.model_container.add(obj)
            obj.castShadow = false;
            obj.receiveShadow = false;
            return obj
        }
        return null
    }

    get_segment_object(id, create_if_not_exist=false){
        var obj
        if (id in this.objects) {
            return this.objects[id];
        }
        else if(create_if_not_exist){
            var geometry = new THREE.BufferGeometry()
                var mat = new THREE.LineBasicMaterial({color:0xffffff, vertexColors: THREE.VertexColors})
            obj = new THREE.LineSegments(geometry, mat)
            obj.name = id
            this.objects[id] = obj
            this.model_container.add(obj)
            obj.castShadow = false;
            obj.receiveShadow = false;
            return obj
        }
        return null
    }

    get_root_object(obj){
        parent = obj.parent
        // console.log('object',obj)
        // console.log('parent',parent)
        while(parent!=undefined && parent.type != 'Scene' && parent.name != 'model_container'){
            obj = parent
            parent = obj.parent
        }
        return obj
    }
    get_all_descending_children(obj){
        var buket = []
        var child
        buket.concat(obj.children)
        for(var i in obj.children){
            child = obj.children[i]
            buket.push(child)
            buket.concat(this.get_all_descending_children(child))
        }
        return buket
    }


    delete(id) {
        if (id in this.objects) {
            var obj = this.objects[id]
            this.model_container.remove(obj)
            this.objects.pop(obj)
        }

    }


}