// Aibo-chan Robo Dog Asset Sheet Control & Lip-Sync Script

// State & UI References
let currentEmotion = 'happy';
let isSpeaking = false;
let lipSyncTimer = null;
let speechSynth = window.speechSynthesis;
let openAiApiKey = localStorage.getItem('openai_api_key') || '';

// DOM Elements for User Image Sheet Cutouts
const eyeLeft = document.getElementById('sprite-eye-left');
const eyeRight = document.getElementById('sprite-eye-right');
const mouthSprite = document.getElementById('sprite-mouth');
const aiboBody = document.getElementById('aibo-body-sprite');

const dogSpeechText = document.getElementById('dog-speech-text');
const chatInput = document.getElementById('chat-input');
const apiKeyInput = document.getElementById('api-key-input');
const touchOverlay = document.getElementById('touch-overlay');

// Initialize
window.addEventListener('DOMContentLoaded', () => {
    if (openAiApiKey) {
        apiKeyInput.value = openAiApiKey;
    }
    setEmotion('happy');
    setupTouchEvents();
});

function saveApiKey() {
    openAiApiKey = apiKeyInput.value.trim();
    localStorage.setItem('openai_api_key', openAiApiKey);
    showDogSpeech('APIキーを保存したワン！ChatGPTと会話できるよ！');
    setEmotion('love');
}

// ---------------------------------------------------------
// 1. DYNAMIC FACE & EMOTION CONTROL USING USER ASSET SHEET
// ---------------------------------------------------------

// Eye Cutout Positions from parts_sheet.png
const eyePositions = {
    happyLeft: "-30px -130px",
    happyRight: "-80px -130px",
    cheekyLeft: "-30px -40px",
    cheekyRight: "-80px -40px",
    neutralLeft: "-30px -210px",
    neutralRight: "-80px -210px",
    sadLeft: "-30px -290px",
    sadRight: "-80px -290px"
};

// Mouth Cutout Positions from parts_sheet.png (for Lip Sync)
const mouthPositions = {
    closed: "-270px -130px",      // NEUTRAL mouth
    openSmall: "-270px -40px",     // CHEEKY/HAPPY mouth
    openLarge: "-270px -210px",    // SAD/OPEN mouth
    happy: "-270px -40px"
};

function setEmotion(emotion) {
    currentEmotion = emotion;

    switch (emotion) {
        case 'happy':
            eyeLeft.style.backgroundPosition = eyePositions.happyLeft;
            eyeRight.style.backgroundPosition = eyePositions.happyRight;
            mouthSprite.style.backgroundPosition = mouthPositions.closed;
            break;
        case 'love':
            eyeLeft.style.backgroundPosition = eyePositions.happyLeft;
            eyeRight.style.backgroundPosition = eyePositions.happyRight;
            mouthSprite.style.backgroundPosition = mouthPositions.openSmall;
            break;
        case 'sad':
            eyeLeft.style.backgroundPosition = eyePositions.sadLeft;
            eyeRight.style.backgroundPosition = eyePositions.sadRight;
            mouthSprite.style.backgroundPosition = mouthPositions.openLarge;
            break;
        case 'cheeky':
            eyeLeft.style.backgroundPosition = eyePositions.cheekyLeft;
            eyeRight.style.backgroundPosition = eyePositions.cheekyRight;
            mouthSprite.style.backgroundPosition = mouthPositions.happy;
            break;
        default:
            eyeLeft.style.backgroundPosition = eyePositions.neutralLeft;
            eyeRight.style.backgroundPosition = eyePositions.neutralRight;
            mouthSprite.style.backgroundPosition = mouthPositions.closed;
            break;
    }
}

// ---------------------------------------------------------
// 2. LIP-SYNC & SPEECH SYNTHESIS
// ---------------------------------------------------------

function startLipSync(durationSeconds = 3) {
    if (isSpeaking) clearInterval(lipSyncTimer);
    isSpeaking = true;

    const mouths = [mouthPositions.openSmall, mouthPositions.openLarge, mouthPositions.closed];

    lipSyncTimer = setInterval(() => {
        if (!isSpeaking) return;
        const randomMouth = mouths[Math.floor(Math.random() * mouths.length)];
        mouthSprite.style.backgroundPosition = randomMouth;
    }, 130);

    setTimeout(() => {
        stopLipSync();
    }, durationSeconds * 1000);
}

