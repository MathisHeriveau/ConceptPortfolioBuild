// Créez une classe CharacterControls pour gérer le mouvement du personnage
class CharacterControls {
    constructor(model, mixer, camera) {
        this.model = model;
        this.mixer = mixer;;
        this.camera = camera;
        this.moveDirection = new THREE.Vector3(); // Direction de déplacement
        this.movementSpeed = 0.1; // Vitesse de déplacement
        this.currentAction = ''; // Action actuellement jouée
        this.setupEventListeners(); // Mettre en place les écouteurs d'événements
    }

    // Met en place les écouteurs d'événements pour les touches de direction
    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                    this.moveDirection.z = -1; // Avancer vers l'avant
                    break;
                case 'ArrowDown':
                    this.moveDirection.z = 1; // Avancer vers l'arrière
                    break;
                case 'ArrowLeft':
                    this.moveDirection.x = -1; // Déplacer vers la gauche
                    break;
                case 'ArrowRight':
                    this.moveDirection.x = 1; // Déplacer vers la droite
                    break;
            }
        });

        document.addEventListener('keyup', (event) => {
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    this.moveDirection.z = 0; // Arrêter le mouvement avant/arrière lorsque la touche est relâchée
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.moveDirection.x = 0; // Arrêter le mouvement gauche/droite lorsque la touche est relâchée
                    break;
            }
        });
    }

    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
        }
    
        // Mettre à jour le mouvement du modèle en fonction de la direction de déplacement
        this.model.position.x += this.moveDirection.x * this.movementSpeed;
        this.model.position.z += this.moveDirection.z * this.movementSpeed;
    
        // Calculer l'angle de rotation par rapport à la direction actuelle du personnage
        let targetAngle = Math.atan2(this.moveDirection.x, this.moveDirection.z);
    
        // Convertir l'angle en degrés
        targetAngle = THREE.MathUtils.radToDeg(targetAngle);
    
        // Limiter l'angle entre -180 et 180 degrés pour éviter des rotations excessives
        targetAngle = THREE.MathUtils.clamp(targetAngle, -180, 180);
    
        // Calculer la différence d'angle entre la direction actuelle et la nouvelle direction
        let angleDiff = targetAngle - THREE.MathUtils.radToDeg(this.model.rotation.z);
    
        // Limiter la différence d'angle entre -180 et 180 degrés pour obtenir la rotation la plus courte
        angleDiff = THREE.MathUtils.clamp(angleDiff, -180, 180);
    
        // Définir la vitesse de rotation pour obtenir une transition fluide
        const rotationSpeed = 360; // Degrés par seconde
    
        // Interpoler progressivement l'angle actuel vers l'angle cible
        let rotationAmount = rotationSpeed * delta;
        if (Math.abs(angleDiff) < rotationAmount) {
            rotationAmount = Math.abs(angleDiff);
        }
        if (angleDiff < 0) {
            rotationAmount *= -1;
        }
    
        // Appliquer la rotation au modèle autour de l'axe Y avec l'angle ajusté
        this.model.rotation.z += THREE.MathUtils.degToRad(rotationAmount);
    }
}