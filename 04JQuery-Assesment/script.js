(function($) {
    $.fn.blossom = function(customOptions) {
        var carousel = $(this);
        var liElements;
        var images;
        var numImgs;
        var orbs;
        var selectedOrb;
        var ulBox;
        var orbBox;
        var displayed = 0;
        var orbSel = 0;
        var inProgress = false;

        carousel.children("ul").addClass("ul-box");
        carousel.children("div").addClass("orb-box");

        ulBox = carousel.children(".ul-box")[0];
        orbBox = carousel.children(".orb-box")[0];
        liElements = carousel.children(".ul-box").children("li");
        images = $(liElements).children("img");
        numImgs = liElements.length;

        var defaultOptions = {
            carouselWidth: "400px",
            carouselHeight: "400px",
            orbColor: "#ccc",
            orbSelectColor: "#aaa",
            orbBoxColor: "white",
            orbAlignment: "center",
            animationStyle: "slide", //or "fade"
            animationSpeed: 1000,
            autoPlay: true,
            autoPlaySpeed: 3000,
            minimal: false
        };

        //merge options
        var options = $.extend({}, defaultOptions, customOptions);

        //generates the clickable orbs
        function generateOrbs() {
            var aTag = "";
            for (var i = 0; i < numImgs; i++) {
                aTag = document.createElement('a');
                aTag.setAttribute("class", "orb");
                aTag.setAttribute("href", "");
                aTag.setAttribute("name", "orb" + i);
                $(aTag).click(orbClick); // Apply eventListener to each orb
                if (i === 0) {
                    aTag.setAttribute("class", "orb selected");
                }
                orbBox.appendChild(aTag);
            }
            orbs = orbBox.children;
            orbBox.style.backgroundColor = options.orbBoxColor;
            orbBox.style.textAlign = options.orbAlignment;
        }

        //Update the Orb Colors and Selection
        function updateOrbs(direction) {
            if (direction == 1) {
                orbs[orbSel].setAttribute("class", "orb");
                orbSel++;
                orbSel = orbSel % numImgs;
                orbs[orbSel].setAttribute("class", "orb selected");
            }
            else if (direction == 0) {
                orbs[orbSel].setAttribute("class", "orb");
                if (orbSel == 0) {
                    orbSel = numImgs - 1;
                }
                else {
                    orbSel--;
                }
                orbs[orbSel].setAttribute("class", "orb selected");
            }
            updateSelectedOrb();
        }

        //moves the images when orb is clicked
        function orbClick(event) {
            event.preventDefault();
            var orb = $(this);
            if (orb.attr("name") === orbs[orbSel].name) {
                return;
            }
            if (inProgress)
                return;
            inProgress = true;
            if (options.autoPlay)
                clearInterval(timer);
            orbs[orbSel].setAttribute("class", "orb");

            if(options.animationStyle === "slide") {
                animateInitialImage();
                animateSelected(this);
            }
            if(options.animationStyle === "fade") {
                fadeSelected(this);
            }
            applyOrbCss();
        }

        //generates nav links
        function generateNav() {
            var navLeft = document.createElement('a');
            navLeft.setAttribute("href", " ");
            navLeft.setAttribute("class", "nav left");
            navLeft.innerHTML = "<";
            navLeft.style.lineHeight = options.carouselHeight;
            navLeft.style.height = options.carouselHeight;
            var navRight = document.createElement('a');
            navRight.setAttribute("href", " ");
            navRight.setAttribute("class", "nav right");
            navRight.innerHTML = ">";
            navRight.style.lineHeight = options.carouselHeight;
            navRight.style.height = options.carouselHeight;

            if(options.animationStyle === "slide"){
                $(navLeft).click(movePrev).hover(navHoverChange, navHoverRevert);
                $(navRight).click(moveNext).hover(navHoverChange, navHoverRevert);
            }else if(options.animationStyle === "fade"){
                $(navLeft).click(fadePrev).hover(navHoverChange, navHoverRevert);
                $(navRight).click(fadeNext).hover(navHoverChange, navHoverRevert);
            }
            
            $(carousel).append(navLeft);
            $(carousel).append(navRight);
        }

        //NAV event Handlers
        function navHoverChange() {
            $(this).css({
                "background-color": "rgba(50, 50, 50, 0.4)"
            });
        }

        function navHoverRevert() {
            $(this).css({
                "background-color": "rgba(50, 50, 50, 0.03)"
            });
        }

        //Moves images back
        function movePrev(event) {
            event.preventDefault();
            if (inProgress)
                return;
            inProgress = true;
            if (options.autoPlay)
                clearInterval(timer);
            if(!options.minimal){
                updateOrbs(0);
                applyOrbCss();
            }
            $(liElements[displayed]).animate({
                    marginLeft: "100%"
                },
                options.animationSpeed,
                function() {
                    this.removeAttribute("style");
                    this.setAttribute("class", "image");
                }
            );
            if (displayed == 0) {
                displayed = numImgs - 1;
            }
            else {
                displayed--;
            }
            liElements[displayed].style.marginLeft = "-100%"; //sets the following element in the right place temporarily
            animateNextImage();
        }

        //move images forward
        function moveNext(event) {
            // Since the interval also calls this method
            // there needs to be a check to decide
            // if this method is being called by a click or
            // by the interval
            if (event) {
                event.preventDefault();
            }
            if (inProgress)
                return;
            inProgress = true;
            if (options.autoPlay)
                clearInterval(timer);
            if(!options.minimal){
                updateOrbs(1);
                applyOrbCss();
            }
            animateInitialImage();
            displayed++;
            displayed = (displayed) % numImgs; //"wraparound" method, using the remainder
            animateNextImage();
        }

        //Functions that move the image, and next image
        function animateInitialImage() {
            $(liElements[displayed]).animate({
                    marginLeft: "-100%"
                },
                options.animationSpeed,
                function() {
                    this.removeAttribute("style");
                    this.setAttribute("class", "image");
                }
            );
        }

        function animateNextImage() {
            $(liElements[displayed]).animate({
                    marginLeft: "0%"
                },
                options.animationSpeed,
                function() {
                    this.removeAttribute("style");
                    this.setAttribute("class", "image visible");
                    updateSizes();
                    inProgress = false;
                    if (options.autoPlay)
                        timer = setInterval(moveNext, options.autoPlaySpeed);
                }
            );
        }
        
        //For orb click
        function animateSelected(orb){
            var found = false;
            var count = 0;
            while (!found && count < numImgs) {
                if (orbs[count].name === orb.name) {
                    orb.setAttribute("class", "orb selected");
                    orbSel = count;
                    displayed = count;
                    animateNextImage();
                    found = true; //stop the loop
                }
                else {
                    count++;
                }
            }
        }
        
        //Fade transitions
        function fadeNext(e){
            if(e){
                e.preventDefault();  
            }
            if(inProgress){
                return false;
            }
            inProgress = true;
            if(options.autoPlay){
                clearInterval(timer);
            }
            if(!options.minimal){
                updateOrbs(1);
                applyOrbCss();
            }
            $(liElements[displayed]).fadeOut(options.animationSpeed, function(){
                displayed++;
                displayed = (displayed) % numImgs;
                $(liElements[displayed]).fadeIn(options.animationSpeed, function(){
                    inProgress = false;
                    if(options.autoPlay){
                        timer = setInterval(fadeNext, options.autoPlaySpeed);
                    }
                });
            });

        }
        
        function fadePrev(e){
            if(e){
                e.preventDefault();  
            }
            if(inProgress){
                return false;
            }
            inProgress = true;
            if(options.autoPlay){
                clearInterval(timer);
            }
            if(!options.minimal){
                updateOrbs(0);
                applyOrbCss();
            }
            $(liElements[displayed]).fadeOut(options.animationSpeed, function(){
                if(displayed === 0){
                displayed = numImgs - 1;
                }else{
                    displayed--;   
                }
                $(liElements[displayed]).fadeIn(options.animationSpeed, function(){
                    inProgress = false;
                    if(options.autoPlay){
                        timer = setInterval(fadeNext, options.autoPlaySpeed);
                    }
                });
            });
        }

        function fadeSelected(orb){//For the orb click
            $(liElements[displayed]).fadeOut(options.animationSpeed, function(){
                var found = false;
                var count = 0;
                while (!found && count < numImgs) {
                    if (orbs[count].name === orb.name) {
                        orb.setAttribute("class", "orb selected");
                        orbSel = count;
                        displayed = count;
                        applyOrbCss();
                        fadeInSelected();
                        found = true; //stop the loop
                    }
                    else {
                        count++;
                    }
                }
            });
        }
        
        function fadeInSelected(){
            $(liElements[displayed]).fadeIn(options.animationSpeed, function(){
                inProgress = false;
                if(options.autoPlay){
                    timer = setInterval(fadeNext, options.autoPlaySpeed);
                }
            });
        }
        
        //minimal cleaning
        function minimalClean(){
            $(orbBox).remove();
        }

        //Update the selected orbs style
        function updateSelectedOrb() {
            selectedOrb = $(orbBox).children(".selected");
            selectedOrb[0].removeAttribute("style");
            selectedOrb[0].style.backgroundColor = options.orbSelectColor;
        }

        //update height and width of elements
        function updateSizes() {
            carousel.css("width", options.carouselWidth);
            //carousel.css("height", options.carouselHeight);
            ulBox.style.height = options.carouselHeight;
            $(liElements).css({
                "height": options.carouselHeight + "px"
            });
        }

        //Initial positioning
        function positionImages() {
            $(liElements).css({
                "margin-left": "100%"
            }).addClass("image visible");
            $(liElements[displayed]).css({
                "margin-left": "0%"
            });
        }
        
        //Initial fade positioning
        function fadePositionImages(){
            $(liElements).hide();
            $(liElements[displayed]).show();
        }

        //update orb colors with custom color
        function applyOrbCss() {
            for (var i = 0; i < numImgs; i++) {
                orbs[i].style.backgroundColor = options.orbColor;
            }
            updateSelectedOrb();
        }

        //adjusts css according to user Options
        function styleCss() {
            updateSizes();
            applyOrbCss();
        }

        //MAIN FLOW
        if(!options.minimal){
            generateOrbs();
            generateNav();
            styleCss();
        }else{
            minimalClean();
        }
        if(options.animationStyle === "slide"){
            positionImages();
            updateSizes();
            if (options.autoPlay) {
                var timer = setInterval(moveNext, options.autoPlaySpeed);
            }
        }else if(options.animationStyle === "fade"){
            fadePositionImages();
            updateSizes();
            if (options.autoPlay) {
                var timer = setInterval(fadeNext, options.autoPlaySpeed);
            }
        }
    };
}(jQuery));
