class TextureLibrary extends Library{
    constructor(viewer) {
        super(viewer, THREE.Texture)
        this.callbacks={}
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


    load_bytes(item, data,key) {
        var self = this;
        var lib_data = this.data;

        // console.log(data)
        // let data_uri = "data:image/png;base64," + convert_to_base64_string(data);
        let data_uri = "data:image/png;base64," + data;
        let loader_t = new THREE.TextureLoader();
        var callbacks=this.callbacks;
        loader_t.load(
            // resource URL
            data_uri,
            // Function when resource is loaded
            function (texture) {
                // texture.format = THREE.RGBAFormat;
                texture.format = THREE.RGBFormat;
                item.image = texture.image
                item.needsUpdate = true
                console.log('flag2: image=',item.image)
                console.log('flag3: prepare to call callbacks')
                if (callbacks[key]!=undefined)
                    for(var i in callbacks[key]){
                        callbacks[key][i]();
                    }
                    callbacks[key]=[]


                // self.update_related_objects(name)
                
            },
            // onProgress callback currently not supported
            // Please note three.js r84 dropped support for TextureLoader progress events.
            undefined,
            // Function called when download errors
            function (xhr) {
                console.log( 'An error happened, data=',data );
            }
        );

    }


    set(key,data){
        var item;
        if (data.type == 'bytes') {
            if(key in this.data)
                item = this.data[key]
            else
                item = new this.item_type()
            this.data[key] = item
            console.log('flag1:',this.data[key])
            this.load_bytes(item, data.texture,key);


        }
        else if (data.type == 'cubemap'){
            var urls = []
            for(var i in data.textures){
                urls.push( "data:image/png;base64," + data.textures[i].texture)
            }
//            console.log('datas=',data)
            var loader = new THREE.CubeTextureLoader();
            var cubemap = loader.load(urls)
            cubemap.format = THREE.RGBFormat;
            this.data[key] = cubemap
            for(var i in this.callbacks[key]){
                    
                    this.callbacks[key][i]();
            }
            this.callbacks[key] = []
            
        }
    }
    


    on_set_item_to_object(item,obj){
        if (obj == undefined) return;
        // override this method
        // TODO: apply this item to a given object
        // the item might be a texture or a THREE.Mesh
//        console.log('on_set_item_to_object, object:',obj)
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

    assign(key, callback){
        if(this.data.key==undefined){
            if (this.callbacks[key] == undefined){
                this.callbacks[key] = []
            }
            this.callbacks[key].push(callback);
        }
        else
            console.log('executing callback:',callback)
            callback();
    }

}