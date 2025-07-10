const config = {
    type: Phaser.AUTO,
    width: 1366,
    height: 768,
    backgroundColor: '#2d2d2d',
    scene: {
        preload: preload,
        create: create,
        update: update
    },
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    }
};

const game = new Phaser.Game(config);

let gameCards = [];
let currentIndex = 0;
let cardWidth = 760;
let cardHeight = 460;
let cardSpacing = 40;
let cardXPositions = [];
let isDragging = false;
let startX = 0;
let dragDistance = 0;
let arrowLeft, arrowRight;

function preload() {
    this.load.image('bg', 'assets/bg3.png');
    this.load.image('arrowLeft', 'assets/panahKiri.png');
    this.load.image('arrowRight', 'assets/panahKanan.png');
    this.load.image('collectStar', 'assets/collectStar.png');
    this.load.image('ocong', 'assets/ocong.png');
    this.load.image('coinHunter', 'assets/coinHunter.png');
    this.load.image('shooter', 'assets/shooter.png');
    this.load.image('btnPlay', 'assets/btnPlay.png');
    this.load.audio('bgm', 'assets/bgm2.mp3');
}

function create() {
    this.add.image(config.width/2, config.height/2, 'bg').setAlpha(0.8);
    
    if (!this.bgm || !this.bgm.isPlaying) {
        this.bgm = this.sound.add('bgm', { loop: true });
        this.bgm.play();
    }

    const title = this.add.text(config.width/2, 90, 'GAME COLLECTION', {
        fontFamily: 'Poppins',
        fontSize: '48px',
        color: '#ffffff',
        fontWeight: 'bold',
        stroke: '#000000',
        strokeThickness: 5
    }).setOrigin(0.5);

    const games = [
        { 
            title: "Collect Star", 
            thumb: "collectStar", 
            url: "CollectStar/index.html",
            thumbSize: { width: 500, height: 340 },
            shadowSize: { width: 620, height: 540, offsetY: 50 },
            titleOffset: { y: 200 },
            btnOffset: { y: 260 }
        },
        { 
            title: "Ocong", 
            thumb: "ocong", 
            url: "EndlessRun/index.html",
            thumbSize: { width: 600, height: 360 },
            shadowSize: { width: 680, height: 550, offsetY: 50 },
            titleOffset: { y: 210 },
            btnOffset: { y: 270 }
        },
        { 
            title: "Coin Hunter", 
            thumb: "coinHunter", 
            url: "CoinHunter/index.html",
            thumbSize: { width: 600, height: 360 },
            shadowSize: { width: 680, height: 550, offsetY: 50 },
            titleOffset: { y: 210 },
            btnOffset: { y: 270 }
        },
        { 
            title: "Shooter", 
            thumb: "shooter", 
            url: "Shooter/index.html",
            thumbSize: { width: 300, height: 400 },
            shadowSize: { width: 460, height: 570, offsetY: 50 },
            titleOffset: { y: 240 },
            btnOffset: { y: 290 }
        }
    ];

    const startX = config.width / 2 - (games.length * (cardWidth + cardSpacing)) / 2 + cardWidth/2;

    games.forEach((game, index) => {
        const card = this.add.container(startX + index * (cardWidth + cardSpacing), config.height/2);
        
        // Get custom sizes or use defaults
        const thumbWidth = game.thumbSize?.width || cardWidth * 0.8;
        const thumbHeight = game.thumbSize?.height || cardHeight * 0.7;
        const shadowWidth = game.shadowSize?.width || thumbWidth + 20;
        const shadowHeight = game.shadowSize?.height || thumbHeight + 20;
        const shadowYOffset = game.shadowSize?.offsetY || 30;
        const titleYOffset = game.titleOffset?.y || thumbHeight/2 + 50;
        const btnYOffset = game.btnOffset?.y || thumbHeight/2 + 90;

        // Shadow with custom size and position
        const shadow = this.add.graphics();
        shadow.fillStyle(0x000000, 0.5);
        shadow.fillRoundedRect(
            -shadowWidth/2, 
            -shadowHeight/2 + shadowYOffset, 
            shadowWidth, 
            shadowHeight, 
            20
        );
        card.add(shadow);

        // Thumbnail centered in its shadow
        const thumb = this.add.image(0, shadowYOffset - (shadowHeight/2 - thumbHeight/1.6), game.thumb)
            .setDisplaySize(thumbWidth, thumbHeight)
            .setInteractive();
        card.add(thumb);

        // Title
        const titleText = this.add.text(0, titleYOffset, game.title, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#fff',
            fontWeight: 'bold'
        }).setOrigin(0.5);
        card.add(titleText);

        // Play button
        const playBtn = this.add.image(0, btnYOffset, 'btnPlay')
            .setDisplaySize(190, 60)
            .setInteractive()
            .on('pointerdown', () => {
                this.tweens.add({
                    targets: playBtn,
                    scaleX: 0.5,
                    scaleY: 0.5,
                    duration: 100,
                    yoyo: true,
                    onComplete: () => {
                        window.location.href = game.url;
                    }
                });
            });
        card.add(playBtn);

        gameCards.push(card);
        cardXPositions.push(card.x);
    });

    arrowLeft = this.add.image(50, config.height/2, 'arrowLeft')
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.tweens.add({
                targets: arrowLeft,
                scale: 0.18,
                duration: 100,
                yoyo: true,
                onComplete: () => navigate(-1, this)
            });
        })
        .setScale(0.2);

    arrowRight = this.add.image(config.width - 50, config.height/2, 'arrowRight')
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {
            this.tweens.add({
                targets: arrowRight,
                scale: 0.18,
                duration: 100,
                yoyo: true,
                onComplete: () => navigate(1, this)
            });
        })
        .setScale(0.2);

    this.input.on('pointerdown', (pointer) => {
        isDragging = true;
        startX = pointer.x;
        dragDistance = 0;
    });

    this.input.on('pointermove', (pointer) => {
        if (isDragging) {
            dragDistance = pointer.x - startX;
            gameCards.forEach((card, index) => {
                card.x = cardXPositions[index] + dragDistance;
            });
            updateArrowVisibility();
        }
    });

    this.input.on('pointerup', () => {
        if (isDragging) {
            isDragging = false;
            if (Math.abs(dragDistance) > 50) {
                const direction = dragDistance > 0 ? -1 : 1;
                navigate(direction, this);
            } else {
                animateCards(this);
            }
        }
    });

    animateCards(this);
    updateArrowVisibility();
}

function update() {
}

function navigate(direction, scene) {
    const newIndex = currentIndex + direction;
    if (newIndex >= 0 && newIndex < gameCards.length) {
        currentIndex = newIndex;
        animateCards(scene);
        updateArrowVisibility();
    }
}

function animateCards(scene) {
    const centerX = config.width / 2;
    gameCards.forEach((card, index) => {
        const distance = index - currentIndex;
        const targetX = centerX + (distance * (cardWidth + cardSpacing));
        cardXPositions[index] = targetX;

        scene.tweens.add({
            targets: card,
            x: targetX,
            scale: index === currentIndex ? 1 : 0.8,
            alpha: index === currentIndex ? 1 : 0.7,
            duration: 300,
            ease: 'Power2'
        });
    });
}

function updateArrowVisibility() {
    arrowLeft.setAlpha(currentIndex === 0 ? 0.5 : 1);
    arrowLeft.setInteractive(currentIndex !== 0);
    arrowRight.setAlpha(currentIndex === gameCards.length - 1 ? 0.5 : 1);
    arrowRight.setInteractive(currentIndex !== gameCards.length - 1);
}