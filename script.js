document.addEventListener('DOMContentLoaded', () => {
    gsap.set('.top-bar', { yPercent: -120, autoAlpha: 0 });
    gsap.set('.artist-bar', { yPercent: 120, autoAlpha: 0 });
    gsap.set('.side-bar', { xPercent: -120, autoAlpha: 0 });
    gsap.set('.carousel__item', { autoAlpha: 0, scale: 0.8 });

    const tl = gsap.timeline({
        defaults: { ease: 'power2.out', duration: 1.4 },
        onComplete: () => {
            setupCarousel();
        }
    });

    tl.to('.top-bar', { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.2)' })
      .to('.artist-bar', { yPercent: 0, autoAlpha: 1, duration: 1.2, ease: 'back.out(1.2)' }, "-=0.9")
      .to('.side-bar', { xPercent: 0, autoAlpha: 1, duration: 1, ease: 'power3.out' }, "-=0.9")
      .to('.carousel__item', {
          autoAlpha: 1,
          scale: 1,
          stagger: { 
              amount: 0.6,
              from: 'center'
          },
          ease: 'back.out(1.4)',
          duration: 0.9
      }, "-=0.7");

    let carouselItems;
    let navButtons;
    let prevButton;
    let nextButton;
    let currentIndex;
    let isAnimating = false;
    let carouselTimeline;

    function setupCarousel() {
        carouselItems = document.querySelectorAll('.carousel__item');
        navButtons = document.querySelectorAll('.artist-bar__nav-button');
        prevButton = navButtons[0];
        nextButton = navButtons[1];
        currentIndex = 3;

        gsap.set('.carousel__item', { 
            willChange: 'transform, opacity',
            backfaceVisibility: 'hidden',
            perspective: 1000,
            transformStyle: 'preserve-3d'
        });

        updateCarousel(true);

        nextButton.addEventListener('click', () => !isAnimating && navigate(1));
        prevButton.addEventListener('click', () => !isAnimating && navigate(-1));
        
        document.addEventListener('keydown', (e) => {
            if (!isAnimating) {
                if (e.key === 'ArrowRight') navigate(1);
                else if (e.key === 'ArrowLeft') navigate(-1);
            }
        });
    }

    function navigate(direction) {
        isAnimating = true;
        
        if (carouselTimeline) carouselTimeline.kill();
        
        currentIndex = (currentIndex + direction + carouselItems.length) % carouselItems.length;
        updateCarousel();
    }

    function updateCarousel(isInitial = false) {
        const numItems = carouselItems.length;
        const duration = isInitial ? 0 : 0.75;
        
        carouselTimeline = gsap.timeline({
            defaults: {
                duration: duration,
                ease: 'power2.out',
                overwrite: 'auto'
            },
            onComplete: () => {
                isAnimating = false;
                carouselTimeline = null;
            }
        });

        const positions = [];
        
        for (let i = 0; i < carouselItems.length; i++) {
            const distance = (i - currentIndex + numItems) % numItems;
            const position = distance > numItems / 2 ? distance - numItems : distance;
            
            let xPercent, scale, zIndex, opacity, rotation, blur;
            const isMain = position === 0;
            
            if (isMain) {
                xPercent = 0;
                scale = 1;
                zIndex = 5;
                opacity = 1;
                rotation = 0;
                blur = 0;
            } else {
                const sign = Math.sign(position);
                const absPos = Math.abs(position);
                
                xPercent = (22 * absPos + 10 * (absPos - 1)) * sign;
                scale = 1 - (0.1 * absPos);
                zIndex = 5 - absPos;
                opacity = Math.max(0, 0.8 - (0.2 * (absPos - 1)));
                rotation = -5 * sign;
                blur = absPos > 2 ? 2 : absPos;
            }
            
            positions.push({ 
                item: carouselItems[i], 
                isMain, 
                props: { xPercent, scale, opacity, rotation, zIndex, blur }
            });
        }

        positions.forEach(pos => {
            if (pos.isMain) {
                gsap.set(pos.item, { className: 'carousel__item glass-container carousel__item--main' });
            } else {
                gsap.set(pos.item, { className: 'carousel__item glass-container' });
            }
        });

        if (isInitial) {
            positions.forEach(pos => {
                gsap.set(pos.item, {
                    xPercent: pos.props.xPercent,
                    scale: pos.props.scale,
                    opacity: pos.props.opacity,
                    rotation: pos.props.rotation,
                    zIndex: pos.props.zIndex,
                    filter: pos.props.blur > 0 ? `blur(${pos.props.blur}px)` : 'none'
                });
            });
        } else {
            positions.forEach((pos, i) => {
                carouselTimeline.to(pos.item, {
                    xPercent: pos.props.xPercent,
                    scale: pos.props.scale,
                    opacity: pos.props.opacity,
                    rotation: pos.props.rotation,
                    zIndex: pos.props.zIndex,
                    filter: pos.props.blur > 0 ? `blur(${pos.props.blur}px)` : 'none',
                    duration: duration,
                    ease: pos.isMain ? 'power2.out' : 'power1.inOut'
                }, 0);
            });
            
            const activeItem = carouselItems[currentIndex];
            carouselTimeline.to(activeItem, {
                scale: 1.02,
                duration: 0.2,
                ease: 'power1.out'
            }, `>-${duration * 0.1}`)
            .to(activeItem, {
                scale: 1,
                duration: 0.3,
                ease: 'power3.out'
            }, ">");
        }
    }
}); 