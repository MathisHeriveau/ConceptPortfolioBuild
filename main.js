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
    renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(0, 5, 15);

    //set up controls
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;

    //set up lights : hemispherical light
    hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    //set up lights : spot lights

    spotLight = new THREE.SpotLight(0xffa95c, 18);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.radius = 3;

    spotLight.position.set(-10, -10, -10);
    // On crée un helper pour voir la direction de la lumière
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    scene.add(spotLight);

    //tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;



    // On ajoute un sol cadrillé

    /// On créé une vrai grille qui va nous servir de sol pour l'ombre
    var planeGeometry = new THREE.PlaneGeometry(100, 100, 100, 100);
    var planeMaterial = new THREE.ShadowMaterial();
    planeMaterial.opacity = 0.5;
    var grid = new THREE.Mesh(planeGeometry, planeMaterial);
    grid.receiveShadow = true;
    grid.rotation.x = -Math.PI / 2;
    scene.add(grid);

    new THREE.GLTFLoader().load(`model/gir animer/Mon petit perso marche.glb`,  function ( gltf ){
        model = gltf.scene;
        if (container.clientWidth < 768) {
            model.position.set(0, 0, 0);
        } else {
            model.position.set(7, 0, 5);
        }
        model.scale.set(2, 2, 2);
        // rotate de 90°
        model.rotation.y = - Math.PI / 1.5;

        // On créé un cube pour la hitbox qui prend toute la hauteur du modèle
        var geometry = new THREE.BoxGeometry(model.scale.x * 1, model.scale.y *1, model.scale.z *1);
        // color in transparent for the cube
        var material = new THREE.MeshBasicMaterial({ color: 0x00ff00, transparent: true, opacity: 0 });
        hitBox = new THREE.Mesh(geometry, material);
        hitBox.position.set(0, 0, 0);
        hitBox.name = "hitBox";
        hitBox.visible = false;

        scene.add(hitBox);
        scene.add(model);

        model.traverse((child) => {
            if (child.isMesh) {
                child.castShadow = true;
            }
        });


    
        // Si il a une animation, on la joue
        if (gltf.animations.length > 0) {
            mixer = new THREE.AnimationMixer(model);
        } else {
            alert("No animation found");
        }
    
        characterControls = new CharacterControls(model, mixer, camera, gltf);
    
        animate();
    });

    document.addEventListener('mouseup', onDocumentMouseClick, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    
    
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
    hitBox.position.set(model.position.x, model.position.y + model.scale.y/2, model.position.z);
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
            INTERSECTED = intersects[0].object;
            if (INTERSECTED && INTERSECTED.name == "hitBox") {
                characterControls.doHello();
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

function onDocumentMouseMove(event) {
    // Si la souris passe au dessus de hitbox on cursor pointer
    event.preventDefault();
    mouse.x = (event.clientX / window.innerWidth) * 2 - 1;
    mouse.y = -(event.clientY / window.innerHeight) * 2 + 1;

    var raycaster = new THREE.Raycaster();
    raycaster.setFromCamera(mouse, camera);
    var intersects = raycaster.intersectObjects(scene.children, true);
    if (intersects.length > 0) {
        if (INTERSECTED != intersects[0].object) {
            INTERSECTED = intersects[0].object;
            if (INTERSECTED && INTERSECTED.name == "hitBox") {
                document.body.style.cursor = "pointer";
            } else {
                document.body.style.cursor = "default";
            }
        }
        INTERSECTED = null;
    } else {
        document.body.style.cursor = "default";
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

