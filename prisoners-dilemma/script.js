// 遊戲狀態
let currentRound = 1;
let totalRounds = Math.floor(Math.random() * 41) + 10; // 隨機 10-50 輪
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
const restartBtn = document.getElementById('restartBtn');

// 績效分數矩陣（分數越高越好）
const payoffMatrix = {
    'cooperate-cooperate': { player: 8, ai: 8 },
    'cooperate-betray': { player: 5, ai: 10 },
    'betray-cooperate': { player: 10, ai: 5 },
    'betray-betray': { player: 3, ai: 3 }
};

// AI 人格類型（遊戲開始時隨機選擇）
let aiPersonality = '';
let aiMood = 'normal'; // AI 情緒狀態：normal, frustrated, confident
let consecutiveLosses = 0; // AI 連續失利次數

const personalities = {
    'honest': { name: '老實人', desc: '總是認真工作' },
    'opportunist': { name: '投機者', desc: '前期認真，後期擺爛' },
    'random': { name: '隨機者', desc: '完全隨機選擇' },
    'retaliator': { name: '報復者', desc: '以牙還牙策略' },
    'slacker': { name: '懶人', desc: '總是擺爛' }
};

// AI 策略決策
function getAiChoice() {
    if (!aiPersonality) {
        // 第一輪：隨機選擇人格（權重分配）
        const rand = Math.random();
        if (rand < 0.05) aiPersonality = 'honest';
        else if (rand < 0.35) aiPersonality = 'opportunist';
        else if (rand < 0.60) aiPersonality = 'random';
        else if (rand < 0.95) aiPersonality = 'retaliator';
        else aiPersonality = 'slacker';
    }

    // 檢查情緒變化（每輪 10% 機率情緒波動）
    if (Math.random() < 0.1) {
        if (consecutiveLosses >= 2) {
            aiMood = 'frustrated'; // 連續失利 → 沮喪
        } else if (aiTotalScore > playerTotalScore + 5) {
            aiMood = 'confident'; // 大幅領先 → 自信
        } else {
            aiMood = 'normal';
        }
    }

    let baseChoice = '';

    switch (aiPersonality) {
        case 'honest':
            baseChoice = 'cooperate';
            break;

        case 'slacker':
            baseChoice = 'betray';
            break;

        case 'opportunist':
            // 前半段認真，後半段擺爛
            baseChoice = currentRound <= Math.ceil(totalRounds / 2) ? 'cooperate' : 'betray';
            break;

        case 'random':
            baseChoice = Math.random() < 0.5 ? 'cooperate' : 'betray';
            break;

        case 'retaliator':
            // 以牙還牙：第一輪隨機，之後模仿玩家上一輪
            if (playerHistory.length === 0) {
                baseChoice = Math.random() < 0.5 ? 'cooperate' : 'betray';
            } else {
                baseChoice = playerHistory[playerHistory.length - 1];
            }
            break;

        default:
            baseChoice = 'cooperate';
    }

    // 情緒影響決策
    if (aiMood === 'frustrated') {
        // 沮喪時：30% 機率改變策略（報復性擺爛）
        if (Math.random() < 0.3) {
            return 'betray';
        }
    } else if (aiMood === 'confident') {
        // 自信時：20% 機率變得更合作（展現大度）
        if (Math.random() < 0.2) {
            return 'cooperate';
        }
    }

    return baseChoice;
}

// 處理玩家選擇
function handleChoice(playerChoice) {
    // 禁用按鈕防止重複點擊
    cooperateBtn.disabled = true;
    betrayBtn.disabled = true;

    const aiChoice = getAiChoice();
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

    // 追蹤 AI 連續失利
    if (payoff.ai < payoff.player) {
        consecutiveLosses++;
    } else {
        consecutiveLosses = 0;
    }

    result.style.display = 'block';

    // 自動進入下一輪（延遲 1.5 秒）
    setTimeout(() => {
        nextRound();
    }, 1500);
}

// 下一輪
function nextRound() {
    currentRound++;

    if (currentRound > totalRounds) {
        endGame();
    } else {
        document.getElementById('currentRound').textContent = currentRound;
        result.style.display = 'none';
        gameArea.style.display = 'block';

        // 重新啟用按鈕
        cooperateBtn.disabled = false;
        betrayBtn.disabled = false;
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
    analysis += `<p><strong>同事的人格：</strong>${personalities[aiPersonality].name}（${personalities[aiPersonality].desc}）</p>`;
    analysis += `<p><em>（本次遊戲共進行了 ${totalRounds} 輪）</em></p>`;

    if (cooperateCount === totalRounds) {
        analysis += `<p>💡 你選擇了完全認真的策略。雖然可能被同事佔便宜，但長期來看，認真工作能建立信任與好名聲。</p>`;
    } else if (betrayCount === totalRounds) {
        analysis += `<p>💡 你選擇了完全擺爛的策略。短期內可能爽到，但長期會導致團隊互不信任，最終大家都受害。</p>`;
    } else {
        analysis += `<p>💡 你採用了混合策略。在團隊合作中，「以牙還牙」（Tit-for-Tat）策略最有效：一開始認真，之後模仿對方的態度。</p>`;
    }

    document.getElementById('analysis').innerHTML = analysis;
}

// 重新開始
function restart() {
    currentRound = 1;
    totalRounds = Math.floor(Math.random() * 41) + 10; // 重新隨機輪數 10-50
    aiPersonality = ''; // 重置 AI 人格
    aiMood = 'normal'; // 重置 AI 情緒
    consecutiveLosses = 0; // 重置連續失利
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
restartBtn.addEventListener('click', restart);
