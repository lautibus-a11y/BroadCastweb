/**
 * BrodCastWeb - Core Logic (Robust Edition)
 */

console.log('BrodCastWeb: Script loading...');

document.addEventListener('DOMContentLoaded', () => {
    console.log('BrodCastWeb: DOM Ready, initializing modules...');
    
    // Safety Fallback: Ensure everything is visible after 3s no matter what
    setTimeout(() => {
        document.querySelectorAll('.revealed-failsafe, .s-card, .p-item, .t-step, .stat-card, .story-item').forEach(el => {
            if (getComputedStyle(el).opacity === '0') {
                el.style.opacity = '1';
                el.style.transform = 'translate(0,0)';
                el.style.visibility = 'visible';
                console.log('BrodCastWeb: Visibility fallback applied to', el);
            }
        });
    }, 3000);

    // Initialize modules with individual error catching
    try { initNeuralNetwork(); } catch (e) { console.error('Neural Network Error:', e); }
    try { initNavbarScroll(); } catch (e) { console.error('Navbar Error:', e); }
    try { initRevealAnimations(); } catch (e) { console.error('Reveal Error:', e); }
    try { initMobileMenu(); } catch (e) { console.error('Mobile Menu Error:', e); }
    try { initSmoothScroll(); } catch (e) { console.error('Smooth Scroll Error:', e); }
});

/**
 * Neural Network Background
 */
function initNeuralNetwork() {
    const canvases = document.querySelectorAll('.neural-canvas');
    if (canvases.length === 0) return;

    canvases.forEach(canvas => {
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        let particles = [];
        let animationId;
        const isSparse = canvas.classList.contains('sparse');
        const particleCount = isSparse ? 30 : 60;
        const connectionDistance = 150;
        const mouse = { x: -1000, y: -1000, radius: 150 };

        window.addEventListener('mousemove', (e) => {
            const rect = canvas.getBoundingClientRect();
            mouse.x = e.clientX - rect.left;
            mouse.y = e.clientY - rect.top;
        });

        class Particle {
            constructor() {
                this.reset();
            }
            reset() {
                this.x = Math.random() * canvas.width;
                this.y = Math.random() * canvas.height;
                this.vx = (Math.random() - 0.5) * 0.5;
                this.vy = (Math.random() - 0.5) * 0.5;
                this.radius = Math.random() * 2 + 1;
            }
            update() {
                this.x += this.vx;
                this.y += this.vy;
                if (this.x < 0 || this.x > canvas.width) this.vx *= -1;
                if (this.y < 0 || this.y > canvas.height) this.vy *= -1;

                const dx = mouse.x - this.x;
                const dy = mouse.y - this.y;
                const dist = Math.sqrt(dx * dx + dy * dy);
                if (dist < mouse.radius) {
                    this.x -= dx * 0.01;
                    this.y -= dy * 0.01;
                }
            }
            draw() {
                ctx.beginPath();
                ctx.arc(this.x, this.y, this.radius, 0, Math.PI * 2);
                ctx.fillStyle = '#00ffa3';
                ctx.globalAlpha = 0.6;
                ctx.fill();
            }
        }

        function resize() {
            const parent = canvas.parentElement;
            canvas.width = parent.offsetWidth || window.innerWidth;
            canvas.height = parent.offsetHeight || 600;
            
            // Ensure section has orientation for absolute canvas
            if (getComputedStyle(parent).position === 'static') {
                parent.style.position = 'relative';
            }
            
            particles = [];
            for (let i = 0; i < particleCount; i++) {
                particles.push(new Particle());
            }
        }

        function animate() {
            ctx.clearRect(0, 0, canvas.width, canvas.height);
            for (let i = 0; i < particles.length; i++) {
                particles[i].update();
                particles[i].draw();
                for (let j = i + 1; j < particles.length; j++) {
                    const dx = particles[i].x - particles[j].x;
                    const dy = particles[i].y - particles[j].y;
                    const dist = Math.sqrt(dx * dx + dy * dy);
                    if (dist < connectionDistance) {
                        ctx.beginPath();
                        ctx.moveTo(particles[i].x, particles[i].y);
                        ctx.lineTo(particles[j].x, particles[j].y);
                        ctx.strokeStyle = '#00ffa3';
                        ctx.globalAlpha = (1 - dist / connectionDistance) * 0.2;
                        ctx.lineWidth = 1;
                        ctx.stroke();
                    }
                }
            }
            animationId = requestAnimationFrame(animate);
        }

        window.addEventListener('resize', resize);
        resize();
        animate();
    });
}

/**
 * Navbar Scroll
 */
function initNavbarScroll() {
    const nav = document.getElementById('navbar');
    if (!nav) return;
    window.addEventListener('scroll', () => {
        nav.classList.toggle('scrolled', window.scrollY > 50);
    });
}

/**
 * Reveal Animations
 */
function initRevealAnimations() {
    const revealElements = document.querySelectorAll('.s-card, .p-item, .t-step, .stat-card, .story-item');
    
    // Set initial state
    revealElements.forEach(el => {
        if (!el.classList.contains('revealed')) {
            el.style.opacity = '0';
            el.style.transform = el.classList.contains('story-item') ? 'translateX(-30px)' : 'translateY(30px)';
        }
    });

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = '1';
                entry.target.style.transform = 'translate(0,0)';
                entry.target.classList.add('revealed');
                observer.unobserve(entry.target);
            }
        });
    }, { threshold: 0.1 });

    revealElements.forEach(el => observer.observe(el));
}

/**
 * Smooth Scroll
 */
function initSmoothScroll() {
    document.querySelectorAll('a[href^="#"]').forEach(anchor => {
        anchor.addEventListener('click', function (e) {
            e.preventDefault();
            const targetId = this.getAttribute('href');
            if (targetId === '#') return;
            const target = document.querySelector(targetId);
            if (target) {
                window.scrollTo({
                    top: target.offsetTop - 80,
                    behavior: 'smooth'
                });
            }
        });
    });
}

/**
 * Mobile Menu
 */
function initMobileMenu() {
    const toggle = document.querySelector('.menu-toggle');
    const navLinks = document.querySelector('.nav-links');
    if (!toggle || !navLinks) return;

    toggle.addEventListener('click', () => {
        toggle.classList.toggle('active');
        navLinks.classList.toggle('active');
    });

    navLinks.querySelectorAll('a').forEach(link => {
        link.addEventListener('click', () => {
            toggle.classList.remove('active');
            navLinks.classList.remove('active');
        });
    });
}
