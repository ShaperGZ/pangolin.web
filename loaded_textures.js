class LoadedTextures{
    constructor(){
        this.data={}
    }

    load_bytes(name, data){

    }

    load_file(name, filename){
        var texture = new THREE.TextureLoader().load( filename );
        this.data[name] = texture
    }
}