

Viewer = function () {
    this.container = document.getElementById("threejs_container")
    //var size = this.get_container_size()
    var canvasW = 400
    var canvasH = 400
    console.log('container', this.container, 'w', this.canvasW)

    this.scene = new THREE.Scene();
    this.camera = new THREE.PerspectiveCamera(75, canvasW / canvasH, 0.1, 1000);
    this.renderer = new THREE.WebGLRenderer({ antialias: true });
    this.manager = new ObjectManager(this.scene)
    this.selected_objects = []
    this.hud_states = {'sr':0, 'mv':0, 'sc':0, 'rt':0} //'sr□ ts□ sc□ rt□'
    this.select_root = true; // 1:select root, 0:select item

    var self = this;

    this.init = function () {
        console.log("initializing")




        //create HUD
        this.hud = new HUD(self)
        this.hud.enable = false

        //dat.gui
        this.datgui = new DATGUIS(self)


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


        this.transformWidget = new TransformWidget(this.manager, this.camera, this.domElement)
        this.bboxWidget = new BBoxWidget(this)

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
        // this.renderer.setSize(this.canvasW, this.canvasH);


        this.renderer.setClearColor( 0x000000 );
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
        this.scene_background_color = new THREE.Color(0xaaaaaa);
        this.scene.background = this.scene_background_color


        //lighting
        this.lighting_setup();
        // this.sao_setup()


        window.addEventListener('resize', this.onWindowResize, false);

        //add grid
        var helper = new THREE.GridHelper(160, 10);
        this.scene.add(helper)

        // this.renderer.render(this.scene, this.camera);

        //libraries
        this.texture_lib = new TextureLibrary(this)
        this.geometry_lib = new GeometryLibrary(this)
        this.component_lib = new ComponentLibrary(this)

        this.onWindowResize()
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

    this.set_scene_background = function(cube_map_name){
//        console.log('cube_map_name=',cube_map_name)
        if(cube_map_name == null){
            this.scene.background = this.scene_background_color;
            return;
        }
        var background = this.scene.background;
        var texture_lib = this.texture_lib;
        var scene= this.scene
        this.texture_lib.assign(cube_map_name, function(){
            scene.background = texture_lib.data[cube_map_name];
        });
        
    }
    
    this.animate = function (time) {

        requestAnimationFrame(self.animate);
        TWEEN.update(time);
        self.render(time);

    }

    this.update_hud_states = function(data){
        for(key in self.hud_states){
            if(key in data){
                self.hud_states[key] = data[key]
            }
            state = self.hud_states[key]
            if(state) color='orange'  // blue:'#2196F3'
            else color = 'grey'

            var id = 'js_hud_states_'+key
            var dom = document.getElementById(id)
            if(dom!=undefined && dom!=null)
                dom.style.backgroundColor = color
            // if(state)
            //     document.getElementById(id).style.color = 'steelblue'
        }


    }

    this.render = function () {
        // this.composer.render()
        self.renderer.render(self.scene, self.camera);
        // self.hud.render(self.renderer)

    }

    this.sao_setup = function(){
        //SAO:

        this.composer = new THREE.EffectComposer( this.renderer );
        var renderPass = new THREE.RenderPass( this.scene, this.camera );
        this.composer.addPass( renderPass );
        var saoPass = new THREE.SAOPass( this.scene, this.camera, false, true );
        saoPass.renderToScreen = true;
        this.composer.addPass( saoPass );

        saoPass.params.output = THREE.SAOPass.OUTPUT.Default;
        saoPass.params.saoScale=3;
        saoPass.params.saoBlur = false;
        saoPass.params.saoBias=1;
        saoPass.params.saoKernelRadius=3
        saoPass.params.saoIntensity=0.2
        saoPass.params.saoBlurRadius=0
        saoPass.params.saoBlurDepthCutoff=0


        var gui = new dat.GUI();
        gui.add( saoPass.params, 'output', {
            'Beauty': THREE.SAOPass.OUTPUT.Beauty,
            'Beauty+SAO': THREE.SAOPass.OUTPUT.Default,
            'SAO': THREE.SAOPass.OUTPUT.SAO,
            'Depth': THREE.SAOPass.OUTPUT.Depth,
            'Normal': THREE.SAOPass.OUTPUT.Normal
        } ).onChange( function ( value ) {

            saoPass.params.output = parseInt( value );

        } );
        gui.add( saoPass.params, 'saoBias', - 1, 1 );
        gui.add({'toggle render to screen':function(){
                console.log('toggle button pressed');
                saoPass.renderToScreen = !saoPass.renderToScreen;
            }},'toggle render to screen')
        gui.add( saoPass.params, 'saoIntensity', 0, 1 );
        gui.add( saoPass.params, 'saoScale', 0, 10 );
        gui.add( saoPass.params, 'saoKernelRadius', 1, 100 );
        gui.add( saoPass.params, 'saoMinResolution', 0, 1 );
        gui.add( saoPass.params, 'saoBlur' );
        gui.add( saoPass.params, 'saoBlurRadius', 0, 200 );
        gui.add( saoPass.params, 'saoBlurStdDev', 0.5, 150 );
        gui.add( saoPass.params, 'saoBlurDepthCutoff', 0.0, 0.1 );
    }

    this.lighting_setup = function () {

        this.ambient = new THREE.AmbientLight(0x606090)
        this.scene.add(this.ambient)

        //sun
        var intensty = 0.8
        this.sun = new THREE.DirectionalLight(0xffffff, 1);
        this.sun.color.setRGB(intensty, intensty, intensty*0.8)
        //self.sun.color.setHSL(intensty, intensty, intensty);
        this.sun.position.set(1, 2, 0.3);
        this.sun.position.multiplyScalar(10000);
        this.scene.add(this.sun);
        this.scene.add(this.sun.target);
        this.last_camera_length=null;

        this.sun.castShadow = true;
        var d = 1000
        // var mapSize = 1024
        var mapSize = 2048
        // var mapSize = 4096
        this.sun.shadow.camera.top = d;
        this.sun.shadow.camera.bottom =-d;
        this.sun.shadow.camera.left = -d;
        this.sun.shadow.camera.right =d;
        this.sun.shadow.camera.far = 35000;
        // this.sun.shadow.bias = - 0.0001;
        this.sun.shadow.camera.near = 0;
        this.sun.shadow.mapSize.width = mapSize;
        this.sun.shadow.mapSize.height = mapSize;

        var camHelper = new THREE.CameraHelper(this.sun.shadow.camera)
        var dirLightHelper = new THREE.DirectionalLightHelper( this.sun, 10 );
        this.scene.add( dirLightHelper );
        this.scene.add( camHelper );

        // this.scene.add(new THREE.AmbientLight(0x404080));

        return self.sun;
    };

    this.onMouseMoveCallback = function(){

        msg1 = 'scene.cameras["main"].transform.set("translation",('+ self.controls.object.position.toArray() + '),False)'
        msg2 = 'scene.cameras["main"].target_position.set(('+ self.controls.target.toArray() + '),False)'
        socket.send(msg1)
        socket.send(msg2)
    }
    this.onMouseZoomCallback = function(){
        var cam_length = self.controls.object.position.distanceTo(self.controls.target)
        if(self.last_camera_length == null || Math.abs((cam_length-self.last_camera_length)/self.last_camera_length)>0.1){
            self.last_camera_length = cam_length
            // console.log(cam_length)
            var d = cam_length*0.6
            self.sun.shadow.camera.top = d;
            self.sun.shadow.camera.bottom =-d;
            self.sun.shadow.camera.left = -d;
            self.sun.shadow.camera.right =d;
            self.sun.shadow.camera.needsUpdate = true;
            self.sun.shadow.map=null;
        }


        msg1 = 'scene.cameras["main"].transform.set("translation",('+ self.controls.object.position.toArray() + '),False)'
        msg2 = 'scene.cameras["main"].target_position.set(('+ self.controls.target.toArray() + '),False)'
        socket.send(msg1)
        socket.send(msg2)
    }

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

    this.tween_camera = function(campos=null, trgpos=null){
        var control = self.controls;
        
        if(campos !=null){
            campos={x:campos[0],y:campos[2],z:campos[1] };
            var org_campos = control.object.position.clone()
            var tween = new TWEEN.Tween(org_campos).to(campos,1000)
            tween.onUpdate(function(){
                control.object.position.set(this.x,this.y,this.z);
            })
            tween.start();
        }

        if(trgpos !=null){
            trgpos={x:trgpos[0],y:trgpos[2],z:trgpos[1] };
            var org_trgpos = control.target;
            var tween = new TWEEN.Tween(org_trgpos).to(trgpos,1000)
            tween.onUpdate(function(){
                control.update();
            })
            tween.start();
        }
    };

    this.update_camera = function (pos, trg = [0, 0, 0], fov = null, cull=null, near=null, far=null) {
        pos[1] *= -1;
        trg[1] *= -1;
        self.camera.position.set(pos[0], pos[2], pos[1])
        self.camera.lookAt(new THREE.Vector3(trg[0], trg[2], trg[1]))
        if(fov != null)self.camera.fov = fov
        if(cull != null) self.camera.frustumCulled = cull
        if(near != null) self.camera.near = near
        if(far != null) self.camera.far = far

        if (fov != null || cull != null || near != null || far != null) self.camera.updateProjectionMatrix()
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
        // self.composer.setSize(canvasW, canvasH);
    };

    this.clear_scene = function () {
        this.manager.clear()
        self.select_objects([])
        self.component_lib.objects = {}
        self.texture_lib.data = {}
    }

    this.select_objects = function (selected_objects) {
        if (selected_objects.length > 0) {
            self.manager.set_selected_objects(selected_objects);
            // var sel = selected_objects[0].object;
            var sel = selected_objects[0];
            self.bboxWidget.set(sel)
            var objid = self.manager.get_id_by_threejs_object(sel);
            self.inspect_object(objid);
            socket.send('scene.select_id("' + objid + '")')

            // self.transformControl.attach(selected_objects[0])
            // self.scene.add(self.transformControl)
        } else {
            self.datgui.clear_inspector()
            self.bboxWidget.set(null)
            // self.transformControl.dettach(this.selected_objects[0])
            // self.scene.remove(self.transformControl)
        }
        this.selected_objects = selected_objects
    }


    this.inspect_object = function (objid) {
        // console.log('inspecting:' + objid);
        // url = 'http://localhost:5567/inspector?id='+objid
        // console.log(url)
        // parent.frames[0].location=url
        msg = 'scene.inspect_id("' + objid + '")'
        // console.log(msg)
        socket.send(msg)
    }

    this.get_transform_widget = function () {
        if (this.selected_objects.length < 1) return null;
        //console.log('selected', this.selected_objects[0]);
        return this.selected_objects[0];
        //return this.transformWidget.widget;
    }

    this.set_selected_transform = function(transform_type,value){
        var msg = 'scene.set_selected_transform("'+transform_type+'",['+value+'])';
        socket.send(msg);
    }


}



