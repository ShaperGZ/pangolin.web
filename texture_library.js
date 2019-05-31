class TextureLibrary {
    constructor(viewer) {
        this.viewer = viewer;
        this.data = {};
        this.texture_references = {};
    }

    set_texture(name, data) {
        var texture = data['texture'];
        var data_type = data['type'];
        if (data_type == 'file') this.load_file(name, texture);
        else if (data_type == 'bytes') this.load_bytes(name, texture);
    }

    load_file(name, filename) {
        var texture = new THREE.TextureLoader().load(
            filename,
            function (texture) {
                this.data[name] = texture
            },
            undefined,
            function (xhr) {
                console.log( 'An error loading file to texture ',filename );
            }

        );

    }

    // load_bytes(name,data){
    //     var img = new Image();
    //     var lib_data = this.data;
    //     img.src = "data:image/png;base64," + data;
    //     img.onload =function(){
    //         var texture = new THREE.Texture()
    //         texture.image = img;
    //         lib_data[name] = texture
    //     }
    //     img.load()
    // }

    load_bytes(name, data) {
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
                texture.type = THREE.UnsignedByteType;
                texture.format = THREE.RGBAFormat;
                console.log('assigning texture, name =',name)
                lib_data[name] = texture
                self.update_related_materials(name)
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

    add_ref(name, obj) {
        if ((name in this.texture_references) == false) {
            this.texture_references[name] = []
        }
        this.texture_references[name].push(obj)
    }

    remove_ref(name, obj) {
        if (name in this.texture_references) {
            var objs = this.texture_references[name]
            var index = objs.indexOf(objs)
            if (index > -1) {
                objs.splice(index, 1)
            }
        }
    }

    set_obj_texture_by_id(id, name){
        console.log('setting object texture id :',id)
        var obj = this.viewer.manager.objects[id]
        if( obj != undefined){
            this.set_obj_texture(obj, name)
            console.log('setting object texture for :',obj)
        }
    }

    set_obj_texture(obj, name) {
        this.remove_ref(name, obj);
        this.add_ref(name, obj);

        obj.material.map = this.data[name];
        obj.material.needsUpdate = true;
    }

    update_related_materials(name) {
        if (name in this.texture_references) {
            var objs = this.texture_references[name];
            for (var i in objs) {
                objs[i].material.needsUpdate = true;
            }
        }
    }


}