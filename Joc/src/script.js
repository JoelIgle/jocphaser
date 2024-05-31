
var score = 0;
var scoreText;
var gameOver = false;

var mainScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function mainScene(){
            Phaser.Scene.call(this, { key: 'mainScene' });
        },
    preload: preload,
    create: create,
    update: update
});



var newScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function newScene(){
            Phaser.Scene.call(this, { key: 'NewScene' });
        },
    preload: function(){
        // Aquí puedes pre-cargar los recursos necesarios para el nuevo mapa
        this.load.image('newSky', 'assets/sky2.jpg'); // Asegúrate de tener esta imagen en tu carpeta de recursos
        this.load.image('ground', 'assets/wood.png');
        this.load.image('star', 'assets/star.png');
        this.load.image('chest', 'assets/chest.png'); // Añadir esta línea para cargar la imagen del cofre
        this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('door', 'assets/door.png', { frameWidth: 32, frameHeight: 32 });
        this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
    },

    create: function() {

        let sky = this.add.image(400, 300, 'newSky'); // Usamos la nueva imagen de fondo
        sky.setScale(1.5, 1.9);

        platforms = this.physics.add.staticGroup();
        var platformWidth = 190; // Ancho de la plataforma
        var platformCount = 5; // Número de plataformas que quieres generar

        for (var i = 0; i < platformCount; i++) {
            platforms.create(i * platformWidth, 600, 'ground').setScale(2).refreshBody();
        }

        platforms.create(550, 400, 'ground');
        platforms.create(200, 250, 'ground');
        platforms.create(800, 200, 'ground');

        player = this.physics.add.sprite(100, 450, 'dude');
        player.setCollideWorldBounds(true);
        player.setBounce(0.2);

        this.cameras.main.startFollow(player);
        this.cameras.main.setBounds(0, 0, Infinity, 568);

        this.anims.create({
            key: 'left',
            frames: this.anims.generateFrameNumbers('dude', {start: 0, end: 3}),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'turn',
            frames: [{key: 'dude', frame: 4}],
            frameRate: 20
        });

        this.anims.create({
            key: 'right',
            frames: this.anims.generateFrameNumbers('dude', {start: 5, end: 8}),
            frameRate: 10,
            repeat: -1
        });

        player.body.setGravityY(400);


        this.physics.add.collider(player, platforms);
        cursors = this.input.keyboard.createCursorKeys();

        stars = this.physics.add.group({
            key: 'star',
            repeat: 11,
            setXY: { x: 12, y: 0, stepX: 70 }
        });

        stars.children.iterate(function (child) {
            child.setBounceY(Phaser.Math.FloatBetween(0.4, 0.8));
        });

        this.physics.add.collider(stars, platforms);
        this.physics.add.overlap(player, stars, collectStar, null, this);

        scoreText = this.add.text(16, 16, 'Score: ' + score, { fontSize: '32px', fill: '#000' });
        scoreText.setScrollFactor(0); // Esto hace que el texto siga a la cámara

        enemy = this.physics.add.sprite(400, 450, 'enemy').setScale(2);

        // Ajustar la mida del collider de l'enemic
        enemy.body.setSize(10, 16); // Ajusta aquests valors segons sigui necessari
        enemy.body.setOffset(1, 11); // Ajusta aquests valors segons sigui necessari

        // Iniciar l'enemic movent cap a l'esquerra
        enemy.setVelocityX(-100);
        enemy.setCollideWorldBounds(true);

        this.anims.create({
            key: 'moveRight',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        this.anims.create({
            key: 'moveLeft',
            frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }),
            frameRate: 10,
            repeat: -1
        });

        enemy.anims.play('moveLeft', true); // Inicia l'animació de moure cap a l'esquerra
        enemy.flipX = true; // Si és necessari per ajustar la direcció de l'sprite

        this.physics.add.collider(enemy, platforms);

        // Afegeix la col·lisió entre el jugador i l'enemic
        this.physics.add.collider(player, enemy, hitEnemy, null, this);

        var chest = this.physics.add.sprite(800, 500, 'chest').setScale(2);
        this.physics.add.collider(chest, platforms);
        this.physics.add.overlap(player, chest, hitChest, null, this);



    },

    update: function(){
        if (gameOver) {
            return;
        }

        if (cursors.left.isDown) {
            player.setVelocityX(-160);
            player.anims.play('left', true);
        } else if (cursors.right.isDown) {
            player.setVelocityX(160);
            player.anims.play('right', true);
        } else {
            player.setVelocityX(0);
            player.anims.play('turn');
        }

        if (cursors.up.isDown && player.body.touching.down) {
            player.setVelocityY(-530);
        }

        if (enemy.body.blocked.left) {
            enemy.setVelocityX(100);
            enemy.anims.play('moveRight', true);
            enemy.flipX = false;
        } else if (enemy.body.blocked.right) {
            enemy.setVelocityX(-100);
            enemy.anims.play('moveLeft', true);
            enemy.flipX = true;
        }

    }
});

