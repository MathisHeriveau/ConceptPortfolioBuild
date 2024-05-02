class CharacterControls {
    constructor(model, mixer, camera, gift) {
        this.model = model;
        this.gift = gift;
        this.mixer = mixer;
        this.camera = camera;
        this.moveDirection = new THREE.Vector3(); 
        this.movementSpeed = 0.1; 
        this.currentAngle = THREE.MathUtils.radToDeg(Math.atan2(this.camera.position.x - this.model.position.x, this.camera.position.z - this.model.position.z));
        this.setupEventListeners(); 
        this.touchePressed = {
            up: false,
            down: false,
            left: false,
            right: false
        };
        this.delta = 0;
        this.model.rotation.y = THREE.MathUtils.degToRad(this.currentAngle);
        this.timer = 0;
        this.timerMax = Math.floor(Math.random() * (10 - 5 + 1)) + 4;

        setInterval(() => {
            this.timer += 1;
            if (this.timer >= this.timerMax) {
                console.log("Random animation : " + this.timer);
                this.timer = 0;
                this.timerMax = Math.floor(Math.random() * (10 - 5 + 1)) + 7;
                this.doRandomAnimation();
            }
        }, 1000);
        

        // On joue la 2e animation
        this.mixer.clipAction(this.gift.animations[1]).play();
    }

    setupEventListeners() {
        document.addEventListener('keydown', (event) => {
            this.timer = 0;
            if (this.mixer && (event.key === 'ArrowUp' || event.key === 'ArrowDown' || event.key === 'ArrowLeft' || event.key === 'ArrowRight')) {
                this.mixer.clipAction(this.gift.animations[6]).play();
                this.stopAllAnimations(6);
            }
            switch (event.key) {
                case 'ArrowUp':
                    this.moveDirection.z = -1; 
                    this.touchePressed.up = true;
                    break;
                case 'ArrowDown':
                    this.moveDirection.z = 1; 
                    this.touchePressed.down = true;
                    break;
                case 'ArrowLeft':
                    this.moveDirection.x = -1; 
                    this.touchePressed.left = true;
                    break;
                case 'ArrowRight':
                    this.moveDirection.x = 1; 
                    this.touchePressed.right = true;
                    break;
            }
        });
    
        document.addEventListener('keyup', (event) => {
            this.timer = 0;
            switch (event.key) {
                case 'ArrowUp':
                    this.touchePressed.up = false;
                    break;
                case 'ArrowDown':
                    this.touchePressed.down = false;
                    break;
                case 'ArrowLeft':
                    this.touchePressed.left = false;
                    break;
                case 'ArrowRight':
                    this.touchePressed.right = false;
                    break;
            }

            if (this.mixer) {
                if (!this.touchePressed.up && !this.touchePressed.down && !this.touchePressed.left && !this.touchePressed.right) {
                    this.mixer.clipAction(this.gift.animations[1]).play();
                    this.stopAllAnimations(1);
                }
            }
            switch (event.key) {
                case 'ArrowUp':
                case 'ArrowDown':
                    this.moveDirection.z = 0; 
                    break;
                case 'ArrowLeft':
                case 'ArrowRight':
                    this.moveDirection.x = 0; 
                    break;
            }
        });
    }


    update(delta) {
        if (this.mixer) {
            this.mixer.update(delta);
            this.delta = delta;
        }
    
        this.model.position.x += this.moveDirection.x * this.movementSpeed;
        this.model.position.z += this.moveDirection.z * this.movementSpeed;
    
        if (this.moveDirection.x !== 0 || this.moveDirection.z !== 0) {
            let targetAngle = Math.atan2(this.moveDirection.x, this.moveDirection.z);
            targetAngle = THREE.MathUtils.radToDeg(targetAngle);
            
            // Normalize targetAngle to be within [0, 360] range
            targetAngle = (targetAngle + 360) % 360;
            
            // Get current angle within [0, 360] range
            let currentAngle = THREE.MathUtils.radToDeg(this.model.rotation.y);
            currentAngle = (currentAngle + 360) % 360;
    
            // Calculate angle difference
            let angleDiff = targetAngle - currentAngle;
            angleDiff = THREE.MathUtils.clamp(angleDiff, -180, 180);
    
            // Adjust rotationAmount based on angle difference
            const rotationSpeed = 360;
            let rotationAmount = rotationSpeed * delta;
    
            if (Math.abs(angleDiff) < rotationAmount) {
                rotationAmount = Math.abs(angleDiff);
            }
    
            // Update rotation direction
            if (angleDiff < 0) {
                rotationAmount *= -1;
            }
    
            // Update model's rotation
            this.model.rotation.y += THREE.MathUtils.degToRad(rotationAmount);
    
            // Update current angle
            currentAngle += rotationAmount;
            currentAngle = (currentAngle + 360) % 360;
            this.currentAngle = THREE.MathUtils.degToRad(currentAngle);
        }


        console.log(this.isOutOfWindow());
    }
    
    
    
    
    

    updateCurrentAngle() {
        const angle = Math.atan2(-this.moveDirection.x, -this.moveDirection.z);
        this.currentAngle = THREE.MathUtils.radToDeg(angle + Math.PI);
    }

    goToAngleSmooth(targetAngle) {
        let angleDiff = targetAngle - THREE.MathUtils.radToDeg(this.model.rotation.y);
        angleDiff = THREE.MathUtils.clamp(angleDiff, -180, 180);
    
        if (angleDiff > 180) {
            angleDiff -= 360;
        } else if (angleDiff < -180) {
            angleDiff += 360;
        }
    
        const rotationSpeed = 360; 
        let rotationAmount = rotationSpeed * this.delta;
    
        if (Math.abs(angleDiff) < rotationAmount) {
            rotationAmount = Math.abs(angleDiff);
        }
    
        if (angleDiff < 0) {
            rotationAmount *= -1;
        }
    
        const targetAngleRad = THREE.MathUtils.degToRad(targetAngle);
    
        var goToAngle = setInterval(() => {
            var rotationYModulo = this.model.rotation.y % (2 * Math.PI);
            var targetAngleModulo = targetAngleRad % (2 * Math.PI);
            if (Math.abs(rotationYModulo - targetAngleModulo) < 0.1) {
                clearInterval(goToAngle);
            } else {
                this.model.rotation.y += THREE.MathUtils.degToRad(rotationAmount);
            }

        }, 20);
    
        this.currentAngle = this.model.rotation.y;    
    }
    

    doHello() {
        if (this.mixer) {
            this.timer = 0;
            // On regarde l'angle entre la camera et le modèle
            let angle = Math.atan2(this.camera.position.x - this.model.position.x, this.camera.position.z - this.model.position.z);
            angle = THREE.MathUtils.radToDeg(angle);
            this.goToAngleSmooth(angle);

            this.mixer.clipAction(this.gift.animations[3]).play();
            this.stopAllAnimations(3);

            // On recupere la durée de l'animation
            let duration = this.gift.animations[3].duration * 1000;
            this.timerMax += duration / 1000;
    
            
            setTimeout(() => {
                this.mixer.clipAction(this.gift.animations[1]).play();

                this.mixer.clipAction(this.gift.animations[3]).stop();
                
            }, 2500);
        }
    }

    doRandomAnimation(){
        if (this.mixer) {
            // On choisi un numero random dans la liste des animations
            let listeAnimations = [3,5];
            let random = Math.floor(Math.random() * listeAnimations.length);
            let animation = listeAnimations[random];

            let angle = Math.atan2(this.camera.position.x - this.model.position.x, this.camera.position.z - this.model.position.z);
            angle = THREE.MathUtils.radToDeg(angle);
            this.goToAngleSmooth(angle);

            this.mixer.clipAction(this.gift.animations[animation]).play();
            this.stopAllAnimations(animation);

            // On recupere la durée de l'animation
            let duration = this.gift.animations[animation].duration * 1000;
            this.timerMax += duration / 1000;


            setTimeout(() => {
                this.mixer.clipAction(this.gift.animations[1]).play();
                this.mixer.clipAction(this.gift.animations[animation]).stop();
            }, 2500);
        }
    }

    stopAllAnimations(j) {
        if (this.mixer) {
            for (let i = 0; i < this.gift.animations.length; i++) {
                // Si i == j on ne stop pas l'animation
                if (i !== j) {
                    this.mixer.clipAction(this.gift.animations[i]).stop();
                }
            }
        }
    }

    isOutOfWindow() {
        var posz = this.model.position.z;

        if (this.model.position.z < -30) {
            // si window.innerWidth < 1000 on tp en 0,0,0 sinon on tp en 7,0,5
            if (window.innerWidth < 1000) {
                this.model.position.set(0, 0, 0);
            } else {
                this.model.position.set(7, 0, 5);
            }
            return false;
        }

        console.log("Position z : " + posz);
        // Calcul de f en utilisant des intervalles
        var f = this.calculateF(posz);

        // Vérifier si la position x est en dehors de la fenêtre en fonction de f
        if (this.model.position.x > (window.innerWidth / f) || this.model.position.x < - (window.innerWidth / f)) {
            return true;
        }
        return false;
    }

    calculateF(posz) {
        var intervals = [-25, -23.8, -17.8, -11.8, -5.8, 0.2, 5.2, 10.2];
        var values = [30,28, 34, 40, 50, 70, 110, 150];
        var newIntervals = [];
        var newValues = [];

        for (var i = 0; i < intervals.length - 1; i++) {
            var currentInterval = intervals[i];
            var nextInterval = intervals[i + 1];
            var currentValues = values[i];
            var nextValues = values[i + 1];

            newIntervals.push(currentInterval);

            // Calculer la moyenne entre les intervalles
            var averageInterval = (currentInterval + nextInterval) / 2;
            newIntervals.push(averageInterval);

            newValues.push(currentValues);

            // Calculer la moyenne entre les valeurs
            var averageValue = (currentValues + nextValues) / 2;
            newValues.push(averageValue);
        }

        newIntervals.push(intervals[intervals.length - 1]);
        newValues.push(values[values.length - 1]);

        // Utiliser les nouvelles valeurs interpolées
        for (var i = 0; i < newIntervals.length; i++) {
            if (posz < newIntervals[i]) {
                return newValues[i];
            }
        }

        return 100; // Valeur par défaut si aucune correspondance n'est trouvée
    }
    

    /*
justWaiting // 0 : bug
justWaiting2 // 1 : Trés bien pour les attentes
T-Pose
WaitingHappy // 3 : Il saute un peu mais il est content
WaitingHot // 4 : bug
WaitinSad // 5 : Tres direct mais ca va
walkInPlace // 6 : Il marche sur place 
walkInPlace // 7 : bug
justWaiting  // 8 : bug
WaitingHappy // 9 : bug
WaitingHappy // 10 : bug
JustWaiting2 // 11 : bug
WaitinSad // 12 : bug
    */

    
}