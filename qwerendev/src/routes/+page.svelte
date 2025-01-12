<script>
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { ArrowRight, Github, Linkedin, Mail, Moon, SquareTerminalIcon, Sun } from 'lucide-svelte';
    import HeroBackground from '$lib/HeroBackground.svelte';
    import Professions from '$lib/Professions.svelte';
    import { onMount } from 'svelte';
    import Status from '$lib/Status.svelte';
  
    let activeSection = 'home'; // Keeps track of which section is currently active
    let showMobileMenu = false; // Controls the visibility of the mobile menu
    let isDarkMode = true;
  
    // An array of objects representing different projects/works
    const works = [
      { 
        title: 'Content Warning Mods', 
        description: 'Mods I made for the game Content Warning.',
        subProjects: [
          { name: 'Where My Bell At?' },
          { name: 'Detailed Face Rotation' },
          { name: 'More Stamina' },
        ],
        image: '/cwmods.png?height=300&width=400',
        link: 'https://steamcommunity.com/id/erenyrd/myworkshopfiles/?appid=2881650'
      },
      { 
        title: 'Minecraft Mods', 
        description: 'Mods/Modpacks/Shaders I made for Minecraft.',
        subProjects: [
          { name: 'Brighter Accesibility' },
          { name: 'Poops And Farts' },
          { name: 'World Wide Wanders' },
        ],
        image: '/mcmods.png?height=300&width=400',
        link: 'https://modrinth.com/user/qweren'
      },
      { 
        title: 'FNF TR', 
        description: 'A translation mod for the game FNF.',
        image: '/friday-night-funkin.gif?height=300&width=400',
        link: 'https://gamebanana.com/mods/355919'
      },
      { 
        title: 'Personal Desktop Website', 
        description: 'A fun project i made that imitates Windows XP and has smaller projects i have hosted on it.', 
        image: '/personaldesktop.png?height=300&width=400',
        link: 'https://qweren.vercel.app'
      }
      
    ];
  
    // An array of strings representing hobbies
    const hobbies = ['Coding', 'Graphic Design', 'Translation', 'Modding Games'];
  
    // Function to smoothly scroll to a specified section of the page
    /** @param {string} section */
    function scrollToSection(section) {
      const element = document.getElementById(section);
      if (element) {
        element.scrollIntoView({ behavior: 'smooth' });
      }
      activeSection = section;
      showMobileMenu = false; // Close the mobile menu when a section is selected
    }
  
    // Function to toggle the visibility of the mobile menu
    function toggleMobileMenu() {
      showMobileMenu = !showMobileMenu;
    }
  
    // Handle initial dark mode setup and localStorage
    onMount(() => {
        // Apply dark mode class on initial load
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
            document.documentElement.classList.toggle('dark-mode', isDarkMode);
        } else {
            document.documentElement.classList.add('dark-mode');
        }
    });
  
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.documentElement.classList.toggle('dark-mode');
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  
    // Add smooth scroll behavior for the entire page
    const scrollConfig = {
        duration: 800,
        easing: quintOut
    };
  
    // Age calculator function
    /**
     * @param {string | number | Date} birthDate
     */
    function calculateAge(birthDate) {
        const today = new Date();
        const birth = new Date(birthDate);
        let age = today.getFullYear() - birth.getFullYear();
        const monthDiff = today.getMonth() - birth.getMonth();
        
        if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birth.getDate())) {
            age--;
        }
        
        return age;
    }

    const birthDate = '2006-01-05';
    $: age = calculateAge(birthDate);
  </script>
  
  <div class="app" class:dark-mode={isDarkMode}>
    <header>
      <!-- Logo link that scrolls to the home section -->
      <a href="/" class="logo" on:click={() => scrollToSection('home')}>
        <span class="sr-only">qweren</span> <!-- Screen reader text for accessibility -->
      </a>
      
      <!-- Navigation for desktop view -->
      <nav class="desktop-nav">
        {#each ['about', 'hobbies', 'projects'] as section}
          <a
            href="#{section}"
            class:active={activeSection === section}
            on:click|preventDefault={() => scrollToSection(section)}
          >
            {section.charAt(0).toUpperCase() + section.slice(1)} <!-- Capitalize the first letter of the section -->
          </a>
        {/each}
      </nav>
  
      <!-- Button to toggle the mobile menu -->
      <button class="mobile-menu-toggle" on:click={toggleMobileMenu}>
        <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
          <line x1="3" y1="12" x2="21" y2="12"></line>
          <line x1="3" y1="6" x2="21" y2="6"></line>
          <line x1="3" y1="18" x2="21" y2="18"></line>
        </svg>
      </button>
      
      <!-- Add dark mode toggle before the mobile menu button -->
      <button 
        class:dark={isDarkMode}
        on:click={toggleDarkMode} 
        class="theme-toggle"
        aria-label="Toggle dark mode"
      >
      </button>
    </header>
  
    <!-- Mobile menu, visible when showMobileMenu is true -->
    {#if showMobileMenu}
      <div class="mobile-menu" on:click={toggleMobileMenu} transition:fade={{ duration: 200 }}>
        <nav>
          {#each ['about', 'hobbies', 'works'] as section}
            <a
              href="#{section}"
              on:click|preventDefault={() => scrollToSection(section)}
            >
              {section.charAt(0).toUpperCase() + section.slice(1)} <!-- Capitalize the first letter of the section -->
            </a>
          {/each}
        </nav>
      </div>
    {/if}
  
    <main>
      <!-- Hero section for the homepage -->
      <section id="home" class="hero">
        <HeroBackground />
        <div class="container" in:fade={{ duration: 1000 }}>
          <h1>qweren</h1> <!-- Display the user's name -->
          <Professions/>
          <div class="cta-buttons">
            <!-- Button to navigate to the works section -->
            <a href="#works" class="button primary" on:click|preventDefault={() => scrollToSection('works')}>
              My Projects
              <ArrowRight class="icon" />
            </a>
            <!-- Button to navigate to the about section -->
            <a href="#about" class="button secondary" on:click|preventDefault={() => scrollToSection('about')}>
              About Me
            </a>
          </div>
        </div>
      </section>
  
      <!-- About section -->
      <section id="about" class="about">
        <div class="container">
          <Status {isDarkMode}/>

          <h2 in:fly={{ y: 50, duration: 1000 }}>About Me</h2>
          
          <div class="about-content" in:fly={{ y: 50, duration: 1000, delay: 200 }}>
            <!-- Personal Info -->
            <div class="personal-info">
                <p class="age-info">I'm {age} years old.</p>
                
                <div class="university-header">
                    <span>1st Year ELT Student at Ondokuz Mayıs University</span>
                    <a href="https://www.omu.edu.tr/" target="_blank" rel="noopener noreferrer">
                        <img 
                            src="https://upload.wikimedia.org/wikipedia/tr/c/c4/OM%C3%9C_logo.svg" 
                            alt="OMÜ Logo" 
                            class="institution-logo"
                        />
                    </a>
                </div>
            </div>

            <!-- Skills Section -->
            <div class="skills-section">
                <h3>Technical Skills</h3>
                <div class="skills-grid">
                    <div class="skill-item">
                        <a href="https://svelte.dev/" target="_blank" rel="noopener noreferrer">
                            <img 
                                src="https://svelte.dev/svelte-logo.svg" 
                                alt="Svelte" 
                                class="tech-logo"
                            />
                            <span>Svelte</span>
                        </a>
                    </div>
                    
                    <div class="skill-item">
                        <div class="web-trio">
                            <img 
                                src="https://www.w3.org/html/logo/badge/html5-badge-h-solo.png" 
                                alt="HTML5" 
                                class="tech-logo"
                            />
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/css3/css3-original.svg" 
                                alt="CSS3" 
                                class="tech-logo"
                            />
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/javascript/javascript-original.svg" 
                                alt="JavaScript" 
                                class="tech-logo"
                            />
                          </div>
                          <span>Web Technologies</span>
                    </div>

                    <div class="skill-item">
                        <a href="https://dotnet.microsoft.com/languages/csharp" target="_blank" rel="noopener noreferrer">
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/csharp/csharp-original.svg" 
                                alt="C#" 
                                class="tech-logo"
                            />
                            <span>C#</span>
                        </a>
                    </div>

                    <div class="skill-item">
                        <a href="https://www.python.org/" target="_blank" rel="noopener noreferrer">
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/python/python-original.svg" 
                                alt="Python" 
                                class="tech-logo"
                            />
                            <span>Python</span>
                        </a>
                    </div>

                    <div class="skill-item">
                        <a href="https://godotengine.org/" target="_blank" rel="noopener noreferrer">
                            <img 
                                src="https://cdn.jsdelivr.net/gh/devicons/devicon/icons/godot/godot-original.svg" 
                                alt="Godot" 
                                class="tech-logo"
                            />
                            <span>Godot</span>
                        </a>
                    </div>
                </div>
            </div>
          </div>
        </div>
      </section>
  
      <!-- Hobbies section -->
      <section id="hobbies" class="hobbies">
        <div class="container">
          <h2 in:fly={{ y: 50, duration: 1000 }}>Hobbies</h2>
          <div class="hobby-list">
            {#each hobbies as hobby, index}
              <div class="hobby-item" in:fly={{ x: 50, duration: 500, delay: index * 100 }}>
                {hobby} <!-- Display each hobby with a fly-in effect -->
              </div>
            {/each}
          </div>
        </div>
      </section>
  
    <!-- Works section -->
    <section id="works" class="works">
      <div class="container">
        <h2 in:fly={{ y: 50, duration: 1000 }}>Some Of My Projects</h2>
        <div class="work-grid">
          {#each works as work, index}
            <div class="work-item" in:fly={{ y: 50, duration: 500, delay: index * 100 }}>
              <img src="{work.image}" alt={work.title} /> <!-- Placeholder image for each project -->
              <div class="work-content">
                <h3>{work.title}</h3> <!-- Display the title of the work -->
                <p>{work.description}</p> <!-- Display the description of the work -->
                <button on:click={() => window.open(work.link, '_blank')} class="button">View Project</button> <!-- Button to view project -->
                {#if work.subProjects}
                  <div class="sub-projects">
                    {#each work.subProjects as subProject}
                      <div class="sub-project-card">
                        {subProject.name}
                      </div>
                    {/each}
                  </div>
                {/if}
              </div>
            </div>
          {/each}
        </div>
      </div>
    </section>
  
    <!-- Footer section with social links -->
    <footer>
      <p class="social-links">© 2024 Eren. All rights reserved.</p>
      <nav class="social-links">
        <a href="https://github.com/qweeren/" aria-label="GitHub">
          <Github /> <!-- GitHub icon link -->
        </a>
        <a href="https://steamcommunity.com/id/erenyrd/" aria-label="Steam">
          <img src="/steam.svg" style="width: 30px; height:30px;" alt="Steam"/> <!-- Steam icon link -->
        </a>
        <a href="https://open.spotify.com/user/15apjwc8ui4nhsc7lq90a4h7g?si=70824440834d46d5" aria-label="spotify">
          <img src="https://upload.wikimedia.org/wikipedia/commons/8/84/Spotify_icon.svg" style="width: 30px; height:30px;" alt="Spotify"/> <!-- Steam icon link -->
        </a>
      </nav>
    </footer>
  </div>
  
  <style>
    /* Base theme variables */
    :global(:root) {
        --bg-primary: #ffffff;
        --bg-secondary: #f8f9fa;
        --text-primary: #2d3436;
        --text-secondary: #636e72;
        --accent-primary: #0984e3;
        --accent-secondary: #0060a8;
        --card-bg: rgba(255, 255, 255, 0.95);
        --header-bg: rgba(255, 255, 255, 0.85);
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06);
        --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.1), 0 4px 6px -2px rgba(0, 0, 0, 0.05);
        --particle-color: 9, 132, 227;
        --bg-primary-rgb: 255, 255, 255;
        --bg-secondary-rgb: 248, 249, 250;
    }

    /* Dark mode variables */
    :global(.dark-mode) {
        --bg-primary: #1a1b1e;
        --bg-secondary: #2d2e32;
        --text-primary: #ffffff;
        --text-secondary: #a0a0a0;
        --accent-primary: #00b0ff;
        --accent-secondary: #0091ea;
        --card-bg: rgba(45, 46, 50, 0.95);
        --header-bg: rgba(26, 27, 30, 0.85);
        --shadow: 0 4px 6px -1px rgba(0, 0, 0, 0.2), 0 2px 4px -1px rgba(0, 0, 0, 0.12);
        --shadow-hover: 0 10px 15px -3px rgba(0, 0, 0, 0.2), 0 4px 6px -2px rgba(0, 0, 0, 0.1);
        --particle-color: 0, 176, 255;
        --bg-primary-rgb: 26, 27, 30;
        --bg-secondary-rgb: 45, 46, 50;
    }

    /* Base styles */
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-primary);
        color: var(--text-primary);
        -webkit-overflow-scrolling: touch;
    }

    /* Header styles */
    header {
        height: 60px;
        padding: 0 1rem;
        position: fixed;
        top: 0;
        left: 0;
        right: 0;
        display: flex;
        align-items: center;
        justify-content: space-between;
        background: var(--header-bg);
        backdrop-filter: blur(10px);
        z-index: 1000;
        border-bottom: 1px solid rgba(var(--particle-color), 0.1);
    }

    /* Logo styles */
    .logo {
        font-size: 2rem;
        text-decoration: none;
        margin-top: 13px;
        font-weight: 700;
        letter-spacing: -0.5px;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text; /* Vendor prefix for WebKit */
        background-clip: text; /* Standard property for compatibility */
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        padding: 0.5rem 0;
    }

    /* Navigation styles */
    .desktop-nav {
        display: none;
        gap: 2rem;
        position: absolute;
        left: 50%;
        transform: translateX(-50%);
    }

    .desktop-nav a {
        color: var(--text-primary);
        text-decoration: none;
        padding: 0.5rem 1rem;
        transition: color 0.3s ease;
    }

    /* Mobile menu styles */
    .mobile-menu-toggle {
        width: 40px;
        height: 40px;
        padding: 0.5rem;
        border-radius: 10px;
        background: rgba(var(--particle-color), 0.1);
        border: none;
        cursor: pointer;
    }

    .mobile-menu {
        position: fixed;
        top: 60px;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--header-bg);
        backdrop-filter: blur(10px);
        padding: 1rem;
        z-index: 999;
    }

    .mobile-menu nav {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .mobile-menu a {
        padding: 1rem;
        border-radius: 12px;
        background: rgba(var(--particle-color), 0.1);
        transition: all 0.3s ease;
        text-decoration: none;
        color: var(--text-primary);
    }

    /* Main content styles */
    main {
        flex: 1;
        margin-top: 60px;
    }

    /* Hero section styles */
    .hero {
        min-height: calc(100vh - 60px);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0;
        overflow: hidden;
    }

    .hero::before {
        content: '';
        position: absolute;
        top: 0;
        left: 0;
        right: 0;
        bottom: 0;
        background: radial-gradient(
            circle at center,
            rgba(var(--particle-color), 0.3) 0%, 
            rgba(var(--particle-color), 0.1) 50%,
            transparent 90%
        );
        z-index: 1;
        pointer-events: none;
    }

    .hero .container {
        position: relative;
        z-index: 2;
        text-align: center;
    }

    .hero h1 {
        font-size: clamp(2.5rem, 8vw, 4rem);
        font-weight: 800;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        position: relative;
        z-index: 1;
    }

    /* Work grid styles */
    .work-grid {
        display: grid;
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
    }

    .work-item {
        display: flex;
        flex-direction: column;
        border-radius: 24px;
        overflow: hidden;
        background: var(--card-bg);
        border: 1px solid rgba(var(--particle-color), 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
        -webkit-tap-highlight-color: transparent;
    }

    .work-item img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        object-position: center;
        margin: 0;
        transition: transform 0.4s ease;
    }

    .work-content {
        padding: 1.25rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    /* Button styles */
    .button {
        display: inline-flex;
        align-items: center;
        gap: 0.5rem;
        padding: 0.75rem 1.5rem;
        border-radius: 8px;
        font-weight: 500;
        text-decoration: none;
        transition: all 0.2s ease;
        border: none;
        cursor: pointer;
        min-height: 44px;
    }

    .button.primary {
        background: var(--accent-primary);
        color: white;
    }

    .button.secondary {
        background: rgba(var(--particle-color), 0.1);
        color: var(--accent-primary);
    }

    /* Skills section styles */
    .skills-section {
        margin-top: 2rem;
    }

    .skills-section h3 {
        font-size: 1.5rem;
        margin-bottom: 1.5rem;
        color: var(--text-primary);
    }

    .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(120px, 1fr));
        gap: 1.5rem;
        align-items: start;
    }

    .skill-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        padding: 1rem;
        background: var(--card-bg);
        border-radius: 16px;
        border: 1px solid rgba(var(--particle-color), 0.1);
        transition: all 0.3s ease;
    }

    .skill-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }

    .skill-item a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.75rem;
        text-decoration: none;
        color: var(--text-primary);
        width: 100%;
    }

    .tech-logo {
        height: 2.5rem;
        width: auto;
        transition: transform 0.3s ease;
    }

    .skill-item:hover .tech-logo {
        transform: scale(1.1);
    }

    .skill-item span {
        font-size: 0.9rem;
        font-weight: 500;
        text-align: center;
    }

    /* Web technologies trio styling */
    .web-trio {
        display: flex;
        flex-direction: row;
        margin-bottom: 20px;
        align-items: center;
        gap: 0.75rem;
    }

    .web-trio .tech-logo {
        height: 2rem;
    }

    .web-trio span {
        margin-top: 0.5rem;
    }

    /* Responsive adjustments */
    @media (max-width: 640px) {
        .skills-grid {
            grid-template-columns: repeat(2, 1fr);
        }
        
        .skill-item {
            padding: 0.75rem;
        }
        
        .tech-logo {
            height: 2rem;
        }
    }

    @media (min-width: 1024px) {
        .skills-grid {
            grid-template-columns: repeat(5, 1fr);
        }
    }

    /* Footer styles */
    footer {
        padding: 2rem 1rem;
        background: var(--bg-secondary);
        border-top: 1px solid rgba(var(--particle-color), 0.1);
    }

    .social-links {
        display: flex;
        justify-content: center;
        gap: 1.5rem;
    }

    .social-links a {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 50%;
        background: rgba(var(--particle-color), 0.1);
        transition: all 0.3s ease;
    }

    /* Media queries */
    @media (min-width: 640px) {
        .container {
            padding: 0 2rem;
        }

        .work-grid {
            grid-template-columns: repeat(2, 1fr);
        }

        .skills-grid {
            grid-template-columns: repeat(3, 1fr);
        }
    }

    @media (min-width: 768px) {
        .desktop-nav {
            display: flex;
        }

        .mobile-menu-toggle {
            display: none;
        }
    }

    @media (min-width: 1024px) {
        header {
            height: 70px;
            padding: 0 4rem;
        }

        main {
            margin-top: 70px;
        }

        .container {
            padding: 0 4rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        .work-grid {
            grid-template-columns: repeat(3, 1fr);
        }

        .skills-grid {
            grid-template-columns: repeat(5, 1fr);
        }

        section {
            padding: 6rem 2rem;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) {
        .work-item:hover,
        .button:hover {
            transform: none;
        }

        .work-item:active,
        .button:active {
            transform: scale(0.98);
        }
    }

    /* Safe area insets */
    @supports (padding: max(0px)) {
        header,
        .container,
        footer {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
        }

        footer {
            padding-bottom: max(2rem, env(safe-area-inset-bottom));
        }
    }

    /* Section containers */
    .container {
        width: 100%;
        margin: 0 auto;
        padding: 0 1rem;
    }

    section {
        padding: 4rem 1rem;
        position: relative;
    }

    /* Hover effects */
    .work-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }

    .button:hover {
        transform: translateY(-2px);
        box-shadow: var(--shadow-hover);
    }

    .social-links a:hover {
        background: rgba(var(--particle-color), 0.2);
        transform: translateY(-2px);
    }

    /* Sub-projects styling */
    .sub-projects {
        display: flex;
        flex-wrap: wrap;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .sub-project-card {
        background: rgba(var(--particle-color), 0.1);
        padding: 0.5rem 1rem;
        border-radius: 8px;
        font-size: 0.875rem;
        color: var(--text-secondary);
    }

    /* Section specific styles */
    .about-content {
        display: grid;
        gap: 2rem;
    }

    .personal-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .university-header {
        display: flex;
        align-items: center;
        gap: 1rem;
    }

    .institution-logo {
        height: 2.5rem;
        width: auto;
    }

    /* Additional hover effects for links */
    .desktop-nav a:hover {
        color: var(--accent-primary);
    }

    .mobile-menu a:hover {
        background: rgba(var(--particle-color), 0.2);
    }

    /* Restore any other missing styles... */

    /* Global styles */
    :global(body) {
        margin: 0;
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
    }

    /* Hero section fixes */
    .hero {
        min-height: calc(100vh - 60px);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0;
        overflow: hidden;
    }

    /* Make sure HeroBackground canvas is positioned correctly */
    :global(.hero canvas) {
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        z-index: 0;
    }

    /* Hobbies section */
    .hobby-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(250px, 1fr));
        gap: 1.5rem;
        padding: 1rem 0;
    }

    .hobby-item {
        background: var(--card-bg);
        padding: 1.5rem;
        border-radius: 16px;
        border: 1px solid rgba(var(--particle-color), 0.1);
        transition: all 0.3s ease;
        text-align: center;
        font-size: 1.1rem;
        box-shadow: var(--shadow);
    }

    .hobby-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }

    /* Dark mode switch */
    .theme-toggle {
        width: 40px;
        height: 40px;
        border-radius: 10px;
        border: none;
        background: rgba(var(--particle-color), 0.1);
        cursor: pointer;
        display: flex;
        align-items: center;
        justify-content: center;
        transition: all 0.3s ease;
        margin-right: 1rem;
        position: relative;
        font-size: 10px;
    }

    .theme-toggle::before {
        content: '';
        position: absolute;
        width: 25px;
        height: 25px;
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>');
        transition: transform 0.3s ease;
    }

    .theme-toggle.dark::before {
        background-image: url('data:image/svg+xml,<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>');
        transform: rotate(360deg);
    }


    /* Fix for hero gradient and content layering */
    .hero .container {
        position: relative;
        z-index: 2;
        text-align: center;
    }

    /* Ensure proper stacking of hero elements */
    :global(.hero > *) {
        position: relative;
        z-index: 1;
    }

    /* Dark mode transition */
    .app {
        transition: background-color 0.3s ease, color 0.3s ease;
    }

    /* Improved mobile dark mode switch */
    @media (max-width: 768px) {
        .theme-toggle {
            margin-right: 0.5rem;
        }
    }
  </style>