var EndScene = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize:
        function EndScene(){
            Phaser.Scene.call(this, { key: 'EndScene' });
        },
    preload: function(){
        this.load.image('coin', 'assets/coin.png'); // Asegúrate de tener esta imagen en tu carpeta de recursos
        this.load.image('treasureBackground', 'assets/endBackground.jpg'); // Asegúrate de tener esta imagen en tu carpeta de recursos
    },
    create: function() {
        // Añadir la imagen de fondo
        let bg = this.add.image(665, 300, 'treasureBackground'); // Centrar la imagen de fondo
        bg.setScale(1.5, 1.5); // Ajustar el tamaño de la imagen de fondo

        var message;
        var coinCount;

        if (score >= 300) {
            coinCount = 3;
            message = '¡Has guanyat 3 monedes!';
        } else if (score >= 150) {
            coinCount = 2;
            message = '¡Has guanyat 2 monedes!';
        } else if (score >= 100) {
            coinCount = 1;
            message = '¡Has guanyat 1 moneda!';
        } else {
            coinCount = 0;
            message = 'No has guanyat ninguna moneda';
        }

        var messageText = this.add.text(665, 200, message, {
            fontSize: '32px',
            fill: '#FFD700', // Cambiar el color de las letras a dorado
            fontFamily: 'Arial, sans-serif'
        });
        messageText.setOrigin(0.5); // Centrar el texto

        for (var i = 0; i < coinCount; i++) {
            var coin = this.add.image(615 + i * 50, 300, 'coin').setScale(2);
            coin.setOrigin(0.5); // Centrar las monedas
        }

        var restartButton = this.add.text(665, 400, 'Reiniciar', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#4CAF50',
            padding: { x: 20, y: 10 },
            borderRadius: 8,
            fontFamily: 'Arial, sans-serif'
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive();
        restartButton.on('pointerdown', function () {
            location.reload();
        });
    }
});

function preload() {
    this.load.image('sky', 'assets/sky.png');
    this.load.image('ground', 'assets/wood.png');
    this.load.image('star', 'assets/star.png');
    this.load.spritesheet('enemy', 'assets/enemy.png', { frameWidth: 32, frameHeight: 32 });
    this.load.spritesheet('enemyDeath', 'assets/enemyDeath.png', { frameWidth: 160, frameHeight: 32 });

    this.load.spritesheet('door', 'assets/door.png', { frameWidth: 32, frameHeight: 32 });

    this.load.spritesheet('dude', 'assets/dude.png', { frameWidth: 32, frameHeight: 48 });
}

