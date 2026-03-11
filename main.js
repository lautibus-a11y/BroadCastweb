/**
 * BrodCastWeb - Core Logic
 */

document.addEventListener('DOMContentLoaded', () => {
    initNeuralNetwork();
    initNavbarScroll();
    initRevealAnimations();
    initMobileMenu();
});

/**
 * Neural Network Background Logic
 */
function initNeuralNetwork() {
    const canvases = document.querySelectorAll('.neural-canvas');
    if (canvases.length === 0) return;

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        let particles = [];
        let animationId;
        const particleCount = canvas.classList.contains('sparse') ? 40 : 80;
        const connectionDistance = 180;
        const mouse = { x: null, y: null, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        class Particle {
            constructor() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.4;
                this.vy = (Math.random() - 0.5) * 0.4;
                this.radius = Math.random() * 2 + 1;
            }

            update() {
                this.x += this.vx;
                this.y += this.vy;

                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                // Interaction with mouse
                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const distance = Math.sqrt(dx * dx + dy * dy);

                if (distance < mouse.radius) {
                    if (mouse.x < this.x && this.x < canvas.width - this.radius * 10) this.x += 0.5;
                    if (mouse.x > this.x && this.x > this.radius * 10) this.x -= 0.5;
                    if (mouse.y < this.y && this.y < canvas.height - this.radius * 10) this.y += 0.5;
                    if (mouse.y > this.y && this.y > this.radius * 10) this.y -= 0.5;
                }
            }

            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00ff88';
                ctx.globalAlpha = 0.5;
                ctx.fill();
            }
        }

        function init() {
            const parent = canvas.parentElement;
            const width = parent.offsetWidth || window.innerWidth;
            const height = parent.offsetHeight || 500;
            
            canvas.width = width;
            canvas.height = height;
            
            // Critical: Ensure parent has relative/absolute positioning
            if (getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            
            canvas.style.position = 'absolute';
            canvas.style.top = '0';
            canvas.style.left = '0';
            canvas.style.pointerEvents = 'none';
            canvas.style.zIndex = '1'; // Behind content (z-index 2)
            
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
            console.log(`Neural network initialized on ${canvas.className} (${width}x${height})`);
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);

            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();

                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const distance = Math.sqrt(dx * dx + dy * dy);

                    if (distance < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        const alpha = (1 - distance / connectionDistance) * 0.15;
                        ctx.strokeStyle = `rgba(0, 255, 136, ${alpha})`;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', () => {
            cancelAnimationFrame(animationId);
            init();
            animate();
        });

        init();
        animate();
    });
}

/**
 * Navbar Scroll Effect
 */
function initNavbarScroll() {
    const nav = document.getElementById('navbar');

    window.addEventListener('scroll', () => {
        if (window.scrollY > 50) {
            nav.classList.add('scrolled');
        } else {
            nav.classList.remove('scrolled');
        }
    });
}

/**
 * Reveal Animations on Scroll
 */
function initRevealAnimations() {
    const observerOptions = {
        threshold: 0.1
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    // Apply reveal to various elements
    const revealElements = document.querySelectorAll('.s-card, .p-item, .t-step, .stat-card, .story-item');
    revealElements.forEach((el, index) => {
        el.style.opacity = '0';
        el.style.transform = el.classList.contains('story-item') ? 'translateX(-30px)' : 'translateY(30px)';
        el.style.transition = 'all 0.8s cubic-bezier(0.16, 1, 0.3, 1)';

        // Cascading delay for story items if they are in the same container
        if (el.classList.contains('story-item')) {
            const itemIndex = Array.from(el.parentElement.children).indexOf(el);
            el.style.transitionDelay = `${itemIndex * 0.2}s`;
        }

        observer.observe(el);
    });

    // Custom CSS for revealed state
    const style = document.createElement('style');
    style.textContent = `
        .revealed {
            opacity: 1 !important;
            transform: translate(0, 0) !important;
            visibility: visible !important;
        }
    `;
    document.head.appendChild(style);

    // Fallback: If elements aren't revealed in 3 seconds, show them anyway
    setTimeout(() => {
        revealElements.forEach(el => {
            if (!el.classList.contains('revealed')) {
                el.classList.add('revealed');
                console.warn('Animation fallback triggered for', el);
            }
        });
    }, 2000);
}

/**
 * Smooth Scroll for Navigation Links
 */
document.querySelectorAll('a[href^="#"]').forEach(anchor => {
    anchor.addEventListener('click', function (e) {
        e.preventDefault();
        const targetId = this.getAttribute('href');
        if (targetId === '#') return;

        const targetElement = document.querySelector(targetId);
        if (targetElement) {
            window.scrollTo({
                top: targetElement.offsetTop - 80,
                behavior: 'smooth'
            });
        }
    });
});



/**
 * Mobile Menu Toggle
 */
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    const links = document.querySelectorAll('.nav-links a');

    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    links.forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}
