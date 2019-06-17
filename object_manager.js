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

    delete(id) {
        if (id in this.objects) {
            this.model_container.remove(this.objects[id])
        }
    }


}