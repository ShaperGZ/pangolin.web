


Viewer=function(){
    this.canvasW=800;
    this.canvasH=600;
    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera( 75, this.canvasW/this.canvasH, 0.1, 1000 );
    this.renderer = new THREE.WebGLRenderer();
    this.container = document.getElementById("threejs_container")
    this.manager = new ObjectManager(this.scene)
    var self=this;
    this.init=function(){
        console.log("initializing")
        var geometries=[]
        var object3ds=[]

        //create HUD
        this.hud = new HUD(self)
        this.hud.enable = false

        //dat.gui
        this.datgui = new DATGUIS(self)

        console.log('HUD is not working, it is added to Viewer, remember to fix later')


        // this.controls = new THREE.TrackballControls( this.camera );
        this.controls = new THREE.OrbitControls( this.camera, this.renderer.domElement );
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 1;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;

        //selector to select object
        var selector = new SelectionControls(this.camera, this.renderer.domElement, this)

        //camera
        this.camera.position.set(-20,28,43)
        this.camera.lookAt(new THREE.Vector3(0,0,0))
        this.camera.far=10000
        this.camera.setFocalLength(35)
        this.renderer.setSize( this.canvasW, this.canvasH );
        this.onWindowResize()


        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;


        this.container.appendChild(this.renderer.domElement);
        this.canvas=this.renderer.domElement

        //---------------------------------------------
        var points = [];

        var point = new THREE.Vector3();
        var direction = new THREE.Vector3();

        for ( var i = 0; i < 50; i ++ ) {

            direction.x += Math.random() - 0.5;
            direction.y += Math.random() - 0.5;
            direction.z += Math.random() - 0.5;
            direction.normalize().multiplyScalar( 10 );

            point.add( direction );
            points.push( point.x, point.y, point.z );

        }

        this.scene.background = new THREE.Color( 0xaaaaaa );

        // SAO:
        //
        // composer = new THREE.EffectComposer( renderer );
        // renderPass = new THREE.RenderPass( scene, camera );
        // composer.addPass( renderPass );
        // saoPass = new THREE.SAOPass( scene, camera, false, true );
        // saoPass.renderToScreen = true;
        // saoPass.params.saoScale=1.7;
        // saoPass.params.saoBias=0;
        // saoPass.params.saoKernelRadius=100
        // saoPass.params.saoIntensity=0.002
        // // saoPass.params.saoBlurRadius=2
        // // saoPass.params.saoBlurDepthCutoff=0.008
        // composer.addPass( saoPass );



        //lighting
        sunLight=this.lighting_setup();
        window.addEventListener( 'resize', this.onWindowResize, false );

        //add grid
        var helper = new THREE.GridHelper( 160, 10 );
        this.scene.add(helper)

        this.renderer.render(this.scene,this.camera);
    }

    this.animate=function() {

        requestAnimationFrame( self.animate );

        self.render();

    }

    this.render=function() {

        self.renderer.render( self.scene, self.camera );
        self.hud.render(self.renderer)

    }


    this.lighting_setup=function(){
        // //sky
        // hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
        // hemiLight.color.setHSL( 0.6, 0.6, 1 );
        // hemiLight.groundColor.setHSL( 0.7, 0.7, 0.7 );
        // hemiLight.position.set( 0, 50, 0 );
        // //scene.add( hemiLight );

        //sun
        dirLight = new THREE.DirectionalLight( 0xffffff, 1 );
        dirLight.color.setHSL( 1, 1, 1 );
        dirLight.position.set( 1,2,0.5 );
        dirLight.position.multiplyScalar( 1 );
        this.scene.add( dirLight );
        this.scene.add(dirLight.target);

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 2048;
        dirLight.shadow.mapSize.height = 2048;

        this.scene.add( new THREE.AmbientLight( 0x404080 ) );

        return dirLight;
    };
    
    this.sky_ground_setup=function(){
        // GROUND

        var groundGeo = new THREE.PlaneBufferGeometry( 10000, 10000 );
        var groundMat = new THREE.MeshPhongMaterial( { color: 0xffffff, specular: 0x050505 } );
        groundMat.color.setHSL( 1, 1,1 );

        var ground = new THREE.Mesh( groundGeo, groundMat );
        ground.rotation.x = - Math.PI / 2;
        ground.position.y = - 33;
        scene.add( ground );

        ground.receiveShadow = true;
    };

    this.update_camera=function(pos,trg=[0,0,0],fov=35){
        pos[1]*=-1
        trg[1]*=-1
        self.camera.position.set(pos[0],pos[2],pos[1])
        self.camera.lookAt(new THREE.Vector3(trg[0],trg[2],trg[1]))
    };

    this.onWindowResize=function() {
        self.camera.aspect = window.innerWidth / window.innerHeight;
        self.camera.updateProjectionMatrix();
        self.renderer.setSize( window.innerWidth, window.innerHeight );
    };

    this.select_objects=function(selected_objects){
        if(selected_objects.length>0){
            self.manager.set_selected_objects(selected_objects)
            var sel = selected_objects[0].object
            var objid = self.manager.get_id_by_threejs_object(sel)
            self.inspect_object(objid)
        }
        else{
            self.datgui.set_inspector(null,null)
        }
    }

    this.inspect_object = function(objid){
        console.log('inspecting:'+objid)
        // url = 'http://localhost:5567/inspector?id='+objid 
        // console.log(url)
        // parent.frames[0].location=url
        msg = 'inspect_inplace("'+objid+'")' 
        console.log(msg)
        socket.send(msg)
    }

}



