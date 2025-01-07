<script>
    import { onMount } from "svelte";
    
    // Define a dictionary of text options
    export let textOptions = ["ELT Student", "Developer", "Translator", "Designer", "Editor"];
    
    // Current index of the displayed text
    let currentIndex = 0;
  
    // Change text every second
    onMount(() => {
      const interval = setInterval(() => {
        currentIndex = (currentIndex + 1) % textOptions.length;
      }, 2000);
  
      return () => clearInterval(interval); // Cleanup on unmount
    });
  </script>
  
  <style>

  .flip-container {
    margin: auto;
    margin-bottom: 25px;
    display: flex;
    justify-content: center;
    align-items: center;
    height: 50px;
    width: 200px;
    font-size: 1.5rem;
    text-align: center;
    overflow: hidden;
    position: relative;
    perspective: 1000px;
    border-radius: 8px;
    box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
  }

  
    .flip-text {
      position: absolute;
      backface-visibility: hidden;
      transition: transform 1s cubic-bezier(0.075, 0.82, 0.165, 1);
      transform-origin: center;
      width: 100%;
    }
  
    .flip-enter {
      transform: rotateX(90deg);
    }
  
    .flip-active {
      transform: rotateX(0deg);
    }
  
    .flip-exit {
      transform: rotateX(-90deg);
    }
  </style>
  
  <div class="flip-container">
    {#each textOptions as option, i}
      <div
        class="flip-text {i === currentIndex ? 'flip-active' : i < currentIndex ? 'flip-exit' : 'flip-enter'}"
        style="visibility: {i === currentIndex ? 'visible' : 'hidden'};"
      >
        {option}
      </div>
    {/each}
  </div>
  