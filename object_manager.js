
ObjectManager = function (scene) {
    this.mapper={}
    this.scene=scene;
    var self=this;


    this.add_line=function(data){
        var id=data['g']['id']
        var pts=data['g']['p']
        var style=data['s']

        var geometry=new THREE.Geometry()
        self.set_geometry_vertices(geometry,pts)
        var mat = new THREE.LineBasicMaterial(style);
        var obj=new THREE.Line(geometry,mat)
        obj.name=id

        self.scene.add(obj)
        self.mapper[id]=obj
        return id;
    };

    this.set_line=function(data){
        var id=data['g']['id']
        if(id in self.mapper){
            var obj=self.mapper[id]
            pts=data['g']['p']
            self.set_geometry_vertices(obj.geometry,pts)
            obj.material=new THREE.LineBasicMaterial(data['s'])
        }
        else{
            self.add_line(data)
        }
        return id
    }

    this.delete=function(id){
        if(id in self.mapper){
            obj=self.mapper[id]
            self.scene.remove(obj)

        }
    }
    this.set_geometry_vertices=function(geometry,pts){
        geometry.vertices=[]
        pts.forEach(function (p) {
            geometry.vertices.push(new THREE.Vector3(p[0], p[2], p[1]))
        });
        geometry.verticesNeedUpdate = true
    }
}