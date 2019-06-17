class GeometryLibrary extends Library{
    // geometry library is indexed by server uuid
    // while component library is indexed by user given name

    constructor(viewer) {
        super(viewer, THREE.Geometry)
    }
    // set_geometry(name,data){
    //     var g;
    //     if(name in this.data)
    //         g = this.data[name]
    //     else
    //         g = new THREE.Geometry()
    //     viewer.manager.set_mesh_geometry_from_data(g,data)
    //
    // }
    // add_ref(name, obj) {
    //     if ((name in this.reference_mapper) == false) {
    //         this.reference_mapper[name] = []
    //     }
    //     this.reference_mapper[name].push(obj)
    // }
    //
    // remove_ref(name, obj) {
    //     if (name in this.reference_mapper) {
    //         var objs = this.reference_mapper[name]
    //         var index = objs.indexOf(objs)
    //         if (index > -1) {
    //             objs.splice(index, 1)
    //         }
    //     }
    // }
    // update_related_objects(name) {
    //     if (name in this.reference_mapper) {
    //         var objs = this.reference_mapper[name];
    //         for (var i in objs) {
    //             objs[i].geometry = this.data[name]
    //         }
    //     }
    // }

    on_set(item,data){
        // override this method
        // called when set an item to the library
        // TODO: you have extract the the correct content from data and set to the item
        // the item might be a texture or a THREE.Mesh
        this.viewer.manager.set_mesh_geometry_from_data(item,data)
    }

    on_set_item_to_object(item,obj){
        // override this method
        // TODO: apply this item to a given object
        // the item might be a texture or a THREE.Mesh
        obj.geometry = item
    }

    on_update_related_objects(obj, item){
        // override this method
        // TODO: when the library item is updated, all related objects should update too
        // this method deals with single object
        // an example usage might be: 'obj.textureNeedUpdate = true' when texture is changed
    }

}