<script>
  import { getCurrentWord, getCurrentWordBounds } from './util';

  export let id;
  export let name;
  export let value;
  export let tags;

  let isFocus = false;
  let isOpen = false;
  let input = null;

  let suggestions = [];
  let selectedIndex = 0;

  function handleFocus() {
    isFocus = true;
  }

  function handleBlur() {
    isFocus = false;
    close();
  }

  function handleInput(e) {
    input = e.target;

    const word = getCurrentWord(input);

    suggestions = word ? tags.filter((tag) => tag.indexOf(word) === 0) : [];

    if (word && suggestions.length > 0) {
      open();
    } else {
      close();
    }
  }

  function handleKeyDown(e) {
    if (isOpen && (e.keyCode === 13 || e.keyCode === 9)) {
      const suggestion = suggestions[selectedIndex];
      complete(suggestion);
      e.preventDefault();
    }
    if (e.keyCode === 27) {
      close();
      e.preventDefault();
    }
    if (e.keyCode === 38) {
      updateSelection(-1);
      e.preventDefault();
    }
    if (e.keyCode === 40) {
      updateSelection(1);
      e.preventDefault();
    }
  }

  function open() {
    isOpen = true;
    selectedIndex = 0;
  }

  function close() {
    isOpen = false;
    suggestions = [];
    selectedIndex = 0;
  }

  function complete(suggestion) {
    const bounds = getCurrentWordBounds(input);
    const inputValue = input.value;
    value =
      inputValue.substring(0, bounds.start) +
      suggestion +
      inputValue.substring(bounds.end);

    close();
  }

  function updateSelection(dir) {
    const length = suggestions.length;
    let newIndex = selectedIndex + dir;

    if (newIndex < 0) newIndex = Math.max(length - 1, 0);
    if (newIndex >= length) newIndex = 0;

    selectedIndex = newIndex;
  }
</script>

<div class="form-autocomplete">
  <!-- autocomplete input container -->
  <div class="form-autocomplete-input form-input" class:is-focused={isFocus}>
    <!-- autocomplete real input box -->
    <input
      {id}
      {name}
      autofocus
      class="form-input input-sm"
      type="text"
      autocomplete="off"
      bind:value
      on:input={handleInput}
      on:keydown={handleKeyDown}
      on:focus={handleFocus}
      on:blur={handleBlur}
    />
  </div>

  <!-- autocomplete suggestion list -->
  <ul class="menu" class:open={isOpen && suggestions.length > 0}>
    <!-- menu list items -->
    {#each suggestions as tag, i}
      <li class="menu-item" class:selected={selectedIndex === i}>
        <a href="#" on:mousedown|preventDefault={() => complete(tag)}>
          <div class="tile tile-centered">
            <div class="tile-content">
              {tag}
            </div>
          </div>
        </a>
      </li>
    {/each}
  </ul>
</div>

<style>
  .menu {
    display: none;
    max-height: 200px;
    overflow: auto;
    font-size: 0.7rem;

    background: var(--base-200);
    color: var(--primary);
  }

  .menu.open {
    display: block;
  }

  /* TODO: Should be read from theme */
  .menu-item.selected > a {
    background: var(--base-300);
    color: var(--primary);
  }
</style>
