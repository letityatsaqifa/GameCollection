var scenePlay = new Phaser.Class({
    Extends: Phaser.Scene,
    initialize: function(){
        Phaser.Scene.call(this, {"key": "scenePlay"});
    },
    init: function(){},
    preload: function(){
        this.load.image('chara', 'assets/images/chara.png');
        this.load.image('fg_loop_back', 'assets/images/fg_loop_back.png');
        this.load.image('fg_loop', 'assets/images/fg_loop.png');
        this.load.image('obstc', 'assets/images/obstc.png');
        this.load.image('panel_skor', 'assets/images/panel_skor.png');
        this.load.audio('snd_dead', 'assets/audio/dead.mp3');
        this.load.audio('snd_klik_1', 'assets/audio/klik_1.mp3');
        this.load.audio('snd_klik_2', 'assets/audio/klik_2.mp3');
        this.load.audio('snd_klik_3', 'assets/audio/klik_3.mp3');
        this.load.image('game_over', 'assets/images/gameover3.png');
    },

    create: function(){
        //membuat variabel sound ketika karakter bertabrakan dgn halangan
        this.snd_dead = this.sound.add('snd_dead');
        //membuat variabel sound, dimasukkan ke dlm array krn akan dimainkan acak salah satu ketika karakter diklik
        this.snd_click = [];
        this.snd_click.push(this.sound.add('snd_klik_1'));
        this.snd_click.push(this.sound.add('snd_klik_2'));
        this.snd_click.push(this.sound.add('snd_klik_3'));
        //mengatur volume halaman menjadi 50%
        for(let i = 0; i < this.snd_click.length; i++){
            this.snd_click[i].setVolume(0.5);
        }
        this.timerHalangan = 0;
        this.halangan = [];

        this.background =[];

        //variabel pengganti angka 
        var bg_x = 1366/2;

        //perulangan sebnayak 2x
        for(let i = 0; i < 4; i++){
            //array bg baru
            var bg_awal = [];
            //membuat bg dan foreground
            var BG = this.add.image(bg_x, 768/2, 'fg_loop_back');
            var FG = this.add.image(bg_x, 768/2, 'fg_loop');
            //menambahkan custom data
            BG.setData('kecepatan', 2);
            FG.setData('kecepatan', 4);
            FG.setDepth(2);
            //memasukkan bg dan fg ke dalam array baru
            bg_awal.push(BG);
            bg_awal.push(FG);
            //memasukkan array bg
            this.background.push(bg_awal);
            //menambahkan nilai bg_x utk perulangan selanjutnya
            bg_x += 1366;
        }

        //menambahkan variabel global
        this.isGameRunning = false;

        //menambahkan sprite karakter dalam game
        this.chara = this.add.image(130, 768/2, 'chara');
        this.chara.setDepth(3);

        //membuuat scale karakter menjadi 0 (tidak terlihat)
        this.chara.setScale(0);

        //membuat objek pengganti this, karena this tidak dapat di akses
        //dari onComplete ataupun sebuah fungsi secara langsung
        var myScene = this;

        //aniamsi scale karakter menjadi 1 (terlihat di tampilan)
        //kemudian mengubah nilai this.isGameRunning menjadi true setelah animasi selesai onComplete
        this.tweens.add({
            delay: 250,
            targets: this.chara,
            ease: 'Back.Out',
            duration: 500,
            scaleX: 1,
            scaleY: 1,
            onComplete: function(){
                myScene.isGameRunning = true;
            }
        });

        //initialisasi variabel global this.score dgn nilai awal 0
        this.score = 0;

        //membuat panel nilai
        this.panel_score = this.add.image(0 + 200, 90, 'panel_skor');
        this.panel_score.setOrigin(0.5);
        this.panel_score.setDepth(10);
        this.panel_score.setAlpha(0.8);

        //membuat label nilai pada panel dgn nilai yg diambil dari variabel this.score
        this.label_score = this.add.text(0 + 130, this.panel_score.y, this.score);
        this.label_score.setOrigin(0, 0.5);
        this.label_score.setDepth(10);
        this.label_score.setFontSize(30);
        this.label_score.setTint(0xff732e);

        this.gameOver = function(){
            // Menampilkan gambar game over di tengah layar
            let gameOverImg = myScene.add.image(1366 / 2, 768 / 2, 'game_over');
            gameOverImg.setScale(0);
            gameOverImg.setDepth(20); // biar tampil di atas elemen lain
        
            // Animasi muncul dari kecil ke besar
            myScene.tweens.add({
                targets: gameOverImg,
                ease: 'Back.Out',
                duration: 800,
                scale: 1,
                onComplete: function(){
                    // Setelah delay beberapa detik, baru pindah ke sceneMenu
                    myScene.time.delayedCall(2000, function(){
                        // menyimpan highscore
                        let highscore = localStorage["highscore"] || 0;
                        if(myScene.score > highscore){
                            localStorage["highscore"] = myScene.score;
                        }
                        myScene.scene.start('sceneMenu');
                    });
                }
            });
        }        

        //menambahkan deteksi ketika pointer dilepakan utk menurunkan karakter ketika user melepaskan klik
        this.input.on('pointerup', function(pointer, currentlyOver){
            //jika this.isGameRunning bernilai false, maka kode di bawahnya tidak akan dijalankan
            if(!this.isGameRunning) return;

            //acak sound dalam array (0-2)
            this.snd_click[Math.floor((Math.random() * 2))].play();

            this.charaTweens = this.charaTweens = this.tweens.add({
                targets: this.chara,
                ease: 'Power1',
                duration: 750,
                y: this.chara.y + 200
            });
        }, this);
    },
    update: function(){
        //sama saja dengan if (this.isDameRunning == true)
        if (this.isGameRunning) {
            //karakter
            //sifat karakter, naik 5 pixel setiap frame
            //sama dengan this.chara.y = this.chara.y - 5;
            this.chara.y -= 5;

            //batas karakter agar karakter tidak bisa jatuh ke bawah 
            if(this.chara.y > 690) this.chara.y = 690;

            //mengakses array
            for(let i = 0; i < this.background.length; i ++){
                //mengakses array di dalam array
                for(var j = 0; j < this.background[i].length; j++){
                    //mengambil data kecepatan, lalu mengurangi nilai x sebnayak kecepatan tersebut
                    this.background[i][j].x -= this.background[i][j].getData('kecepatan');
                    //atur ulang posisi jika sudah berada di kiri canvas krn titik posisi adl tengah dan bg adl 1366 maka bg akan tdk terlihat ketika mencapai posisi minus 1366.2
                    if(this.background[i][j].x <= -(1366/2)){
                        //digunakan utk mengatur ulang posisi agar tidak ada jarak antara bg
                        var diff = this.background[i][j].x = 1366 + 1366/2 + diff;
                    }
                }
            }

            //jika this.timerHalangan adalah 0, maka buat peluru baru
            if(this.timerHalangan == 0){
                //mendapatkan angka acak antara 60 sampai 680
                var acak_y = Math.floor((Math.random() * 680) + 60);
                //membuat peluru baru dgn posisi x 1500 dan posisi y acak antara 60 sampai 680
                var halamanBaru = this.add.image(1500, acak_y, 'obstc');
                //mengubah titik posisi berada di kiri, bukan di tengah
                halamanBaru.setOrigin(0, 0);
                halamanBaru.setData("status_aktif", true);
                halamanBaru.setData("kecepatan", Math.floor((Math.random() * 15) + 15));
                halamanBaru.setDepth(5);
                //memasukkan peluru ke dalam array agar dapat di akses kembali
                this.halangan.push(halamanBaru);
                //mengatur ulang waktu utk memunculkan halangan selanjutnya acak antara 10 - 50 frame
                this.timerHalangan = Math.floor((Math.random() * 50) + 10);
            }

            //mengakses array halangan 
            for(let i = this.halangan.length - 1; i >= 0; i--){
                //menggerakkan halangan sebanyak kecepatan perframe
                this.halangan[i].x -= this.halangan[i].getData("kecepatan");
                //jika halangan sudah di posisi kurang dari - 200 (sudah tidak terlihat)
                if(this.halangan[i].x < -200){
                    //hancurkan halangan utk mengurandi beban memori
                    this.halangan[i].destroy();
                    this.halangan.splice(i, 1);
                    break;
                }
            }

            //mengurangi timer halangan sebanyak 1 setiap framenya jika sudah 0
            this.timerHalangan--;

            for(var i = this.halangan.length - 1; i >= 0; i--){
                //jika posisi halangan +50 lebih kecil dari karakter dan status halangan masih aktif
                if(this.chara.x > this.halangan[i].x + 50 && this.halangan[i].getData("status_aktif") == true){
                    //ubah status halangan menjadi tidak aktif
                    this.halangan[i].setData("status_aktif", false);
                    //tambahkan nilai sebanyak 1 poin 
                    this.score++;
                    //ubah label menjadi nilai terbaru
                    this.label_score.setText(this.score);
                }
            }

            for(let i = this.halangan.length - 1; i >= 0; i--){
                //jika rect chara mengenai titik posisi halangan
                if(this.chara.getBounds().contains(this.halangan[i].x, this.halangan[i].y)){
                    //ubah status halnagn menjadi tidak aktif
                    this.halangan[i].setData("status_aktif", false);
                    //ubah status game
                    this.isGameRunning= false;
                    //memainkan suara karakter kalah
                    this.snd_dead.play();
                    //malakukan cek variabel penampung animasi karakter sebelum mebghentika animasi karakter
                    if(this.charaTweens != null){
                        this.charaTweens.stop();
                    }
                    //membuat object pengganti this karena this tdk bisa diakses pada onComplete secara langsung
                    var myScene = this;
                    //membuat animasi kalah
                    this.charaTweens = this.tweens.add({
                        targets: this.chara,
                        ease: 'Elastic.easeOut',
                        duration: 2000,
                        alpha: 0,
                        //memanggil fungsi gameOver setelah animasi selesai
                        onComplete: myScene.gameOver
                    });
                    //menghentikan looping jika sudah terpenuhi pengecekannya
                    break;
                }
            }

            if(this.chara.y< -50){
                //ubah status game
                this.isGameRunning = false;
                //memainkan suara karakter kalah
                this.snd_dead.play();
                //melakukan cek variabel penampung animasi karakter sebelum menghentikan animasi karakter
                if(this.charaTweens != null){
                    this.charaTweens.stop();
                }
                //membuat object pengganti this
                let myScene =this;
                //membuat animasi kalah
                this.charaTweens = this.tweens.add({
                    targets: this.chara,
                    ease: 'Elastic.easeOut',
                    duration: 2000,
                    alpha: 0,
                    //memanggil fungsi game over setelah animasi selesai
                    onComplete: myScene.gameOver
                });
            }
        }
    }
});