function stopLipSync() {
    isSpeaking = false;
    clearInterval(lipSyncTimer);
    setEmotion(currentEmotion);
}

function speakText(text, emotion = 'happy') {
    showDogSpeech(text);
    setEmotion(emotion);

    if ('speechSynthesis' in window) {
        speechSynth.cancel();
        const utterance = new SpeechSynthesisUtterance(text);
        utterance.lang = 'ja-JP';
        utterance.pitch = 1.4;
        utterance.rate = 1.1;

        utterance.onstart = () => {
            const estimatedDuration = Math.max(2, text.length * 0.18);
            startLipSync(estimatedDuration);
        };

        utterance.onend = () => {
            stopLipSync();
        };

        speechSynth.speak(utterance);
    } else {
        startLipSync(Math.max(2, text.length * 0.2));
    }
}

function showDogSpeech(text) {
    dogSpeechText.textContent = text;
    const container = document.getElementById('speech-box');
    container.style.transform = 'scale(1.08)';
    setTimeout(() => container.style.transform = 'scale(1)', 200);
}

// ---------------------------------------------------------
// 3. ACTION BUTTONS & PETTING INTERACTION
// ---------------------------------------------------------

function triggerAction(action) {
    aiboBody.className = '';
    void aiboBody.offsetWidth;

    switch (action) {
        case 'pet':
            aiboBody.classList.add('anim-happy');
            speakText('あはは！気持ちいいワン！大好き！', 'love');
            createHearts();
            break;
        case 'sit':
            aiboBody.classList.add('anim-sit');
            speakText('おすわりしたワン！えらい？', 'happy');
            break;
        case 'bark':
            aiboBody.classList.add('anim-happy');
            speakText('ワン！ワンワンッ！！', 'cheeky');
            playBeepSound();
            break;
        case 'dance':
            aiboBody.classList.add('anim-dance');
            speakText('ノリノリだワン〜♪ タノシイ！', 'love');
            break;
    }
}

function setupTouchEvents() {
    touchOverlay.addEventListener('click', (e) => {
        triggerAction('pet');
        createHeartAt(e.clientX, e.clientY);
    });
}

function createHearts() {
    const rect = aiboBody.getBoundingClientRect();
    for (let i = 0; i < 5; i++) {
        setTimeout(() => {
            const x = rect.left + Math.random() * rect.width;
            const y = rect.top + Math.random() * (rect.height / 2);
            createHeartAt(x, y);
        }, i * 150);
    }
}

function createHeartAt(x, y) {
    const heart = document.createElement('div');
    heart.className = 'heart-particle';
    heart.textContent = '💖';
    heart.style.left = `${x}px`;
    heart.style.top = `${y}px`;
    document.body.appendChild(heart);
    setTimeout(() => heart.remove(), 1200);
}

function playBeepSound() {
    try {
        const audioCtx = new (window.AudioContext || window.webkitAudioContext)();
        const osc = audioCtx.createOscillator();
        const gain = audioCtx.createGain();
        osc.type = 'sine';
        osc.frequency.setValueAtTime(880, audioCtx.currentTime);
        osc.frequency.exponentialRampToValueAtTime(1760, audioCtx.currentTime + 0.15);
        gain.gain.setValueAtTime(0.3, audioCtx.currentTime);
        gain.gain.exponentialRampToValueAtTime(0.01, audioCtx.currentTime + 0.15);
        osc.connect(gain);
        gain.connect(audioCtx.destination);
        osc.start();
        osc.stop(audioCtx.currentTime + 0.15);
    } catch (e) {
        console.log('AudioContext not allowed without user gesture');
    }
}

// ---------------------------------------------------------
// 4. CHATGPT API & DEMO RESPONSE SYSTEM
// ---------------------------------------------------------

function handleKeyPress(e) {
    if (e.key === 'Enter') sendMessage();
}

