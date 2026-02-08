// 遊戲狀態
let currentRound = 1;
let playerTotalScore = 0;
let aiTotalScore = 0;
let playerHistory = [];
let aiHistory = [];

// DOM 元素
const cooperateBtn = document.getElementById('cooperateBtn');
const betrayBtn = document.getElementById('betrayBtn');
const gameArea = document.getElementById('gameArea');
const result = document.getElementById('result');
const gameOver = document.getElementById('gameOver');
const nextBtn = document.getElementById('nextBtn');
const restartBtn = document.getElementById('restartBtn');

// 刑期矩陣
const payoffMatrix = {
    'cooperate-cooperate': { player: 1, ai: 1 },
    'cooperate-betray': { player: 3, ai: 0 },
    'betray-cooperate': { player: 0, ai: 3 },
    'betray-betray': { player: 2, ai: 2 }
};

// AI 策略：Tit-for-Tat
function getAIChoice() {
    if (currentRound === 1) {
        // 第一輪隨機選擇
        return Math.random() < 0.5 ? 'cooperate' : 'betray';
    } else {
        // 之後模仿玩家上一輪的選擇
        return playerHistory[playerHistory.length - 1];
    }
}

// 處理玩家選擇
function handleChoice(playerChoice) {
    const aiChoice = getAIChoice();
    const key = `${playerChoice}-${aiChoice}`;
    const payoff = payoffMatrix[key];

    // 記錄歷史
    playerHistory.push(playerChoice);
    aiHistory.push(aiChoice);

    // 更新分數
    playerTotalScore += payoff.player;
    aiTotalScore += payoff.ai;

    // 顯示結果
    showResult(playerChoice, aiChoice, payoff);

    // 隱藏選擇按鈕
    gameArea.style.display = 'none';
}

// 顯示本輪結果
function showResult(playerChoice, aiChoice, payoff) {
    const playerChoiceText = playerChoice === 'cooperate' ? '🤝 合作' : '⚔️ 背叛';
    const aiChoiceText = aiChoice === 'cooperate' ? '🤝 合作' : '⚔️ 背叛';

    document.getElementById('playerChoice').textContent = playerChoiceText;
    document.getElementById('aiChoice').textContent = aiChoiceText;
    document.getElementById('playerPenalty').textContent = `+${payoff.player} 年`;
    document.getElementById('aiPenalty').textContent = `+${payoff.ai} 年`;

    // 更新總分顯示
    document.getElementById('playerScore').textContent = playerTotalScore;
    document.getElementById('aiScore').textContent = aiTotalScore;

    result.style.display = 'block';
}

// 下一輪
function nextRound() {
    currentRound++;

    if (currentRound > 5) {
        endGame();
    } else {
        document.getElementById('currentRound').textContent = currentRound;
        result.style.display = 'none';
        gameArea.style.display = 'block';
    }
}

// 結束遊戲
function endGame() {
    result.style.display = 'none';
    gameOver.style.display = 'block';

    document.getElementById('finalPlayerScore').textContent = playerTotalScore;
    document.getElementById('finalAiScore').textContent = aiTotalScore;

    // 策略分析
    const cooperateCount = playerHistory.filter(c => c === 'cooperate').length;
    const betrayCount = playerHistory.filter(c => c === 'betray').length;

    let analysis = '';
    if (playerTotalScore < aiTotalScore) {
        analysis = `<h3>🎉 你贏了！</h3><p>你的總刑期比 AI 少 ${aiTotalScore - playerTotalScore} 年。`;
    } else if (playerTotalScore > aiTotalScore) {
        analysis = `<h3>😔 AI 贏了</h3><p>AI 的總刑期比你少 ${playerTotalScore - aiTotalScore} 年。`;
    } else {
        analysis = `<h3>🤝 平手！</h3><p>你和 AI 的總刑期相同。`;
    }

    analysis += `</p><p><strong>你的策略：</strong>合作 ${cooperateCount} 次，背叛 ${betrayCount} 次。</p>`;

    if (cooperateCount === 5) {
        analysis += `<p>💡 你選擇了完全合作的策略。在單次賽局中這可能不是最優解，但在重複賽局中，合作往往能帶來更好的長期結果。</p>`;
    } else if (betrayCount === 5) {
        analysis += `<p>💡 你選擇了完全背叛的策略。雖然短期內可能獲利，但在重複賽局中，這會導致雙方都陷入「互相背叛」的惡性循環。</p>`;
    } else {
        analysis += `<p>💡 你採用了混合策略。在囚徒困境中，「以牙還牙」（Tit-for-Tat）策略被證明是最有效的：第一次合作，之後模仿對方上一次的選擇。</p>`;
    }

    document.getElementById('analysis').innerHTML = analysis;
}

// 重新開始
function restart() {
    currentRound = 1;
    playerTotalScore = 0;
    aiTotalScore = 0;
    playerHistory = [];
    aiHistory = [];

    document.getElementById('currentRound').textContent = 1;
    document.getElementById('playerScore').textContent = 0;
    document.getElementById('aiScore').textContent = 0;

    gameOver.style.display = 'none';
    gameArea.style.display = 'block';
}

// 事件監聽
cooperateBtn.addEventListener('click', () => handleChoice('cooperate'));
betrayBtn.addEventListener('click', () => handleChoice('betray'));
nextBtn.addEventListener('click', nextRound);
restartBtn.addEventListener('click', restart);