function create() {
    let sky = this.add.image(400, 300, 'sky');
    sky.setScale(3.23 , 1.9);


    // Terra
    platforms = this.physics.add.staticGroup();
    var platformWidth = 190;
    var platformCount = 7;

    for (var i = 0; i < platformCount; i++) {
        platforms.create(i * platformWidth, 600, 'ground').setScale(2).refreshBody();
    }

    // Plataformes
    platforms.create(415, 400, 'ground');
    platforms.create(600, 400, 'ground');

    platforms.create(50, 250, 'ground');
    platforms.create(900, 250, 'ground');

    platforms.create(1200, 200, 'ground');


    player = this.physics.add.sprite(100, 450, 'dude');
    player.setCollideWorldBounds(true);
    player.setBounce(0.2);

    this.cameras.main.startFollow(player);
    this.cameras.main.setBounds(0, 0, Infinity, 568);

    this.anims.create({
        key: 'left',
        frames: this.anims.generateFrameNumbers('dude', { start: 0, end: 3 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'turn',
        frames: [ { key: 'dude', frame: 4 } ],
        frameRate: 20
    });

    this.anims.create({
        key: 'right',
        frames: this.anims.generateFrameNumbers('dude', { start: 5, end: 8 }),
        frameRate: 10,
        repeat: -1
    });

    player.body.setGravityY(400);
    this.physics.add.collider(player, platforms);
    cursors = this.input.keyboard.createCursorKeys();

    stars = this.physics.add.group({
        key: 'star',
        repeat: 11,
        setXY: { x: 12, y: 200, stepX: 100 }
    });

    stars.children.iterate(function (child) {
        child.setBounceY(Phaser.Math.FloatBetween(0.1, 0.3));
    });

    this.physics.add.collider(stars, platforms);
    this.physics.add.overlap(player, stars, collectStar, null, this);

    scoreText = this.add.text(16, 16, 'score: 0', { fontSize: '32px', fill: '#000' });
    scoreText.setScrollFactor(0); // Esto hace que el texto siga a la cámara

    enemy = this.physics.add.sprite(400, 450, 'enemy').setScale(2);

    // Ajustar la mida del collider de l'enemic
    enemy.body.setSize(10, 16); // Ajusta aquests valors segons sigui necessari
    enemy.body.setOffset(1, 11); // Ajusta aquests valors segons sigui necessari

    // Iniciar l'enemic movent cap a l'esquerra
    enemy.setVelocityX(-100);
    enemy.setCollideWorldBounds(true);


    enemy2 = this.physics.add.sprite(1000, 100, 'enemy').setScale(1.5);

    // Ajustar la mida del collider de l'enemic
    enemy2.body.setSize(10, 16); // Ajusta aquests valors segons sigui necessari
    enemy2.body.setOffset(1, 11); // Ajusta aquests valors segons sigui necessari

    // Iniciar l'enemic movent cap a l'esquerra
    enemy2.setVelocityX(-100);
    enemy2.setCollideWorldBounds(true);



    this.anims.create({
        key: 'moveRight',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    this.anims.create({
        key: 'moveLeft',
        frames: this.anims.generateFrameNumbers('enemy', { start: 0, end: 5 }),
        frameRate: 10,
        repeat: -1
    });

    enemy.anims.play('moveLeft', true); // Inicia l'animació de moure cap a l'esquerra
    enemy.flipX = true; // Si és necessari per ajustar la direcció de l'sprite

    this.physics.add.collider(enemy, platforms);

    enemy2.anims.play('moveLeft', true); // Inicia l'animació de moure cap a l'esquerra
    enemy2.flipX = true; // Si és necessari per ajustar la direcció de l'sprite

    this.physics.add.collider(enemy2, platforms);


    // Afegeix la col·lisió entre el jugador i l'enemic
    this.physics.add.collider(player, enemy, hitEnemy, null, this);

    this.physics.add.collider(player, enemy2, hitEnemy, null, this);


    var door = this.physics.add.sprite(1200, 100, 'door').setScale(2);

    this.physics.add.collider(door, platforms);

    this.physics.add.collider(player, door, function(){
        // Quan el jugador col·lisiona amb la porta, canvia a la nova escena
        this.scene.start('NewScene');
    }, null, this);


}

function update() {
    if (gameOver) {
        return;
    }

    if (cursors.left.isDown) {
        player.setVelocityX(-160);
        player.anims.play('left', true);
    } else if (cursors.right.isDown) {
        player.setVelocityX(160);
        player.anims.play('right', true);
    } else {
        player.setVelocityX(0);
        player.anims.play('turn');
    }

    if (cursors.up.isDown && player.body.touching.down) {
        player.setVelocityY(-530);
    }

    if (enemy.body.blocked.left) {
        enemy.setVelocityX(100);
        enemy.anims.play('moveRight', true);
        enemy.flipX = false;
    } else if (enemy.body.blocked.right) {
        enemy.setVelocityX(-100);
        enemy.anims.play('moveLeft', true);
        enemy.flipX = true;
    }

    if (enemy2.body.blocked.left) {
        enemy2.setVelocityX(100);
        enemy2.anims.play('moveRight', true);
        enemy2.flipX = false;
    } else if (enemy2.body.blocked.right) {
        enemy2.setVelocityX(-100);
        enemy2.anims.play('moveLeft', true);
        enemy2.flipX = true;
    }



}

function collectStar(player, star) {
    star.disableBody(true, true);

    score += 10;
    scoreText.setText('Score: ' + score);

    if (stars.countActive(true) === 0) {
        stars.children.iterate(function (child) {
            child.enableBody(true, child.x, 0, true, true);
        });
    }
}

function hitEnemy(player, enemy) {
    if (player.body.touching.down && enemy.body.touching.up) { // Si el jugador toca a l'enemic per dalt
        enemy.disableBody(true, true); // Desactiva i elimina l'enemic
        score += 50; // Incrementa la puntuació
        scoreText.setText('Score: ' + score);

    } else { // En qualsevol altre cas, el jugador mor
        this.physics.pause(); // Pausa el joc
        player.setTint(0xff0000); // Canvia el color del jugador a vermell
        player.anims.play('turn'); // Executa l'animació de parar-se
        gameOver = true; // Marca el joc com acabat

        // Crea un fons fosc semitransparent per ressaltar el missatge de Game Over
        var gameOverOverlay = this.add.graphics();
        gameOverOverlay.fillStyle(0x000000, 0.7); // Color fosc amb opacitat
        gameOverOverlay.fillRect(0, 0, config.width, config.height); // Crea un rectangle que cobreix tota la pantalla

        var gameOverText = this.add.text(config.width / 2, config.height / 2 - 50, 'Game Over', {
            fontSize: '64px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif'
        }); // Crea el text de Game Over centrat a la pantalla
        gameOverText.setOrigin(0.5); // Centra el text

        // Crea un botó de reinici més atractiu
        var restartButton = this.add.text(config.width / 2, config.height / 2 + 50, 'Restart', {
            fontSize: '32px',
            fill: '#ffffff',
            fontFamily: 'Arial, sans-serif',
            backgroundColor: '#4CAF50',
            padding: {
                x: 20,
                y: 10
            },
            borderRadius: 8
        });
        restartButton.setOrigin(0.5);
        restartButton.setInteractive(); // Fa que el text sigui interactiu

        // Quan es fa clic al botó de reinici, es recarrega la pàgina
        restartButton.on('pointerdown', function () {
            location.reload();
        });
    }
}

function hitChest(player, chest) {
    this.physics.pause(); // Pausa el juego
    player.setTint(0xff0000); // Cambia el color del jugador para indicar que el juego ha terminado
    player.anims.play('turn'); // Ejecuta la animación de parar

    this.scene.start('EndScene'); // Inicia la escena final
}

var config = {
    type: Phaser.AUTO,
    width: 1330,
    height: 600,
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: 300 },
            debug: false
        }
    },
    scene: [mainScene, newScene, EndScene] // Añadir EndScene aquí
};


var game = new Phaser.Game(config);