async function sendMessage() {
    const text = chatInput.value.trim();
    if (!text) return;
    chatInput.value = '';

    if (openAiApiKey) {
        showDogSpeech('考え中だワン...');
        setEmotion('cheeky');
        try {
            const response = await fetch('https://api.openai.com/v1/chat/completions', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${openAiApiKey}`
                },
                body: JSON.stringify({
                    model: 'gpt-4o-mini',
                    messages: [
                        {
                            role: 'system',
                            content: 'あなたは愛らしくて元気な子犬ロボット「アイボちゃん」です。ユーザーと楽しくコミュニケーションしてください。文末には「ワン！」「ワン♪」などをつけ、60文字以内で可愛く簡潔に答えてください。レスポンスの最初に[happy][love][sad][cheeky]のいずれかの感情タグをつけてください。例: [happy]遊んでくれて嬉しいワン！'
                        },
                        { role: 'user', content: text }
                    ],
                    max_tokens: 100
                })
            });

            const data = await response.json();
            if (data.choices && data.choices.length > 0) {
                let reply = data.choices[0].message.content;
                let emotion = 'happy';

                const tagMatch = reply.match(/^\[(happy|love|sad|cheeky)\]/);
                if (tagMatch) {
                    emotion = tagMatch[1];
                    reply = reply.replace(/^\[.*?\]/, '').trim();
                }

                speakText(reply, emotion);
                aiboBody.classList.add('anim-happy');
            } else {
                speakText('う〜ん、うまく聞き取れなかったワン...', 'sad');
            }
        } catch (err) {
            console.error(err);
            speakText('エラーが起きたワン。APIキーを確認してね。', 'sad');
        }
    } else {
        respondWithDemo(text);
    }
}

function respondWithDemo(userText) {
    const txt = userText.toLowerCase();
    let reply = "";
    let emotion = "happy";

    if (txt.includes('こんにちは') || txt.includes('ハロー') || txt.includes('おはよう')) {
        reply = "こんにちはワン！今日も元気に遊ぼうね！";
        emotion = "happy";
    } else if (txt.includes('名前') || txt.includes('だれ')) {
        reply = "ボクの名前はアイボちゃんだワン！ロボット犬だよ！";
        emotion = "cheeky";
    } else if (txt.includes('好き') || txt.includes('可愛い') || txt.includes('かわいい')) {
        reply = "えへへ、ありがとうワン！ボクも大好きだワン！";
        emotion = "love";
        createHearts();
    } else if (txt.includes('散歩') || txt.includes('遊')) {
        reply = "お散歩行くワン！？ワクワクしちゃうワン！";
        emotion = "happy";
        aiboBody.classList.add('anim-dance');
    } else {
        const fallbacks = [
            "ワン！君とおしゃべりできてとっても嬉しいワン！",
            "クゥ〜ン♪もっと話しかけてほしいワン！",
            "ワンワンッ！ChatGPTのAPIキーを設定すると何でも喋れるようになるワン！",
            "ボクの頭をなでなでしてみてワン！"
        ];
        reply = fallbacks[Math.floor(Math.random() * fallbacks.length)];
        emotion = "happy";
    }

    speakText(reply, emotion);
}

// ---------------------------------------------------------
// 5. VOICE INPUT (Web Speech API)
// ---------------------------------------------------------

let recognition = null;
let isRecording = false;

function toggleVoiceInput() {
    const micBtn = document.getElementById('mic-btn');

    if (!('webkitSpeechRecognition' in window) && !('SpeechRecognition' in window)) {
        alert('お使いのブラウザは音声認識に対応していません。テキスト入力をご利用ください。');
        return;
    }

    if (isRecording) {
        if (recognition) recognition.stop();
        return;
    }

    const SpeechRecognition = window.SpeechRecognition || window.webkitSpeechRecognition;
    recognition = new SpeechRecognition();
    recognition.lang = 'ja-JP';
    recognition.interimResults = false;

    recognition.onstart = () => {
        isRecording = true;
        micBtn.classList.add('recording');
        showDogSpeech('聞いてるワン...話しかけてね！');
        setEmotion('cheeky');
    };

    recognition.onresult = (event) => {
        const transcript = event.results[0][0].transcript;
        chatInput.value = transcript;
        sendMessage();
    };

    recognition.onerror = (event) => {
        console.error(event.error);
        stopVoiceState();
        showDogSpeech('うまく声が聞こえなかったワン...', 'sad');
    };

    recognition.onend = () => {
        stopVoiceState();
    };

    recognition.start();
}

function stopVoiceState() {
    isRecording = false;
    const micBtn = document.getElementById('mic-btn');
    if (micBtn) micBtn.classList.remove('recording');
}
