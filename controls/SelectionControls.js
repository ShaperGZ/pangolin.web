SelectionControls = function(camera, dom, viewer){
    var _camera= camera;
    var _dom = dom;
    var _viewer = viewer;
    var _raycaster =  new THREE.Raycaster();
    var _mouse = new THREE.Vector2();
    var _select_root = true; // true:root false:all items

    const KEY_SELECTION_MODE = 73 // key:i

    var _leftButtonCallbacks=[]
    var _rightButtonCallbacks=[]

    this.addLeftButtonCallbacks = function(func){
        _leftButtonCallbacks.push(func);
    }
    this.addRightButtonCallbacks = function(func){
        _rightButtonCallbacks.push(func);
    }

    function activate(){
        _dom.addEventListener( 'mousedown', onDocumentMouseDown, false );
        window.addEventListener( 'keydown', onKeyDown, false );
        window.addEventListener( 'keyup', onKeyUp, false );
        _viewer.update_hud_states({'sr':_select_root})

    }

    function deactivate(){
        _dom.removeEventListener( 'mousedown', onDocumentMouseDown, false );
        window.removeEventListener( 'keydown', onKeyDown, false );
        window.removeEventListener( 'keyup', onKeyUp, false );
    }

    function onKeyDown(event){
        if(event.keyCode == KEY_SELECTION_MODE){
            _select_root = !_select_root
            _viewer.select_root = _select_root
            _viewer.update_hud_states({'sr':_select_root})
        }
    }
    function onKeyUp(event){
        // if(event.keyCode == KEY_SELECTION_MODE && _selection_mode==0){
        //     _selection_mode = 1
        //     _viewer.update_hud_states({'sr':_selection_mode})
        // }
    }

    function onDocumentMouseDown(event){
        if (event.button == THREE.MOUSE.LEFT){
            //local callbacks first
            for(var i in this.leftButtonCallbacks){
                _leftButtonCallbacks[i]()
            }

            var selectables = _viewer.manager.get_selectable_objects()
        
            var rect = _dom.getBoundingClientRect();
            _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
            _mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
            
    
                                                    
            _raycaster.setFromCamera( _mouse, _camera );
            var intersects = _raycaster.intersectObjects( selectables );

            if ( intersects.length > 0 && intersects[0]!=undefined) {
                if (_select_root){
                    parent = _viewer.manager.get_root_object(intersects[0].object)
                    _viewer.select_objects([parent])

                }
                else _viewer.select_objects([intersects[0].object])
            }
            else
            {
                _viewer.select_objects([])
            }
            
        }
        else if(event.button == THREE.MOUSE.RIGHT){
            for(var i in this.rightButtonCallbacks){
                _rightButtonCallbacks[i]()
            }
        }

       
    }

    activate()
}