/*
 * @author zz85 / https://github.com/zz85
 * @author mrdoob / http://mrdoob.com
 * Running this will allow you to drag three.js objects around the screen.
 */

THREE.DragControls = function ( _camera, _domElement, _viewer ) {

	var _plane = new THREE.Plane();
	var _raycaster = new THREE.Raycaster();
    var _activated = false
	var _mouse = new THREE.Vector2();
	var _offset = new THREE.Vector3();
	var _intersection = new THREE.Vector3();
	var _start_pos = new THREE.Vector3();
	var _start_obj_pos = new THREE.Vector3();
	var _obj_mouse_offset = new THREE.Vector3();

	var _intersected = null, _hovered = null;

	//

	var scope = this;

	function activate() {
        _activated = true
		_domElement.addEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.addEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.addEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.addEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.addEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.addEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function deactivate() {
        _activated = false
		_domElement.removeEventListener( 'mousemove', onDocumentMouseMove, false );
		_domElement.removeEventListener( 'mousedown', onDocumentMouseDown, false );
		_domElement.removeEventListener( 'mouseup', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'mouseleave', onDocumentMouseCancel, false );
		_domElement.removeEventListener( 'touchmove', onDocumentTouchMove, false );
		_domElement.removeEventListener( 'touchstart', onDocumentTouchStart, false );
		_domElement.removeEventListener( 'touchend', onDocumentTouchEnd, false );

	}

	function dispose() {

		deactivate();

	}

    function toggle(){
        if(_activated) deactivate();
        else activate();
    }

	function onDocumentMouseMove( event ) {

		event.preventDefault();
        // 1 獲取用來碰撞的物體，（這裏只是爲了改變cursor才有用 ）
		if(_viewer.selected_objects.length==0) return
		selection = _viewer.selected_objects[0]
		if (_viewer.select_root){
            intersect_objects = _viewer.manager.get_all_descending_children(selection)
            intersect_objects.push(selection)
		}
		else intersect_objects = [selection]

		// 2 做個鼠標的射綫
		var rect = _domElement.getBoundingClientRect();
		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;
		_raycaster.setFromCamera( _mouse, _camera );

		// 3 得出鼠標射綫與移動平面的交點, 並獲取與鼠標按下時的偏移量
		if ( _intersected && scope.enabled ) {
			// console.log('plane=',_plane)
			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				var pos = _intersection.clone()
                // console.log('> pos=',pos)
                // console.log('  _obj_mouse_offset=',_obj_mouse_offset)
				pos.sub(_obj_mouse_offset)

				// 5 把新坐標變回物體本地坐標
				// pos = selection.worldToLocal(pos)
				var new_pos = [pos.x,-pos.z,pos.y,]
				// console.log('new_pos=',new_pos)
				_viewer.set_selected_transform('translation',new_pos)
			}

			scope.dispatchEvent( { type: 'drag', object: _intersected } );

			return;

		}

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( intersect_objects );

		if ( intersects.length > 0 ) {

			var object = intersects[ 0 ].object;
			// console.log('intersected object =',object)
			// if (scope.viewer.select_root){
			// 	object = scope.viewer.manager.get_root_object(object)
			// }

			// following lines defines the plane which used to intersect with mouse ray
			// _plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), object.position);
			// // _plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), object.position );
			// console.log('new position:', object.position);
			if ( _hovered !== object ) {

				scope.dispatchEvent( { type: 'hoveron', object: object } );

				_domElement.style.cursor = 'pointer';
				_hovered = object;

			}

		} else {

			if ( _hovered !== null ) {

				scope.dispatchEvent( { type: 'hoveroff', object: _hovered } );

				_domElement.style.cursor = 'auto';
				_hovered = null;

			}

		}

	}

	function onDocumentMouseDown( event ) {
		// mouseDown 不負責選擇，他只是在有選擇物體后移動他

		if (event.button == 0){

			// 1 獲取用來碰撞的物體
            if(_viewer.selected_objects.length==0) return
            selection = _viewer.selected_objects[0]
            if (_viewer.select_root){
                intersect_objects = _viewer.manager.get_all_descending_children(selection)
                intersect_objects.push(selection)
            }
            else intersect_objects = [selection]

			// 2 碰撞
            _raycaster.setFromCamera( _mouse, _camera );
            var intersects = _raycaster.intersectObjects( intersect_objects );


            if ( intersects.length > 0 ) {
				// 3 獲得第一個碰到的物體
                _intersected = intersects[ 0 ].object;
				_intersected_obj_pos = _intersected.localToWorld(_intersected.position.clone())

				// 4 以第一個碰到的物體的坐標做個面，叫移動平面
                _plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), _intersected_obj_pos);

				// 5 碰撞移動平面 得出鼠標按下時的位置作爲原點
                if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {
                	_start_pos.copy(_intersection)
                    // _start_pos.z *=-1

					// 6 獲得要移動的物體的初始位置
					_start_obj_pos = selection.position.clone()
                    // _start_obj_pos = selection.localToWorld(selection.position.clone())
					_start_obj_pos.z *= -1
					_obj_mouse_offset = _intersection.clone().sub(_start_obj_pos)


					// _start_obj_pos = selection.localToWorld(selection.position.clone())
					console.log('onDown, start_obj_pos=',_start_obj_pos)
                }


                _domElement.style.cursor = 'move';
                // _plane.setFromNormalAndCoplanarPoint(new THREE.Vector3(0,1,0), _intersected.position);

                scope.dispatchEvent( { type: 'dragstart', object: _intersected } );
			}

		}
	}

	function onDocumentMouseCancel( event ) {

		event.preventDefault();

		if ( _intersected ) {

			scope.dispatchEvent( { type: 'dragend', object: _intersected } );

			_intersected = null;

		}

		_domElement.style.cursor = _hovered ? 'pointer' : 'auto';

	}

	function onDocumentTouchMove( event ) {

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		if ( _intersected && scope.enabled ) {

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_intersected.position.copy( _intersection.sub( _offset ) );

			}

			scope.dispatchEvent( { type: 'drag', object: _intersected } );

			return;

		}

	}

	function onDocumentTouchStart( event ) {
        var objects = [_viewer.get_transform_widget()];
        if (objects[0] == null) return ;

		event.preventDefault();
		event = event.changedTouches[ 0 ];

		var rect = _domElement.getBoundingClientRect();

		_mouse.x = ( ( event.clientX - rect.left ) / rect.width ) * 2 - 1;
		_mouse.y = - ( ( event.clientY - rect.top ) / rect.height ) * 2 + 1;

		_raycaster.setFromCamera( _mouse, _camera );

		var intersects = _raycaster.intersectObjects( objects );

		if ( intersects.length > 0 ) {

			_intersected = intersects[ 0 ].object;

			_plane.setFromNormalAndCoplanarPoint( _camera.getWorldDirection( _plane.normal ), _intersected.position );

			if ( _raycaster.ray.intersectPlane( _plane, _intersection ) ) {

				_offset.copy( _intersection ).sub( _intersected.position );

			}

			_domElement.style.cursor = 'move';

			scope.dispatchEvent( { type: 'dragstart', object: _intersected } );

		}


	}

	function onDocumentTouchEnd( event ) {

		event.preventDefault();

		if ( _intersected ) {

			scope.dispatchEvent( { type: 'dragend', object: _intersected } );

			_intersected = null;

		}

		_domElement.style.cursor = 'auto';

	}

	activate();

	// API

	this.enabled = true;

	this.activate = activate;
	this.deactivate = deactivate;
	this.dispose = dispose;

	// Backward compatibility

	this.setObjects = function () {

		console.error( 'THREE.DragControls: setObjects() has been removed.' );

	};

	this.on = function ( type, listener ) {

		console.warn( 'THREE.DragControls: on() has been deprecated. Use addEventListener() instead.' );
		scope.addEventListener( type, listener );

	};

	this.off = function ( type, listener ) {

		console.warn( 'THREE.DragControls: off() has been deprecated. Use removeEventListener() instead.' );
		scope.removeEventListener( type, listener );

	};

	this.notify = function ( type ) {

		console.error( 'THREE.DragControls: notify() has been deprecated. Use dispatchEvent() instead.' );
		scope.dispatchEvent( { type: type } );

	};

};

THREE.DragControls.prototype = Object.create( THREE.EventDispatcher.prototype );
THREE.DragControls.prototype.constructor = THREE.DragControls;
