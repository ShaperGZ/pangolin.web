SelectionControls = function(camera, dom, viewer){
    var _camera= camera;
    var _dom = dom;
    var _viewer = viewer;
    var _raycaster =  new THREE.Raycaster();
    var _mouse = new THREE.Vector2();
    

    function activate(){
        _dom.addEventListener( 'mousedown', onDocumentMouseDown, false );
    }

    function deactivate(){
        _dom.removeEventListener( 'mousedown', onDocumentMouseDown, false );
    }

    function onDocumentMouseDown(event){
        var selectables = _viewer.manager.get_selectable_objects()
        
        var rect = _dom.getBoundingClientRect();
        _mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
        

                                                
        _raycaster.setFromCamera( _mouse, _camera );
        var intersects = _raycaster.intersectObjects( selectables );
        console.log(intersects)

        if ( intersects.length > 0 ) {
            _viewer.select_objects([intersects[0]])
        }
        else
        {
            _viewer.select_objects([])
        }
    }

    activate()
}