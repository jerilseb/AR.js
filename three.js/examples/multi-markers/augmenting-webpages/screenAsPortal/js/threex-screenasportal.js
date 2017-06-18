var THREEx = THREEx || {}

THREEx.ScreenAsPortal = function(multiMarkerFile, screenDepth){
	var _this = this
	this.object3d = new THREE.Group

	// init render loop
	this._onRenderFcts = []
	this.update = function(){
		_this._onRenderFcts.forEach(function(onRenderFct){
			onRenderFct()
		})
	}
	
	// compute screenSize
	var markerSize = 1
	var whiteMargin = 0.125*2
	var boundingBox = THREEx.ArMultiMarkerControls.computeBoundingBox(multiMarkerFile)
	boundingBox.min.x -= markerSize/2 + whiteMargin
	boundingBox.min.z -= markerSize/2 + whiteMargin
	boundingBox.max.x += markerSize/2 + whiteMargin
	boundingBox.max.z += markerSize/2 + whiteMargin
	var screenSize = boundingBox.getSize()
	

	initCube()
	addTargets()
	addBorders()
	return
	
	function initCube(){
		// add outter cube - invisibility cloak
		var geometry = new THREE.BoxGeometry(screenSize.x, screenDepth, screenSize.z)
		geometry.faces.splice(4, 2); // make hole by removing top two triangles (is this assumption stable?)
		var material = new THREE.MeshBasicMaterial({
			colorWrite: false // only write to z-buf
		})
		var outterCubeMesh = new THREE.Mesh( geometry, material);
		outterCubeMesh.scale.set(1.04, 1, 1.04)
		outterCubeMesh.position.y = -geometry.parameters.height/2
		_this.object3d.add(outterCubeMesh)

		// add the inner box
		var textureBox = new THREE.TextureLoader().load('images/box.png')
		textureBox.wrapS = THREE.RepeatWrapping;
		textureBox.wrapT = THREE.RepeatWrapping;
		textureBox.repeat.set(15, 20);
		// textureBox.anisotropy = renderer.getMaxAnisotropy();
		textureBox.anisotropy = 16;
		var geometry	= new THREE.BoxGeometry(screenSize.x, screenDepth, screenSize.z);
		var material	= new THREE.MeshBasicMaterial({
			side: THREE.BackSide,
			map: textureBox,
			color: 'cyan',
		}); 
		var innerBoxMesh	= new THREE.Mesh( geometry, material );
		innerBoxMesh.position.y = -geometry.parameters.height/2
		_this.object3d.add( innerBoxMesh );		
	}

	function addTargets(){
		// add the inner box
		var geometry	= new THREE.PlaneGeometry(0.8,0.8).rotateX(-Math.PI/2);
		var material	= new THREE.MeshBasicMaterial({
			side: THREE.DoubleSide,
			map: new THREE.TextureLoader().load('images/target.png'),
			alphaTest: 0.9,
		}); 
		var targetModel	= new THREE.Mesh( geometry, material );

		// create a blue LineBasicMaterial
		var lineMaterial = new THREE.LineBasicMaterial({
			color: 0x0000ff
		});

		var nTargets = 8;
		for(var i = 0; i < nTargets; i++){
			var positionX = (Math.random()-0.5)*(screenSize.x - targetModel.geometry.parameters.width )
			var positionZ = (Math.random()-0.5)*(screenSize.z - targetModel.geometry.parameters.height)
			var height = screenDepth*0.25 + Math.random() * (screenDepth * 1.5)
			addTarget( positionX, positionZ, height)
		}
		
		
		return
		function addTarget(positionX, positionZ, height){
			var geometry = new THREE.Geometry();
			geometry.vertices.push(new THREE.Vector3(0, 0, 0));
			geometry.vertices.push(new THREE.Vector3(0, height-0.1, 0));
			var line = new THREE.Line(geometry, lineMaterial);
			line.position.x = positionX
			line.position.y = -screenDepth
			line.position.z = positionZ
			_this.object3d.add(line)
			
			var target = targetModel.clone()
			target.position.copy(line.position)
			target.position.y += height
			_this.object3d.add(target)

		}
	}
	//////////////////////////////////////////////////////////////////////////////
	//		addBorders
	//////////////////////////////////////////////////////////////////////////////
	function addBorders(){
		var thickNess = 0.1
		
		var material = new THREE.MeshNormalMaterial()
		var material = new THREE.MeshBasicMaterial({
			color: 'black'
		})
		// top border
		var geometry = new THREE.BoxGeometry(screenSize.x, thickNess, thickNess).rotateX(Math.PI/4);
		var mesh = new THREE.Mesh(geometry, material)
		mesh.position.y = +thickNess/2
		mesh.position.z = -screenSize.z/2
		_this.object3d.add(mesh)		

		// bottom border
		var mesh = new THREE.Mesh(geometry, material)
		mesh.position.y = +thickNess/2
		mesh.position.z = +screenSize.z/2
		_this.object3d.add(mesh)		

		// left border
		var geometry = new THREE.BoxGeometry(thickNess, thickNess, screenSize.z).rotateZ(Math.PI/4);
		var mesh = new THREE.Mesh(geometry, material)
		mesh.position.y = +thickNess/2
		mesh.position.x = -screenSize.x/2
		_this.object3d.add(mesh)		

		// right border
		var mesh = new THREE.Mesh(geometry, material)
		mesh.position.y = +thickNess/2
		mesh.position.x = +screenSize.x/2
		_this.object3d.add(mesh)		
	}
}
