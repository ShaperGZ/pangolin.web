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

    // on_set(item,data){
    //     // override this method
    //     // called when set an item to the library
    //     // TODO: you have extract the the correct content from data and set to the item
    //     // the item might be a texture or a THREE.Mesh
    //     if(item.geometry == undefined) item.geometry = new THREE.Geometry();
    //     data.g=data.geometry
    //
    //     this.viewer.manager.set_mesh_geometry_from_data(item.geometry,data)
    //     console.log('data.g=',data.g)
    //     if(item.material == undefined) item.material = new THREE.MeshPhongMaterial()
    //     // TODO: assign material
    // }
    //
    // on_set_item_to_object(item,obj){
    //     // override this method
    //     // TODO: apply this item to a given object
    //     // the item might be a texture or a THREE.Mesh
    //     var obj = this.viewer.manager.get_mesh_object(id)
    //     obj.geometry = item.geometry
    //     // obj.material = item.material
    // }
    //
    // on_update_related_objects(obj, item){
    //     // override this method
    //     // TODO: when the library item is updated, all related objects should update too
    //     // this method deals with single object
    //     // an example usage might be: 'obj.textureNeedUpdate = true' when texture is changed
    //
    // }

}