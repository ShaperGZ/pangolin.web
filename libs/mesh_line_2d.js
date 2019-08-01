class MeshLine2d{



    set_geometry(pts, line_width, obj){
        console.log('set_geometry pts=',pts)
        var geometry = obj.geometry

        var hv1,hv2
        const up=new THREE.Vector3(0,1,0)
        var vertices=[]
        var faces = []
        var vcount=0
        var last_hv2=null

        for(var i=0;i<pts.length-1;i++){
            var j = i+1;
            var radians = Math.PI / 2 //90 degree

            var p0 = pts[i]
            var p1 = pts[j]
            var dir = p1.clone().sub(p0)
            var cordlength = line_width
            if(last_hv2==null)
                hv1 = dir.clone().normalize().cross(up).multiplyScalar(cordlength)
            else
                hv1=last_hv2
            

            if (i<pts.length-2){
                console.log('cal angle i=',i)
                var k = j+1
                // angle betwen vects
                var v1 = pts[i].clone().sub(pts[j]).normalize()
                var v2 = pts[k].clone().sub(pts[j]).normalize()


                radians = v1.angleTo(v2) / 2


                console.log('['+i+']v2=',v2)
                //get half angle

                if (radians!=0)
                {
                    cordlength = line_width/Math.sin(radians)
                    hv2 = v1.clone().add(v2).multiplyScalar(0.5).normalize().multiplyScalar(cordlength)
                }
                else{
                    hv2 = hv1;
                }
                if(v1.clone().cross(v2).y<0) {
                    hv2.multiplyScalar(-1)
                }
                // console.log('['+i+']radians=',radians)
                // console.log('['+i+']half angle=',radians*(180/Math.PI))
                // console.log('['+i+']concavity=',v1.clone().cross(v2).y>0)

            }
            else{
                hv2 = dir.clone().normalize().cross(up).multiplyScalar(cordlength)
            }

            var unscale = this._get_untransformed_scale(obj)
            console.log('unscale=',unscale)



            if(i==0){
                hv1.divide(unscale)
            }
            hv2.divide(unscale)
            vertices.push(p0.clone().add(hv1))
            vertices.push(p0.clone().sub(hv1))
            vertices.push(p1.clone().add(hv2))
            vertices.push(p1.clone().sub(hv2))


            last_hv2 = hv2


            faces.push(new THREE.Face3(vcount,vcount+2,vcount+1))
            faces.push(new THREE.Face3(vcount+1,vcount+2,vcount+3))
            vcount = vertices.length
        }
        console.log('set_geometry vertices=',vertices)
        console.log('set_geometry faces=',faces)
        geometry.vertices = vertices
        geometry.faces = faces
        geometry.verticesNeedUpdate = true
        return geometry
    }

    _get_untransformed_scale(obj){
        var scale = obj.scale;
        var parent = obj.parent;
        while(parent.type !='Group'){
            scale.multiply(parent.scale);
            parent = parent.parent;
        }
        return scale
    }
}