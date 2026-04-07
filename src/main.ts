import StartGame from './game/main.ts';

const PASSWORD = '6767';
const SESSION_KEY = 'game_unlocked';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
    throw new Error('Missing #app container');
}

function launchGame() {
    app!.innerHTML = `
      <main class="game-shell">
        <section class="game-shell__stage">
          <div id="game-container"></div>
        </section>
      </main>
    `;
    void StartGame('game-container');
}

function showGate() {
    app!.innerHTML = `
      <div class="gate">
        <div class="gate__box">
          <div class="gate__emoji">🎮</div>
          <h1 class="gate__title">Adam &amp; Noah's Game</h1>
          <form class="gate__form" id="gate-form">
            <input
              class="gate__input"
              id="gate-input"
              type="password"
              placeholder="Enter password"
              autocomplete="off"
              autofocus
            />
            <button class="gate__btn" type="submit">Play ▶</button>
          </form>
          <p class="gate__error" id="gate-error"></p>
        </div>
      </div>
    `;

    const form = document.getElementById('gate-form') as HTMLFormElement;
    const input = document.getElementById('gate-input') as HTMLInputElement;
    const error = document.getElementById('gate-error') as HTMLParagraphElement;

    form.addEventListener('submit', (e) => {
        e.preventDefault();
        if (input.value === PASSWORD) {
            sessionStorage.setItem(SESSION_KEY, '1');
            launchGame();
        } else {
            error.textContent = 'Wrong password, try again!';
            input.value = '';
            input.focus();
        }
    });
}

if (sessionStorage.getItem(SESSION_KEY) === '1') {
    launchGame();
} else {
    showGate();
}
