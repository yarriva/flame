    window.onload = function () {

        // Wait for Cordova to load
        document.addEventListener("deviceready", onDeviceReady, false);

        // Cordova is ready - Cordova is loaded and it is now safe to make calls Cordova methods
        function onDeviceReady() {
        	var online = navigator.onLine;
			
			// TODO:
			if (!online){
				alert("Sorry, there is no connection to the Internet.");
				Application.Close();			
			}
			
            //Hardcoded... I know..
            var backgroundWidth = 49;
            var backgroundHeight = 34;
            var fireX = 24;
            var fireY = 29;            
            var initialParticlesNumber = 10;
			var particle_count = initialParticlesNumber;
			
			var isBigFire = false;

			var myTimer=setTimeout(StopBigFlame,10);  
            var canvas = document.getElementById("canvas");
            var ctx = canvas.getContext("2d");

            //Make the canvas occupy the full page
            var W = window.innerWidth, H = window.innerHeight;
            canvas.width = W;
            canvas.height = H;
            var x1, y1, r, t;

            //Lets create some particles now
            var particles = [];
            for (var i = 0; i < initialParticlesNumber; i++) {
                particles.push(new particle());
            }

            var snd = new Media("/android_asset/www/Audio/little-fire.mp3");  
            snd.play(); 
            snd.setVolume('0.2');
            var duration = 60000;          
            setInterval(function(){
            	snd.stop();
            	snd.play(); 
            },duration);

            setInterval(draw, 100);


            // Events region
            document.getElementById('hidden_button').addEventListener('touchstart', StartBigFlame, false);    
			
			document.getElementById('hidden_button').addEventListener('touchend', StopBigFlame, false);         


            // Funcitions region:
            function StartBigFlame() {
                if(particle_count < initialParticlesNumber * 5){
                	isBigFire = true;
	                snd.setVolume('1.0');
	                particle_count = initialParticlesNumber * 5;
	                for (var i = 0; i < particle_count; i++) {
	                    particles.push(new particle());
	                }
                }
                myTimer=setTimeout(StopBigFlame,10000);  
            }
            
            function StopBigFlame() {
                if(isBigFire){
	                isBigFire = false;
	                snd.setVolume('0.2');
	                particle_count = initialParticlesNumber;
	                particles.splice(0, particle_count);
	                particles.length = particle_count;  
	                clearTimeout(myTimer); 
                }              	
            }
            
            function particle() {
            	W = window.innerWidth, H = window.innerHeight;
            	
            	//Location
            	x1 = W / 2 - 10;
            	
            	// Determine Landscape or Portrait
	            if (W / H > backgroundWidth / backgroundHeight) {
	               	y1 = H - ((W / backgroundWidth) * backgroundHeight - (W / backgroundWidth) * (fireY));
	            }
	               	else {
	               	y1 = 0.86 * H - (backgroundHeight / backgroundWidth) * ((H - fireY) / H);
	            }
	            
	            //colors
	            this.r = 255;
	            this.g = 130;
	            this.b = 10;
            	            	
            	if(isBigFire){
		            //speed                
	                this.speed = { x: -1 + Math.random() * 2 * W / 480, y: -12 + Math.random() * 4 * W / 480};
	
	                //location
	                this.location = { x: x1 - 10 + Math.random() * 40, y: y1 + Math.random() * 5 };
	
	                //radius range
	                this.radius = (15 + Math.random() * 5 * W / 480);
	
	                //life range = 20-30
	                this.life = 1 + Math.random() * particle_count / 7;
	                this.remaining_life = this.life;
            	}
            	else{
	                //speed                
	                this.speed = { x: -1 + Math.random() * 2 * W / 480, y: -1 + Math.random() * 4 * W / 480};
	
	                //location	
	                this.location = { x: x1 + Math.random() * 20, y: y1 + Math.random() * 2 };
	
	                //radius range
	                this.radius = (8 + Math.random() * 5 * W / 480);
	
	                //life range = 20-30
	                this.life = 3 + Math.random() * 10;
	                this.remaining_life = this.life;
            	}                
            }

            function draw() {
                W = window.innerWidth, H = window.innerHeight;
                canvas.width = W;
                canvas.height = H;

                //Painting the canvas black particles are painted with "lighter"
                //In the next frame the background is painted normally without blending to the 
                //previous frame
                ctx.globalCompositeOperation = "destination-out";
                ctx.fillStyle = "black";
                ctx.fillRect(0, 0, W, H);
                ctx.globalCompositeOperation = "lighter";

                for (var i = 0; i < particles.length; i++) {
                    var p = particles[i];
                    ctx.beginPath();

                    //changing opacity according to the life.
                    //opacity goes to 0 at the end of life of a particle
                    p.opacity = Math.round(p.remaining_life / p.life * 100) / 100

                    //a gradient instead of white fill
                    var gradient = ctx.createRadialGradient(p.location.x, p.location.y, 0, p.location.x, p.location.y, p.radius);
                    gradient.addColorStop(0, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
                    gradient.addColorStop(0.5, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", " + p.opacity + ")");
                    gradient.addColorStop(1, "rgba(" + p.r + ", " + p.g + ", " + p.b + ", 0)");
                    ctx.fillStyle = gradient;
                    ctx.arc(p.location.x, p.location.y, p.radius, Math.PI * 2, false);
                    ctx.fill();

                    //lets move the particles
                    p.remaining_life--;
                    p.radius--;
                    p.location.x += p.speed.x;
                    p.location.y += p.speed.y;

                    //Smoke
                    p.r -= 5;
                    p.g += 10;
                    p.b += 20;

                    //regenerate particles
                    if (p.remaining_life < 0 || p.radius < 0) {
                        //a brand new particle replacing the dead one
                        particles[i] = new particle();
                    }
                }

                //Add glow
                glow();
            }

            function glow() {
                //location
                r = (x1 > y1 ? x1 : y1);
                r = (particle_count > initialParticlesNumber ? 1.5 * r : r);
                t = Math.random() * 0.02;

                var grd = ctx.createRadialGradient(x1 + 25, y1 - 25, 0, x1 + 25, y1 - 75, r * 6 / 8);
                grd.addColorStop(0, "rgba(255,222,171," + t + ")");
                grd.addColorStop(0.8, "rgba(255,222,171," + t + ")");
                grd.addColorStop(0.9, "rgba(0,0,0," + Math.random() * 0.05 + ")");
                grd.addColorStop(1, "rgba(0,0,0," + 0.2 + ")");

                ctx.fillStyle = grd;
                ctx.fillRect(0, 0, W, H);
            }
        }
    }