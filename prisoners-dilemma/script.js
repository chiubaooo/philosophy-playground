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

// 績效分數矩陣（分數越高越好）
const payoffMatrix = {
    'cooperate-cooperate': { player: 8, ai: 8 },
    'cooperate-betray': { player: 5, ai: 10 },
    'betray-cooperate': { player: 10, ai: 5 },
    'betray-betray': { player: 3, ai: 3 }
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
    const playerChoiceText = playerChoice === 'cooperate' ? '💪 認真工作' : '😴 擺爛摸魚';
    const aiChoiceText = aiChoice === 'cooperate' ? '💪 認真工作' : '😴 擺爛摸魚';

    document.getElementById('playerChoice').textContent = playerChoiceText;
    document.getElementById('aiChoice').textContent = aiChoiceText;
    document.getElementById('playerPenalty').textContent = `+${payoff.player} 分`;
    document.getElementById('aiPenalty').textContent = `+${payoff.ai} 分`;

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
    if (playerTotalScore > aiTotalScore) {
        analysis = `<h3>🎉 你贏了！</h3><p>你的總績效比同事高 ${playerTotalScore - aiTotalScore} 分。`;
    } else if (playerTotalScore < aiTotalScore) {
        analysis = `<h3>😔 同事贏了</h3><p>同事的總績效比你高 ${aiTotalScore - playerTotalScore} 分。`;
    } else {
        analysis = `<h3>🤝 平手！</h3><p>你和同事的總績效相同。`;
    }

    analysis += `</p><p><strong>你的策略：</strong>認真工作 ${cooperateCount} 次，擺爛摸魚 ${betrayCount} 次。</p>`;

    if (cooperateCount === 5) {
        analysis += `<p>💡 你選擇了完全認真的策略。雖然可能被同事佔便宜，但長期來看，認真工作能建立信任與好名聲。</p>`;
    } else if (betrayCount === 5) {
        analysis += `<p>💡 你選擇了完全擺爛的策略。短期內可能爽到，但長期會導致團隊互不信任，最終大家都受害。</p>`;
    } else {
        analysis += `<p>💡 你採用了混合策略。在團隊合作中，「以牙還牙」（Tit-for-Tat）策略最有效：一開始認真，之後模仿對方的態度。</p>`;
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
