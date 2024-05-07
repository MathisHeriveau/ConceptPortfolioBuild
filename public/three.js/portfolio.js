let scene, camera, renderer, controls, model, hemiLight, spotLight, gridHelper;
let mixer = null;

let grid, characterControls, hitBox;
let container = document.getElementById('container');
var span = document.getElementById("performance");

var mouse = new THREE.Vector2(),
    INTERSECTED;

    
function init() {
    scene = new THREE.Scene();

    // add la scene dans le container , 
    //  antialias : true
    // Si il y a #2 dans l'url on ajoute le mode performance
    if(window.location.href.includes("#2")){
        span.classList.remove("off");
        span.classList.add("on");
        span.innerHTML = "ON";
        renderer = new THREE.WebGLRenderer({ alpha: true , antialias: true, powerPreference: "high-performance" });
    }
    else{
        renderer = new THREE.WebGLRenderer({ alpha: false , antialias: false });
        span.classList.remove("on");
        span.classList.add("off");
        span.innerHTML = "OFF";
    }
    // renderer.setPixelRatio( window.devicePixelRatio * 1.5);
    renderer.setSize(container.clientWidth, container.clientHeight);
    container.appendChild(renderer.domElement);
    renderer.shadowMap.enabled = true;

    window.addEventListener('resize', () => {
        renderer.setSize(container.clientWidth, container.clientHeight);
        camera.aspect = container.clientWidth / container.clientHeight;
        camera.updateProjectionMatrix();
    });

    camera = new THREE.PerspectiveCamera(75, container.clientWidth / container.clientHeight, 0.1, 1000);
    camera.position.set(-15, 5, 15);

    //set up controls
    // controls = new THREE.OrbitControls(camera, renderer.domElement);
    // controls.enableDamping = true;

    //set up lights : hemispherical light
    hemiLight = new THREE.HemisphereLight();
    scene.add(hemiLight);

    //set up lights : spot lights

    spotLight = new THREE.SpotLight(0xD9D9D9, 2);
    spotLight.castShadow = true;
    spotLight.shadow.mapSize.width = 2048;
    spotLight.shadow.mapSize.height = 2048;
    spotLight.shadow.radius = 2;
    // On crée un helper pour voir la direction de la lumière
    const spotLightHelper = new THREE.SpotLightHelper(spotLight);
    scene.add(spotLightHelper);

    scene.add(spotLight);

    //tone mapping
    renderer.toneMapping = THREE.ACESFilmicToneMapping;
    renderer.toneMappingExposure = 1.0;


    
    /*****************************************/
    /*    Ajout de notre avatar dans la scène */
    /*****************************************/
    new THREE.GLTFLoader().load(`/public/three.js/model/Mon petit perso marche.glb`,  function ( gltf ){
        model = gltf.scene;
        if (container.clientWidth < 768) {
            model.position.set(-1.5, 0, 1.5);
            camera.lookAt(model.position.x, model.position.y, model.position.z);
        } else {
            model.position.set(-8, 0,3);
            camera.lookAt(model.position.x -2, model.position.y+3, model.position.z);
            model.position.set(-12, 0, 3);

        }
        model.scale.set(1.7, 1.7, 1.7);
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
    
    // On ajoute un event listener pour le click
    document.addEventListener('mouseup', onDocumentMouseClick, false);
    document.addEventListener('mousemove', onDocumentMouseMove, false);
    

    
    /**************************************************/
    /*         Création du décor de la scène          */
    /**************************************************/
    var planeGeometry = new THREE.BoxGeometry(100, 100, 0.1);
    var planeMaterial = new THREE.MeshBasicMaterial({ color: 0xffffff, side: THREE.DoubleSide }); // Utilisation d'un blanc pur
    var grid = new THREE.Mesh(planeGeometry, planeMaterial);
    grid.receiveShadow = true;
    grid.castShadow = true;
    grid.rotation.x = -Math.PI / 2;
    grid.position.set(-40, -0.2, 50);
    scene.add(grid);

    gridHelper = new THREE.GridHelper(100, 100);
    gridHelper.position.set(-40, 0, 50);
    gridHelper.visible = true;
    scene.add(gridHelper);

    // On ajoute un mur en 0,0,0 de hauteur 10 et de largeur 1 et de longueur 10 
    var geometry = new THREE.BoxGeometry(100, 50, 0.1);
    var material = new THREE.MeshBasicMaterial({ color: 0x000000 });
    var wall = new THREE.Mesh(geometry, material);
    wall.position.set(-40, 0, 0);
    scene.add(wall);
    geometry = new THREE.BoxGeometry(0.1, 50, 100);
    wall = new THREE.Mesh(geometry, material);
    wall.position.set(10, 0, 50);
    scene.add(wall);

    // Add text to the scene
    var marginRight = -18;
    if (container.clientWidth < 1000) {
        marginRight = -1.5;
    }else if (container.clientWidth < 1450) {
        marginRight = -12;
    }
    
    addTextToScene("AI", {x: marginRight - 3, y: 8.45, z: 0}, 0.5);
    addTextToScene("PORTFOLIO", {x: marginRight - 4, y: 6, z: 0}, 1);
    addTextToScene("Decouvrez un univers ou la creativite rencontre l'innovation : explorez mon portfolio pour plonger dans un monde  ", {x: marginRight-5, y: 3, z: -0.03}, 0.2);
    addTextToScene("futuriste ou le developpement web et la 3D se conjuguent pour faconner l'avenir numerique.", {x: marginRight-5, y: 2.6, z: -0.03}, 0.2);
    
    addRectangleToScene({x: marginRight, y: 4.1, z: 0.1}, {width: 9, height: 0.5, depth: 0.5}, 0xffffff, 0xD9D9D9);
    addRectangleToScene({x: marginRight, y: 5, z: 0.1}, {width: 9, height: 0.5, depth: 0.5}, 0x20BDB0, 0x009288);
    addRectangleToScene({x: marginRight , y: 2.2, z: 0.1}, {width: 6, height: 0.3, depth: 0.5}, 0xffffff, 0xD9D9D9);
    addRectangleToScene({x: marginRight+14 , y: 2, z: 0.1}, {width: 13, height: 0.5, depth: 0.5}, 0xffffff , 0xD9D9D9);
    addRectangleToScene({x: marginRight+17 , y: 4.7, z: 0.1}, {width: 15, height: 0.6, depth: 0.5}, 0x20BDB0 , 0x009288);
    addRectangleToScene({x: marginRight+14 , y: 8, z: 0.1}, {width: 14, height: 0.6, depth: 0.5}, 0xffffff , 0xD9D9D9);
    
    addSquareWithBorderToScene({x: marginRight - 2.6 , y: 8.7, z: 0.01}, {width: 2, height: 2, depth: 0.5}, 0.1, 0x20BDB0, 0x000000);
    addSquareWithBorderToScene({x: marginRight - 2.6 , y: 8.7, z: 0.03}, {width: 1.7, height: 1.7, depth: 0.5}, 0.1, 0x20BDB0, 0x000000);

    

    const extrudeSettings = {
        depth: 0.3, // Profondeur de l'extrusion
        bevelEnabled: false // Pas de biseau
    };
    addShapeToScene(createMShapePoints(5,0.6), extrudeSettings, { x: marginRight + 5, y: 0, z: 0.3 }, 0xffffff);
    addShapeToScene(createMShapePoints(3,0.2), extrudeSettings,  { x: marginRight + 12, y: 0, z: 0.3 }, 0xffffff);
    addShapeToScene(createMShapePoints(3,0.4), extrudeSettings,  { x: marginRight + 15, y: 0, z: 0.3 }, 0xffffff);
    addShapeToScene(createMShapePoints(12,0.8), extrudeSettings,  { x: marginRight + 18, y: 0, z: 0.3 }, 0xffffff);

    addShapeWithRoundedLeftEdge({ x: marginRight + 9, y: 0, z: 0.3 }, { width: 5, height: 1, depth: 0.3 }, 1, 0xffffff);
    addShapeWithRoundedLeftEdge({ x: marginRight +7, y: 0, z: 0.3 }, { width: 5, height: 0.99, depth: 0.29 }, 1, 0x009288);
    addShapeWithRoundedLeftEdge({ x: marginRight + 6.5, y: 0, z: 0.3 }, { width: 2, height: 0.98, depth: 0.28 }, 1.5, 0xffffff);
    addShapeWithRoundedLeftEdge({ x: marginRight + 6, y: 0, z: 0.3 }, { width: 3, height: 0.97, depth: 0.27 }, 1, 0x009288);
    addShapeWithRoundedLeftEdge({ x: marginRight , y: 0, z: 0.3 }, { width: 15, height: 0.96, depth: 0.26 }, 1, 0xffffff);


    addTextToScene("Les maquettes qui m'ont permis de faire mon site", {x: 9.9, y: 6, z: 5}, 0.4, Math.PI * 1.5, 6.1);

    // Ajoute des images 
    addImageToScene("/public/img/600x600.jpg", {x: 9.9, y: 4, z: 13}, {width: 4, height: 4, depth: 0.1}, Math.PI * 1.5);
    addImageToScene("/public/img/600x600.jpg", {x: 9.9, y: 4, z: 18}, {width: 4, height: 4, depth: 0.1}, Math.PI * 1.5);
    addImageToScene("/public/img/600x600.jpg", {x: 9.9, y: 4, z: 23}, {width: 4, height: 4, depth: 0.1}, Math.PI * 1.5);
    addImageToScene("/public/img/600x600.jpg", {x: 9.9, y: 4, z: 28}, {width: 4, height: 4, depth: 0.1}, Math.PI * 1.5);

    // On ajoute icons8-flèche-96.png au sol pour indiquer la direction
    addImageToScene("/public/img/icons8-flèche-80.png", {x: -15, y: -0.1, z: 3}, {width: 3.5, height: 3.5, depth: 0.01}, 0, Math.PI / 2);
    addImageToScene("/public/img/icons8-flèche-80.png", {x: -12, y: -0.1, z: 6}, {width: 3.5, height: 3.5, depth: 0.01}, 0, Math.PI / 2, Math.PI *1.5);


}

function animate() {
    renderer.render(scene, camera);
    spotLight.position.set(
        model.position.x - 10,
        model.position.y + 10,
        model.position.z +10000
    );

    if (mixer) {
        mixer.update(0.01);
    }
    hitBox.position.set(model.position.x, model.position.y + model.scale.y/2, model.position.z);
    characterControls.update(0.01);

    /*
        camera.position.set(-15, 5, 15);
        model.position.set(-12, 0, 5);
    */
        camera.position.set(model.position.x - 3, 7, model.position.z + 10);

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

function addTextToScene(textAEcrire, position, size, rotateY = 0, rotateX = 0, rotateZ = 0) {
    const loader = new THREE.FontLoader();
    loader.load('https://cdn.jsdelivr.net/npm/three/examples/fonts/helvetiker_bold.typeface.json', function (font) {
        // encodage du texte en utf-8
        textAEcrire = decodeURIComponent(textAEcrire);
        const geometry = new THREE.TextGeometry(textAEcrire, {
            font: font,
            size: size,
            height: 0.1,
            weight: 'normal',
            curveSegments: 12,
            bevelEnabled: false,
        });
        const material = new THREE.MeshBasicMaterial({ color: 0xffffff });
        const text = new THREE.Mesh(geometry, material);
        text.position.set(position.x, position.y, position.z);
        // Il prend les ombres
        text.castShadow = true;
        text.rotation.y = rotateY;
        text.rotation.x = rotateX;
        text.rotation.z = rotateZ;
        scene.add(text);
    });
}


function addImageToScene(url, position, size, rotateY = 0, rotateX = 0, rotateZ = 0) {
    const loader = new THREE.TextureLoader();
    loader.load(url, function (texture) {
        const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
        // Augmentation de la qualité de l'image
        texture.anisotropy = renderer.capabilities.getMaxAnisotropy();

        const material = new THREE.MeshBasicMaterial({ map: texture , transparent: true, alphaTest: 0.5 });
        const image = new THREE.Mesh(geometry, material);
        image.position.set(position.x, position.y, position.z);
        image.rotation.y = rotateY;
        image.rotation.x = rotateX;
        image.rotation.z = rotateZ;
        scene.add(image);
    });
}


function addRectangleToScene(position, size, topColor, otherColor) {
    // Création d'un matériau pour le haut du cube
    const topMaterial = new THREE.MeshPhongMaterial({ color: topColor });
    // Création d'un matériau pour les autres faces
    const otherMaterial = new THREE.MeshPhongMaterial({ color: otherColor });
    // Pour tester
    
    // Création de la géométrie et des faces du cube
    const geometry = new THREE.BoxGeometry(size.width, size.height, size.depth);
    const materials = [
        otherMaterial, // droite
        otherMaterial, // gauche
        otherMaterial, // face top
        otherMaterial, // face bottom
        otherMaterial, // face de devant
        otherMaterial  // face de derrière
    ];
    const cube = new THREE.Mesh(geometry, materials);
    
    // Positionnement du cube
    cube.position.set(position.x, position.y, position.z);
    cube.castShadow = true; // Permet au cube de projeter des ombres
    
    // Ajout du cube à la scène
    scene.add(cube);
}

function addSquareWithBorderToScene(position, size, borderWidth, borderColor, fillColor) {
    // Création d'un matériau pour la bordure
    const borderMaterial = new THREE.MeshBasicMaterial({ color: borderColor });

    // Création d'un matériau pour le remplissage
    const fillMaterial = new THREE.MeshBasicMaterial({ color: fillColor });

    // Création de la géométrie pour le cadre extérieur
    const outerGeometry = new THREE.BoxGeometry(size.width, size.height, borderWidth);
    const outerCube = new THREE.Mesh(outerGeometry, borderMaterial);
    outerCube.position.set(position.x, position.y, position.z);

    // Création de la géométrie pour le cadre intérieur
    const innerSize = { width: size.width - borderWidth * 2, height: size.height - borderWidth * 2, depth: size.depth };
    const innerGeometry = new THREE.BoxGeometry(innerSize.width + 0.15, innerSize.height+0.15, borderWidth);
    const innerCube = new THREE.Mesh(innerGeometry, fillMaterial);
    innerCube.position.set(position.x, position.y, position.z+0.01);

    // Ajout des cubes à la scène
    scene.add(outerCube);
    scene.add(innerCube);
}

function addShapeToScene(points, extrudeSettings, position, color) {
    // Création de la forme à partir des points spécifiés
    const shape = createShapeFromPoints(points);

    // Création de la géométrie extrudée à partir de la forme
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Création d'un matériau pour la forme
    const material = new THREE.MeshPhongMaterial({ color: color });

    // Création du maillage pour la forme
    const mesh = new THREE.Mesh(geometry, material);

    // Positionnement de la forme
    mesh.position.set(position.x, position.y, position.z);

    // Ajout de la forme à la scène
    scene.add(mesh);

    return mesh;
}



function createShapeFromPoints(points) {
    // Création d'une nouvelle instance de Shape
    const shape = new THREE.Shape();

    // Définition des points pour la forme
    shape.moveTo(points[0].x, points[0].y);
    for (let i = 1; i < points.length; i++) {
        shape.lineTo(points[i].x, points[i].y);
    }

    // Fermeture de la forme
    shape.closePath();

    return shape;
}
function createMShapePoints(size, profondeur) {
    const points = [
        new THREE.Vector2(0, 0),         // Coin inférieur gauche
        new THREE.Vector2(1*size, 0),         // Coin inférieur droit
        new THREE.Vector2(1*size, 1),       // Coin supérieur droit
        new THREE.Vector2(0.8*size-profondeur, 1),     // Coin supérieur droit avec enfoncement
        new THREE.Vector2(0.5*size, 1-profondeur),     // Coin supérieur droit avec enfoncement
        new THREE.Vector2(0.2*size+profondeur, 1),     // Coin supérieur droit avec enfoncement
        new THREE.Vector2(0, 1)        // Coin supérieur gauche    
    ];

    return points;
}


function addShapeWithRoundedLeftEdge(position, size, cornerRadius, color) {
    // Création de la forme avec le bord gauche arrondi
    const shape = new THREE.Shape();

    // Définition du contour du carré avec le bord gauche arrondi
    shape.moveTo(position.x + cornerRadius, position.y);
    shape.lineTo(position.x + size.width, position.y);
    shape.lineTo(position.x + size.width, position.y + size.height);
    shape.lineTo(position.x + cornerRadius, position.y + size.height);
    shape.quadraticCurveTo(position.x, position.y + size.height / 2, position.x + cornerRadius, position.y); // Courbe de Bézier cubique pour le bord gauche arrondi
    shape.closePath();

    // Création de la géométrie extrudée à partir de la forme
    const extrudeSettings = {
        depth: size.depth,
        bevelEnabled: false
    };
    const geometry = new THREE.ExtrudeGeometry(shape, extrudeSettings);

    // Création d'un matériau pour la forme
    const material = new THREE.MeshPhongMaterial({ color: color });

    // Création du maillage pour la forme
    const mesh = new THREE.Mesh(geometry, material);

    // Positionnement de la forme
    mesh.position.copy(position);

    // Ajout de la forme à la scène
    scene.add(mesh);

    return mesh;
}





document.getElementById('grid').addEventListener('click', () => {
    gridHelper.visible = !gridHelper.visible;
});


window.onload = function() {
    if (model != null) {
        characterControls.isOut = false;
    }
    if(window.location.href.includes("#1")){
        console.error("je suis dans la page 1");
        inThePage();
    }
}
