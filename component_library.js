class ComponentLibrary{
    // geometry library is indexed by server uuid
    // while component library is indexed by user given name

    constructor() {
        this.objects = {}
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
            // this.model_container.add(obj)
            // obj.castShadow = true;
            // obj.receiveShadow = true;
            return obj
        }
        return null
    }

    clear(){
        this.object = {}
    }

   
}