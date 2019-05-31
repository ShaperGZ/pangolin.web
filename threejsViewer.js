Viewer = function () {
    this.container = document.getElementById("threejs_container")
    //var size = this.get_container_size()
    var canvasW = 400
    var canvasH = 400
    console.log('container', this.container, 'w', this.canvasW)

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer();
    this.manager = new ObjectManager(this.scene)
    this.selected_objects = []


    var self = this;

    this.init = function () {
        console.log("initializing")
        var geometries = []
        var object3ds = []


        //create HUD
        this.hud = new HUD(self)
        this.hud.enable = false

        //dat.gui
        this.datgui = new DATGUIS(self)

        console.log('HUD is not working, it is added to Viewer, remember to fix later')


        // this.controls = new THREE.TrackballControls( this.camera );
        this.controls = new THREE.OrbitControls(this.camera, this.renderer.domElement);
        this.controls.enableDamping = true; // an animation loop is required when either damping or auto-rotation are enabled
        this.controls.dampingFactor = 1;
        this.controls.screenSpacePanning = false;
        this.controls.minDistance = 10
        this.controls.maxDistance = 500;
        this.controls.maxPolarAngle = Math.PI / 2;


        this.drag_control =  new THREE.DragControls(this.camera, this.renderer.domElement,self)
        this.drag_control.activate()
//        var _drag_control = this.drag_control
//        var self = this

        //Transform controls
        //transformControl = new THREE.TransformControls(this.camera, this.renderer.domElement)
        // this.transformControl=transformControl
        // this.transformControl.addEventListener( 'change', this.render );
        // this.transformControl.addEventListener( 'dragging-changed', function ( event ) {
        //     transformControl.enabled = ! event.value;
        //         } );
//         window.addEventListener( 'keydown', function ( event ) {
//             switch ( event.keyCode ) {
//                 case 87: // W
////                    control.setMode( "translate" );
//                    break;
        //         case 69: // E
        //             control.setMode( "rotate" );
        //             break;
        //         case 82: // R
        //             control.setMode( "scale" );
        //             break;
//             }
//         });



        this.transformWidget = new TransformWidget(this.manager, this.camera, this.domElement)


        //selector to select object
        var selector = new SelectionControls(this.camera, this.renderer.domElement, this)
        this.selectionControl = selector
        selector.addRightButtonCallbacks(function () {
            console.log('right button down')
        })

        //camera
        this.camera.position.set(-20, 28, 43)
        this.camera.lookAt(new THREE.Vector3(0, 0, 0))
        this.camera.far = 10000
        this.camera.setFocalLength(35)
        this.renderer.setSize(this.canvasW, this.canvasH);
        this.onWindowResize()


        this.renderer.shadowMap.enabled = true;
        this.renderer.shadowMap.type = THREE.PCFShadowMap;


        this.container.appendChild(this.renderer.domElement);

        this.canvas = this.renderer.domElement

        //---------------------------------------------
        var points = [];

        var point = new THREE.Vector3();
        var direction = new THREE.Vector3();

        for (var i = 0; i < 50; i++) {

            direction.x += Math.random() - 0.5;
            direction.y += Math.random() - 0.5;
            direction.z += Math.random() - 0.5;
            direction.normalize().multiplyScalar(10);

            point.add(direction);
            points.push(point.x, point.y, point.z);

        }

        this.scene.background = new THREE.Color(0xaaaaaa);

        SAO:

            // composer = new THREE.EffectComposer( this.renderer );
            // renderPass = new THREE.RenderPass( this.scene, this.camera );
            // composer.addPass( renderPass );
            // saoPass = new THREE.SAOPass( this.scene, this.camera, false, true );
            // saoPass.renderToScreen = true;
            // saoPass.params.saoScale=1.7;
            // saoPass.params.saoBias=0;
            // saoPass.params.saoKernelRadius=100
            // saoPass.params.saoIntensity=0.002
            // saoPass.params.saoBlurRadius=2
            // saoPass.params.saoBlurDepthCutoff=0.008
            // composer.addPass( saoPass );
            // this.composer = composer


            //lighting
            sunLight = this.lighting_setup();
        window.addEventListener('resize', this.onWindowResize, false);

        //add grid
        var helper = new THREE.GridHelper(160, 10);
        this.scene.add(helper)

        this.renderer.render(this.scene, this.camera);
        this.texture_lib = new TextureLibrary(this)
    }

    // this.create_label=function(){
    //     console.log('create label')
    //     var dom = document.createElement( 'div' );
    //     dom.className = 'label';
    //     dom.textContent = ' Test Dom Text';
    //     dom.style.marginTop = '-1em';
    //     var label = new THREE.CSS2DObject( dom );
    //     label.position.set(-50,10,0)
    //     return label
    // }

    this.animate = function () {

        requestAnimationFrame(self.animate);

        self.render();

    }

    this.render = function () {

        //self.composer.render()
        self.renderer.render(self.scene, self.camera);
        self.hud.render(self.renderer)

    }


    this.lighting_setup = function () {
        //sky
        // hemiLight = new THREE.HemisphereLight( 0xffffff, 0xffffff, 0.3 );
        // hemiLight.color.setHSL( 0.6, 0.6, 1 );
        // hemiLight.groundColor.setHSL( 0.7, 0.7, 0.7 );
        // hemiLight.position.set( 0, 50, 0 );
        // //scene.add( hemiLight );
        var ambient = new THREE.AmbientLight(0x8800aa)
        this.scene.add(ambient)

        //sun
        dirLight = new THREE.DirectionalLight(0xffffff, 1);
        dirLight.color.setHSL(1, 1, 1);
        dirLight.position.set(1, 2, 0.5);
        dirLight.position.multiplyScalar(1);
        this.scene.add(dirLight);
        this.scene.add(dirLight.target);

        dirLight.castShadow = true;
        dirLight.shadow.mapSize.width = 750;
        dirLight.shadow.mapSize.height = 750;

        this.scene.add(new THREE.AmbientLight(0x404080));

        return dirLight;
    };

    this.sky_ground_setup = function () {
        // GROUND

        var groundGeo = new THREE.PlaneBufferGeometry(10000, 10000);
        var groundMat = new THREE.MeshPhongMaterial({color: 0xffffff, specular: 0x050505});
        groundMat.color.setHSL(1, 1, 1);

        var ground = new THREE.Mesh(groundGeo, groundMat);
        ground.rotation.x = -Math.PI / 2;
        ground.position.y = -33;
        scene.add(ground);

        ground.receiveShadow = true;
    };

    this.update_camera = function (pos, trg = [0, 0, 0], fov = 35) {
        pos[1] *= -1;
        trg[1] *= -1;
        self.camera.position.set(pos[0], pos[2], pos[1])
        self.camera.lookAt(new THREE.Vector3(trg[0], trg[2], trg[1]))
    };

    this.get_container_size = function () {
        var size = [0, 0];
        // size[0]=window.innerWidth
        // size[1]=window.innerHeight
        size[0] = self.container.clientWidth
        size[1] = window.innerHeight
        // console.log('container width=',self.container.clientWidth, '   win width=',size[0])
        // console.log('container height=',self.container.clientHeight, '   win height=',size[1])
        return size
    };

    this.onWindowResize = function () {
//        console.log('on window resize');
        var size = self.get_container_size();
        var canvasW = size[0]
        var canvasH = size[1]
        self.camera.aspect = canvasW / canvasH;
        self.camera.updateProjectionMatrix();

        self.renderer.setSize(canvasW, canvasH);
    };

    this.clear_scene = function () {
        this.manager.clear()
        // while(self.scene.children.length > 0){ 
        //     self.scene.remove(self.scene.children[0]); 
        // }
    }

    this.select_objects = function (selected_objects) {
        if (selected_objects.length > 0) {
            self.manager.set_selected_objects(selected_objects);
            var sel = selected_objects[0].object;

            var objid = self.manager.get_id_by_threejs_object(sel);
            self.inspect_object(objid);
            socket.send('scene.select_id("' + objid + '")')
            // self.transformControl.attach(selected_objects[0])
            // self.scene.add(self.transformControl)
        } else {
            self.datgui.clear_inspector()
            // self.transformControl.dettach(this.selected_objects[0])
            // self.scene.remove(self.transformControl)
        }
        this.selected_objects = selected_objects
    }


    this.inspect_object = function (objid) {
        console.log('inspecting:' + objid);
        // url = 'http://localhost:5567/inspector?id='+objid 
        // console.log(url)
        // parent.frames[0].location=url
        msg = 'scene.inspect_id("' + objid + '")'
        console.log(msg)
        socket.send(msg)
    }

    this.get_transform_widget = function () {
        if (this.selected_objects.length < 1) return null;
//        console.log('selected', this.selected_objects[0]);
        return this.selected_objects[0].object;
        //return this.transformWidget.widget;
    }

    this.set_selected_transform = function(transform_type,value){
        let msg = 'scene.set_selected_transform("'+transform_type+'",['+value+'])';
        console.log('translation msg =',msg)
        socket.send(msg)

    }


}



