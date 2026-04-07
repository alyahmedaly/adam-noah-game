import StartGame from './game/main.ts';

const app = document.querySelector<HTMLDivElement>('#app');

if (!app) {
    throw new Error('Missing #app container');
}

app.innerHTML = `
  <main class="game-shell">
    <section class="game-shell__stage">
      <div id="game-container"></div>
    </section>
  </main>
`;

void StartGame('game-container');
