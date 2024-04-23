let scene, camera, renderer, controls, model, hemiLight, spotLight;
let mixer = null;

let grid, characterControls, hitBox;
let container = document.getElementById('container');
var mouse = new THREE.Vector2(),
    INTERSECTED;

    
function init() {
    scene = new THREE.Scene();

   // add la scene dans le container
    renderer = new THREE.WebGLRenderer({ alpha: true });
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 6, 15);

    //set up controls
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;
    //set up lights : hemispherical light

    hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    //set up lights : spot lights

    spotLight = new THREE.SpotLight(0xffa95c, 18);
    //spotLight.castShadow = true;
    spotLight.position.set(-10, -10, -10);
    scene.add(spotLight);

    //tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;

    //model upload
    renderer.shadowMap.enabled = true;


    // On ajoute un sol cadrillé
    grid= new THREE.GridHelper(100, 100, 0x888888, 0x444444);
    scene.add(grid);

    new THREE.GLTFLoader().load(`model/gir/scene.gltf`, result => {
        model = result.scene.children[0];
        model.position.set(0, 0, 0);
        model.scale.set(0.3, 0.3, 0.3);

        // On créé un cube pour la hitbox qui prend toute la hauteur du modèle
        var geometry = new THREE.BoxGeometry(model.scale.x * 3, model.scale.y *8, model.scale.z *3);
        // color in transparent for the cube
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        hitBox = new THREE.Mesh(geometry, material);
        hitBox.position.set(0, model.scale.y *3, 0);
        hitBox.name = "hitBox";

        scene.add(hitBox);
        scene.add(model);


        
        // On se positionne sur le modèle
        camera.lookAt(model.position);
    
        // Si il a une animation, on la joue
        if (result.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
            mixer.clipAction(result.animations[0]).play();
        } else {
            alert("No animation found");
        }
    
        characterControls = new CharacterControls(model, mixer, camera);
    
        animate();
    });

    document.addEventListener('mouseup', onDocumentMouseClick, false);
    
    
}

function animate() {
    renderer.render(scene, camera);
    spotLight.position.set(
        camera.position.x + 10,
        camera.position.y + 10,
        camera.position.z + 10,
    );

    if (mixer) {
        mixer.update(0.01);
    }
    hitBox.position.set(model.position.x, model.position.y + model.scale.y * 3, model.position.z);
    characterControls.update(0.01);

    requestAnimationFrame(animate);
}
init();



function onDocumentMouseClick(event) {
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    // Si on a cliqué sur le modele on alerte
    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            // if (INTERSECTED) INTERSECTED.material.emissive.setHex(INTERSECTED.currentHex);
            INTERSECTED = intersects[0].object;
            // INTERSECTED.currentHex = INTERSECTED.material.emissive.getHex();
            // INTERSECTED.material.emissive.setHex(0xff0000);
            // Si l'objet cliqué est le modèle, on alerte
            if (INTERSECTED && INTERSECTED.name == "Object_125") {
                console.log("Model clicked");
            } else if (INTERSECTED == grid) {
                console.log("Grid clicked");
            } else if (INTERSECTED != null) {
                console.log(INTERSECTED);
            }
        }
        INTERSECTED = null;
    } else {
        console.log("Nothing clicked");

        INTERSECTED = null;
    }
}

function addTextToScene (textAEcrire, position)  {
    const loader = new THREE.FontLoader();
    loader.load( 'https://threejs.org/examples/fonts/helvetiker_regular.typeface.json', function ( font )
    {
        const geometry = new THREE.TextGeometry(textAEcrire, {
            font: font,
            size: 0.5,
            height: 0.2,
            bevelEnabled: false,
        } );
        const material = new THREE.MeshBasicMaterial( { color: 0xffffff } );
        const text = new THREE.Mesh( geometry, material );
        text.position.set(position.x, position.y, position.z);
        scene.add( text );
    });
}