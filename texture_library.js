class TextureLibrary extends Library{
    constructor(viewer) {
        super(viewer, THREE.Texture)
    }


    load_file(item, filename) {
        new THREE.TextureLoader().load(
            filename,
            function (texture) {
                item.image = texture.image
                item.needsUpdate = true
                self.update_related_objects(name)
            },
            undefined,
            function (xhr) {
                console.log( 'An error loading file to texture ',filename );
            }

        );

    }


    load_bytes(item, data) {
        var self = this;
        var lib_data = this.data;

        console.log(data)
        // let data_uri = "data:image/png;base64," + convert_to_base64_string(data);
        let data_uri = "data:image/png;base64," + data;
        let loader_t = new THREE.TextureLoader();
        loader_t.load(
            // resource URL
            data_uri,
            // Function when resource is loaded
            function (texture) {
                // texture.format = THREE.RGBAFormat;
                texture.format = THREE.RGBFormat;
                console.log('assigning texture, name =',name)
                item.image = texture.image
                item.needsUpdate = true
                self.update_related_objects(name)
            },
            // onProgress callback currently not supported
            // Please note three.js r84 dropped support for TextureLoader progress events.
            undefined,
            // Function called when download errors
            function (xhr) {
                console.log( 'An error happened' );
            }
        );

    }


    on_set(item,data){
        // override this method
        // called when set an item to the library
        // TODO: you have extract the the correct content from data and set to the item
        // the item might be a texture or a THREE.Mesh
        if (data.type == 'file')
            this.load_file(item, data.texture);
        else if (data.type == 'bytes') this.load_bytes(item, data.texture);
    }

    on_set_item_to_object(item,obj){
        if (obj == undefined) return;
        // override this method
        // TODO: apply this item to a given object
        // the item might be a texture or a THREE.Mesh
        console.log('on_set_item_to_object, object:',obj)
        obj.material.map = item
        obj.material.needsUpdate = true
    }

    on_update_related_objects(obj, item){
        // override this method
        // TODO: when the library item is updated, all related objects should update too
        // this method deals with single object
        // an example usage might be: 'obj.textureNeedUpdate = true' when texture is changed
        obj.material.needsUpdate = true
    }


}