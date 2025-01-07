<script>
    import { fade, fly, slide } from 'svelte/transition';
    import { quintOut } from 'svelte/easing';
    import { ArrowRight, Github, Linkedin, Mail, Moon, Sun } from 'lucide-svelte';
    import HeroBackground from '$lib/HeroBackground.svelte';
    import { onMount } from 'svelte';
  
    let activeSection = 'home'; // Keeps track of which section is currently active
    let showMobileMenu = false; // Controls the visibility of the mobile menu
    let isDarkMode = true;
  
    // An array of objects representing different projects/works
    const works = [
      { 
        title: 'Project 1', 
        description: 'A brief description of the project and its key features.',
        subProjects: [
          { name: 'Sub Project A' },
          { name: 'Sub Project B' },
          { name: 'Sub Project C' },
        ],
        image: '/placeholder.svg?height=300&width=400'
      },
      { 
        title: 'Project 2', 
        description: 'Another project showcasing different skills and technologies.',
        image: '/placeholder.svg?height=300&width=400'
      },
      { 
        title: 'Project 3', 
        description: 'An innovative solution to a complex problem.',
        image: '/placeholder.svg?height=300&width=400'
      },
      { 
        title: 'Translator at Anime Who', 
        description: 'I translate anime subtitles from English to Turkish in my free time.',
        image: 'https://encrypted-tbn0.gstatic.com/images?q=tbn:ANd9GcTe7S-lB1vd1n9iATvj5skkR3O5fcEwZdFf_w&s'
      },
      { 
        title: 'Project 5', 
        description: 'An app that pushes the boundaries of user experience.',
        image: '/placeholder.svg?height=300&width=400'
      },
      { 
        title: 'Project 6', 
        description: 'A robust backend system with advanced features.',
        image: '/placeholder.svg?height=300&width=400'
      },
      
    ];
  
    // An array of strings representing hobbies
    const hobbies = ['Coding', 'Graphic Design', 'Anime Translation', 'Rhythm Games'];
  
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
        document.documentElement.classList.add('dark-mode');
        
        // Optional: If you want to persist user preference
        const savedTheme = localStorage.getItem('theme');
        if (savedTheme) {
            isDarkMode = savedTheme === 'dark';
            document.documentElement.classList.toggle('dark-mode', isDarkMode);
        }
    });
  
    function toggleDarkMode() {
        isDarkMode = !isDarkMode;
        document.documentElement.classList.toggle('dark-mode');
        // Optional: Save preference
        localStorage.setItem('theme', isDarkMode ? 'dark' : 'light');
    }
  
    // Add smooth scroll behavior for the entire page
    const scrollConfig = {
        duration: 800,
        easing: quintOut
    };
  
    // Age calculator function
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
        <span class="sr-only">Eren</span> <!-- Screen reader text for accessibility -->
        <span>Yördem</span> <!-- Placeholder initials, can be changed to your initials -->
      </a>
      
      <!-- Navigation for desktop view -->
      <nav class="desktop-nav">
        {#each ['about', 'hobbies', 'works'] as section}
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
          class="theme-toggle"
          class:dark={isDarkMode}
          on:click={toggleDarkMode} 
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
          <h1>Eren</h1> <!-- Display the user's name -->
          <p>ELT Student & Web Developer</p> <!-- Display user's title -->
          <div class="cta-buttons">
            <!-- Button to navigate to the works section -->
            <a href="#works" class="button primary" on:click|preventDefault={() => scrollToSection('works')}>
              My Works
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
                            <span>Web Technologies</span>
                        </div>
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
          <h2 in:fly={{ y: 50, duration: 1000 }}>My Works</h2>
          <div class="work-grid">
            {#each works as work, index}
              <div class="work-item" in:fly={{ y: 50, duration: 500, delay: index * 100 }}>
                <img src="{work.image}" alt={work.title} /> <!-- Placeholder image for each project -->
                <div class="work-content">
                  <h3>{work.title}</h3> <!-- Display the title of the work -->
                  <p>{work.description}</p> <!-- Display the description of the work -->
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
    </main>
  
    <!-- Footer section with social links -->
    <footer>
      <p>© 2024 Eren. All rights reserved.</p>
      <nav class="social-links">
        <a href="#" aria-label="GitHub">
          <Github /> <!-- GitHub icon link -->
        </a>
        <a href="#" aria-label="LinkedIn">
          <Linkedin /> <!-- LinkedIn icon link -->
        </a>
        <a href="#" aria-label="Email">
          <Mail /> <!-- Email icon link -->
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

    /* Apply background color to main elements */
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
        background-color: var(--bg-primary);
        color: var(--text-primary);
    }

    main {
        flex: 1;
        margin-top: 70px;
        background-color: var(--bg-primary);
    }

    section {
        background-color: var(--bg-primary);
    }

    .hero {
        min-height: calc(100vh - 70px);
        display: flex;
        align-items: center;
        justify-content: center;
        position: relative;
        padding: 0;
        overflow: hidden;
    }

    /* Add a pseudo-element for the gradient background */
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
        z-index: 1; /* Place above background, below content */
        pointer-events: none; /* Allow clicks to pass through */
    }

    /* Ensure hero content stays above gradient */
    .hero .container {
        position: relative;
        z-index: 2;
    }

    /* If you're using HeroBackground component, ensure proper z-index */
    :global(.hero HeroBackground) {
        z-index: 0;
    }

    /* Update card backgrounds */
    .work-item {
        background-color: var(--card-bg);
        color: var(--text-primary);
    }

    .hobby-item {
        background-color: var(--card-bg);
        color: var(--text-primary);
    }

    /* Update header background */
    header {
        background: var(--header-bg);
        backdrop-filter: blur(10px);
        color: var(--text-primary);
    }

    /* Update footer background */
    footer {
        background-color: var(--bg-secondary);
        color: var(--text-primary);
    }

    /* Modern CSS Reset and Improvements */
    :global(*) {
        box-sizing: border-box;
        -webkit-font-smoothing: antialiased;
        -moz-osx-font-smoothing: grayscale;
    }

    :global(body) {
        /* Enhanced color palette */
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
        scroll-behavior: smooth;
        scroll-padding-top: 80px; /* Account for fixed header */
        font-family: 'Inter', -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
        -webkit-font-smoothing: antialiased;
        margin: 0;
    }

    :global(body.dark-mode) {
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
    }

    /* Enhanced Header */
    header {
        height: 70px;
        padding: 0 2rem;
        border-bottom: 1px solid rgba(var(--particle-color), 0.1);
    }

    .logo {
        font-size: 1.25rem;
        font-weight: 700;
        letter-spacing: -0.5px;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        padding: 0.5rem 0;
    }

    /* Modern Card Styles */
    .work-item {
        border-radius: 12px;
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        background: var(--card-bg);
        border: 1px solid rgba(var(--particle-color), 0.1);
    }

    .work-item:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-hover);
    }

    .work-item img {
        border-radius: 12px 12px 0 0;
        transition: transform 0.4s ease;
    }

    .work-item:hover img {
        transform: scale(1.05);
    }

    /* Enhanced Button Styles */
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
    }

    .button.primary {
        background: var(--accent-primary);
        color: white;
    }

    .button.primary:hover {
        background: var(--accent-secondary);
        transform: translateY(-2px);
    }

    .button.secondary {
        background: rgba(var(--particle-color), 0.1);
        color: var(--accent-primary);
    }

    .button.secondary:hover {
        background: rgba(var(--particle-color), 0.15);
        transform: translateY(-2px);
    }

    /* Section Improvements */
    section {
        position: relative;
        padding: 6rem 0;
    }

    .hero {
    min-height: calc(100vh - 70px);
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative; /* Add this */
    padding: 0;
    overflow: hidden; /* Add this */
}

    /* Typography Enhancements */
    h1 {
        font-size: clamp(2.5rem, 5vw, 4rem);
        line-height: 1.1;
        margin-bottom: 1.5rem;
        font-weight: 800;
    }

    h2 {
        font-size: clamp(2rem, 4vw, 3rem);
        margin-bottom: 2rem;
        position: relative;
    }

    h2::after {
        content: '';
        position: absolute;
        bottom: -10px;
        left: 0;
        width: 60px;
        height: 4px;
        background: linear-gradient(90deg, var(--accent-primary), transparent);
        border-radius: 2px;
    }

    /* Mobile Menu Improvements */
    .mobile-menu {
        background: rgba(0, 0, 0, 0.95);
        backdrop-filter: blur(10px);
    }

    .mobile-menu a {
        font-size: 1.25rem;
        padding: 1rem 2rem;
        width: 100%;
        text-align: center;
        transition: all 0.3s ease;
    }

    .mobile-menu a:hover {
        background: rgba(255, 255, 255, 0.1);
    }

    /* Hobby Items Enhancement */
    .hobby-item {
        border-radius: 12px;
        padding: 1.5rem;
        background: var(--card-bg);
        transition: all 0.3s ease;
    }

    .hobby-item:hover {
        transform: translateY(-5px);
        box-shadow: var(--shadow-hover);
    }

    /* Footer Improvements */
    footer {
        background: var(--bg-secondary);
        color: var(--text-primary);
        padding: 2rem;
        border-top: 1px solid rgba(var(--particle-color), 0.1);
    }

    .social-links a {
        padding: 0.5rem;
        border-radius: 50%;
        transition: all 0.3s ease;
        background: rgba(var(--particle-color), 0.1);
        margin: 0 0.5rem;
    }

    .social-links a:hover {
        background: var(--accent-primary);
        transform: translateY(-3px);
    }

    /* Responsive Improvements */
    @media (min-width: 768px) {
        .container {
            padding: 0 4rem;
        }

        .desktop-nav a {
            position: relative;
            padding: 0.5rem 0;
        }

        .desktop-nav a::after {
            content: '';
            position: absolute;
            bottom: 0;
            left: 0;
            width: 0;
            height: 2px;
            background: var(--accent-primary);
            transition: width 0.3s ease;
        }

        .desktop-nav a:hover::after,
        .desktop-nav a.active::after {
            width: 100%;
        }
    }

    /* Scroll Bar Styling */
    :global(::-webkit-scrollbar) {
        width: 10px;
    }

    :global(::-webkit-scrollbar-track) {
        background: var(--bg-secondary);
    }

    :global(::-webkit-scrollbar-thumb) {
        background: var(--accent-primary);
        border-radius: 5px;
    }

    :global(::-webkit-scrollbar-thumb:hover) {
        background: var(--accent-secondary);
    }

    /* Base layout fixes */
    .app {
        min-height: 100vh;
        display: flex;
        flex-direction: column;
    }

    main {
        flex: 1;
        margin-top: 70px; /* Match header height */
    }

    /* Header layout fix */
    header {
        height: 70px;
        padding: 0 2rem;
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

    /* Navigation fixes */
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

    /* Mobile menu fixes */
    .mobile-menu {
        position: fixed;
        top: 70px;
        left: 0;
        right: 0;
        bottom: 0;
        background: var(--header-bg);
        backdrop-filter: blur(10px);
        display: flex;
        flex-direction: column;
        align-items: center;
        justify-content: center;
        z-index: 999;
    }

    /* Section layout fixes */
    section {
        padding: 4rem 2rem;
    }

    .container {
        max-width: 1200px;
        margin: 0 auto;
        width: 100%;
    }

    /* Work grid fix */
    .work-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem 0;
    }

    .work-item img {
    width: 100%;
    height: 200px;
    object-fit: cover;
    object-position: center;
    margin: 0;
    border-radius: 24px 24px 0 0; /* Match the card's top border radius */
    transition: transform 0.4s ease;
    border-radius: inherit; /* Remove this if you had it */
    border: none; /* Remove any borders if they existed */
}


    /* Hobby list fix */
    .hobby-list {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
        gap: 1.5rem;
    }

    /* Hero section fix */
    .hero {
        min-height: calc(100vh - 70px);
        display: flex;
        align-items: center;
        justify-content: center;
        text-align: center;
        position: relative;
        padding: 0;
    }

    .hero .container {
        position: relative;
        z-index: 2;
    }

    /* Button container fix */
    .cta-buttons {
        display: flex;
        gap: 1rem;
        justify-content: center;
        margin-top: 2rem;
    }

    /* Footer fix */
    footer {
        padding: 2rem;
        text-align: center;
        background: var(--bg-secondary);
    }

    .social-links {
        display: flex;
        justify-content: center;
        gap: 1rem;
        margin-top: 1rem;
    }

    /* Responsive fixes */
    @media (min-width: 768px) {
        .desktop-nav {
            display: flex;
        }

        .mobile-menu-toggle {
            display: none;
            color: var(--text-primary);
            outline: none;
        }
    }

    @media (max-width: 767px) {
        .work-grid {
            grid-template-columns: 1fr;
        }

        .hobby-list {
            grid-template-columns: 1fr;
        }

        .cta-buttons {
            flex-direction: column;
        }
    }

    /* Fix theme toggle button styling */
    .theme-toggle {
        display: flex;
        align-items: center;
        justify-content: center;
        width: 40px;
        height: 40px;
        border-radius: 50%;
        border: none;
        background: transparent;
        color: var(--text-primary);
        cursor: pointer;
        transition: all 0.2s ease;
        padding: 0;
        position: relative;
        z-index: 1000;
    }

    .theme-toggle:hover {
        background: rgba(var(--particle-color), 0.1);
    }

    /* Ensure icons are visible */
    :global(.theme-toggle svg) {
        width: 20px;
        height: 20px;
        color: var(--text-primary);
    }

    /* Update container to fill screen width */
    .container {
        max-width: 100%;
        padding: 0 2rem;
        margin: 0 auto;
        width: 100%;
    }

    /* Update work item styling */
    .work-item {
        display: flex;
        flex-direction: column;
        border-radius: 24px;
        overflow: hidden;
        background: var(--card-bg);
        border: 1px solid rgba(var(--particle-color), 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
        height: 100%;
    }

    .work-item:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-hover);
    }

    .work-content {
        padding: 1.5rem;
        flex: 1;
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .work-item img {
        width: 100%;
        height: 200px;
        object-fit: cover;
        object-position: center;
        margin: 0;
        border-radius: 24px 24px 0 0;
        transition: transform 0.4s ease;
    }

    .work-item:hover img {
        transform: scale(1.05);
    }

    .work-content h3 {
        margin: 0;
        font-size: 1.25rem;
        font-weight: 600;
    }

    .work-content p {
        margin: 0;
        color: var(--text-secondary);
        line-height: 1.5;
    }

    /* Update work grid for better spacing */
    .work-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem 0;
    }

    /* Ensure content is properly spaced */
    .work-content h3 {
        margin-top: 0.5rem;
        margin-bottom: 1rem;
    }

    .work-content p {
        flex: 1;
        margin: 0;
    }

    /* If you have sub-projects, adjust their container */
    .sub-projects {
        margin-top: auto; /* Push to bottom of content area */
        padding-top: 1rem;
    }

    /* Sub-projects styling */
    .sub-projects {
        display: flex;
        flex-direction: column;
        gap: 0.5rem;
        margin-top: 1rem;
    }

    .sub-project-card {
        padding: 0.75rem 1rem;
        background: rgba(var(--particle-color), 0.1);
        border-radius: 8px;
        transition: transform 0.3s ease, box-shadow 0.3s ease;
    }

    .sub-project-card:hover {
        transform: translateX(10px);
        background: rgba(var(--particle-color), 0.2);
    }

    /* Section backgrounds */
    section {
        background: rgba(var(--bg-primary-rgb), 0.8);
        backdrop-filter: blur(10px);
        margin: 2rem 0;
        border-radius: 20px;
    }

    footer {
        background: rgba(var(--bg-secondary-rgb), 0.8);
        backdrop-filter: blur(10px);
    }

    /* Dark mode toggle switch */
    .theme-toggle {
        width: 50px;
        height: 28px;
        border-radius: 14px;
        background: var(--bg-secondary);
        position: relative;
        border: none;
        cursor: pointer;
        padding: 0;
        overflow: hidden;
    }

    .theme-toggle::before {
        content: '';
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--accent-primary);
        top: 2px;
        left: 2px;
        transition: transform 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
    }

    .theme-toggle.dark::before {
        transform: translateX(22px);
    }

    /* Enhanced color system */
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
    }

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
    }

    /* Enhanced Work Items */
    .work-item {
        display: flex;
        flex-direction: column;
        border-radius: 24px;
        overflow: hidden;
        background: var(--card-bg);
        border: 1px solid rgba(var(--particle-color), 0.1);
        transition: all 0.4s cubic-bezier(0.4, 0, 0.2, 1);
    }

    .work-item:hover {
        transform: translateY(-8px);
        box-shadow: var(--shadow-hover);
    }

    .work-content {
        padding: 1.5rem;
    }

    .work-item img {
      width: 100%;
      height: 100%;
      border-radius: 24px;
      margin: 1.5rem auto;
      -o-object-fit: contain;
      object-fit: contain;
      border: 4px solid rgba(var(--particle-color), 0.1);
      transition: transform 0.4s ease;
      margin: 0;
    }

    /* Enhanced Section Styling */
    section {
        padding: 6rem 2rem;
        margin: 0;
        border-radius: 0;
        background: rgba(var(--bg-primary-rgb), 0.97);
        backdrop-filter: blur(20px);
    }

    /* Hero Section Enhancement */
    .hero {
        min-height: calc(100vh - 70px);
        display: flex;
        align-items: center;
        justify-content: center;
        background: transparent;
        padding: 0;
    }

    .hero h1 {
        font-size: clamp(3rem, 8vw, 5rem);
        font-weight: 800;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        position: relative;
        z-index: 1;
    }

    /* Sub-projects Enhancement */
    .sub-projects {
        margin-top: 1.5rem;
        display: grid;
        gap: 0.75rem;
    }

    .sub-project-card {
        padding: 1rem;
        background: rgba(var(--particle-color), 0.05);
        border-radius: 12px;
        transition: all 0.3s ease;
        border: 1px solid rgba(var(--particle-color), 0.1);
    }

    .sub-project-card:hover {
        transform: translateX(8px);
        background: rgba(var(--particle-color), 0.1);
    }

    /* Enhanced Typography */
    h1, h2, h3 {
        letter-spacing: -0.02em;
    }

    h2 {
        font-size: clamp(2rem, 4vw, 2.5rem);
        font-weight: 700;
        margin-bottom: 3rem;
    }

    h3 {
        font-size: 1.5rem;
        font-weight: 600;
        margin-bottom: 1rem;
    }

    /* Container Enhancement */
    .container {
        max-width: 1200px;
        margin: 0 auto;
        padding: 0 2rem;
        width: 100%;
    }

    /* Enhanced Header */
    header {
        height: 70px;
        background: var(--header-bg);
        backdrop-filter: blur(20px);
        border-bottom: 1px solid rgba(var(--particle-color), 0.1);
    }

    /* Enhanced Theme Toggle */
    .theme-toggle {
        width: 56px;
        height: 32px;
        border-radius: 16px;
        background: rgba(var(--particle-color), 0.1);
        position: relative;
        transition: background 0.3s ease;
        font-size: 16px; /* Control icon size */
    }

    .theme-toggle::before {
        content: '☀︎'; /* Default moon icon */
        position: absolute;
        width: 24px;
        height: 24px;
        border-radius: 50%;
        background: var(--accent-primary);
        top: 4px;
        left: 4px;
        transition: all 0.3s cubic-bezier(0.4, 0.0, 0.2, 1);
        box-shadow: 0 2px 4px rgba(0, 0, 0, 0.2);
        /* Center the icon */
        display: flex;
        align-items: center;
        justify-content: center;
        color: white; /* Icon color */
        line-height: 1;
    }

    .theme-toggle.dark::before {
        content: '☾'; /* Sun icon when in dark mode */
        transform: translateX(24px);
        background: var(--accent-secondary);
    }

    /* Enhanced Work Grid */
    .work-grid {
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(300px, 1fr));
        gap: 2rem;
        padding: 2rem 0;
    }

    /* Responsive Improvements */
    @media (max-width: 768px) {
        section {
            padding: 4rem 1rem;
        }

        .work-grid {
            grid-template-columns: 1fr;
            gap: 1.5rem;
        }

        .container {
            padding: 0 1rem;
        }
    }

    .university-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .university-logo {
        height: 1.5em; /* Same height as the text */
        width: auto;
        transition: transform 0.2s ease;
    }

    .university-logo:hover {
        transform: scale(1.1);
    }

    .about-content {
        display: flex;
        flex-direction: column;
        gap: 2rem;
    }

    .personal-info {
        display: flex;
        flex-direction: column;
        gap: 1rem;
    }

    .age-info {
        font-size: 1.1rem;
        color: var(--text-secondary);
    }

    .university-header {
        display: flex;
        align-items: center;
        gap: 0.5rem;
    }

    .skills-section {
        margin-top: 2rem;
    }

    .skills-grid {
        display: grid;
        grid-template-columns: repeat(auto-fit, minmax(150px, 1fr));
        gap: 1.5rem;
        margin-top: 1rem;
    }

    .skill-item {
        display: flex;
        flex-direction: column;
        align-items: center;
        text-align: center;
    }

    .skill-item a {
        display: flex;
        flex-direction: column;
        align-items: center;
        gap: 0.5rem;
        text-decoration: none;
        color: var(--text-primary);
        transition: transform 0.2s ease;
    }

    .skill-item a:hover {
        transform: translateY(-5px);
    }

    .tech-logo {
        height: 2.5rem;
        width: auto;
        transition: transform 0.2s ease;
    }

    .institution-logo {
        height: 1.5em;
        width: auto;
        transition: transform 0.2s ease;
    }

    .institution-logo:hover {
        transform: scale(1.1);
    }

    .web-trio {
        display: flex;
        flex-wrap: wrap;
        justify-content: center;
        gap: 0.5rem;
        align-items: center;
    }

    .web-trio .tech-logo {
        height: 2rem;
    }

    .web-trio span {
        width: 100%;
        margin-top: 0.5rem;
    }

    @media (max-width: 768px) {
        .skills-grid {
            grid-template-columns: repeat(2, 1fr);
        }
    }

    @media (max-width: 480px) {
        .skills-grid {
            grid-template-columns: 1fr;
        }
    }

    /* Update the hero section styles */
    .hero h1 {
        font-size: clamp(3rem, 8vw, 5rem);
        font-weight: 800;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        margin-bottom: 1rem;
        position: relative; /* For the pseudo-element positioning */
        z-index: 1; /* Ensure text stays above the glow */
    }

    /* Add the glow effect */
    .hero h1::before {
        content: 'Eren'; /* Same as the text */
        position: absolute;
        top: 0;
        left: 0;
        width: 100%;
        height: 100%;
        background: linear-gradient(45deg, var(--accent-primary), var(--accent-secondary));
        -webkit-background-clip: text;
        -webkit-text-fill-color: transparent;
        filter: blur(25px);
        opacity: 0.5;
        z-index: -1;
        animation: glowPulse 3s ease-in-out infinite;
    }

    /* Add a subtle animation to the glow */
    @keyframes glowPulse {
        0%, 100% {
            opacity: 0.5;
            filter: blur(25px);
        }
        50% {
            opacity: 0.7;
            filter: blur(30px);
        }
    }

    /* Mobile-first responsive design */

    /* Base container padding */
    .container {
        padding: 0 1rem;
        max-width: 100%;
    }

    /* Header adjustments */
    header {
        padding: 0 1rem;
        height: 60px; /* Slightly smaller on mobile */
    }

    /* Mobile menu improvements */
    .mobile-menu {
        padding: 1rem;
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
    }

    /* Hero section adjustments */
    .hero {
        min-height: calc(100vh - 60px);
        padding: 2rem 1rem;
        text-align: center;
    }

    .hero h1 {
        font-size: clamp(2.5rem, 8vw, 4rem);
    }

    .cta-buttons {
        flex-direction: column;
        gap: 1rem;
        padding: 0 1rem;
    }

    /* Work grid adjustments */
    .work-grid {
        grid-template-columns: 1fr;
        gap: 1.5rem;
        padding: 1rem 0;
    }

    .work-item {
        margin: 0 1rem;
    }

    .work-item img {
        height: 200px;
        width: 100%;
        object-fit: cover;
        border-radius: 24px 24px 0 0;
        margin: 0;
        border: none;
    }

    /* Skills section adjustments */
    .skills-grid {
        grid-template-columns: repeat(2, 1fr);
        gap: 1rem;
    }

    .tech-logo {
        height: 2rem;
    }

    /* Section spacing */
    section {
        padding: 3rem 1rem;
    }

    /* Typography adjustments */
    h2 {
        font-size: clamp(1.75rem, 4vw, 2.25rem);
        margin-bottom: 2rem;
    }

    h3 {
        font-size: 1.25rem;
    }

    /* Footer adjustments */
    footer {
        padding: 2rem 1rem;
    }

    .social-links {
        gap: 1.5rem;
    }

    /* Media queries for larger screens */
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

    @media (min-width: 1024px) {
        .container {
            padding: 0 4rem;
            max-width: 1200px;
            margin: 0 auto;
        }

        header {
            padding: 0 4rem;
            height: 70px;
        }

        .work-grid {
            grid-template-columns: repeat(3, 1fr);
        }

        .skills-grid {
            grid-template-columns: repeat(5, 1fr);
        }

        .cta-buttons {
            flex-direction: row;
        }

        section {
            padding: 6rem 2rem;
        }
    }

    /* Touch device optimizations */
    @media (hover: none) {
        .work-item:hover {
            transform: none;
        }

        .button:hover {
            transform: none;
        }

        /* Add active states for touch devices */
        .button:active {
            transform: scale(0.98);
        }

        .work-item:active {
            transform: scale(0.98);
        }
    }

    /* Safe area insets for modern mobile devices */
    @supports (padding: max(0px)) {
        header {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
        }

        .container {
            padding-left: max(1rem, env(safe-area-inset-left));
            padding-right: max(1rem, env(safe-area-inset-right));
        }

        footer {
            padding-bottom: max(2rem, env(safe-area-inset-bottom));
        }
    }

    /* Improved mobile menu button */
    .mobile-menu-toggle {
        width: 40px;
        height: 40px;
        padding: 0.5rem;
        border-radius: 10px;
        color: var(--accent-primary);
        border: none;
        outline: none;
        background: rgba(var(--particle-color), 0.1);
    }

    /* Smooth scrolling for iOS */
    .app {
        -webkit-overflow-scrolling: touch;
    }

    /* Better tap targets for mobile */
    .social-links a {
        min-width: 44px;
        min-height: 44px;
        display: flex;
        align-items: center;
        justify-content: center;
    }

    /* Prevent text size adjustment on orientation change */
    html {
        -webkit-text-size-adjust: 100%;
    }

    /* Improved button accessibility */
    .button {
        min-height: 44px;
        padding: 0.75rem 1.5rem;
    }

    /* Enhanced mobile card interaction */
    .work-item {
        -webkit-tap-highlight-color: transparent;
    }

    /* Better form factor for mobile devices */
    .work-content {
        padding: 1.25rem;
    }

    .sub-project-card {
        padding: 1rem;
        min-height: 44px;
    }
  </style>