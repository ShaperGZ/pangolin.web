// this is the base class for all kinds of library objects
class Library{
    constructor(viwer, item_type){
        this.viewer = viewer
        this.data = {}
        this.reference_mapper = {}
        this.item_type = item_type;
    }

    set(key,data){
        var item;
        if(key in this.data)
            item = this.data[key]
        else
            item = new this.item_type()
        this.data[key] = item
        this.on_set(item, data)
        // the following line might need to be called in 'on_set' duel to async callbacks
        // this.update_related_objects(key)
    }

    set_item_to_object_by_id(key, id){
        var obj = this.viewer.manager.get_mesh_object(id, true)
        this.set_item_to_object(key, obj)
        // var obj = this.viewer.manager.objects[id]
        // if( obj != undefined){
        //     this.set_item_to_object(key, obj)
        // }
    }

    set_item_to_object(key, obj){
        console.log('set_item_to_object')
        this._remove_ref(key, obj);
        this._add_ref(key, obj);
        var item = this.data[key]
        this.on_set_item_to_object(item, obj);

    }

    _add_ref(key, obj) {
        if ((key in this.reference_mapper) == false) {
            this.reference_mapper[key] = []
        }
        this.reference_mapper[key].push(obj)
    }

    _remove_ref(key, obj) {
        if (key in this.reference_mapper) {
            var objs = this.reference_mapper[key]
            var index = objs.indexOf(obj)
            if (index > -1) {
                objs.splice(index, 1)
            }
        }
    }

    update_related_objects(key) {
        if (key in this.reference_mapper) {
            var objs = this.reference_mapper[key];
            for (var i in objs) {
                this.on_update_related_objects(objs[i], this.data[key])
            }
        }
    }

    on_set(item, data){
        // override this method
        // called when set an item to the library
        // TODO: you have extract the the correct content from data and set to the item
        // the item might be a texture or a THREE.Mesh

    }

    on_set_item_to_object(item, obj){
        // override this method
        // TODO: apply this item to a given object
        // the item might be a texture or a THREE.Mesh


    }

    on_update_related_objects(obj, item){
        // override this method
        // TODO: when the library item is updated, all related objects should update too
        // this method deals with single object
        // an example usage might be: 'obj.textureNeedUpdate = true' when texture is changed

    }



}